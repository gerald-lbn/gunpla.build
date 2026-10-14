import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { KitFactory } from '#database/factories/kit_factory'
import AuthService from '#auth/services/auth_service'
import RepoSyncService from '#kits/services/repo_sync_service'
import IdentityService from '#profile/services/identity_service'
import { FakeAuthService } from '#tests/helpers/fake_auth_service'
import { FakeRepoSyncService } from '#tests/helpers/fake_repo_sync_service'
import { FakeIdentityService } from '#tests/helpers/fake_identity_service'
import OAuthCallbackException from '#auth/exceptions/oauth_callback_exception'

test.group('SessionsController.show', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('new user callback redirects to shelf', async ({ client, swap }) => {
    swap(AuthService, new FakeAuthService({ fakeDid: 'did:plc:testnewuser' }))
    swap(RepoSyncService, new FakeRepoSyncService())

    const response = await client.visit('oauth.callback').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')
  })

  test('existing user callback redirects to shelf', async ({ client, swap }) => {
    await KitFactory.merge({ did: 'did:plc:testexistinguser' }).create()
    swap(AuthService, new FakeAuthService({ fakeDid: 'did:plc:testexistinguser' }))
    swap(RepoSyncService, new FakeRepoSyncService())

    const response = await client.visit('oauth.callback').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')
  })

  test('callback redirects to shelf even when sync throws', async ({ client, swap }) => {
    swap(AuthService, new FakeAuthService({ fakeDid: 'did:plc:testerror' }))
    swap(RepoSyncService, new FakeRepoSyncService({ shouldThrow: true }))

    const response = await client.visit('oauth.callback').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')
  })

  test('callback creates profile with resolved handle on login', async ({ client, db, swap }) => {
    swap(AuthService, new FakeAuthService({ fakeDid: 'did:plc:callbackuser' }))
    swap(RepoSyncService, new FakeRepoSyncService())
    swap(IdentityService, new FakeIdentityService({ defaultHandle: 'callback.bsky.social' }))

    const response = await client.visit('oauth.callback').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')
    await db.assertHas('profiles', { did: 'did:plc:callbackuser', handle: 'callback.bsky.social' })
  })

  test('callback succeeds when handle resolution is unreachable', async ({ client, db, swap }) => {
    swap(AuthService, new FakeAuthService({ fakeDid: 'did:plc:unreachableuser' }))
    swap(RepoSyncService, new FakeRepoSyncService())
    swap(IdentityService, new FakeIdentityService({ defaultHandle: null }))

    const response = await client.visit('oauth.callback').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')
    await db.assertMissing('profiles', { did: 'did:plc:unreachableuser' })
  })

  test('callback failure flashes error and redirects to login', async ({ client, swap }) => {
    swap(AuthService, new FakeAuthService({ throwOnCallback: new OAuthCallbackException() }))
    swap(RepoSyncService, new FakeRepoSyncService())

    const response = await client.visit('oauth.callback').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/login')
    response.assertFlashMessage('error', 'Sign-in failed. Please try again.')
  })
})
