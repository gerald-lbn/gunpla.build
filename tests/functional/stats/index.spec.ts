import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { KitFactory } from '#database/factories/kit_factory'

test.group('StatsController.index', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('stats page renders with all typed prop fields', async ({ client }) => {
    const response = await client.visit('stats').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('stats')
    response.assertInertiaPropsContains({
      totalKits: 0,
      totalBuilders: 0,
      totalPhotos: 0,
      totalLikes: 0,
      gradeBreakdown: [],
      topBuilders: [],
      recentActivity: [],
    })
  })

  test('accurately counts photos across kits with single and multi-photo arrays', async ({
    client,
  }) => {
    // 1 kit with single photo
    await KitFactory.merge({
      photos: ['bafkreia1'],
    }).create()

    // 1 kit with multi-photo array (3 photos)
    await KitFactory.merge({
      photos: ['bafkreia2', 'bafkreia3', 'bafkreia4'],
    }).create()

    // 1 kit with no photos
    await KitFactory.merge({
      photos: null,
    }).create()

    const response = await client.visit('stats').withInertia()
    response.assertStatus(200)
    response.assertInertiaPropsContains({
      totalKits: 3,
      totalPhotos: 4,
    })
  })
})
