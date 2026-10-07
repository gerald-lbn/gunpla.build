import { test } from '@japa/runner'
import AuthMiddleware from '#middleware/auth_middleware'
import { IdentityService } from '#profile/services/identity_service'
import FakeAuthMiddlewareWithUser from '../../helpers/fake_auth_middleware_with_user.js'

class FakeIdentityService extends IdentityService {
  override async resolve(_identifier: string) {
    return { did: 'did:plc:testuser', handle: 'test.user' }
  }
}

test.group('ListKitsController.render', () => {
  test('authenticated user at /shelf redirects to their profile', async ({ client, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:testuser'))
    swap(IdentityService, new FakeIdentityService())

    const response = await client.visit('shelf').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/profile/test.user')
  })
})
