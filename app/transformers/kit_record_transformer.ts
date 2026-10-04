import { BaseTransformer } from '@adonisjs/core/transformers'
import type { Main } from '#lexicons/build/gunpla/kit.defs'

type KitRecord = { uri: string; value: Main }

export default class KitRecordTransformer extends BaseTransformer<KitRecord> {
  toObject() {
    return {
      uri: this.resource.uri,
      name: this.resource.value.name,
      grade: this.resource.value.grade ?? null,
      scale: this.resource.value.scale ?? null,
      status: this.resource.value.status,
    }
  }
}
