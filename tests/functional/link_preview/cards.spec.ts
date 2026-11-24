import { test } from '@japa/runner'
import { AtUri } from '@atproto/syntax'
import testUtils from '@adonisjs/core/services/test_utils'
import { KitFactory } from '#database/factories/kit_factory'
import { ProfileFactory } from '#database/factories/profile_factory'

/**
 * No avatar and no photos, so rendering a card fetches nothing over the
 * network.
 */
async function createKit() {
  const profile = await ProfileFactory.merge({
    handle: 'amuro.example.com',
    avatarUrl: null,
  }).create()
  const kit = await KitFactory.merge({
    did: profile.did,
    uri: AtUri.make(profile.did, 'build.gunpla.kit', '3mx7c72iqn62f').toString(),
    cid: 'bafyreikitrecord',
    name: 'RX-78-2 Gundam',
  }).create()
  return { profile, kit }
}

test.group('Link preview cards', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('a kit card is a JPEG, cached for good at its current version', async ({ client }) => {
    await createKit()

    const response = await client
      .get('/profile/amuro.example.com/kit/3mx7c72iqn62f/card')
      .qs({ v: 'bafyreikitrecord' })

    response.assertStatus(200)
    response.assertHeader('content-type', 'image/jpeg')
    response.assertHeader('cache-control', 'public, max-age=31536000, immutable')
  })

  test('a kit card asked for at an old version is cached only briefly', async ({ client }) => {
    await createKit()

    const response = await client
      .get('/profile/amuro.example.com/kit/3mx7c72iqn62f/card')
      .qs({ v: 'bafyreioldrecord' })

    response.assertStatus(200)
    response.assertHeader('cache-control', 'public, max-age=300')
  })

  test('a kit card is not found under a different builder', async ({ client }) => {
    await createKit()
    await ProfileFactory.merge({ handle: 'char.example.com', avatarUrl: null }).create()

    const response = await client.get('/profile/char.example.com/kit/3mx7c72iqn62f/card')

    response.assertStatus(404)
  })

  test('a profile card is a JPEG', async ({ client }) => {
    await createKit()

    const response = await client.get('/profile/amuro.example.com/card')

    response.assertStatus(200)
    response.assertHeader('content-type', 'image/jpeg')
  })

  test('a profile card for an unknown handle is not found', async ({ client }) => {
    const response = await client.get('/profile/nobody.example.com/card')

    response.assertStatus(404)
  })
})
