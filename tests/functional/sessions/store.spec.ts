import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import AuthService from '#auth/services/auth_service'
import { FakeAuthService } from '#tests/helpers/fake_auth_service'
import OAuthResolverException from '#auth/exceptions/oauth_resolver_exception'
import OAuthLoginException from '#auth/exceptions/oauth_login_exception'

test.group('SessionsController.store', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('OAuthResolverError produces flash and redirects back', async ({ client, swap }) => {
    swap(AuthService, new FakeAuthService({ throwOnAuthorize: new OAuthResolverException() }))

    const response = await client
      .visit('oauth.login')
      .json({ input: 'test.bsky.social' })
      .withCsrfToken()
      .header('referer', '/login')
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/login')
    response.assertFlashMessage(
      'error',
      'The provided handle or service does not support AT Protocol OAuth'
    )
  })

  test('generic OAuth error produces flash and redirects back', async ({ client, swap }) => {
    swap(AuthService, new FakeAuthService({ throwOnAuthorize: new OAuthLoginException() }))

    const response = await client
      .visit('oauth.login')
      .json({ input: 'test.bsky.social' })
      .withCsrfToken()
      .header('referer', '/login')
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/login')
    response.assertFlashMessage(
      'error',
      'Unable to initiate login. Please verify your handle and try again.'
    )
  })
})
