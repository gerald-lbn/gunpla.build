import ProfileService from '#profile/services/profile_service'
import AchievementsService from '#profile/services/achievements_service'
import { FakeIdentityService } from '#tests/helpers/fake_identity_service'
import type Profile from '#profile/models/profile'

export type FakeProfileOptions = {
  onSyncProfile?: (did: string, handle?: string) => Promise<Profile | null> | Profile | null
}

export class FakeProfileService extends ProfileService {
  public syncedProfiles: Array<{ did: string; handle?: string }> = []

  constructor(private options: FakeProfileOptions = {}) {
    super(new AchievementsService(), new FakeIdentityService())
  }

  override async syncProfile(did: string, handle?: string): Promise<Profile> {
    this.syncedProfiles.push({ did, handle })
    if (this.options.onSyncProfile) {
      const result = await this.options.onSyncProfile(did, handle)
      if (result) return result
    }
    return {
      did,
      handle: handle || `${did.replace('did:plc:', '')}.bsky.social`,
      displayName: 'Mock User',
      avatarUrl: 'https://mock.avatar',
      pdsEndpoint: 'https://mock.pds',
      badges: [],
      syncedAt: new Date().toISOString(),
    } as unknown as Profile
  }
}
