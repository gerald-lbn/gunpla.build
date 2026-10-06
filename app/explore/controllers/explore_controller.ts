import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { ExploreService } from '#explore/services/explore_service'

@inject()
export default class ExploreController {
  constructor(private exploreService: ExploreService) {}

  async render({ inertia, request }: HttpContext) {
    const page = Math.max(1, Number(request.input('page', 1)))
    const q = String(request.input('q', '')).toLowerCase().trim()

    const { kits, hasMore } = await this.exploreService.listKits(page, q)

    return inertia.render('explore/index', { kits, hasMore, page, q })
  }
}
