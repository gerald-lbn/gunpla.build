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
import '#start/routes/oauth'

router.on('/').renderInertia('home', {}).as('home')

router
  .group(() => {
    router.on('/login').renderInertia('auth/login', {}).as('login')
  })
  .use(middleware.guest())

router
  .group(() => {
    router.on('/dashboard').renderInertia('dashboard', {}).as('dashboard')
  })
  .use(middleware.auth())
