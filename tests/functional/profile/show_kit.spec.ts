import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { KitFactory } from '#database/factories/kit_factory'
import { ProfileFactory } from '#database/factories/profile_factory'
import { IdentityService } from '#profile/services/identity_service'
import { FakeIdentityService } from '#tests/helpers/fake_identity_service'

test.group('ShowKitController.render', (group) => {
  group.each.setup(() => testUtils.db().truncate())

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
