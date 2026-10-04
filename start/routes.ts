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
import { controllers } from '#generated/controllers'
import '#start/routes/oauth'
import '#start/routes/kits'

router.get('/', [controllers.Home, 'index']).as('home')

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
