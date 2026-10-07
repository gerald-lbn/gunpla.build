import { BaseTransformer } from '@adonisjs/core/transformers'
import type BuildLog from '#kits/models/build_log'

export default class BuildLogTransformer extends BaseTransformer<BuildLog> {
  toObject() {
    return {
      id: this.resource.id,
      uri: this.resource.uri,
      did: this.resource.did,
      kitUri: this.resource.kitUri,
      stage: this.resource.stage,
      text: this.resource.text,
      recordCreatedAt: this.resource.recordCreatedAt?.toISO() ?? null,
      indexedAt: this.resource.indexedAt.toISO()!,
    }
  }

  forExploreDetail() {
    return {
      formattedDate: this.resource.recordCreatedAt?.toFormat('MMM yyyy') ?? null,
      stage: this.resource.stage,
      text: this.resource.text,
    }
  }
}
