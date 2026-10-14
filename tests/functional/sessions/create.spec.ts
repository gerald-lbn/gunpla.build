import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { KitFactory } from '#database/factories/kit_factory'

test.group('SessionsController.create', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('login page renders with kit: null when no photo kit exists', async ({ client }) => {
    const response = await client.visit('login').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
    response.assertInertiaPropsContains({ kit: null })
  })

  test('login page renders kit with transformer-shaped fields', async ({ client }) => {
    await KitFactory.merge({
      photoCid: 'bafyfakecid',
      name: 'HG Aerial',
      grade: 'HG',
      scale: '1/144',
      manufacturer: 'Bandai',
      status: 'done',
    }).create()

    const response = await client.visit('login').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
    response.assertInertiaPropsContains({
      kit: {
        name: 'HG Aerial',
        grade: 'HG',
        scale: '1/144',
        manufacturer: 'Bandai',
        status: 'done',
        photoCid: 'bafyfakecid',
        photoCount: 1,
      },
    })
  })
})
