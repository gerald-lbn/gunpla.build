import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import StatsService from '#stats/services/stats_service'
import LinkPreview from '#link_preview/link_preview'

@inject()
export default class StatsController {
  constructor(private stats: StatsService) {}

  async index({ inertia, request }: HttpContext) {
    const stats = await this.stats.gather()
    const linkPreview = new LinkPreview({
      path: request.url(),
      title: 'Community stats',
      description: `${stats.totalKits} kits from ${stats.totalBuilders} builders, with ${stats.totalPhotos} photos and ${stats.totalLikes} likes, on gunpla.build.`,
    })
    return inertia.render('stats', stats, linkPreview.toViewProps())
  }
}
