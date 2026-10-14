import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class OAuthResolverException extends Exception {
  static status = 422
  static code = 'E_OAUTH_RESOLVER_ERROR'

  async handle(_error: this, ctx: HttpContext) {
    ctx.session.flash('error', 'The provided handle or service does not support AT Protocol OAuth')
    return ctx.response.redirect().back()
  }

  async report(error: this, { logger }: HttpContext) {
    logger.warn({ cause: error.cause }, 'OAuth resolver error')
  }
}
