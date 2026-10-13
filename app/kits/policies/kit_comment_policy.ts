import { BasePolicy } from '@adonisjs/bouncer'
import type { AtprotoUser } from '@thisismissem/adonisjs-atproto-oauth'
import type KitComment from '#kits/models/kit_comment'

export default class KitCommentPolicy extends BasePolicy {
  destroy(user: AtprotoUser, comment: KitComment): boolean {
    return user.did === comment.did
  }
}
