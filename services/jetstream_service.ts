import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import { inject } from '@adonisjs/core'
import env from '#start/env'
import Kit from '#kits/models/kit'
import Profile from '#profile/models/profile'
import { DateTime } from 'luxon'
import { AtUri } from '@atproto/syntax'
import { lexParse, getBlobCidString, isBlobRef } from '@atproto/lex'
import KitLike from '#kits/models/kit_like'
import { main as gunplaKitLexicon } from '#lexicons/build/gunpla/kit'
import { main as gunplaLikeLexicon } from '#lexicons/build/gunpla/like'
import fs from 'node:fs'
import WebSocket from 'ws'

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
  | { kind: 'identity'; time_us: number; did: string; identity: { did: string; handle?: string } }
  | { kind: 'account'; time_us: number; did: string; account: Record<string, unknown> }
  | { kind: 'commit'; time_us: number; did: string; commit: JetstreamCommit }

export interface JetstreamServiceOptions {
  endpoint?: string
  wantedCollections?: string[]
  cursorFilePath?: string
}

@inject()
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

  constructor(options: JetstreamServiceOptions = {}) {
    this.endpoint =
      options.endpoint ??
      env.get('JETSTREAM_URL') ??
      'wss://jetstream2.us-east.bsky.network/subscribe'
    this.wantedCollections = options.wantedCollections ?? ['build.gunpla.kit', 'build.gunpla.like']
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

    try {
      const existing = await Profile.find(did)
      if (existing?.handle) {
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
          await Profile.firstOrCreate(
            { did },
            { did, handle: data.handle, indexedAt: DateTime.now() }
          )
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
          const handle = new AtUri(aka).hostname
          await Profile.firstOrCreate({ did }, { did, handle, indexedAt: DateTime.now() })
          return handle
        }
      }
    } catch {}

    return null
  }

  private async broadcast(channel: string, payload: Record<string, unknown>): Promise<void> {
    try {
      const internalUrl = env.get('INTERNAL_APP_URL') ?? 'http://app:3333'
      const appKey = env.get('APP_KEY').release()
      await fetch(`${internalUrl}/internal/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': appKey,
        },
        body: JSON.stringify({ channel, payload }),
      })
    } catch {
      // Quiet fail if web app is not reachable yet
    }
  }

  async processEvent(event: JetstreamEvent): Promise<void> {
    this.saveCursor(event.time_us)

    if (event.kind !== 'commit') return

    const { collection, operation, rkey } = event.commit
    if (!this.wantedCollections.includes(collection)) return

    const did = event.did
    const uri = `at://${did}/${collection}/${rkey}`

    if (collection === 'build.gunpla.kit') {
      if (operation === 'delete') {
        logger.info(`[Jetstream] deleting kit ${uri}`)
        await Kit.query().where('uri', uri).delete()
        await this.broadcast('kits', { type: 'delete', uri })
        return
      }
      logger.info(`[Jetstream] ${operation} kit ${uri}`)
      const { record, cid } = event.commit
      const validation = gunplaKitLexicon.safeValidate(record)
      if (!validation.success) {
        logger.warn(
          { collection: 'build.gunpla.kit', rkey, error: validation.error },
          '[Jetstream] invalid kit record — skipping'
        )
        return
      }
      await this.resolveHandle(did)
      const recordPhotos = (record as { photos?: unknown[] }).photos
      const photoCids: string[] = []
      if (Array.isArray(recordPhotos)) {
        for (const p of recordPhotos) {
          if (isBlobRef(p)) {
            const cidStr = getBlobCidString(p)
            if (cidStr) photoCids.push(cidStr)
          }
        }
      }
      const photoCid = photoCids[0] ?? null
      await Kit.updateOrCreate(
        { uri },
        {
          cid,
          did,
          name: record.name as string,
          grade: record.grade as string,
          scale: record.scale as string,
          manufacturer: record.manufacturer as string | undefined,
          acquiredAt: record.acquiredAt ? DateTime.fromISO(record.acquiredAt as string) : null,
          status: record.status as string,
          photoCid,
          photos: photoCids.length > 0 ? photoCids : null,
          recordCreatedAt: record.createdAt ? DateTime.fromISO(record.createdAt as string) : null,
          indexedAt: DateTime.now(),
        }
      )
      await this.broadcast('kits', { type: operation, uri })
      return
    }

    if (collection === 'build.gunpla.like') {
      if (operation === 'delete') {
        logger.info('[Jetstream] deleting like ' + uri)
        const existingLike = await KitLike.findBy('uri', uri)
        if (!existingLike) {
          logger.debug('[Jetstream] like not found locally ' + uri + ' — no-op')
          return
        }
        const kitId = existingLike.kitId
        await existingLike.delete()
        const targetKit = await Kit.find(kitId)
        if (targetKit) {
          const [row] = await KitLike.query().where('kit_id', kitId).count('* as count')
          await this.broadcast('kits', {
            type: 'like_update',
            uri: targetKit.uri,
            likeCount: Number(row.$extras.count),
          })
        }
        return
      }

      logger.info('[Jetstream] ' + operation + ' like ' + uri)
      const { record } = event.commit
      const validation = gunplaLikeLexicon.safeValidate(record)
      if (!validation.success) {
        logger.warn(
          { collection: 'build.gunpla.like', rkey, error: validation.error },
          '[Jetstream] invalid like record — skipping'
        )
        return
      }

      const subjectUri = (record as { subject: string }).subject
      const targetKit = await Kit.findBy('uri', subjectUri)
      if (!targetKit) {
        logger.debug({ subjectUri, did }, '[Jetstream] like targets unindexed kit — skipping')
        return
      }

      await KitLike.updateOrCreate({ did, kitId: targetKit.id }, { uri, did, kitId: targetKit.id })
      const [row] = await KitLike.query().where('kit_id', targetKit.id).count('* as count')
      await this.broadcast('kits', {
        type: 'like_update',
        uri: targetKit.uri,
        likeCount: Number(row.$extras.count),
      })
    }
  }

  start(): void {
    if (this.isRunning) return
    this.isRunning = true
    this.connect()
  }

  private connect(): void {
    if (!this.isRunning) return
    this.cleanup()

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

    ws.on('open', () => {
      logger.info('[Jetstream] connected')
      this.pingInterval = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.ping()
        }
      }, 30000)
    })

    ws.on('message', async (data) => {
      try {
        const raw = data.toString('utf-8')
        await this.processEvent(lexParse(raw) as JetstreamEvent)
      } catch (err) {
        logger.error({ err }, '[Jetstream] error processing event')
      }
    })

    ws.on('error', (err) => logger.error({ err }, '[Jetstream] WebSocket error'))

    ws.on('close', () => {
      this.cleanup()
      if (this.isRunning) {
        logger.warn('[Jetstream] connection closed, reconnecting in 5s')
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout)
        this.reconnectTimeout = setTimeout(() => this.connect(), 5000)
      }
    })
  }

  private cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
    if (this.ws) {
      try {
        this.ws.removeAllListeners()
        this.ws.terminate()
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
  wantedCollections: ['build.gunpla.kit', 'build.gunpla.like'],
})
