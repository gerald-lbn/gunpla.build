import { BaseTransformer } from '@adonisjs/core/transformers'
import type Kit from '#models/kit'

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
      indexedAt: this.resource.indexedAt.toISO()!,
    }
  }
}
