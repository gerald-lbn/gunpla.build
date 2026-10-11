import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { updateKitValidator, kitParamsValidator } from '#kits/validators/kit'
import { KitsService } from '#kits/services/kits_service'
import KitRecordTransformer from '#kits/transformers/kit_record_transformer'

@inject()
export default class UpdateKitController {
  constructor(private kitsService: KitsService) {}

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

    try {
      await this.kitsService.update(rkey, data)

      session.flash('success', `Updated "${data.name}"`)
      return response.redirect().toRoute('shelf')
    } catch {
      session.flash('error', 'Failed to update kit on ATProto')
      return response.redirect().back()
    }
  }
}
