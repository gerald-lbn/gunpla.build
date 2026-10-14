import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class RegistrationNotSupportedException extends Exception {
  static status = 400
  static code = 'E_REGISTRATION_NOT_SUPPORTED'

  async handle(_error: this, ctx: HttpContext) {
    ctx.session.flash('error', 'Registration is not supported by this service.')
    return ctx.response.redirect().back()
  }
}
