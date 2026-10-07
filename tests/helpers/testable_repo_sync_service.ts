import { RepoSyncService } from '#kits/services/repo_sync_service'
import type { IdentityService } from '#profile/services/identity_service'
import type { ProfileService } from '#profile/services/profile_service'
import type { Client } from '@atproto/lex'
import type { AtprotoDid } from '@atproto/oauth-client-node'

export interface TestableRepoSyncOptions {
  pdsEndpoint?: string | null
  kitsSynced?: number
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

  protected override async syncKits(_client: Client, _repoDid: AtprotoDid): Promise<number> {
    return this.options.kitsSynced ?? 2
  }
}
