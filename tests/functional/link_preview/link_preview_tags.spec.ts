import { test } from '@japa/runner'
import { AtUri } from '@atproto/syntax'
import testUtils from '@adonisjs/core/services/test_utils'
import { KitFactory } from '#database/factories/kit_factory'
import { ProfileFactory } from '#database/factories/profile_factory'

function meta(html: string, key: string): string | null {
  const match = html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`))
  if (!match) {
    return null
  }
  return match[1]
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
}

test.group('Link preview tags', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('a profile page previews the builder with their profile card', async ({
    client,
    assert,
  }) => {
    const profile = await ProfileFactory.merge({
      handle: 'amuro.example.com',
      displayName: 'Amuro Ray',
      avatarUrl: null,
    }).create()
    await KitFactory.merge({ did: profile.did }).createMany(3)

    const response = await client.get('/profile/amuro.example.com')

    response.assertStatus(200)
    const html = response.text()
    assert.equal(meta(html, 'og:title'), "Amuro Ray's shelf")
    assert.equal(meta(html, 'og:type'), 'profile')
    assert.match(meta(html, 'og:description')!, /^3 kits on @amuro\.example\.com's shelf\./)
    assert.match(meta(html, 'og:image')!, /\/profile\/amuro\.example\.com\/card\?v=\d+-3$/)
    assert.equal(meta(html, 'og:image:type'), 'image/jpeg')
    assert.match(meta(html, 'og:url')!, /\/profile\/amuro\.example\.com$/)
  })

  test('a kit page previews the kit with its kit card', async ({ client, assert }) => {
    const profile = await ProfileFactory.merge({
      handle: 'amuro.example.com',
      avatarUrl: null,
    }).create()
    await KitFactory.merge({
      did: profile.did,
      uri: AtUri.make(profile.did, 'build.gunpla.kit', '3mx7c72iqn62f').toString(),
      cid: 'bafyreikitrecord',
      name: 'RX-78-2 Gundam',
      grade: 'MG',
      scale: '1/100',
      status: 'done',
    }).create()

    const response = await client.get('/profile/amuro.example.com/kit/3mx7c72iqn62f')

    response.assertStatus(200)
    const html = response.text()
    assert.equal(meta(html, 'og:title'), "RX-78-2 Gundam on @amuro.example.com's shelf")
    assert.equal(meta(html, 'og:type'), 'article')
    assert.match(meta(html, 'og:description')!, /^Built · MG · 1\/100\./)
    assert.match(
      meta(html, 'og:image')!,
      /\/profile\/amuro\.example\.com\/kit\/3mx7c72iqn62f\/card\?v=bafyreikitrecord$/
    )
    assert.equal(meta(html, 'twitter:card'), 'summary_large_image')
  })

  test('the home feed has its own title and the site image', async ({ client, assert }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    const html = response.text()
    assert.equal(meta(html, 'og:title'), 'Latest builds')
    assert.match(meta(html, 'og:image')!, /\/og-default\.png$/)
    assert.include(html, '<title data-inertia>Latest builds - gunpla.build</title>')
  })

  test('the sign-in page falls back to the site preview', async ({ client, assert }) => {
    const response = await client.get('/login')

    response.assertStatus(200)
    const html = response.text()
    assert.equal(meta(html, 'og:title'), 'gunpla.build')
    assert.match(meta(html, 'og:image')!, /\/og-default\.png$/)
    assert.match(meta(html, 'og:url')!, /\/login$/)
  })
})
