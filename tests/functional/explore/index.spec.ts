import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import { KitFactory } from '#database/factories/kit_factory'
import { KitLikeFactory } from '#database/factories/kit_like_factory'
import { ProfileFactory } from '#database/factories/profile_factory'
import SilentAuthMiddleware from '#middleware/silent_auth_middleware'
import FakeAuthMiddlewareWithUser from '../../helpers/fake_auth_middleware_with_user.js'

test.group('ExploreController.index', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('explore renders completed kits with transformer-shaped fields', async ({ client }) => {
    await ProfileFactory.merge({
      did: 'did:plc:amuro',
      handle: 'amuro.bsky.social',
    }).create()

    await KitFactory.merge({
      did: 'did:plc:amuro',
      status: 'done',
      name: 'HG Aerial',
      grade: 'HG',
      photos: ['bafyfakecid'],
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
      photos: ['bafyfakecid'],
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

  test('explore kit objects include rkey, status, and acquiredAt', async ({ client, assert }) => {
    await ProfileFactory.merge({
      did: 'did:plc:amuro',
      handle: 'amuro.bsky.social',
    }).create()

    await KitFactory.merge({
      did: 'did:plc:amuro',
      status: 'done',
      acquiredAt: DateTime.fromISO('2024-06-01'),
    }).create()

    const response = await client.visit('explore').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('explore/index')

    const kit = response.inertiaProps.kits.data[0]
    assert.isString(kit.rkey)
    assert.isNotEmpty(kit.rkey)
    assert.equal(kit.status, 'done')
    assert.isString(kit.acquiredAt)
    assert.isNotEmpty(kit.acquiredAt)
  })

  test('explore kit props include likeCount 0 and viewerHasLiked false for a guest', async ({
    client,
  }) => {
    await ProfileFactory.merge({ did: 'did:plc:amuro', handle: 'amuro.bsky.social' }).create()
    await KitFactory.merge({
      did: 'did:plc:amuro',
      status: 'done',
      photos: ['bafyfakecid'],
    }).create()

    const response = await client.visit('explore').withInertia()

    response.assertStatus(200)
    response.assertInertiaPropsContains({
      kits: { data: [{ likeCount: 0, viewerHasLiked: false }] },
    })
  })

  test('explore kit props include likeCount 1 and viewerHasLiked true for user who has liked', async ({
    client,
    swap,
  }) => {
    await ProfileFactory.merge({ did: 'did:plc:amuro', handle: 'amuro.bsky.social' }).create()
    const kit = await KitFactory.merge({
      did: 'did:plc:amuro',
      status: 'done',
      photos: ['bafyfakecid'],
    }).create()
    await KitLikeFactory.merge({ kitId: kit.id, did: 'did:plc:liker' }).create()
    swap(SilentAuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:liker'))

    const response = await client.visit('explore').withInertia()

    response.assertInertiaPropsContains({
      kits: { data: [{ likeCount: 1, viewerHasLiked: true }] },
    })
  })

  test('explore kit props include viewerHasLiked false for viewer who has not liked', async ({
    client,
    swap,
  }) => {
    await ProfileFactory.merge({ did: 'did:plc:amuro', handle: 'amuro.bsky.social' }).create()
    const kit = await KitFactory.merge({
      did: 'did:plc:amuro',
      status: 'done',
      photos: ['bafyfakecid'],
    }).create()
    await KitLikeFactory.merge({ kitId: kit.id, did: 'did:plc:other' }).create()
    swap(SilentAuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:viewer'))

    const response = await client.visit('explore').withInertia()

    response.assertInertiaPropsContains({
      kits: { data: [{ likeCount: 1, viewerHasLiked: false }] },
    })
  })
  test('explore renders initial page of kits with scroll-compatible metadata and matchOn id', async ({
    client,
    assert,
  }) => {
    await ProfileFactory.merge({ did: 'did:plc:amuro', handle: 'amuro.bsky.social' }).create()
    await KitFactory.merge({ did: 'did:plc:amuro', status: 'done' }).createMany(25)

    const response = await client.visit('explore').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('explore/index')
    assert.lengthOf(response.inertiaProps.kits.data, 20)
    assert.equal(response.inertiaProps.kits.metadata.currentPage, 1)
    assert.equal(response.inertiaProps.kits.metadata.lastPage, 2)
    assert.equal(response.inertiaProps.q, '')
  })

  test('explore with page 2 loads next batch of completed kits', async ({ client, assert }) => {
    await ProfileFactory.merge({ did: 'did:plc:amuro', handle: 'amuro.bsky.social' }).create()
    await KitFactory.merge({ did: 'did:plc:amuro', status: 'done' }).createMany(25)

    const response = await client.visit('explore').qs({ page: 2 }).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('explore/index')
    assert.lengthOf(response.inertiaProps.kits.data, 5)
    assert.equal(response.inertiaProps.kits.metadata.currentPage, 2)
    assert.equal(response.inertiaProps.kits.metadata.lastPage, 2)
  })

  test('explore with search query filters kits across paginated requests', async ({
    client,
    assert,
  }) => {
    await ProfileFactory.merge({ did: 'did:plc:amuro', handle: 'amuro.bsky.social' }).create()
    await KitFactory.merge({
      did: 'did:plc:amuro',
      status: 'done',
      name: 'HG Gundam Aerial',
    }).createMany(25)
    await KitFactory.merge({ did: 'did:plc:amuro', status: 'done', name: 'MG Zaku II' }).createMany(
      5
    )

    const response = await client.visit('explore').qs({ q: 'Gundam', page: 2 }).withInertia()

    response.assertStatus(200)
    assert.lengthOf(response.inertiaProps.kits.data, 5)
    assert.equal(response.inertiaProps.q, 'Gundam')
    for (const kit of response.inertiaProps.kits.data) {
      assert.include(kit.name.toLowerCase(), 'gundam')
    }
  })

  test('explore page requested beyond lastPage returns empty data with intact metadata', async ({
    client,
    assert,
  }) => {
    await ProfileFactory.merge({ did: 'did:plc:amuro', handle: 'amuro.bsky.social' }).create()
    await KitFactory.merge({ did: 'did:plc:amuro', status: 'done' }).createMany(5)

    const response = await client.visit('explore').qs({ page: 99 }).withInertia()

    response.assertStatus(200)
    assert.lengthOf(response.inertiaProps.kits.data, 0)
    assert.equal(response.inertiaProps.kits.metadata.currentPage, 99)
    assert.equal(response.inertiaProps.kits.metadata.lastPage, 1)
  })

  test('index returns only kits matching the given structured filter param for {label}')
    .with([
      {
        label: 'grade',
        param: 'grade',
        value: 'HG',
        nonMatch: 'MG',
        isBuilder: false,
        expectCount: 1,
      },
      {
        label: 'scale',
        param: 'scale',
        value: '1/144',
        nonMatch: '1/100',
        isBuilder: false,
        expectCount: 1,
      },
      {
        label: 'manufacturer',
        param: 'manufacturer',
        value: 'Bandai',
        nonMatch: 'Kotobukiya',
        isBuilder: false,
        expectCount: 1,
      },
      {
        label: 'builder',
        param: 'builder',
        value: 'match-builder.bsky.social',
        nonMatch: 'other-builder.bsky.social',
        isBuilder: true,
        expectCount: 1,
      },
      {
        label: 'grade (no match)',
        param: 'grade',
        value: 'RG',
        nonMatch: 'HG',
        isBuilder: false,
        expectCount: 0,
      },
    ])
    .run(async ({ client, assert }, { param, value, nonMatch, isBuilder, expectCount }) => {
      if (isBuilder) {
        const matchProfile = await ProfileFactory.merge({ handle: value }).create()
        await KitFactory.merge({ did: matchProfile.did, status: 'done' }).create()
        const nonMatchProfile = await ProfileFactory.merge({ handle: nonMatch }).create()
        await KitFactory.merge({ did: nonMatchProfile.did, status: 'done' }).create()
      } else {
        if (expectCount > 0) {
          await KitFactory.merge({ [param]: value, status: 'done' }).create()
        }
        await KitFactory.merge({ [param]: nonMatch, status: 'done' }).create()
      }

      const response = await client
        .visit('explore')
        .qs({ [param]: value })
        .withInertia()

      response.assertStatus(200)
      assert.lengthOf(response.inertiaProps.kits.data, expectCount)
      if (expectCount > 0) {
        assert.equal(response.inertiaProps[param], value)
      }
    })

  test('index applies multiple filter params as AND, returning only the intersection', async ({
    client,
    assert,
  }) => {
    await KitFactory.merge({ grade: 'HG', scale: null, status: 'done' }).create()
    await KitFactory.merge({ grade: null, scale: '1/144', status: 'done' }).create()
    await KitFactory.merge({
      grade: 'HG',
      scale: '1/144',
      status: 'done',
      name: 'Both Match',
    }).create()

    const response = await client.visit('explore').qs({ grade: 'HG', scale: '1/144' }).withInertia()

    response.assertStatus(200)
    assert.lengthOf(response.inertiaProps.kits.data, 1)
    response.assertInertiaPropsContains({ kits: { data: [{ name: 'Both Match' }] } })

    const props = response.inertiaProps
    assert.equal(props.grade, 'HG')
    assert.equal(props.scale, '1/144')
  })
})
