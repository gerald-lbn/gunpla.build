import AuthService from '#auth/services/auth_service'
import type { HttpContext } from '@adonisjs/core/http'
import type OAuthResolverException from '#auth/exceptions/oauth_resolver_exception'
import type OAuthLoginException from '#auth/exceptions/oauth_login_exception'
import type OAuthCallbackException from '#auth/exceptions/oauth_callback_exception'

interface FakeAuthServiceOptions {
  fakeDid?: string
  throwOnAuthorize?: OAuthResolverException | OAuthLoginException
  throwOnCallback?: OAuthCallbackException
  noOpLogout?: boolean
}

export class FakeAuthService extends AuthService {
  private options: FakeAuthServiceOptions

  constructor(input: string | FakeAuthServiceOptions = {}) {
    super()
    this.options = typeof input === 'string' ? { fakeDid: input } : input
  }

  async authorize(_input: string, _oauth: HttpContext['oauth']) {
    if (this.options.throwOnAuthorize) {
      throw this.options.throwOnAuthorize
    }
    return 'https://bsky.social/oauth/authorize?request_uri=fake'
  }

  async handleCallback(_oauth: HttpContext['oauth'], _auth: HttpContext['auth']) {
    if (this.options.throwOnCallback) {
      throw this.options.throwOnCallback
    }
    return { user: { did: this.options.fakeDid } } as any
  }

  async logout(oauth: HttpContext['oauth'], auth: HttpContext['auth']) {
    if (this.options.noOpLogout) return
    return super.logout(oauth, auth)
  }
}
