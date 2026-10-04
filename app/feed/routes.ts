import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const {
  feed: { Feed: FeedController },
} = controllers

router.get('/', [FeedController, 'render']).as('home')
