import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const {
  stats: { Stats: StatsController },
} = controllers

router.get('/stats', [StatsController, 'index']).as('stats')
