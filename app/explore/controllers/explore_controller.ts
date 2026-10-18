import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ExploreService from '#explore/services/explore_service'
import KitTransformer from '#kits/transformers/kit_transformer'
import { filterValuesValidator, listKitsValidator } from '#kits/validators/kit'

@inject()
export default class ExploreController {
  constructor(private exploreService: ExploreService) {}

  async index({ inertia, request, auth }: HttpContext) {
    const payload = await request.validateUsing(listKitsValidator)
    const page = Math.max(1, payload.page ?? 1)

    return inertia.render('explore/index', {
      kits: inertia
        .scroll(async () => {
          const { paginator, viewerLikedKitIds } = await this.exploreService.listShowcaseBuilds({
            q: payload.q,
            grade: payload.grade,
            scale: payload.scale,
            manufacturer: payload.manufacturer,
            builder: payload.builder,
            page,
            viewerDid: auth.user?.did,
          })
          const kits = paginator.all()

          return KitTransformer.paginate(kits, paginator.getMeta(), viewerLikedKitIds)
            .useVariant('forExplore')
            .depth(2)
        })
        .matchOn('id'),
      q: payload.q ?? '',
      grade: payload.grade ?? '',
      scale: payload.scale ?? '',
      manufacturer: payload.manufacturer ?? '',
      builder: payload.builder ?? '',
    })
  }

  async filterValues({ request }: HttpContext) {
    const { type, q } = await request.validateUsing(filterValuesValidator)
    const values = await this.exploreService.listDistinctFilterValues(type, q)
    return { values }
  }
}
