import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { IdentityService } from '#profile/services/identity_service'
import { ProfileService } from '#profile/services/profile_service'
import {
  asAtprotoDid,
  DidResolverCommon,
  extractPdsUrl,
  type AtprotoDid,
} from '@atproto/oauth-client-node'
import { Client, isBlobRef, getBlobCidString } from '@atproto/lex'
import gunplaKit from '#lexicons/build/gunpla/kit'
import gunplaBuildLog from '#lexicons/build/gunpla/buildLog'
import Kit from '#kits/models/kit'
import BuildLog from '#kits/models/build_log'
import { DateTime } from 'luxon'

export interface SyncResult {
  did: string
  handle: string
  pdsEndpoint: string
  kitsSynced: number
  logsSynced: number
}

export interface SyncAccountResult {
  identifier: string
  success: boolean
  data?: SyncResult
  error?: string
}

export interface BatchSyncResult {
  results: SyncAccountResult[]
  totalKits: number
  totalLogs: number
  hasFailures: boolean
}

@inject()
export class RepoSyncService {
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

  protected async syncKits(client: Client, repoDid: AtprotoDid): Promise<number> {
    let count = 0
    for await (const record of client.listAll(gunplaKit, { repo: repoDid })) {
      if (!record.valid) continue

      const kit = record.value
      const photoCids: string[] = []
      if (Array.isArray(kit.photos)) {
        for (const p of kit.photos) {
          if (isBlobRef(p)) {
            const cidStr = getBlobCidString(p)
            if (cidStr) photoCids.push(cidStr)
          }
        }
      }
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
      count++
    }
    return count
  }

  protected async syncBuildLogs(client: Client, repoDid: AtprotoDid): Promise<number> {
    let count = 0
    for await (const record of client.listAll(gunplaBuildLog, { repo: repoDid })) {
      if (!record.valid) continue

      const log = record.value
      await BuildLog.updateOrCreate(
        { uri: record.uri },
        {
          cid: record.cid,
          did: repoDid,
          kitUri: log.kit,
          stage: log.stage ?? null,
          text: log.text ?? null,
          recordCreatedAt: log.createdAt ? DateTime.fromISO(log.createdAt) : null,
          indexedAt: DateTime.now(),
        }
      )
      count++
    }
    return count
  }

  async syncUser(identifier: string): Promise<SyncResult> {
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

    const kitsSynced = await this.syncKits(client, repoDid)
    const logsSynced = await this.syncBuildLogs(client, repoDid)

    await this.profileService.syncProfile(did, handle)

    return {
      did,
      handle,
      pdsEndpoint,
      kitsSynced,
      logsSynced,
    }
  }

  async syncUsers(identifiers: string[]): Promise<BatchSyncResult> {
    const results: SyncAccountResult[] = []
    let totalKits = 0
    let totalLogs = 0
    let hasFailures = false

    for (const identifier of identifiers) {
      try {
        const syncData = await this.syncUser(identifier)
        results.push({
          identifier,
          success: true,
          data: syncData,
        })
        totalKits += syncData.kitsSynced
        totalLogs += syncData.logsSynced
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
      totalLogs,
      hasFailures,
    }
  }
}
