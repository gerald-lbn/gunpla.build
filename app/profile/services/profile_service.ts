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

  async getProfileData(handle: string) {
    const identity = await this.identityService.resolve(handle)
    if (!identity) {
      return null
    }

    const [kits, buildLogs] = await Promise.all([
      Kit.query()
        .where((q) => q.where('handle', identity.handle).orWhere('did', identity.did))
        .orderBy('indexed_at', 'desc')
        .limit(100),
      BuildLog.query()
        .where((q) => q.where('handle', identity.handle).orWhere('did', identity.did))
        .orderBy('indexed_at', 'desc')
        .limit(50),
    ])

    const stats = this.achievementsService.computeStats(kits, buildLogs)
    const achievements = this.achievementsService.computeAchievements(kits, buildLogs)

    return {
      handle: identity.handle,
      did: identity.did,
      kits: KitTransformer.transform(kits),
      buildLogs: BuildLogTransformer.transform(buildLogs),
      stats,
      achievements,
    }
  }
}
