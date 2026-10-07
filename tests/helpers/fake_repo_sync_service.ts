import {
  RepoSyncService,
  type SyncResult,
  type BatchSyncResult,
} from '#kits/services/repo_sync_service'

export interface FakeRepoSyncOptions {
  shouldThrow?: boolean
  handler?: (identifier: string) => Promise<SyncResult>
}

export class FakeRepoSyncService extends RepoSyncService {
  constructor(private options: FakeRepoSyncOptions = {}) {
    super(null as any, null as any)
  }

  async syncUser(identifier: string): Promise<SyncResult> {
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
      logsSynced: 0,
    }
  }

  async syncUsers(identifiers: string[]): Promise<BatchSyncResult> {
    return super.syncUsers(identifiers)
  }
}
