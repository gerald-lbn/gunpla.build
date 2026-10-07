import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { KitFactory } from '#database/factories/kit_factory'
import { AuthService } from '#auth/services/auth_service'
import { RepoSyncService } from '#kits/services/repo_sync_service'
import { FakeAuthService } from '#tests/helpers/fake_auth_service'
import { FakeRepoSyncService } from '#tests/helpers/fake_repo_sync_service'

test.group('CallbackController.handle', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('new user callback redirects to shelf', async ({ client, swap }) => {
    swap(AuthService, new FakeAuthService('did:plc:testnewuser'))
    swap(RepoSyncService, new FakeRepoSyncService())

    const response = await client.visit('oauth.callback').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')
  })

  test('existing user callback redirects to shelf', async ({ client, swap }) => {
    await KitFactory.merge({ did: 'did:plc:testexistinguser' }).create()
    swap(AuthService, new FakeAuthService('did:plc:testexistinguser'))
    swap(RepoSyncService, new FakeRepoSyncService())

    const response = await client.visit('oauth.callback').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')
  })

  test('callback redirects to shelf even when sync throws', async ({ client, swap }) => {
    swap(AuthService, new FakeAuthService('did:plc:testerror'))
    swap(RepoSyncService, new FakeRepoSyncService({ shouldThrow: true }))

    const response = await client.visit('oauth.callback').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')
  })
})
