import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'
import env from '#start/env'
import { broadcastValidator } from '#core/validators/broadcast'

// Register Server-Sent Events routes for Transmit
transmit.registerRoutes()

// Internal broadcast endpoint for worker container
router.post('/internal/broadcast', async ({ request, response }) => {
  const secret = request.header('x-internal-secret')
  if (secret !== env.get('APP_KEY').release()) {
    return response.unauthorized()
  }
  const { channel, payload } = await request.validateUsing(broadcastValidator)
  transmit.broadcast(channel, payload)
  return response.ok({ broadcasted: true })
})
