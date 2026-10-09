import { inject } from '@adonisjs/core'
import { AtUri, ensureValidHandle, ensureValidRecordKey } from '@atproto/syntax'
import { l } from '@atproto/lex'
import { AtprotoUser } from '@thisismissem/adonisjs-atproto-oauth'
import gunplaLike from '#lexicons/build/gunpla/like'
import Kit from '#kits/models/kit'
import KitLike from '#kits/models/kit_like'
import Profile from '#profile/models/profile'

@inject()
export class KitLikesService {
  constructor(protected user: AtprotoUser) {}

  async like(handle: string, rkey: string): Promise<{ likeCount: number }> {
    ensureValidHandle(handle)
    ensureValidRecordKey(rkey)

    const profile = await Profile.findByOrFail('handle', handle)
    const kitUri = AtUri.make(profile.did, 'build.gunpla.kit', rkey).toString()
    const kit = await Kit.findByOrFail('uri', kitUri)

    const result = await this.user.client.create(gunplaLike, {
      subject: kit.uri as l.AtUriString,
      createdAt: l.currentDatetimeString(),
    })

    await KitLike.updateOrCreate(
      { did: this.user.did, kitId: kit.id },
      { uri: result.uri, did: this.user.did, kitId: kit.id }
    )

    const [row] = await KitLike.query().where('kit_id', kit.id).count('* as count')
    return { likeCount: Number(row.$extras.count) }
  }

  async unlike(handle: string, rkey: string): Promise<{ likeCount: number }> {
    ensureValidHandle(handle)
    ensureValidRecordKey(rkey)

    const profile = await Profile.findByOrFail('handle', handle)
    const kitUri = AtUri.make(profile.did, 'build.gunpla.kit', rkey).toString()
    const kit = await Kit.findByOrFail('uri', kitUri)

    const likeRecord = await KitLike.query()
      .where('did', this.user.did)
      .where('kit_id', kit.id)
      .firstOrFail()

    const likeRkey = new AtUri(likeRecord.uri).rkey
    await this.user.client.delete(gunplaLike, { rkey: likeRkey })

    await likeRecord.delete()

    const [row] = await KitLike.query().where('kit_id', kit.id).count('* as count')
    return { likeCount: Number(row.$extras.count) }
  }
}
