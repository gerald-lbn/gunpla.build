import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { ProfileService } from '#profile/services/profile_service'
import { AchievementsService } from '#profile/services/achievements_service'
import { FakeIdentityService } from '../helpers/fake_identity_service.js'
import { ProfileFactory } from '#database/factories/profile_factory'

test.group('ProfileService', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('syncProfile upserts profile with resolved handle, display name, and avatar', async ({
    db,
    assert,
  }) => {
    const fakeIdentityService = new FakeIdentityService({ defaultHandle: 'amuro.bsky.social' })
    const service = new ProfileService(new AchievementsService(), fakeIdentityService)

    const profile = await service.syncProfile('did:plc:amuro123')

    await db.assertHas('profiles', { did: 'did:plc:amuro123', handle: 'amuro.bsky.social' })
    assert.equal(profile.did, 'did:plc:amuro123')
    assert.equal(profile.handle, 'amuro.bsky.social')
  })

  test('syncProfile preserves existing handle when ATProto resolution fails', async ({ db }) => {
    await ProfileFactory.merge({
      did: 'did:plc:existing123',
      handle: 'existing.bsky.social',
      displayName: 'Existing Builder',
    }).create()

    const fakeIdentityService = new FakeIdentityService({ defaultHandle: null })
    const service = new ProfileService(new AchievementsService(), fakeIdentityService)

    await service.syncProfile('did:plc:existing123')

    await db.assertHas('profiles', {
      did: 'did:plc:existing123',
      handle: 'existing.bsky.social',
      display_name: 'Existing Builder',
    })
  })

  test('syncProfile creates interim profile with did as fallback handle when initial resolution fails', async ({
    db,
    assert,
  }) => {
    const fakeIdentityService = new FakeIdentityService({ defaultHandle: null })
    const service = new ProfileService(new AchievementsService(), fakeIdentityService)

    const profile = await service.syncProfile('did:plc:greenfield123')

    await db.assertHas('profiles', {
      did: 'did:plc:greenfield123',
      handle: 'did:plc:greenfield123',
    })
    assert.equal(profile.handle, 'did:plc:greenfield123')
  })
})
