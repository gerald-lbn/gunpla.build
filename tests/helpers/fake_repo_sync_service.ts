import { RepoSyncService, type SyncResult } from '#kits/services/repo_sync_service'

export class FakeRepoSyncService extends RepoSyncService {
  constructor(private options: { shouldThrow?: boolean } = {}) {
    super(null as any)
  }

  async syncUser(did: string): Promise<SyncResult> {
    if (this.options.shouldThrow) {
      throw new Error('Fake sync error')
    }
    return {
      did,
      handle: 'fake.bsky.social',
      pdsEndpoint: 'https://fake.pds',
      kitsSynced: 0,
      logsSynced: 0,
    }
  }
}
