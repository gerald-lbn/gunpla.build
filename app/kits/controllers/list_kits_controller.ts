import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { KitsService } from '#kits/services/kits_service'

@inject()
export default class ListKitsController {
  constructor(private kitsService: KitsService) {}

  async render({ inertia }: HttpContext) {
    const kits = await this.kitsService.listForUser()
    return inertia.render('shelf', { kits })
  }
}
