import { BaseTransformer } from '@adonisjs/core/transformers'
import type Kit from '#kits/models/kit'
import { getBlobUrl } from '#kits/helpers/atproto'

export default class KitTransformer extends BaseTransformer<Kit> {
  toObject() {
    return {
      id: this.resource.id,
      uri: this.resource.uri,
      did: this.resource.did,
      handle: this.resource.handle,
      name: this.resource.name,
      grade: this.resource.grade,
      scale: this.resource.scale,
      status: this.resource.status,
      photoCid: this.resource.photoCid ?? null,
      photoUrl:
        this.resource.photoCid && this.resource.did
          ? getBlobUrl(this.resource.did, this.resource.photoCid, 'thumb')
          : null,
      indexedAt: this.resource.indexedAt.toISO()!,
    }
  }
}
