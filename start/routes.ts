/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'
import env from '#start/env'
import { controllers } from '#generated/controllers'
import '#start/routes/oauth'
import '#start/routes/kits'

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

router.get('/', [controllers.Home, 'index']).as('home')
router.get('/profile/:handle', [controllers.Profile, 'show']).as('profile')

router
  .group(() => {
    router.on('/login').renderInertia('auth/login', {}).as('login')
  })
  .use(middleware.guest())

router
  .group(() => {
    router.get('/dashboard', [controllers.Kits, 'index']).as('dashboard')
  })
  .use(middleware.auth())
