import { inject } from '@adonisjs/core'
import Kit from '#kits/models/kit'
import BuildLog from '#kits/models/build_log'
import KitTransformer from '#kits/transformers/kit_transformer'
import BuildLogTransformer from '#kits/transformers/build_log_transformer'
import { AchievementsService } from '#profile/services/achievements_service'
import { IdentityService } from '#profile/services/identity_service'

@inject()
export class ProfileService {
  constructor(
    private achievementsService: AchievementsService,
    private identityService: IdentityService
  ) {}

  private async fetchBskyProfile(
    did: string
  ): Promise<{ avatarUrl: string | null; description: string | null; displayName: string | null }> {
    try {
      const url = `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) })
      if (!res.ok) return { avatarUrl: null, description: null, displayName: null }
      const data = (await res.json()) as {
        avatar?: string
        description?: string
        displayName?: string
      }
      return {
        avatarUrl: data.avatar ?? null,
        description: data.description ?? null,
        displayName: data.displayName ?? null,
      }
    } catch {
      return { avatarUrl: null, description: null, displayName: null }
    }
  }

  async getProfileData(handle: string) {
    const identity = await this.identityService.resolve(handle)
    if (!identity) {
      return null
    }

    const [kits, buildLogs, bskyProfile] = await Promise.all([
      Kit.query()
        .where((q) => q.where('handle', identity.handle).orWhere('did', identity.did))
        .orderBy('indexed_at', 'desc')
        .limit(100),
      BuildLog.query()
        .where((q) => q.where('handle', identity.handle).orWhere('did', identity.did))
        .orderBy('indexed_at', 'desc')
        .limit(50),
      this.fetchBskyProfile(identity.did),
    ])

    const stats = this.achievementsService.computeStats(kits, buildLogs)
    const achievements = this.achievementsService.computeAchievements(kits, buildLogs)

    return {
      handle: identity.handle,
      did: identity.did,
      avatarUrl: bskyProfile.avatarUrl,
      description: bskyProfile.description,
      displayName: bskyProfile.displayName,
      kits: KitTransformer.transform(kits),
      buildLogs: BuildLogTransformer.transform(buildLogs),
      stats,
      achievements,
    }
  }
}
