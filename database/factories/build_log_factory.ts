import Factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import BuildLog from '#kits/models/build_log'

export const BuildLogFactory = Factory.define(BuildLog, ({ faker }) => {
  const did = `did:plc:${faker.string.alphanumeric(24)}`
  const rkey = faker.string.alphanumeric(13)
  const kitRkey = faker.string.alphanumeric(13)
  return {
    uri: `at://${did}/build.gunpla.buildLog/${rkey}`,
    cid: null,
    did,
    kitUri: `at://${did}/build.gunpla.kit/${kitRkey}`,
    stage: null,
    text: null,
    recordCreatedAt: null,
    indexedAt: DateTime.now(),
  }
}).build()
