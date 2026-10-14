import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import AuthService from '#auth/services/auth_service'
import AuthMiddleware from '#core/middleware/auth_middleware'
import { FakeAuthService } from '#tests/helpers/fake_auth_service'
import FakeAuthMiddlewareWithUser from '../../helpers/fake_auth_middleware_with_user.js'

test.group('SessionsController.destroy', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('logout redirects back', async ({ client, swap }) => {
    swap(AuthService, new FakeAuthService({ noOpLogout: true }))
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:someuser'))

    const response = await client
      .visit('oauth.logout')
      .withCsrfToken()
      .header('referer', '/shelf')
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')
  })
})
