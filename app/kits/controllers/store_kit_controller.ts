import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { createKitValidator } from '#kits/validators/kit'
import { KitsService } from '#kits/services/kits_service'

@inject()
export default class StoreKitController {
  constructor(private kitsService: KitsService) {}

  async render({ inertia }: HttpContext) {
    return inertia.render('kits/new', {})
  }

  async handle({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(createKitValidator)

    await this.kitsService.create(data)

    session.flash('success', `Kit "${data.name}" added to your shelf`)
    return response.redirect().toRoute('dashboard')
  }
}
