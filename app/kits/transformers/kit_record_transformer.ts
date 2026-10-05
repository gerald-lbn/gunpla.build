import { BaseTransformer } from '@adonisjs/core/transformers'
import type { Main } from '#lexicons/build/gunpla/kit.defs'
import { AtUri } from '@atproto/syntax'
import { getBlobCidString } from '@atproto/lex'
import { getBlobUrl } from '#kits/helpers/atproto'

type KitRecord = { uri: string; value: Main }

export default class KitRecordTransformer extends BaseTransformer<KitRecord> {
  toObject() {
    const atUri = new AtUri(this.resource.uri)
    const rkey = atUri.rkey
    const did = atUri.did
    const photoCid = getBlobCidString(this.resource.value.photos?.[0]) ?? null

    return {
      uri: this.resource.uri,
      rkey,
      did,
      name: this.resource.value.name,
      grade: this.resource.value.grade ?? null,
      scale: this.resource.value.scale ?? null,
      status: this.resource.value.status,
      photoCid,
      photoUrl: photoCid && did ? getBlobUrl(did, photoCid, 'thumb') : null,
      fullPhotoUrl: photoCid && did ? getBlobUrl(did, photoCid, 'full') : null,
    }
  }
}
