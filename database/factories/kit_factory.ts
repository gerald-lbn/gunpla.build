import Factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import Kit from '#kits/models/kit'

export const KitFactory = Factory.define(Kit, ({ faker }) => {
  const did = `did:plc:${faker.string.alphanumeric(24)}`
  const rkey = faker.string.alphanumeric(13)
  return {
    uri: `at://${did}/gunpla.kit/${rkey}`,
    cid: null,
    did,
    handle: `${faker.internet.username().toLowerCase()}.bsky.social`,
    name: faker.commerce.productName(),
    grade: null,
    scale: null,
    manufacturer: null,
    status: 'backlog',
    photoCid: null,
    photos: null,
    acquiredAt: null,
    recordCreatedAt: null,
    indexedAt: DateTime.now(),
  }
}).build()
