import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class OAuthCallbackException extends Exception {
  static status = 400
  static code = 'E_OAUTH_CALLBACK_FAILED'

  async handle(_error: this, ctx: HttpContext) {
    ctx.session.flash('error', 'Sign-in failed. Please try again.')
    return ctx.response.redirect().toRoute('login')
  }

  async report(error: this, { logger }: HttpContext) {
    logger.warn({ cause: error.cause }, 'OAuth callback error')
  }
}
