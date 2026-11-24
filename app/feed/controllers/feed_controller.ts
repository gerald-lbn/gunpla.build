import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import FeedService from '#feed/services/feed_service'
import KitTransformer from '#kits/transformers/kit_transformer'
import LinkPreview from '#link_preview/link_preview'

@inject()
export default class FeedController {
  constructor(private feedService: FeedService) {}

  async index({ inertia, request }: HttpContext) {
    const kits = await this.feedService.getRecentKits(50)
    const linkPreview = new LinkPreview({
      path: request.url(),
      title: 'Latest builds',
      description:
        "The newest Gunpla kits on builders' shelves: photos, grades and scales, each stored in the builder's own AT Protocol repository.",
    })
    return inertia.render(
      'home/index',
      { kits: KitTransformer.transform(kits) },
      linkPreview.toViewProps()
    )
  }
}
