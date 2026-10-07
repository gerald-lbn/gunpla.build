import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { KitFactory } from '#database/factories/kit_factory'
import { ProfileFactory } from '#database/factories/profile_factory'

test.group('FeedController.render', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('home page renders kits list with name, handle, status', async ({ client }) => {
    await ProfileFactory.merge({
      did: 'did:plc:amuro',
      handle: 'amuro.bsky.social',
    }).create()

    await KitFactory.merge({
      did: 'did:plc:amuro',
      name: 'HG Aerial',
      status: 'done',
      photoCid: 'bafyfakecid',
    }).create()

    const response = await client.visit('home').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home/index')
    response.assertInertiaPropsContains({
      kits: [{ name: 'HG Aerial', handle: 'amuro.bsky.social', status: 'done' }],
    })
  })

  test('home feed renders kit cards with author attribution including avatar, display name, and handle', async ({
    client,
  }) => {
    await ProfileFactory.merge({
      did: 'did:plc:amuro',
      handle: 'amuro.bsky.social',
      displayName: 'Amuro Ray',
      avatarUrl: 'https://cdn.bsky.app/avatar.jpg',
    }).create()

    await KitFactory.merge({
      did: 'did:plc:amuro',
      name: 'HG Aerial',
      status: 'done',
      photoCid: 'bafyfakecid',
    }).create()

    const response = await client.visit('home').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home/index')
    response.assertInertiaPropsContains({
      kits: [
        {
          name: 'HG Aerial',
          handle: 'amuro.bsky.social',
          author: {
            handle: 'amuro.bsky.social',
            displayName: 'Amuro Ray',
            avatarUrl: 'https://cdn.bsky.app/avatar.jpg',
          },
        },
      ],
    })
  })

  test('home page renders kits: [] when no kits exist', async ({ client }) => {
    const response = await client.visit('home').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home/index')
    response.assertInertiaPropsContains({ kits: [] })
  })
})
