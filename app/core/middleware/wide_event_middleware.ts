import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import WideEvent from '#observability/wide_event'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    /**
     * The canonical log line for this request. Controllers and services add
     * business context to it; `start/events.ts` emits it once the response
     * has been sent.
     */
    wideEvent: WideEvent
  }
}

export default class WideEventMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.wideEvent = new WideEvent('http.request')

    return next()
  }
}
