import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import FeedService from '#feed/services/feed_service'
import KitTransformer from '#kits/transformers/kit_transformer'

@inject()
export default class FeedController {
  constructor(private feedService: FeedService) {}

  async index({ inertia }: HttpContext) {
    const kits = await this.feedService.getRecentKits(50)
    return inertia.render('home/index', { kits: KitTransformer.transform(kits) })
  }
}
