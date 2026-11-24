import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const {
  linkPreview: { KitCards: KitCardsController, ProfileCards: ProfileCardsController },
} = controllers

router.get('/profile/:handle/card', [ProfileCardsController, 'show']).as('profiles.card')
router.get('/profile/:handle/kit/:rkey/card', [KitCardsController, 'show']).as('kits.card')
