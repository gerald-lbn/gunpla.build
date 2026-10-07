import { BaseTransformer } from '@adonisjs/core/transformers'
import type Profile from '#profile/models/profile'

export default class ProfileTransformer extends BaseTransformer<Profile> {
  toObject() {
    return this.pick(this.resource, ['did', 'handle', 'displayName', 'avatarUrl', 'description'])
  }
}
