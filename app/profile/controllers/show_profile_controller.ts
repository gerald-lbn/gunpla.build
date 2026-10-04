import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { ProfileService } from '#profile/services/profile_service'

@inject()
export default class ShowProfileController {
  constructor(private profileService: ProfileService) {}

  async render({ params, inertia, response }: HttpContext) {
    const handle = params.handle as string
    const profile = await this.profileService.getProfileData(handle)

    if (!profile) {
      response.status(404)
      return inertia.render('errors/not_found', {})
    }

    return inertia.render('profile', {
      handle: profile.handle,
      kits: profile.kits,
      buildLogs: profile.buildLogs,
      stats: profile.stats,
      achievements: profile.achievements,
    })
  }
}
