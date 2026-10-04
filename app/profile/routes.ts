import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const {
  profile: { ShowProfile: ShowProfileController },
} = controllers

router.get('/profile/:handle', [ShowProfileController, 'render']).as('profile')
