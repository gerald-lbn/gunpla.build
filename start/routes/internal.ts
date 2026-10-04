import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'
import env from '#start/env'

// Register Server-Sent Events routes for Transmit
transmit.registerRoutes()

// Internal broadcast endpoint for worker container
router.post('/internal/broadcast', async ({ request, response }) => {
  const secret = request.header('x-internal-secret')
  if (secret !== env.get('APP_KEY').release()) {
    return response.unauthorized()
  }
  const { channel, payload } = request.body() as {
    channel?: string
    payload?: Record<string, unknown>
  }
  if (channel) {
    transmit.broadcast(channel, (payload ?? {}) as any)
  }
  return response.ok({ broadcasted: true })
})
