import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { AtUri } from '@atproto/syntax'
import { ProfileFactory } from '#database/factories/profile_factory'
import { KitFactory } from '#database/factories/kit_factory'
import AuthMiddleware from '#middleware/auth_middleware'
import { KitLikesService } from '#kits/services/kit_likes_service'
import FakeAuthMiddlewareWithUser from '../../helpers/fake_auth_middleware_with_user.js'
import { FakeKitLikesService } from '../../helpers/fake_kit_likes_service.js'

test.group('LikeKitController.store', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  const kitUri = AtUri.make('did:plc:amuro', 'build.gunpla.kit', 'abc123').toString()

  test('unauthenticated POST to kits.like redirects to login', async ({ client }) => {
    const response = await client
      .visit('kits.like', { handle: 'any.bsky.social', rkey: 'anyrkey' })
      .redirects(0)

    response.assertStatus(302)
  })

  test('POST kits.like with unknown handle returns 404', async ({ client, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:liker'))

    const response = await client
      .visit('kits.like', { handle: 'ghost.bsky.social', rkey: 'anyrkey' })
      .withCsrfToken()

    response.assertStatus(404)
  })

  test('POST kits.like with valid handle but unknown rkey returns 404', async ({
    client,
    swap,
  }) => {
    await ProfileFactory.merge({ did: 'did:plc:amuro', handle: 'amuro.bsky.social' }).create()
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:liker'))

    const response = await client
      .visit('kits.like', { handle: 'amuro.bsky.social', rkey: 'ghost-rkey' })
      .withCsrfToken()

    response.assertStatus(404)
  })

  test('POST kits.like with valid kit returns likeCount and viewerHasLiked', async ({
    client,
    swap,
  }) => {
    await ProfileFactory.merge({ did: 'did:plc:amuro', handle: 'amuro.bsky.social' }).create()
    await KitFactory.merge({
      did: 'did:plc:amuro',
      uri: kitUri,
    }).create()
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:liker'))
    swap(KitLikesService, new FakeKitLikesService({ likeCount: 1 }))

    const response = await client
      .visit('kits.like', { handle: 'amuro.bsky.social', rkey: 'abc123' })
      .withCsrfToken()

    response.assertStatus(200)
    response.assertBodyContains({ likeCount: 1, viewerHasLiked: true })
  })
})

test.group('LikeKitController.destroy', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  const kitUri = AtUri.make('did:plc:amuro', 'build.gunpla.kit', 'abc123').toString()

  test('unauthenticated DELETE to kits.unlike redirects to login', async ({ client }) => {
    const response = await client
      .visit('kits.unlike', { handle: 'any.bsky.social', rkey: 'anyrkey' })
      .redirects(0)

    response.assertStatus(302)
  })

  test('DELETE kits.unlike when user has no like record returns 404', async ({ client, swap }) => {
    await ProfileFactory.merge({ did: 'did:plc:amuro', handle: 'amuro.bsky.social' }).create()
    await KitFactory.merge({
      did: 'did:plc:amuro',
      uri: kitUri,
    }).create()
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:liker'))

    const response = await client
      .visit('kits.unlike', { handle: 'amuro.bsky.social', rkey: 'abc123' })
      .withCsrfToken()

    response.assertStatus(404)
  })

  test('DELETE kits.unlike with valid kit returns likeCount and viewerHasLiked false', async ({
    client,
    swap,
  }) => {
    await ProfileFactory.merge({ did: 'did:plc:amuro', handle: 'amuro.bsky.social' }).create()
    await KitFactory.merge({
      did: 'did:plc:amuro',
      uri: kitUri,
    }).create()
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:liker'))
    swap(KitLikesService, new FakeKitLikesService({ likeCount: 0 }))

    const response = await client
      .visit('kits.unlike', { handle: 'amuro.bsky.social', rkey: 'abc123' })
      .withCsrfToken()

    response.assertStatus(200)
    response.assertBodyContains({ likeCount: 0, viewerHasLiked: false })
  })
})
