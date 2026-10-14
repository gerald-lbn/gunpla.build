import type { HttpContext } from '@adonisjs/core/http'
import { OAuthResolverError } from '@atproto/oauth-client-node'
import OAuthResolverException from '#auth/exceptions/oauth_resolver_exception'
import OAuthLoginException from '#auth/exceptions/oauth_login_exception'
import OAuthCallbackException from '#auth/exceptions/oauth_callback_exception'

export default class AuthService {
  async authorize(input: string, oauth: HttpContext['oauth']) {
    try {
      return await oauth.authorize(input)
    } catch (err) {
      if (err instanceof OAuthResolverError) {
        throw new OAuthResolverException('', { cause: err })
      }
      throw new OAuthLoginException('', { cause: err as Error })
    }
  }

  async canRegister(service: string, oauth: HttpContext['oauth']) {
    return oauth.canRegister(service)
  }

  async register(service: string, oauth: HttpContext['oauth']) {
    return oauth.register(service)
  }

  async handleCallback(oauth: HttpContext['oauth'], auth: HttpContext['auth']) {
    try {
      const session = await oauth.handleCallback()
      await auth.use('web').login(session.user)
      return session
    } catch (err) {
      throw new OAuthCallbackException('', { cause: err as Error })
    }
  }

  async logout(oauth: HttpContext['oauth'], auth: HttpContext['auth']) {
    if (auth.user?.did) {
      await oauth.logout(auth.user.did)
    }
    await auth.use('web').logout()
  }
}
