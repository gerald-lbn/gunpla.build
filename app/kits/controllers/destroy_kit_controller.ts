import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { KitsService } from '#kits/services/kits_service'

@inject()
export default class DestroyKitController {
  constructor(private kitsService: KitsService) {}

  async handle({ params, response, session }: HttpContext) {
    const rkey = params.rkey as string

    try {
      await this.kitsService.delete(rkey)

      session.flash('success', 'Kit deleted successfully')
      return response.redirect().toRoute('shelf')
    } catch {
      session.flash('error', 'Failed to delete kit from ATProto')
      return response.redirect().back()
    }
  }
}
