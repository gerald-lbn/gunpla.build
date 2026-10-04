import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Auth', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('renders login page for guests', async ({ client }) => {
    const response = await client.get('/login').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })

  test('redirects unauthenticated users visiting /dashboard to /login', async ({ client }) => {
    const response = await client.get('/dashboard')

    response.assertRedirectsTo('/login')
  })
})
