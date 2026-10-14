import Factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import { AtUri } from '@atproto/syntax'
import Kit from '#kits/models/kit'

export const KitFactory = Factory.define(Kit, ({ faker }) => {
  const did = `did:plc:${faker.string.alphanumeric(24)}`
  const rkey = faker.string.alphanumeric(13)
  return {
    uri: AtUri.make(did, 'build.gunpla.kit', rkey).toString(),
    cid: null,
    did,
    name: faker.commerce.productName(),
    grade: null,
    scale: null,
    manufacturer: null,
    status: 'backlog',
    photos: null,
    acquiredAt: null,
    recordCreatedAt: null,
    indexedAt: DateTime.now(),
  }
}).build()
