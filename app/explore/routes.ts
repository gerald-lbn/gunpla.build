import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const {
  explore: { Explore: ExploreController },
} = controllers

router.get('/explore', [ExploreController, 'index']).as('explore')
router.get('/explore/filter-values', [ExploreController, 'filterValues'])
