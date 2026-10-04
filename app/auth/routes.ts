import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

const {
  auth: {
    Login: LoginController,
    Signup: SignupController,
    Callback: CallbackController,
    Logout: LogoutController,
  },
} = controllers

router
  .group(() => {
    router.get('/login', [LoginController, 'render']).as('login')
  })
  .use(middleware.guest())

router.post('/oauth/logout', [LogoutController, 'handle']).as('oauth.logout').use(middleware.auth())

router.group(() => {
  router.post('/oauth/login', [LoginController, 'handle']).as('oauth.login')
  router.post('/oauth/signup', [SignupController, 'handle']).as('oauth.signup')
  router.get('/oauth/callback', [CallbackController, 'handle']).as('oauth.callback')
})
