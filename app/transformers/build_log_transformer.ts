import { BaseTransformer } from '@adonisjs/core/transformers'
import type BuildLog from '#models/build_log'

export default class BuildLogTransformer extends BaseTransformer<BuildLog> {
  toObject() {
    return {
      id: this.resource.id,
      uri: this.resource.uri,
      did: this.resource.did,
      handle: this.resource.handle,
      kitUri: this.resource.kitUri,
      stage: this.resource.stage,
      text: this.resource.text,
      indexedAt: this.resource.indexedAt.toISO()!,
    }
  }
}
