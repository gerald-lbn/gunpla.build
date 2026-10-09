import Factory from '@adonisjs/lucid/factories'
import { AtUri } from '@atproto/syntax'
import { DateTime } from 'luxon'
import KitLike from '#kits/models/kit_like'

export const KitLikeFactory = Factory.define(KitLike, ({ faker }) => {
  const did = `did:plc:${faker.string.alphanumeric(24)}`
  const rkey = faker.string.alphanumeric(13)
  return {
    did,
    uri: AtUri.make(did, 'build.gunpla.like', rkey).toString(),
    kitId: 0,
    createdAt: DateTime.now(),
  }
}).build()
