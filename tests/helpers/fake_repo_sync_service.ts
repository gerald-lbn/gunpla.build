import RepoSyncService from '#kits/services/repo_sync_service'
import type { SyncResult, BatchSyncResult } from '#types/kits'

export type FakeRepoSyncOptions = {
  shouldThrow?: boolean
  handler?: (identifier: string) => Promise<SyncResult>
}

export class FakeRepoSyncService extends RepoSyncService {
  constructor(private options: FakeRepoSyncOptions = {}) {
    super(null as any, null as any)
  }

  async syncAccount(identifier: string): Promise<SyncResult> {
    if (this.options.handler) {
      return this.options.handler(identifier)
    }
    if (this.options.shouldThrow) {
      throw new Error('Fake sync error')
    }
    return {
      did: identifier.startsWith('did:') ? identifier : `did:plc:${identifier}`,
      handle: identifier.includes('.') ? identifier : `${identifier}.bsky.social`,
      pdsEndpoint: 'https://fake.pds',
      kitsSynced: 0,
      kitsPruned: 0,
    }
  }

  async syncAccounts(identifiers: string[]): Promise<BatchSyncResult> {
    return super.syncAccounts(identifiers)
  }
}
