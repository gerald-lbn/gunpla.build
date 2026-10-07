import Factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import Profile from '#profile/models/profile'

export const ProfileFactory = Factory.define(Profile, ({ faker }) => {
  const did = `did:plc:${faker.string.alphanumeric(24)}`
  const handle = `${faker.internet.username().toLowerCase()}.bsky.social`
  return {
    did,
    handle,
    displayName: faker.person.fullName(),
    avatarUrl: faker.image.avatar(),
    description: faker.person.bio(),
    indexedAt: DateTime.now(),
  }
}).build()
