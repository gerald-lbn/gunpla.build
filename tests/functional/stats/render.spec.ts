import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('StatsController.render', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('stats page renders with all typed prop fields', async ({ client }) => {
    const response = await client.visit('stats').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('stats')
    response.assertInertiaPropsContains({
      totalKits: 0,
      totalBuilders: 0,
      totalPhotos: 0,
      monthlyActiveBuilders: 0,
      gradeBreakdown: [],
      topBuilders: [],
      recentActivity: [],
    })
  })
})
