import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { KitFactory } from '#database/factories/kit_factory'
import { KitLikeFactory } from '#database/factories/kit_like_factory'
import { ProfileFactory } from '#database/factories/profile_factory'
import { IdentityService, type ResolvedIdentity } from '#profile/services/identity_service'
import { FakeIdentityService } from '#tests/helpers/fake_identity_service'
import SilentAuthMiddleware from '#middleware/silent_auth_middleware'
import FakeAuthMiddlewareWithUser from '../../helpers/fake_auth_middleware_with_user.js'

test.group('ShowKitController.render', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('malformed handle parameter on kit view returns 404 without dispatching identity resolver', async ({
    client,
    swap,
  }) => {
    let resolverCalled = false
    class ThrowingIdentityService extends IdentityService {
      override async resolve(_id: string): Promise<ResolvedIdentity | null> {
        resolverCalled = true
        throw new Error('IdentityService.resolve should not be called for malformed handle')
      }
    }
    swap(IdentityService, new ThrowingIdentityService())

    const response = await client
      .visit('kit', { handle: 'invalid handle!', rkey: '3mx7c72iqn62f' })
      .withInertia()

    response.assertStatus(404)
    response.assertInertiaComponent('errors/not_found')
    if (resolverCalled) {
      throw new Error('IdentityService.resolve was unexpectedly called')
    }
  })

  test('malformed rkey parameter on kit view returns 404 without dispatching identity resolver', async ({
    client,
    swap,
  }) => {
    let resolverCalled = false
    class ThrowingIdentityService extends IdentityService {
      override async resolve(_id: string): Promise<ResolvedIdentity | null> {
        resolverCalled = true
        throw new Error('IdentityService.resolve should not be called for malformed rkey')
      }
    }
    swap(IdentityService, new ThrowingIdentityService())

    const response = await client
      .visit('kit', { handle: 'amuro.bsky.social', rkey: 'invalid/rkey!' })
      .withInertia()

    response.assertStatus(404)
    response.assertInertiaComponent('errors/not_found')
    if (resolverCalled) {
      throw new Error('IdentityService.resolve was unexpectedly called')
    }
  })

  test('kit found at dedicated URL renders profile page with selectedRkey', async ({
    client,
    swap,
    assert,
  }) => {
    await ProfileFactory.merge({ did: 'did:plc:amuro', handle: 'amuro.bsky.social' }).create()
    await KitFactory.merge({
      did: 'did:plc:amuro',
      uri: 'at://did:plc:amuro/gunpla.kit/abc123rkey01',
      status: 'done',
    }).create()
    swap(
      IdentityService,
      new FakeIdentityService({
        resolver: (id) =>
          id === 'amuro.bsky.social' ? { did: 'did:plc:amuro', handle: 'amuro.bsky.social' } : null,
      })
    )

    const response = await client
      .visit('kit', { handle: 'amuro.bsky.social', rkey: 'abc123rkey01' })
      .withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('profile')
    response.assertInertiaPropsContains({
      selectedRkey: 'abc123rkey01',
      handle: 'amuro.bsky.social',
    })
    assert.isAbove((response.inertiaProps.kits as unknown[]).length, 0)
  })

  test('dedicated kit URL for unknown profile returns 404', async ({ client, swap }) => {
    swap(IdentityService, new FakeIdentityService({ defaultHandle: null }))

    const response = await client
      .visit('kit', { handle: 'nonexistent.bsky.social', rkey: 'abc123rkey01' })
      .withInertia()

    response.assertStatus(404)
    response.assertInertiaComponent('errors/not_found')
  })

  test('dedicated kit URL response includes likeCount 0 and viewerHasLiked false for a guest', async ({
    client,
    swap,
  }) => {
    await ProfileFactory.merge({ did: 'did:plc:amuro', handle: 'amuro.bsky.social' }).create()
    await KitFactory.merge({
      did: 'did:plc:amuro',
      uri: 'at://did:plc:amuro/gunpla.kit/abc123',
    }).create()
    swap(
      IdentityService,
      new FakeIdentityService({
        resolver: (id) =>
          id === 'amuro.bsky.social' ? { did: 'did:plc:amuro', handle: 'amuro.bsky.social' } : null,
      })
    )

    const response = await client
      .visit('kit', { handle: 'amuro.bsky.social', rkey: 'abc123' })
      .withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('profile')
    response.assertInertiaPropsContains({ kits: [{ likeCount: 0, viewerHasLiked: false }] })
  })

  test('dedicated kit URL includes viewerHasLiked true for authenticated user who has liked', async ({
    client,
    swap,
  }) => {
    await ProfileFactory.merge({ did: 'did:plc:amuro', handle: 'amuro.bsky.social' }).create()
    const kit = await KitFactory.merge({
      did: 'did:plc:amuro',
      uri: 'at://did:plc:amuro/gunpla.kit/abc123',
    }).create()
    await KitLikeFactory.merge({ kitId: kit.id, did: 'did:plc:liker' }).create()
    swap(
      IdentityService,
      new FakeIdentityService({
        resolver: (id) =>
          id === 'amuro.bsky.social' ? { did: 'did:plc:amuro', handle: 'amuro.bsky.social' } : null,
      })
    )
    swap(SilentAuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:liker'))

    const response = await client
      .visit('kit', { handle: 'amuro.bsky.social', rkey: 'abc123' })
      .withInertia()

    response.assertInertiaComponent('profile')
    response.assertInertiaPropsContains({ kits: [{ likeCount: 1, viewerHasLiked: true }] })
  })

  test('dedicated kit URL for profile found but rkey absent returns 404', async ({
    client,
    swap,
  }) => {
    await ProfileFactory.merge({ did: 'did:plc:amuro', handle: 'amuro.bsky.social' }).create()
    swap(
      IdentityService,
      new FakeIdentityService({
        resolver: (id) =>
          id === 'amuro.bsky.social' ? { did: 'did:plc:amuro', handle: 'amuro.bsky.social' } : null,
      })
    )

    const response = await client
      .visit('kit', { handle: 'amuro.bsky.social', rkey: 'ghost-rkey-xyz' })
      .withInertia()

    response.assertStatus(404)
    response.assertInertiaComponent('errors/not_found')
  })
})
