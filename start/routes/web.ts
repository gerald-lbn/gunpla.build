import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', [controllers.Home, 'index']).as('home')
router.get('/profile/:handle', [controllers.Profile, 'show']).as('profile')
