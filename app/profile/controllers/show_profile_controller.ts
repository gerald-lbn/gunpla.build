import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { ProfileService } from '#profile/services/profile_service'

@inject()
export default class ShowProfileController {
  constructor(private profileService: ProfileService) {}

  async render({ params, inertia }: HttpContext) {
    const handle = params.handle as string
    const { kits, buildLogs, stats, achievements } =
      await this.profileService.getProfileData(handle)

    return inertia.render('profile', {
      handle,
      kits,
      buildLogs,
      stats,
      achievements,
    })
  }
}
