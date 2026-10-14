import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const {
  feed: { Feed: FeedController },
} = controllers

router.get('/', [FeedController, 'index']).as('home')
