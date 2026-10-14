import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class OAuthLoginException extends Exception {
  static status = 400
  static code = 'E_OAUTH_LOGIN_FAILED'

  async handle(_error: this, ctx: HttpContext) {
    ctx.session.flash('error', 'Unable to initiate login. Please verify your handle and try again.')
    return ctx.response.redirect().back()
  }

  async report(error: this, { logger }: HttpContext) {
    logger.warn({ cause: error.cause }, 'OAuth login error')
  }
}
