import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Kit from '#kits/models/kit'
import { DateTime } from 'luxon'
import { IdentityService } from '#profile/services/identity_service'
import { ProfileFactory } from '#database/factories/profile_factory'

class FakeIdentityService extends IdentityService {
  override async resolve(identifier: string) {
    if (identifier === 'grld.deve' || identifier === 'nonexistent.bsky.social') {
      return null
    }
    return {
      did: `did:plc:${identifier.replace(/[^a-z0-9]/gi, '')}`,
      handle: identifier,
    }
  }
}

test.group('Profile', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('returns 404 not found when atproto account does not exist', async ({ client, swap }) => {
    swap(IdentityService, new FakeIdentityService())

    const response = await client.visit('profile', { handle: 'grld.deve' }).withInertia()

    response.assertStatus(404)
    response.assertInertiaComponent('errors/not_found')
    response.assertInertiaPropsContains({
      handle: 'grld.deve',
    })
  })

  test('renders profile page with empty stats for user with no kits', async ({ client, swap }) => {
    swap(IdentityService, new FakeIdentityService())

    const response = await client.visit('profile', { handle: 'empty.user' }).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('profile')
    response.assertInertiaPropsContains({
      handle: 'empty.user',
      kits: [],
      stats: {
        totalKits: 0,
        completed: 0,
        inProgress: 0,
        backlog: 0,
      },
    })
  })

  test('renders profile with unlocked Infinity Gauntlet achievement when user completed 6 grades', async ({
    client,
    db,
    swap,
    assert,
  }) => {
    swap(IdentityService, new FakeIdentityService())

    const handle = 'amuro.bsky.social'
    const did = 'did:plc:amurobskysocial'
    const grades = ['HG', 'RG', 'MG', 'PG', 'SD', 'EG']

    for (const [index, grade] of grades.entries()) {
      await Kit.create({
        uri: `at://${did}/build.gunpla.kit/${index}`,
        did,
        name: `Kit ${grade}`,
        grade,
        scale: '1/144',
        status: 'done',
        indexedAt: DateTime.now(),
      })
    }

    await db.assertCount('kits', 6)
    await db.assertHas('kits', { did, grade: 'PG' })

    const response = await client.visit('profile', { handle }).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('profile')
    response.assertInertiaPropsContains({
      handle,
      stats: {
        totalKits: 6,
        completed: 6,
        inProgress: 0,
        backlog: 0,
      },
    })

    const gauntlet = response.inertiaProps.achievements.find(
      (a: { id: string }) => a.id === 'infinity-gauntlet'
    )

    assert.isDefined(gauntlet)
    assert.isTrue(gauntlet?.unlocked)
    assert.equal(gauntlet?.progress?.current, 6)
  })

  test('renders profile page with persisted display name, avatar, and bio from profiles record', async ({
    client,
    swap,
  }) => {
    await ProfileFactory.merge({
      did: 'did:plc:amurobskysocial',
      handle: 'amuro.bsky.social',
      displayName: 'Amuro Ray',
      avatarUrl: 'https://cdn.bsky.app/avatar.jpg',
      description: 'Gundam Pilot',
    }).create()

    swap(IdentityService, new FakeIdentityService())

    const response = await client.visit('profile', { handle: 'amuro.bsky.social' }).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('profile')
    response.assertInertiaPropsContains({
      handle: 'amuro.bsky.social',
      displayName: 'Amuro Ray',
      avatarUrl: 'https://cdn.bsky.app/avatar.jpg',
      description: 'Gundam Pilot',
    })
  })
})
