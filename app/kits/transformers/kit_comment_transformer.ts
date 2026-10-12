import { BaseTransformer } from '@adonisjs/core/transformers'
import type KitComment from '#kits/models/kit_comment'
import ProfileTransformer from '#profile/transformers/profile_transformer'

export default class KitCommentTransformer extends BaseTransformer<KitComment> {
  toObject() {
    return {
      id: this.resource.id,
      did: this.resource.did,
      uri: this.resource.uri,
      text: this.resource.text,
      createdAt: this.resource.createdAt.toISO(),
      author: ProfileTransformer.transform(this.whenLoaded(this.resource.profile)),
    }
  }
}
