import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { createKitValidator, kitParamsValidator, updateKitValidator } from '#kits/validators/kit'
import KitsService from '#kits/services/kits_service'
import IdentityService from '#profile/services/identity_service'
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

  async store({ request, response, session, wideEvent }: HttpContext) {
    const data = await request.validateUsing(createKitValidator)
    wideEvent.set({
      kit: {
        action: 'create',
        name: data.name,
        status: data.status,
        grade: data.grade ?? null,
        scale: data.scale ?? null,
        manufacturer: data.manufacturer ?? null,
        photo_count: (data.photos?.length ?? 0) + (data.photo ? 1 : 0),
      },
    })
    const record = await this.kitsService.create(data)
    wideEvent.set({ kit: { uri: record.uri } })
    session.flash('success', `Kit "${data.name}" added to your shelf`)
    return response.redirect().toRoute('shelf')
  }

  async edit({ params, request, inertia }: HttpContext) {
    const { rkey } = await request.validateUsing(kitParamsValidator, { data: params })
    const remote = await this.kitsService.getByRkey(rkey)
    const pdsUrl = await this.kitsService.getPdsUrl()
    return inertia.render('kits/edit', {
      kit: KitRecordTransformer.transform(remote, pdsUrl).useVariant('forEdit'),
    })
  }

  async update({ params, request, response, session, wideEvent }: HttpContext) {
    const { rkey } = await request.validateUsing(kitParamsValidator, { data: params })
    const data = await request.validateUsing(updateKitValidator)
    wideEvent.set({
      kit: {
        action: 'update',
        rkey,
        name: data.name,
        status: data.status,
        grade: data.grade ?? null,
        scale: data.scale ?? null,
        new_photo_count: (data.photos?.length ?? 0) + (data.photo ? 1 : 0),
      },
    })
    await this.kitsService.update(rkey, data)
    session.flash('success', `Updated "${data.name}"`)
    return response.redirect().toRoute('shelf')
  }

  async destroy({ params, request, response, session, wideEvent }: HttpContext) {
    const { rkey } = await request.validateUsing(kitParamsValidator, { data: params })
    wideEvent.set({ kit: { action: 'delete', rkey } })
    await this.kitsService.delete(rkey)
    session.flash('success', 'Kit deleted successfully')
    return response.redirect().toRoute('shelf')
  }
}
