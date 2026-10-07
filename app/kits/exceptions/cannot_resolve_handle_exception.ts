import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class CannotResolveHandleException extends Exception {
  static status = 400
  static code = 'E_CANNOT_RESOLVE_HANDLE'

  constructor(
    message = 'Unable to resolve your Bluesky/ATProto handle. Please try again in a moment.'
  ) {
    super(message, {
      status: CannotResolveHandleException.status,
      code: CannotResolveHandleException.code,
    })
  }

  async handle(_error: this, ctx: HttpContext) {
    ctx.session.flash('error', this.message)
    return ctx.response.redirect().back()
  }
}
