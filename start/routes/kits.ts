import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

router
  .group(() => {
    router.get('/kits/new', [controllers.Kits, 'new']).as('kits.new')
    router.post('/kits', [controllers.Kits, 'store']).as('kits.store')
  })
  .use(middleware.auth())
