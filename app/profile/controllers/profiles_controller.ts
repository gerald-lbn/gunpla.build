import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { AtUri } from '@atproto/syntax'
import ProfileService from '#profile/services/profile_service'
import KitTransformer from '#kits/transformers/kit_transformer'
import { showProfileParamsValidator, showKitParamsValidator } from '#profile/validators/profile'

@inject()
export default class ProfilesController {
  constructor(private profileService: ProfileService) {}

  async show({ params, request, inertia, response, auth }: HttpContext) {
    const { handle } = await request.validateUsing(showProfileParamsValidator, { data: params })

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

  async showKit({ params, request, inertia, response, auth }: HttpContext) {
    const { handle, rkey } = await request.validateUsing(showKitParamsValidator, { data: params })

    const profile = await this.profileService.getProfileData(handle, auth.user?.did)

    if (!profile) {
      response.status(404)
      return inertia.render('errors/not_found', { handle })
    }

    const kit = profile.kits.find((k) => new AtUri(k.uri).rkey === rkey)

    if (!kit) {
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
      selectedRkey: rkey,
    })
  }
}
