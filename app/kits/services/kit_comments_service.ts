import transmit from '@adonisjs/transmit/services/main'
import { l } from '@atproto/lex'
import { asAtUriString, AtUri } from '@atproto/syntax'
import { DateTime } from 'luxon'
import type { AtprotoUser } from '@thisismissem/adonisjs-atproto-oauth'
import type { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import gunplaComment from '#lexicons/build/gunpla/comment'
import Kit from '#kits/models/kit'
import KitComment from '#kits/models/kit_comment'
import Profile from '#profile/models/profile'

export class KitCommentsService {
  private async resolveKit(handle: string, rkey: string): Promise<Kit> {
    const profile = await Profile.findByOrFail('handle', handle)
    const kitUri = AtUri.make(profile.did, 'build.gunpla.kit', rkey).toString()
    return Kit.findByOrFail('uri', kitUri)
  }

  async list(
    handle: string,
    rkey: string,
    page: number
  ): Promise<ModelPaginatorContract<KitComment>> {
    const kit = await this.resolveKit(handle, rkey)
    return kit
      .related('comments')
      .query()
      .preload('profile')
      .orderBy('created_at', 'desc')
      .paginate(page, 20)
  }

  async create(handle: string, rkey: string, user: AtprotoUser, text: string): Promise<KitComment> {
    const kit = await this.resolveKit(handle, rkey)
    const gunplaCommentRecord = await user.client.create(gunplaComment, {
      subject: asAtUriString(kit.uri),
      text,
      createdAt: l.currentDatetimeString(),
    })

    const comment = await KitComment.create({
      uri: gunplaCommentRecord.uri,
      did: user.did,
      kitId: kit.id,
      text,
      createdAt: DateTime.now(),
    })
    await comment.load('profile')

    transmit.broadcast('kits', {
      type: 'comment_created',
      kitUri: kit.uri,
      comment: {
        id: comment.id,
        did: comment.did,
        uri: comment.uri,
        text: comment.text,
        createdAt: comment.createdAt.toISO(),
      },
    })

    return comment
  }

  async destroy(comment: KitComment, user: AtprotoUser): Promise<void> {
    const kit = await Kit.find(comment.kitId)
    const deletedId = comment.id
    const kitUri = kit?.uri

    const rkey = new AtUri(comment.uri).rkey
    await user.client.delete(gunplaComment, { rkey })
    await comment.delete()

    if (kitUri) {
      transmit.broadcast('kits', {
        type: 'comment_deleted',
        kitUri,
        commentId: deletedId,
      })
    }
  }
}
