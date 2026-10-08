import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const {
  profile: { ShowProfile: ShowProfileController, ShowKit: ShowKitController },
} = controllers

router.get('/profile/:handle', [ShowProfileController, 'render']).as('profile')
router.get('/profile/:handle/kit/:rkey', [ShowKitController, 'render']).as('kit')
