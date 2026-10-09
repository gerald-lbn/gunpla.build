import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { AtprotoUser } from '@thisismissem/adonisjs-atproto-oauth'
import AuthMiddleware from '#core/middleware/auth_middleware'

export default class FakeAuthMiddlewareWithUser extends AuthMiddleware {
  constructor(private fakeDid: string) {
    super()
  }

  async handle(ctx: HttpContext, next: NextFn) {
    const fakeUser = Object.create(AtprotoUser.prototype) as AtprotoUser
    Object.defineProperty(fakeUser, 'did', { get: () => this.fakeDid })

    ctx.auth.use('web').user = fakeUser
    Object.defineProperty(ctx.auth, 'user', { get: () => fakeUser, configurable: true })
    ctx.containerResolver.bindValue(AtprotoUser, fakeUser)

    return next()
  }
}
