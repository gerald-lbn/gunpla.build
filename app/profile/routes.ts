import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

const {
  profile: { Profiles: ProfilesController },
  kits: { KitLikes: KitLikesController, KitComments: KitCommentsController },
} = controllers

router.get('/profile/:handle', [ProfilesController, 'show']).as('profile')
router.get('/profile/:handle/kit/:rkey', [ProfilesController, 'showKit']).as('kit')
router
  .get('/profile/:handle/kit/:rkey/comments', [KitCommentsController, 'index'])
  .as('kits.comments.index')
router
  .post('/profile/:handle/kit/:rkey/comments', [KitCommentsController, 'store'])
  .as('kits.comments.store')
  .use(middleware.auth())
router
  .delete('/profile/:handle/kit/:rkey/comments/:commentId', [KitCommentsController, 'destroy'])
  .as('kits.comments.destroy')
  .use(middleware.auth())
router
  .post('/profile/:handle/kit/:rkey/like', [KitLikesController, 'store'])
  .as('kits.like')
  .use(middleware.auth())
router
  .delete('/profile/:handle/kit/:rkey/like', [KitLikesController, 'destroy'])
  .as('kits.unlike')
  .use(middleware.auth())
