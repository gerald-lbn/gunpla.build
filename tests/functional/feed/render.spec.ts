import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { KitFactory } from '#database/factories/kit_factory'

test.group('FeedController.render', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('home page renders kits list with name, handle, status', async ({ client }) => {
    await KitFactory.merge({
      name: 'HG Aerial',
      handle: 'amuro.bsky.social',
      status: 'done',
      photoCid: 'bafyfakecid',
    }).create()

    const response = await client.get('/').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home/index')
    response.assertInertiaPropsContains({
      kits: [{ name: 'HG Aerial', handle: 'amuro.bsky.social', status: 'done' }],
    })
  })

  test('home page renders kits: [] when no kits exist', async ({ client }) => {
    const response = await client.get('/').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home/index')
    response.assertInertiaPropsContains({ kits: [] })
  })
})
