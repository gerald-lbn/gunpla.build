import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

router
  .group(() => {
    router.on('/login').renderInertia('auth/login', {}).as('login')
  })
  .use(middleware.guest())

router.post('/oauth/logout', [controllers.Oauth, 'logout']).use(middleware.auth())

router.group(() => {
  router.post('/oauth/login', [controllers.Oauth, 'login'])
  router.post('/oauth/signup', [controllers.Oauth, 'signup'])
  router.get('/oauth/callback', [controllers.Oauth, 'callback'])
})
