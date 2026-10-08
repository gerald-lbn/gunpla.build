import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { AtUri } from '@atproto/syntax'
import { ProfileService } from '#profile/services/profile_service'
import KitTransformer from '#kits/transformers/kit_transformer'

@inject()
export default class ShowKitController {
  constructor(private profileService: ProfileService) {}

  async render({ params, inertia, response }: HttpContext) {
    const handle = params.handle as string
    const rkey = params.rkey as string
    const profile = await this.profileService.getProfileData(handle)

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
      kits: KitTransformer.transform(profile.kits).useVariant('forProfileShelf'),
      stats: profile.stats,
      achievements: profile.achievements,
      selectedRkey: rkey,
    })
  }
}
