import logger from '@adonisjs/core/services/logger'
import { inject } from '@adonisjs/core'
import transmit from '@adonisjs/transmit/services/main'
import env from '#start/env'
import Kit from '#kits/models/kit'
import CoverPlaceholder from '#kits/helpers/cover_placeholder'
import KitLike from '#kits/models/kit_like'
import KitComment from '#kits/models/kit_comment'
import JetstreamCursor from '#models/jetstream_cursor'
import Profile from '#profile/models/profile'
import { DateTime } from 'luxon'
import { AtUri } from '@atproto/syntax'
import { lexParse, getBlobCidString, isBlobRef } from '@atproto/lex'
import { main as gunplaKitLexicon } from '#lexicons/build/gunpla/kit'
import { main as gunplaLikeLexicon } from '#lexicons/build/gunpla/like'
import { main as gunplaCommentLexicon } from '#lexicons/build/gunpla/comment'
import WebSocket from 'ws'
import WideEvent from '#observability/wide_event'

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
  private connection: WideEvent | null = null
  private messagesOnConnection = 0

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
      new WideEvent('jetstream.cursor', { operation: 'read' }).fail(err).emit(logger)
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
      new WideEvent('jetstream.cursor', { operation: 'write', cursor: cursor.toString() })
        .fail(err)
        .emit(logger)
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

    const wideEvent = new WideEvent('jetstream.commit', {
      did,
      collection,
      operation: event.commit.operation,
      rkey: event.commit.rkey,
      uri,
      time_us: event.time_us,
    })

    try {
      switch (collection) {
        case 'build.gunpla.kit':
          await this.handleKitCommit(event.commit, did, uri, wideEvent)
          break
        case 'build.gunpla.like':
          await this.handleLikeCommit(event.commit, did, uri, wideEvent)
          break
        case 'build.gunpla.comment':
          await this.handleCommentCommit(event.commit, did, uri, wideEvent)
          break
      }

      await this.saveCursor(event.time_us)
    } catch (err) {
      wideEvent.fail(err)
      throw err
    } finally {
      wideEvent.emit(logger)
    }
  }

  private async handleKitCommit(
    commit: JetstreamCommit,
    did: string,
    uri: string,
    wideEvent: WideEvent
  ): Promise<void> {
    if (commit.operation === 'delete') {
      await Kit.query().where('uri', uri).delete()
      transmit.broadcast('kits', { type: 'delete', uri })
      wideEvent.set({ result: 'deleted' })
      return
    }

    const { record, cid } = commit
    const validation = gunplaKitLexicon.safeValidate(record)
    if (!validation.success) {
      wideEvent.set({
        result: 'skipped',
        skip_reason: 'invalid_record',
        validation_error: String(validation.error),
      })
      return
    }

    const handle = await this.resolveHandle(did)
    wideEvent.set({ handle })
    const photoCids: string[] = []
    if (Array.isArray((record as { photos?: unknown[] }).photos)) {
      for (const p of (record as { photos: unknown[] }).photos) {
        if (isBlobRef(p)) {
          const cidStr = getBlobCidString(p)
          if (cidStr) photoCids.push(cidStr)
        }
      }
    }

    const coverPlaceholder = await this.coverPlaceholderFor(uri, did, photoCids[0])

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
        coverPlaceholder,
        recordCreatedAt: record.createdAt ? DateTime.fromISO(record.createdAt as string) : null,
        indexedAt: DateTime.now(),
      }
    )
    transmit.broadcast('kits', { type: commit.operation, uri })
    wideEvent.set({
      result: 'indexed',
      kit: {
        name: record.name,
        status: record.status,
        grade: record.grade ?? null,
        photo_count: photoCids.length,
      },
    })
  }

  private async coverPlaceholderFor(
    uri: string,
    did: string,
    coverCid: string | undefined
  ): Promise<string | null> {
    if (!coverCid) {
      return null
    }
    const stored = await Kit.storedCoverPlaceholder(uri, coverCid)
    if (stored) {
      return stored
    }
    const fetched = await CoverPlaceholder.fromBlob(did, coverCid)
    return fetched?.hash ?? null
  }

  private async handleLikeCommit(
    commit: JetstreamCommit,
    did: string,
    uri: string,
    wideEvent: WideEvent
  ): Promise<void> {
    if (commit.operation === 'delete') {
      const existing = await KitLike.findBy('uri', uri)
      if (!existing) {
        wideEvent.set({ result: 'skipped', skip_reason: 'not_indexed' })
        return
      }
      const kitId = existing.kitId
      await existing.delete()
      wideEvent.set({ result: 'deleted' })
      const targetKit = await Kit.find(kitId)
      if (targetKit) {
        const [row] = await KitLike.query().where('kit_id', kitId).count('* as count')
        const likeCount = Number(row.$extras.count)
        transmit.broadcast('kits', { type: 'like_update', uri: targetKit.uri, likeCount })
        wideEvent.set({ subject_uri: targetKit.uri, like_count: likeCount })
      }
      return
    }

    const { record } = commit
    const validation = gunplaLikeLexicon.safeValidate(record)
    if (!validation.success) {
      wideEvent.set({
        result: 'skipped',
        skip_reason: 'invalid_record',
        validation_error: String(validation.error),
      })
      return
    }

    const subjectUri = (record as { subject: string }).subject
    wideEvent.set({ subject_uri: subjectUri })
    const targetKit = await Kit.findBy('uri', subjectUri)
    if (!targetKit) {
      wideEvent.set({ result: 'skipped', skip_reason: 'subject_not_indexed' })
      return
    }

    await KitLike.updateOrCreate({ did, kitId: targetKit.id }, { uri, did, kitId: targetKit.id })
    const [row] = await KitLike.query().where('kit_id', targetKit.id).count('* as count')
    const likeCount = Number(row.$extras.count)
    transmit.broadcast('kits', { type: 'like_update', uri: targetKit.uri, likeCount })
    wideEvent.set({ result: 'indexed', like_count: likeCount })
  }

  private async handleCommentCommit(
    commit: JetstreamCommit,
    did: string,
    uri: string,
    wideEvent: WideEvent
  ): Promise<void> {
    if (commit.operation === 'delete') {
      const existing = await KitComment.findBy('uri', uri)
      if (!existing) {
        wideEvent.set({ result: 'skipped', skip_reason: 'not_indexed' })
        return
      }
      const kitId = existing.kitId
      await existing.delete()
      wideEvent.set({ result: 'deleted', comment_id: existing.id })
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

    const validation = gunplaCommentLexicon.safeValidate(commit.record)
    if (!validation.success) {
      wideEvent.set({
        result: 'skipped',
        skip_reason: 'invalid_record',
        validation_error: String(validation.error),
      })
      return
    }

    const { subject: subjectUri, text } = validation.value
    wideEvent.set({ subject_uri: subjectUri, text_length: text.length })

    const targetKit = await Kit.findBy('uri', subjectUri)
    if (!targetKit) {
      wideEvent.set({ result: 'skipped', skip_reason: 'subject_not_indexed' })
      return
    }

    const comment = await KitComment.firstOrCreate(
      { uri },
      { uri, did, kitId: targetKit.id, text, createdAt: DateTime.now() }
    )
    if (!comment.$isLocal) {
      wideEvent.set({ result: 'skipped', skip_reason: 'duplicate', comment_id: comment.id })
    } else {
      wideEvent.set({ result: 'indexed', comment_id: comment.id })
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
    const rewindCursor = cursor ? Math.max(0, Number(cursor) - 5_000_000) : null
    if (rewindCursor !== null) {
      url += `&cursor=${rewindCursor}`
    }

    this.connection = new WideEvent('jetstream.connection', {
      endpoint: this.endpoint,
      collections: this.wantedCollections,
      cursor: rewindCursor,
      connected: false,
    })
    this.messagesOnConnection = 0

    const ws = new WebSocket(url)
    this.ws = ws

    ws.on('open', () => {
      this.connection?.set({ connected: true })
      this.pingInterval = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.ping()
        }
      }, 30000)
    })

    ws.on('message', async (data) => {
      this.messagesOnConnection++
      const raw = data.toString('utf-8')

      let event: JetstreamEvent
      try {
        event = lexParse(raw) as JetstreamEvent
      } catch (err) {
        new WideEvent('jetstream.message', { bytes: raw.length }).fail(err).emit(logger)
        return
      }

      await this.processEvent(event).catch(() => {})
    })

    ws.on('error', (err) => this.connection?.fail(err))

    ws.on('close', (code) => {
      this.connection?.set({ close_code: code, reconnect: this.isRunning })
      this.cleanup()
      if (this.isRunning) {
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
      } catch (err) {
        this.connection?.failStep('terminate', err)
      }
      this.ws = null
    }
    if (this.connection) {
      this.connection.set({ messages: this.messagesOnConnection }).emit(logger)
      this.connection = null
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false
    this.connection?.set({ stopped: true })
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    this.cleanup()
    if (this.lastCursor) await this.saveCursor(this.lastCursor, true)
  }
}

export default new JetstreamService()
