import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { KitFactory } from '#database/factories/kit_factory'
import { ProfileFactory } from '#database/factories/profile_factory'

test.group('ExploreController.render', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('explore renders completed kits with transformer-shaped fields', async ({
    client,
  }) => {
    await ProfileFactory.merge({
      did: 'did:plc:amuro',
      handle: 'amuro.bsky.social',
    }).create()

    await KitFactory.merge({
      did: 'did:plc:amuro',
      status: 'done',
      name: 'HG Aerial',
      grade: 'HG',
      photoCid: 'bafyfakecid',
    }).create()

    const response = await client.visit('explore').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('explore/index')
    response.assertInertiaPropsContains({
      kits: {
        data: [
          {
            name: 'HG Aerial',
            handle: 'amuro.bsky.social',
            grade: 'HG',
          },
        ],
        metadata: { currentPage: 1 },
      },
    })
  })

  test('explore renders completed kits with author attribution including avatar, display name, and handle', async ({
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

    const response = await client.visit('explore').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('explore/index')
    response.assertInertiaPropsContains({
      kits: {
        data: [
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
      },
    })
  })

  test('explore shows only completed kits, excluding non-completed', async ({ client, assert }) => {
    await KitFactory.merge({ status: 'done', name: 'HG Aerial' }).create()
    await KitFactory.merge({ status: 'in-progress', name: 'WIP Zaku' }).create()

    const response = await client.visit('explore').withInertia()

    response.assertInertiaComponent('explore/index')
    response.assertInertiaPropsContains({
      kits: {
        data: [{ name: 'HG Aerial' }],
      },
    })
    assert.lengthOf(response.inertiaProps.kits.data, 1)
  })

  test('explore returns kits.data: [] when no completed kits exist', async ({ client }) => {
    await KitFactory.merge({ status: 'backlog' }).create()

    const response = await client.visit('explore').withInertia()

    response.assertInertiaPropsContains({ kits: { data: [] } })
  })

  test('explore with ?page=0 returns page 1 results', async ({ client }) => {
    await KitFactory.merge({ status: 'done' }).create()

    const response = await client.visit('explore').qs({ page: 0 }).withInertia()

    response.assertInertiaPropsContains({ kits: { metadata: { currentPage: 1 } } })
  })

  test('explore search returns only matching completed kits', async ({ client, assert }) => {
    await KitFactory.merge({ status: 'done', name: 'HG Aerial' }).create()
    await KitFactory.merge({ status: 'done', name: 'MG Sazabi' }).create()

    const response = await client.visit('explore').qs({ q: 'aerial' }).withInertia()

    response.assertInertiaComponent('explore/index')
    response.assertInertiaPropsContains({
      kits: {
        data: [{ name: 'HG Aerial' }],
      },
    })
    assert.lengthOf(response.inertiaProps.kits.data, 1)
  })

  test('explore search with no matching results returns kits.data: []', async ({ client }) => {
    await KitFactory.merge({ status: 'done', name: 'HG Aerial' }).create()

    const response = await client.visit('explore').qs({ q: 'sazabi' }).withInertia()

    response.assertInertiaPropsContains({ kits: { data: [] } })
  })
})
