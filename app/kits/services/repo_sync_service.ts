import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import IdentityService from '#profile/services/identity_service'
import ProfileService from '#profile/services/profile_service'
import {
  asAtprotoDid,
  DidResolverCommon,
  extractPdsUrl,
  type AtprotoDid,
} from '@atproto/oauth-client-node'
import { Client, isBlobRef, getBlobCidString } from '@atproto/lex'
import gunplaKit from '#lexicons/build/gunpla/kit'
import gunplaComment from '#lexicons/build/gunpla/comment'
import type { Main as KitRecordValue } from '#lexicons/build/gunpla/kit.defs'
import type { Main as CommentRecordValue } from '#lexicons/build/gunpla/comment.defs'
import Kit from '#kits/models/kit'
import KitComment from '#kits/models/kit_comment'
import KitLike from '#kits/models/kit_like'
import { DateTime } from 'luxon'
import type { SyncResult, SyncAccountResult, BatchSyncResult } from '#types/kits'

@inject()
export default class RepoSyncService {
  private didResolver = new DidResolverCommon()

  constructor(
    private identityService: IdentityService,
    private profileService: ProfileService
  ) {}

  async resolvePdsEndpoint(did: string): Promise<string | null> {
    try {
      const atprotoDid = asAtprotoDid(did)
      const doc = await this.didResolver.resolve(atprotoDid)
      return extractPdsUrl(doc).origin
    } catch (err) {
      logger.debug({ err, did }, 'Failed resolving PDS via DidResolverCommon')
      return null
    }
  }

  protected async syncKits(
    client: Client,
    repoDid: AtprotoDid
  ): Promise<{ synced: number; pruned: number }> {
    let synced = 0
    const remoteUris = new Set<string>()

    for await (const record of client.listAll(gunplaKit, { repo: repoDid })) {
      if (!record.valid) continue

      remoteUris.add(record.uri)
      const photoCids = this.extractPhotoCids(record.value)
      await this.upsertKit(record, repoDid, photoCids)
      synced++
    }

    const pruned = await this.pruneMissingKits(repoDid, remoteUris)
    return { synced, pruned }
  }

  async syncAccount(identifier: string): Promise<SyncResult> {
    const identity = await this.identityService.resolve(identifier)
    if (!identity) {
      throw new Error(`Could not resolve ATProto identity for "${identifier}"`)
    }

    const { did, handle } = identity
    const pdsEndpoint = await this.resolvePdsEndpoint(did)
    if (!pdsEndpoint) {
      throw new Error(`Could not find Personal Data Server (PDS) endpoint for DID "${did}"`)
    }

    const client = new Client(pdsEndpoint)
    const repoDid = asAtprotoDid(did)

    const { synced, pruned } = await this.syncKits(client, repoDid)
    await this.syncComments(client, repoDid)

    await this.profileService.syncProfile(did, handle)

    return {
      did,
      handle,
      pdsEndpoint,
      kitsSynced: synced,
      kitsPruned: pruned,
    }
  }

  async syncAccounts(identifiers: string[]): Promise<BatchSyncResult> {
    const results: SyncAccountResult[] = []
    let totalKits = 0
    let totalPruned = 0
    let hasFailures = false

    for (const identifier of identifiers) {
      try {
        const syncData = await this.syncAccount(identifier)
        results.push({
          identifier,
          success: true,
          data: syncData,
        })
        totalKits += syncData.kitsSynced
        totalPruned += syncData.kitsPruned
      } catch (error) {
        hasFailures = true
        results.push({
          identifier,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error during sync',
        })
      }
    }

    return {
      results,
      totalKits,
      totalPruned,
      hasFailures,
    }
  }

  protected async syncComments(client: Client, repoDid: AtprotoDid): Promise<void> {
    const remoteUris = new Set<string>()

    for await (const record of client.listAll(gunplaComment, { repo: repoDid })) {
      if (!record.valid) continue
      remoteUris.add(record.uri)
      await this.upsertComment(record.uri, record.value, repoDid)
    }

    await this.pruneMissingComments(repoDid, remoteUris)
  }

  private async upsertComment(
    uri: string,
    value: CommentRecordValue,
    repoDid: AtprotoDid
  ): Promise<void> {
    const kit = await Kit.findBy('uri', value.subject)
    if (!kit) return

    await KitComment.updateOrCreate(
      { uri },
      {
        did: repoDid,
        kitId: kit.id,
        text: value.text,
        createdAt: DateTime.fromISO(value.createdAt),
      }
    )
  }

  private async pruneMissingComments(repoDid: AtprotoDid, remoteUris: Set<string>): Promise<void> {
    const query = KitComment.query().where('did', repoDid)
    if (remoteUris.size > 0) {
      query.whereNotIn('uri', Array.from(remoteUris))
    }
    await query.delete()
  }

  private extractPhotoCids(kit: KitRecordValue): string[] {
    const photoCids: string[] = []
    if (Array.isArray(kit.photos)) {
      for (const p of kit.photos) {
        if (isBlobRef(p)) {
          const cidStr = getBlobCidString(p)
          if (cidStr) photoCids.push(cidStr)
        }
      }
    }
    return photoCids
  }

  private async upsertKit(
    record: { uri: string; cid?: string; value: KitRecordValue },
    repoDid: AtprotoDid,
    photoCids: string[]
  ) {
    const kit = record.value
    const photoCid = photoCids[0] ?? null

    await Kit.updateOrCreate(
      { uri: record.uri },
      {
        cid: record.cid,
        did: repoDid,
        name: kit.name,
        grade: kit.grade ?? null,
        scale: kit.scale ?? null,
        manufacturer: kit.manufacturer ?? null,
        status: kit.status ?? 'backlog',
        acquiredAt: kit.acquiredAt ? DateTime.fromISO(kit.acquiredAt) : null,
        photoCid,
        photos: photoCids.length > 0 ? photoCids : null,
        recordCreatedAt: kit.createdAt ? DateTime.fromISO(kit.createdAt) : null,
        indexedAt: DateTime.now(),
      }
    )
  }

  private async pruneMissingKits(repoDid: AtprotoDid, remoteUris: Set<string>): Promise<number> {
    const query = Kit.query().where('did', repoDid)
    if (remoteUris.size > 0) {
      query.whereNotIn('uri', Array.from(remoteUris))
    }
    const toPrune = await query.select('id')

    if (toPrune.length > 0) {
      const pruneIds = toPrune.map((k) => k.id)
      await KitLike.query().whereIn('kit_id', pruneIds).delete()
      await Kit.query().whereIn('id', pruneIds).delete()
      logger.info({ repoDid, count: toPrune.length }, 'Pruned kits removed from remote PDS')
    }

    return toPrune.length
  }
}
