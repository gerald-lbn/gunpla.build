import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { ExploreService } from '#explore/services/explore_service'
import KitTransformer from '#kits/transformers/kit_transformer'
import { listKitsValidator } from '#kits/validators/kit'

@inject()
export default class ExploreController {
  constructor(private exploreService: ExploreService) {}

  async render({ inertia, request, auth }: HttpContext) {
    const payload = await request.validateUsing(listKitsValidator)
    const page = Math.max(1, payload.page ?? 1)

    const { paginator, viewerLikedKitIds } = await this.exploreService.listKits({
      q: payload.q,
      page,
      viewerDid: auth.user?.did,
    })
    const kits = paginator.all()

    return inertia.render('explore/index', {
      kits: KitTransformer.paginate(kits, paginator.getMeta(), viewerLikedKitIds)
        .useVariant('forExplore')
        .depth(2),
      q: payload.q ?? '',
    })
  }
}
