import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

const {
  auth: { Sessions: SessionsController, Registrations: RegistrationsController },
} = controllers

router
  .group(() => {
    router.get('/login', [SessionsController, 'create']).as('login')
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('/login', [SessionsController, 'store']).as('oauth.login')
    router.post('/signup', [RegistrationsController, 'store']).as('oauth.signup')
    router.get('/callback', [SessionsController, 'show']).as('oauth.callback')
    router
      .post('/logout', [SessionsController, 'destroy'])
      .as('oauth.logout')
      .use(middleware.auth())
  })
  .prefix('/oauth')
