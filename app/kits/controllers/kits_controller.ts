import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { createKitValidator, kitParamsValidator, updateKitValidator } from '#kits/validators/kit'
import { KitsService } from '#kits/services/kits_service'
import { IdentityService } from '#profile/services/identity_service'
import KitRecordTransformer from '#kits/transformers/kit_record_transformer'

@inject()
export default class KitsController {
  constructor(private kitsService: KitsService) {}

  @inject()
  async index({ auth, response }: HttpContext, identityService: IdentityService) {
    const did = auth.getUserOrFail().did
    const identity = await identityService.resolve(did)
    const handle = identity?.handle ?? did
    return response.redirect().toRoute('profile', { handle })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('kits/new', {})
  }

  async store({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(createKitValidator)
    await this.kitsService.create(data)
    session.flash('success', `Kit "${data.name}" added to your shelf`)
    return response.redirect().toRoute('shelf')
  }

  async edit({ params, request, inertia }: HttpContext) {
    const { rkey } = await request.validateUsing(kitParamsValidator, { data: params })
    const remote = await this.kitsService.getByRkey(rkey)
    return inertia.render('kits/edit', {
      kit: KitRecordTransformer.transform(remote).useVariant('forEdit'),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const { rkey } = await request.validateUsing(kitParamsValidator, { data: params })
    const data = await request.validateUsing(updateKitValidator)
    await this.kitsService.update(rkey, data)
    session.flash('success', `Updated "${data.name}"`)
    return response.redirect().toRoute('shelf')
  }

  async destroy({ params, request, response, session }: HttpContext) {
    const { rkey } = await request.validateUsing(kitParamsValidator, { data: params })
    await this.kitsService.delete(rkey)
    session.flash('success', 'Kit deleted successfully')
    return response.redirect().toRoute('shelf')
  }
}
