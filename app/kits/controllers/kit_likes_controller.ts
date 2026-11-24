import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import KitLikesService from '#kits/services/kit_likes_service'
import { likeKitParamsValidator } from '#kits/validators/kit'

@inject()
export default class KitLikesController {
  constructor(private kitLikesService: KitLikesService) {}

  async store({ params, request, response, wideEvent }: HttpContext) {
    const { handle, rkey } = await request.validateUsing(likeKitParamsValidator, {
      data: params,
    })
    wideEvent.set({ like: { action: 'like', kit_owner_handle: handle, kit_rkey: rkey } })
    const { likeCount } = await this.kitLikesService.like(handle, rkey)
    wideEvent.set({ like: { like_count: likeCount } })
    return response.json({ likeCount, viewerHasLiked: true })
  }

  async destroy({ params, request, response, wideEvent }: HttpContext) {
    const { handle, rkey } = await request.validateUsing(likeKitParamsValidator, {
      data: params,
    })
    wideEvent.set({ like: { action: 'unlike', kit_owner_handle: handle, kit_rkey: rkey } })
    const { likeCount } = await this.kitLikesService.unlike(handle, rkey)
    wideEvent.set({ like: { like_count: likeCount } })
    return response.json({ likeCount, viewerHasLiked: false })
  }
}
