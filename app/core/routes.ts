import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'
import env from '#start/env'

// Register Server-Sent Events routes for Transmit
transmit.registerRoutes()

type BroadcastPayload = Parameters<typeof transmit.broadcast>[1]

// Internal broadcast endpoint for worker container
router.post('/internal/broadcast', async ({ request, response }) => {
  const secret = request.header('x-internal-secret')
  if (secret !== env.get('APP_KEY').release()) {
    return response.unauthorized()
  }
  const { channel, payload } = request.body() as {
    channel?: string
    payload?: BroadcastPayload
  }
  if (channel && payload !== undefined) {
    transmit.broadcast(channel, payload)
  }
  return response.ok({ broadcasted: true })
})
