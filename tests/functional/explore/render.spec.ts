import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import { KitFactory } from '#database/factories/kit_factory'
import { BuildLogFactory } from '#database/factories/build_log_factory'

test.group('ExploreController.render', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('explore renders completed kits with transformer-shaped fields and build logs', async ({
    client,
  }) => {
    const kit = await KitFactory.merge({
      status: 'done',
      name: 'HG Aerial',
      handle: 'amuro.bsky.social',
      grade: 'HG',
      photoCid: 'bafyfakecid',
    }).create()

    await BuildLogFactory.merge({
      kitUri: kit.uri,
      stage: 'Painting',
      text: 'Top coat done',
      recordCreatedAt: DateTime.fromISO('2024-03-15'),
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
            buildLogs: [{ stage: 'Painting', text: 'Top coat done', formattedDate: 'Mar 2024' }],
          },
        ],
        metadata: { currentPage: 1 },
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
