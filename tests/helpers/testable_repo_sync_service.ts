import { RepoSyncService } from '#kits/services/repo_sync_service'
import type { IdentityService } from '#profile/services/identity_service'
import type { ProfileService } from '#profile/services/profile_service'
import type { Client } from '@atproto/lex'
import type { AtprotoDid } from '@atproto/oauth-client-node'

export type TestableRepoSyncOptions = {
  pdsEndpoint?: string | null
  kitsSynced?: number
  kitsPruned?: number
}

export class TestableRepoSyncService extends RepoSyncService {
  constructor(
    identityService: IdentityService,
    profileService: ProfileService,
    private options: TestableRepoSyncOptions = {}
  ) {
    super(identityService, profileService)
  }

  public override async resolvePdsEndpoint(): Promise<string | null> {
    return this.options.pdsEndpoint ?? 'https://mock.pds'
  }

  protected override async syncKits(
    _client: Client,
    _repoDid: AtprotoDid
  ): Promise<{ synced: number; pruned: number }> {
    return {
      synced: this.options.kitsSynced ?? 2,
      pruned: this.options.kitsPruned ?? 0,
    }
  }

  protected override async syncComments(_client: Client, _repoDid: AtprotoDid): Promise<void> {}
}
