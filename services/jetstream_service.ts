import logger from '@adonisjs/core/services/logger'
import { inject } from '@adonisjs/core'
import transmit from '@adonisjs/transmit/services/main'
import env from '#start/env'
import Kit from '#kits/models/kit'
import KitLike from '#kits/models/kit_like'
import KitComment from '#kits/models/kit_comment'
import JetstreamCursor from '#models/jetstream_cursor'
import Profile from '#profile/models/profile'
import { DateTime } from 'luxon'
import { AtUri } from '@atproto/syntax'
import { lexParse, getBlobCidString, isBlobRef } from '@atproto/lex'
import { main as gunplaKitLexicon } from '#lexicons/build/gunpla/kit'
import { main as gunplaLikeLexicon } from '#lexicons/build/gunpla/like'
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
}

@inject()
export class JetstreamService {
  private endpoint: string
  private wantedCollections: string[]
  private ws: WebSocket | null = null
  private isRunning = false
  private reconnectTimeout: NodeJS.Timeout | null = null
  private pingInterval: NodeJS.Timeout | null = null
  private lastCursor: number | string | null = null
  private lastSavedCursorTime = 0

  constructor(options: JetstreamServiceOptions = {}) {
    this.endpoint = options.endpoint ?? env.get('JETSTREAM_URL')
    this.wantedCollections = options.wantedCollections ?? [
      'build.gunpla.kit',
      'build.gunpla.like',
      'build.gunpla.comment',
    ]
  }

  async loadCursor(): Promise<string | null> {
    try {
      const record = await JetstreamCursor.find('default')
      if (record?.cursor) return record.cursor
    } catch (err) {
      logger.error({ err }, 'Failed to read Jetstream cursor from database')
    }
    return null
  }

  async saveCursor(cursor: number | string, force = false): Promise<void> {
    this.lastCursor = cursor
    const now = Date.now()
    if (!force && now - this.lastSavedCursorTime < 2000) return
    try {
      const cursorStr = cursor.toString()
      await JetstreamCursor.updateOrCreate({ id: 'default' }, { id: 'default', cursor: cursorStr })
      this.lastSavedCursorTime = now
    } catch (err) {
      logger.error({ err }, 'Failed to write Jetstream cursor to database')
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

  async processEvent(event: JetstreamEvent): Promise<void> {
    if (event.kind !== 'commit') {
      await this.saveCursor(event.time_us)
      return
    }

    const { collection } = event.commit
    if (!this.wantedCollections.includes(collection)) {
      await this.saveCursor(event.time_us)
      return
    }

    const did = event.did
    const uri = AtUri.make(did, collection, event.commit.rkey).toString()

    switch (collection) {
      case 'build.gunpla.kit':
        await this.handleKitCommit(event.commit, did, uri)
        break
      case 'build.gunpla.like':
        await this.handleLikeCommit(event.commit, did, uri)
        break
      case 'build.gunpla.comment':
        await this.handleCommentCommit(event.commit, did, uri)
        break
    }

    await this.saveCursor(event.time_us)
  }

  private async handleKitCommit(commit: JetstreamCommit, did: string, uri: string): Promise<void> {
    if (commit.operation === 'delete') {
      logger.info(`[Jetstream] deleting kit ${uri}`)
      await Kit.query().where('uri', uri).delete()
      transmit.broadcast('kits', { type: 'delete', uri })
      return
    }

    logger.info(`[Jetstream] ${commit.operation} kit ${uri}`)
    const { record, cid } = commit
    const validation = gunplaKitLexicon.safeValidate(record)
    if (!validation.success) {
      logger.warn(
        { collection: 'build.gunpla.kit', rkey: commit.rkey, error: validation.error },
        '[Jetstream] invalid kit record — skipping'
      )
      return
    }

    await this.resolveHandle(did)
    const photoCids: string[] = []
    if (Array.isArray((record as { photos?: unknown[] }).photos)) {
      for (const p of (record as { photos: unknown[] }).photos) {
        if (isBlobRef(p)) {
          const cidStr = getBlobCidString(p)
          if (cidStr) photoCids.push(cidStr)
        }
      }
    }

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
        photos: photoCids.length > 0 ? photoCids : null,
        recordCreatedAt: record.createdAt ? DateTime.fromISO(record.createdAt as string) : null,
        indexedAt: DateTime.now(),
      }
    )
    transmit.broadcast('kits', { type: commit.operation, uri })
  }

  private async handleLikeCommit(commit: JetstreamCommit, did: string, uri: string): Promise<void> {
    if (commit.operation === 'delete') {
      logger.info(`[Jetstream] deleting like ${uri}`)
      const existing = await KitLike.findBy('uri', uri)
      if (!existing) {
        logger.debug(`[Jetstream] like not found locally ${uri} — no-op`)
        return
      }
      const kitId = existing.kitId
      await existing.delete()
      const targetKit = await Kit.find(kitId)
      if (targetKit) {
        const [row] = await KitLike.query().where('kit_id', kitId).count('* as count')
        transmit.broadcast('kits', {
          type: 'like_update',
          uri: targetKit.uri,
          likeCount: Number(row.$extras.count),
        })
      }
      return
    }

    logger.info(`[Jetstream] ${commit.operation} like ${uri}`)
    const { record } = commit
    const validation = gunplaLikeLexicon.safeValidate(record)
    if (!validation.success) {
      logger.warn(
        { collection: 'build.gunpla.like', rkey: commit.rkey, error: validation.error },
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
    transmit.broadcast('kits', {
      type: 'like_update',
      uri: targetKit.uri,
      likeCount: Number(row.$extras.count),
    })
  }

  private async handleCommentCommit(
    commit: JetstreamCommit,
    did: string,
    uri: string
  ): Promise<void> {
    if (commit.operation === 'delete') {
      logger.info(`[Jetstream] deleting comment ${uri}`)
      const existing = await KitComment.findBy('uri', uri)
      if (!existing) {
        logger.debug(`[Jetstream] comment not found locally ${uri} — no-op`)
        return
      }
      const kitId = existing.kitId
      await existing.delete()
      const targetKit = await Kit.find(kitId)
      if (targetKit) {
        transmit.broadcast('kits', {
          type: 'comment_deleted',
          kitUri: targetKit.uri,
          commentId: existing.id,
        })
      }
      return
    }

    logger.info(`[Jetstream] ${commit.operation} comment ${uri}`)
    const { record } = commit
    const subjectUri = (record as { subject: string }).subject
    const text = (record as { text: string }).text
    if (!subjectUri || !text) {
      logger.warn(
        { collection: 'build.gunpla.comment', rkey: commit.rkey },
        '[Jetstream] invalid comment record — skipping'
      )
      return
    }

    const targetKit = await Kit.findBy('uri', subjectUri)
    if (!targetKit) {
      logger.debug({ subjectUri, did }, '[Jetstream] comment targets unindexed kit — skipping')
      return
    }

    const comment = await KitComment.firstOrCreate(
      { uri },
      { uri, did, kitId: targetKit.id, text, createdAt: DateTime.now() }
    )
    if (!comment.$isLocal) {
      logger.debug(`[Jetstream] duplicate comment ${uri} — skipped`)
    } else {
      await comment.load('profile')
      transmit.broadcast('kits', {
        type: 'comment_created',
        kitUri: targetKit.uri,
        comment: {
          id: comment.id,
          did: comment.did,
          uri: comment.uri,
          text: comment.text,
          createdAt: comment.createdAt.toISO(),
        },
      })
    }
  }

  start(): void {
    if (this.isRunning) return
    this.isRunning = true
    this.connect()
  }

  private async connect(): Promise<void> {
    if (!this.isRunning) return
    this.cleanup()

    const cursor = await this.loadCursor()
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

  async stop(): Promise<void> {
    this.isRunning = false
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    this.cleanup()
    if (this.lastCursor) await this.saveCursor(this.lastCursor, true)
    logger.info('[Jetstream] stopped')
  }
}

export default new JetstreamService()
