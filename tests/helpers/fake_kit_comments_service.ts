import { AtUri } from '@atproto/syntax'
import { DateTime } from 'luxon'
import type { AtprotoUser } from '@thisismissem/adonisjs-atproto-oauth'
import Kit from '#kits/models/kit'
import KitComment from '#kits/models/kit_comment'
import Profile from '#profile/models/profile'
import KitCommentsService from '#kits/services/kit_comments_service'

export class FakeKitCommentsService extends KitCommentsService {
  override async create(
    handle: string,
    rkey: string,
    user: AtprotoUser,
    text: string
  ): Promise<KitComment> {
    const profile = await Profile.findByOrFail('handle', handle)
    const kitUri = AtUri.make(profile.did, 'build.gunpla.kit', rkey).toString()
    const kit = await Kit.findByOrFail('uri', kitUri)
    const fakeRkey = `fake${Date.now()}`
    const uri = AtUri.make(user.did, 'build.gunpla.comment', fakeRkey).toString()
    const comment = await KitComment.create({
      uri,
      did: user.did,
      kitId: kit.id,
      text,
      createdAt: DateTime.now(),
    })
    await comment.load('profile')
    return comment
  }

  override async destroy(comment: KitComment, _user: AtprotoUser): Promise<void> {
    await comment.delete()
  }
}
