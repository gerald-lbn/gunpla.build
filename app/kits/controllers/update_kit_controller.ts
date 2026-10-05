import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { AtUri } from '@atproto/syntax'
import { getBlobCidString } from '@atproto/lex'
import { updateKitValidator } from '#kits/validators/kit'
import { KitsService } from '#kits/services/kits_service'
import { getBlobUrl } from '#kits/helpers/atproto'

@inject()
export default class UpdateKitController {
  constructor(private kitsService: KitsService) {}

  async render({ params, inertia, response }: HttpContext) {
    const rkey = params.rkey as string

    try {
      const remote = await this.kitsService.getByRkey(rkey)
      const atUri = new AtUri(remote.uri)
      const did = atUri.did
      const photoCid = getBlobCidString(remote.value.photos?.[0]) ?? null

      return inertia.render('kits/edit', {
        kit: {
          rkey,
          uri: remote.uri,
          name: remote.value.name,
          grade: remote.value.grade ?? '',
          scale: remote.value.scale ?? '',
          status: remote.value.status,
          photoCid,
          photoUrl: photoCid && did ? getBlobUrl(did, photoCid, 'thumb') : null,
        },
      })
    } catch {
      return response.notFound('Kit not found')
    }
  }

  async handle({ params, request, response, session }: HttpContext) {
    const rkey = params.rkey as string
    const data = await request.validateUsing(updateKitValidator)

    try {
      await this.kitsService.update(rkey, data)

      session.flash('success', `Updated "${data.name}"`)
      return response.redirect().toRoute('dashboard')
    } catch {
      session.flash('error', 'Failed to update kit on ATProto')
      return response.redirect().back()
    }
  }
}
