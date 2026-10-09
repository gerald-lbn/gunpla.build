import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { ProfileService } from '#profile/services/profile_service'
import KitTransformer from '#kits/transformers/kit_transformer'

@inject()
export default class ShowProfileController {
  constructor(private profileService: ProfileService) {}

  async render({ params, inertia, response, auth }: HttpContext) {
    const handle = params.handle as string
    const profile = await this.profileService.getProfileData(handle, auth.user?.did)

    if (!profile) {
      response.status(404)
      return inertia.render('errors/not_found', { handle })
    }

    return inertia.render('profile', {
      handle: profile.handle,
      did: profile.did,
      avatarUrl: profile.avatarUrl,
      description: profile.description,
      displayName: profile.displayName,
      kits: KitTransformer.transform(profile.kits, profile.viewerLikedKitIds).useVariant(
        'forProfileShelf'
      ),
      stats: profile.stats,
      achievements: profile.achievements,
    })
  }
}
