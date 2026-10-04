import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export class AuthService {
  constructor(private ctx: HttpContext) {}

  async authorize(input: string) {
    return this.ctx.oauth.authorize(input)
  }

  async canRegister(service: string) {
    return this.ctx.oauth.canRegister(service)
  }

  async register(service: string) {
    return this.ctx.oauth.register(service)
  }

  async handleCallback() {
    const session = await this.ctx.oauth.handleCallback()
    await this.ctx.auth.use('web').login(session.user)
    return session
  }

  async logout() {
    if (this.ctx.auth.user?.did) {
      await this.ctx.oauth.logout(this.ctx.auth.user.did)
    }
    await this.ctx.auth.use('web').logout()
  }
}
