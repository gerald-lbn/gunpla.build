import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

const {
  profile: { ShowProfile: ShowProfileController, ShowKit: ShowKitController },
  kits: { KitLikes: KitLikesController },
} = controllers

router.get('/profile/:handle', [ShowProfileController, 'render']).as('profile')
router.get('/profile/:handle/kit/:rkey', [ShowKitController, 'render']).as('kit')
router
  .post('/profile/:handle/kit/:rkey/like', [KitLikesController, 'store'])
  .as('kits.like')
  .use(middleware.auth())
router
  .delete('/profile/:handle/kit/:rkey/like', [KitLikesController, 'destroy'])
  .as('kits.unlike')
  .use(middleware.auth())
