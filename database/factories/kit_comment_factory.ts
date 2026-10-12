import Factory from '@adonisjs/lucid/factories'
import { AtUri } from '@atproto/syntax'
import { DateTime } from 'luxon'
import KitComment from '#kits/models/kit_comment'

export const KitCommentFactory = Factory.define(KitComment, ({ faker }) => {
  const did = `did:plc:${faker.string.alphanumeric(24)}`
  const rkey = faker.string.alphanumeric(13)
  return {
    did,
    uri: AtUri.make(did, 'build.gunpla.comment', rkey).toString(),
    kitId: 0,
    text: faker.lorem.sentence(),
    createdAt: DateTime.now(),
  }
}).build()
