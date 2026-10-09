import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { AtUri } from '@atproto/syntax'
import { getBlobCidString } from '@atproto/lex'
import { updateKitValidator, kitParamsValidator } from '#kits/validators/kit'
import { KitsService } from '#kits/services/kits_service'
import { getBlobUrl } from '#kits/helpers/atproto'

@inject()
export default class UpdateKitController {
  constructor(private kitsService: KitsService) {}

  async render({ params, inertia }: HttpContext) {
    const { rkey } = await kitParamsValidator.validate(params)
    const remote = await this.kitsService.getByRkey(rkey)
    const did = new AtUri(remote.uri).did

    const photos = (remote.value.photos ?? [])
      .map((p) => {
        const cid = getBlobCidString(p)
        if (!cid || !did) return null
        return {
          cid,
          thumbUrl: getBlobUrl(did, cid, 'thumb'),
          fullUrl: getBlobUrl(did, cid, 'full'),
        }
      })
      .filter((p): p is { cid: string; thumbUrl: string; fullUrl: string } => p !== null)

    const photoCid = photos[0]?.cid ?? null
    const photoUrl = photos[0]?.thumbUrl ?? null

    return inertia.render('kits/edit', {
      kit: {
        rkey,
        uri: remote.uri,
        name: remote.value.name,
        grade: remote.value.grade ?? '',
        scale: remote.value.scale ?? '',
        manufacturer: remote.value.manufacturer ?? '',
        acquiredAt: remote.value.acquiredAt
          ? (DateTime.fromISO(remote.value.acquiredAt).toISODate() ?? '')
          : '',
        status: remote.value.status,
        photoCid,
        photoUrl,
        photos,
      },
    })
  }

  async handle({ params, request, response, session }: HttpContext) {
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
