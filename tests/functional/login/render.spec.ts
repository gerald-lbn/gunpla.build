import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { KitFactory } from '#database/factories/kit_factory'

test.group('LoginController.render', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('login page renders with kit: null when no photo kit exists', async ({ client }) => {
    const response = await client.get('/login').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
    response.assertInertiaPropsContains({ kit: null })
  })

  test('login page renders with kit data when a photo kit exists', async ({ client }) => {
    await KitFactory.merge({ photoCid: 'bafyfakecid' }).create()

    const response = await client.get('/login').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
    response.assertInertiaPropsContains({ kit: {} })
  })
})
