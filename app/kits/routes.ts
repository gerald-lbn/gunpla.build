import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

const {
  kits: {
    ListKits: ListKitsController,
    StoreKit: StoreKitController,
    UpdateKit: UpdateKitController,
    DestroyKit: DestroyKitController,
  },
} = controllers

router
  .group(() => {
    router.get('/shelf', [ListKitsController, 'render']).as('shelf')
    router.get('/kits/new', [StoreKitController, 'create']).as('kits.new')
    router.post('/kits', [StoreKitController, 'store']).as('kits.store')
    router.get('/kits/:rkey/edit', [UpdateKitController, 'edit']).as('kits.edit')
    router.put('/kits/:rkey', [UpdateKitController, 'update']).as('kits.update')
    router.delete('/kits/:rkey', [DestroyKitController, 'destroy']).as('kits.destroy')
  })
  .use(middleware.auth())
