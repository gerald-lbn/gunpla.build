import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { KitLikesService } from '#kits/services/kit_likes_service'
import { likeKitParamsValidator } from '#kits/validators/kit'

@inject()
export default class LikeKitController {
  constructor(private kitLikesService: KitLikesService) {}

  async store({ params, request, response }: HttpContext) {
    const { handle, rkey } = await request.validateUsing(likeKitParamsValidator, {
      data: params,
    })
    const { likeCount } = await this.kitLikesService.like(handle, rkey)
    return response.json({ likeCount, viewerHasLiked: true })
  }

  async destroy({ params, request, response }: HttpContext) {
    const { handle, rkey } = await request.validateUsing(likeKitParamsValidator, {
      data: params,
    })
    const { likeCount } = await this.kitLikesService.unlike(handle, rkey)
    return response.json({ likeCount, viewerHasLiked: false })
  }
}
