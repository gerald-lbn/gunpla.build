import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import StatsService from '#stats/services/stats_service'

@inject()
export default class StatsController {
  constructor(private stats: StatsService) {}

  async render({ inertia }: HttpContext) {
    return inertia.render('stats', await this.stats.gather())
  }
}
