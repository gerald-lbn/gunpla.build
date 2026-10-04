import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'
import Kit from '#models/kit'
import BuildLog from '#models/build_log'
import { DateTime } from 'luxon'
import fs from 'node:fs'

type JetstreamCommit<T extends Record<string, unknown> = Record<string, unknown>> =
  | {
      operation: 'create' | 'update'
      collection: string
      rkey: string
      cid: string
      record: T
    }
  | {
      operation: 'delete'
      collection: string
      rkey: string
    }

type JetstreamEvent =
  | { kind: 'identity'; time_us: number; did: string; identity: { did: string; handle: string } }
  | { kind: 'account'; time_us: number; did: string; account: Record<string, unknown> }
  | { kind: 'commit'; time_us: number; did: string; commit: JetstreamCommit }

export interface JetstreamServiceOptions {
  endpoint?: string
  wantedCollections?: string[]
  cursorFilePath?: string
}

export class JetstreamService {
  private endpoint: string
  private wantedCollections: string[]
  private cursorFilePath: string
  private ws: WebSocket | null = null
  private isRunning = false
  private reconnectTimeout: NodeJS.Timeout | null = null
  private pingInterval: NodeJS.Timeout | null = null
  private lastCursor: number | string | null = null
  private lastSavedCursorTime = 0
  private handleCache: Map<string, string> = new Map()

  constructor(options: JetstreamServiceOptions = {}) {
    this.endpoint =
      options.endpoint ??
      env.get('JETSTREAM_URL') ??
      'wss://jetstream2.us-east.bsky.network/subscribe'
    this.wantedCollections = options.wantedCollections ?? ['build.gunpla.kit']
    this.cursorFilePath = options.cursorFilePath ?? app.tmpPath('jetstream_cursor.txt')
  }

  loadCursor(): string | null {
    try {
      if (fs.existsSync(this.cursorFilePath)) {
        const cursor = fs.readFileSync(this.cursorFilePath, 'utf-8').trim()
        if (cursor) return cursor
      }
    } catch (err) {
      logger.error({ err }, 'Failed to read Jetstream cursor file')
    }
    return null
  }

  saveCursor(cursor: number | string, force = false): void {
    this.lastCursor = cursor
    const now = Date.now()
    if (!force && now - this.lastSavedCursorTime < 2000) return
    try {
      fs.writeFileSync(this.cursorFilePath, cursor.toString(), 'utf-8')
      this.lastSavedCursorTime = now
    } catch (err) {
      logger.error({ err }, 'Failed to write Jetstream cursor file')
    }
  }

  async resolveHandle(did: string): Promise<string | null> {
    if (!did.startsWith('did:')) return null
    if (this.handleCache.has(did)) return this.handleCache.get(did)!

    try {
      const existing = await Kit.query()
        .where('did', did)
        .whereNotNull('handle')
        .orderBy('indexed_at', 'desc')
        .first()
      if (existing?.handle) {
        this.handleCache.set(did, existing.handle)
        return existing.handle
      }
    } catch {}

    try {
      const res = await fetch(
        `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`
      )
      if (res.ok) {
        const data = (await res.json()) as { handle?: string }
        if (data.handle) {
          this.handleCache.set(did, data.handle)
          return data.handle
        }
      }
    } catch {}

    try {
      const res = await fetch(`https://plc.directory/${encodeURIComponent(did)}`)
      if (res.ok) {
        const data = (await res.json()) as { alsoKnownAs?: string[] }
        const aka = data.alsoKnownAs?.find((h) => h.startsWith('at://'))
        if (aka) {
          const handle = aka.replace('at://', '')
          this.handleCache.set(did, handle)
          return handle
        }
      }
    } catch {}

    return null
  }

  async processEvent(event: JetstreamEvent): Promise<void> {
    this.saveCursor(event.time_us)

    if (event.kind === 'identity') {
      const { did, handle } = event.identity
      this.handleCache.set(did, handle)
      await Kit.query().where('did', did).update({ handle })
      await BuildLog.query().where('did', did).update({ handle })
      return
    }

    if (event.kind !== 'commit') return

    const { collection, operation, rkey } = event.commit
    if (!this.wantedCollections.includes(collection)) return

    const did = event.did
    const uri = `at://${did}/${collection}/${rkey}`

    if (collection === 'build.gunpla.kit') {
      if (operation === 'delete') {
        logger.info(`[Jetstream] deleting kit ${uri}`)
        await Kit.query().where('uri', uri).delete()
        return
      }
      logger.info(`[Jetstream] ${operation} kit ${uri}`)
      const { record, cid } = event.commit
      const handle = await this.resolveHandle(did)
      await Kit.updateOrCreate(
        { uri },
        {
          cid,
          did,
          handle,
          name: record.name as string,
          grade: record.grade as string,
          scale: record.scale as string,
          status: record.status as string,
          recordCreatedAt: record.createdAt ? DateTime.fromISO(record.createdAt as string) : null,
          indexedAt: DateTime.now(),
        }
      )
    }

    if (collection === 'build.gunpla.buildLog') {
      if (operation === 'delete') {
        logger.info(`[Jetstream] deleting build log ${uri}`)
        await BuildLog.query().where('uri', uri).delete()
        return
      }
      logger.info(`[Jetstream] ${operation} build log ${uri}`)
      const { record, cid } = event.commit
      const handle = await this.resolveHandle(did)
      await BuildLog.updateOrCreate(
        { uri },
        {
          cid,
          did,
          handle,
          kitUri: (record.kit as string) ?? '',
          stage: (record.stage as string) ?? null,
          text: (record.text as string) ?? null,
          recordCreatedAt: record.createdAt ? DateTime.fromISO(record.createdAt as string) : null,
          indexedAt: DateTime.now(),
        }
      )
    }
  }

  start(): void {
    if (this.isRunning) return
    this.isRunning = true

    const cursor = this.loadCursor()
    const params = this.wantedCollections
      .map((c) => `wantedCollections=${encodeURIComponent(c)}`)
      .join('&')
    let url = `${this.endpoint}?${params}`
    if (cursor) {
      const rewindCursor = Math.max(0, Number(cursor) - 5_000_000)
      url += `&cursor=${rewindCursor}`
    }

    logger.info(`[Jetstream] connecting to ${url}`)
    const ws = new WebSocket(url)
    this.ws = ws

    ws.onopen = () => {
      logger.info('[Jetstream] connected')
      this.pingInterval = setInterval(() => {}, 30000)
    }

    ws.onmessage = async (event) => {
      try {
        const raw = typeof event.data === 'string' ? event.data : event.data.toString()
        await this.processEvent(JSON.parse(raw) as JetstreamEvent)
      } catch (err) {
        logger.error({ err }, '[Jetstream] error processing event')
      }
    }

    ws.onerror = (err) => logger.error({ err }, '[Jetstream] WebSocket error')

    ws.onclose = () => {
      this.cleanup()
      if (this.isRunning) {
        logger.warn('[Jetstream] connection closed, reconnecting in 5s')
        this.reconnectTimeout = setTimeout(() => this.start(), 5000)
      }
    }
  }

  private cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
    if (this.ws) {
      try {
        this.ws.close()
      } catch {
        logger.warn('[Jetstream] error closing WebSocket')
      }
      this.ws = null
    }
  }

  stop(): void {
    this.isRunning = false
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    this.cleanup()
    if (this.lastCursor) this.saveCursor(this.lastCursor, true)
    logger.info('[Jetstream] stopped')
  }
}

export default new JetstreamService({
  wantedCollections: ['build.gunpla.kit', 'build.gunpla.buildLog'],
})
