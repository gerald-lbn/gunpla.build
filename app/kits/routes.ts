import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

const {
  kits: {
    ListKits: ListKitsController,
    StoreKit: StoreKitController,
    UpdateKit: UpdateKitController,
  },
} = controllers

router
  .group(() => {
    router.get('/dashboard', [ListKitsController, 'render']).as('dashboard')
    router.get('/kits/new', [StoreKitController, 'render']).as('kits.new')
    router.post('/kits', [StoreKitController, 'handle']).as('kits.store')
    router.get('/kits/:rkey/edit', [UpdateKitController, 'render']).as('kits.edit')
    router.put('/kits/:rkey', [UpdateKitController, 'handle']).as('kits.update')
  })
  .use(middleware.auth())
