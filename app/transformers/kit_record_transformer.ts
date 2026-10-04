import { BaseTransformer } from '@adonisjs/core/transformers'
import type { Main } from '#lexicons/build/gunpla/kit.defs'

type KitRecord = { uri: string; value: Main }

export default class KitRecordTransformer extends BaseTransformer<KitRecord> {
  toObject() {
    const rkey = this.resource.uri.split('/').pop()!
    return {
      uri: this.resource.uri,
      rkey,
      name: this.resource.value.name,
      grade: this.resource.value.grade ?? null,
      scale: this.resource.value.scale ?? null,
      status: this.resource.value.status,
    }
  }
}
