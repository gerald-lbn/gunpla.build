import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class AtprotoSyncException extends Exception {
  static status = 502
  static code = 'E_ATPROTO_SYNC_FAILED'

  constructor(message = 'Failed to sync with ATProto. Please try again.') {
    super(message, {
      status: AtprotoSyncException.status,
      code: AtprotoSyncException.code,
    })
  }

  async handle(_error: this, ctx: HttpContext) {
    ctx.session.flash('error', this.message)
    return ctx.response.redirect().back()
  }
}
