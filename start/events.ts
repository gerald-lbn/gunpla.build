/*
|--------------------------------------------------------------------------
| Application events
|--------------------------------------------------------------------------
|
| Emits the wide event of each HTTP request once the response has been
| sent, so the status code is final, including responses that the
| exception handler rendered.
|
*/

import emitter from '@adonisjs/core/services/emitter'

emitter.on('http:request_completed', ({ ctx }) => {
  if (!ctx.wideEvent) {
    return
  }

  const { request, response } = ctx
  const user = ctx.auth?.user

  ctx.wideEvent.set({
    method: request.method(),
    path: request.url(),
    route: ctx.route?.pattern ?? null,
    route_name: ctx.route?.name ?? null,
    status_code: response.getStatus(),
    inertia: request.header('x-inertia') === 'true',
    ip: request.ip(),
    user_agent: request.header('user-agent') ?? null,
    user: user ? { did: user.did, authenticated: true } : { authenticated: false },
  })

  ctx.wideEvent.emit(ctx.logger)
})
