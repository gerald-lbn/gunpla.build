import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

const {
  kits: { Kits: KitsController },
} = controllers

router.get('/shelf', [KitsController, 'index']).as('shelf').use(middleware.auth())
router
  .resource('kits', KitsController)
  .only(['create', 'store', 'edit', 'update', 'destroy'])
  .params({ kits: 'rkey' })
  .use('*', middleware.auth())
