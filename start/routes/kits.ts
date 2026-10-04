import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

router
  .group(() => {
    router.get('/dashboard', [controllers.Kits, 'index']).as('dashboard')
    router.get('/kits/new', [controllers.Kits, 'new']).as('kits.new')
    router.post('/kits', [controllers.Kits, 'store']).as('kits.store')
    router.get('/kits/:rkey/edit', [controllers.Kits, 'edit']).as('kits.edit')
    router.put('/kits/:rkey', [controllers.Kits, 'update']).as('kits.update')
  })
  .use(middleware.auth())
