import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { asAtUriString, AtUri, InvalidRecordKeyError } from '@atproto/syntax'
import { l, lexParse } from '@atproto/lex'
import sharp from 'sharp'
import app from '@adonisjs/core/services/app'
import Kit from '#kits/models/kit'
import KitsService from '#kits/services/kits_service'
import { KitFactory } from '#database/factories/kit_factory'
import { FakeAtprotoUser } from '../helpers/fake_atproto_user.js'

test.group('KitsService', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('creates kit record in ATProto and persists it locally', async ({ db }) => {
    const did = 'did:plc:builder123'

    const fakeUser = new FakeAtprotoUser({
      did,
      createHandler: async () => ({
        uri: asAtUriString(AtUri.make(did, 'build.gunpla.kit', 'new-kit').toString()),
        cid: 'bafytestcid',
      }),
    })

    const service = new KitsService(fakeUser)

    await service.create({
      name: 'RG Zeta',
      status: 'done',
    })

    await db.assertHas('kits', { name: 'RG Zeta', did })
  })

  test('update kit formats canonical AT-URI via AtUri.make and persists record update', async ({
    assert,
    db,
  }) => {
    const did = 'did:plc:builder123'
    const rkey = '3k2y4z3u2b222'
    const kitUri = AtUri.make(did, 'build.gunpla.kit', rkey).toString()

    await KitFactory.merge({
      uri: kitUri,
      did,
      name: 'HG Aerial',
      status: 'in-progress',
    }).create()

    const fakeUser = new FakeAtprotoUser({
      did,
      getHandler: async () => ({
        uri: asAtUriString(kitUri),
        cid: 'bafytestcid',
        value: {
          $type: 'build.gunpla.kit',
          name: 'HG Aerial',
          status: 'in-progress',
          createdAt: l.currentDatetimeString(),
        },
      }),
      putHandler: async () => ({
        uri: asAtUriString(kitUri),
        cid: 'bafytestcid2',
      }),
    })

    const service = new KitsService(fakeUser)
    const result = await service.update(rkey, {
      name: 'RG Hi-Nu',
      status: 'done',
    })

    assert.equal(result.uri, kitUri)
    await db.assertHas('kits', {
      uri: kitUri,
      name: 'RG Hi-Nu',
      status: 'done',
    })
  })

  test('update kit throws InvalidRecordKeyError when rkey syntax is invalid', async ({
    assert,
  }) => {
    const fakeUser = new FakeAtprotoUser()
    const service = new KitsService(fakeUser)

    await assert.rejects(
      () =>
        service.update('invalid/rkey!', {
          name: 'RG Hi-Nu',
          status: 'done',
        }),
      InvalidRecordKeyError
    )
  })

  test('creating a kit with a photo stores a blur placeholder of its cover', async ({ assert }) => {
    const did = 'did:plc:builder123'
    const photoPath = app.tmpPath('cover-placeholder-test.png')
    await sharp({
      create: { width: 40, height: 50, channels: 3, background: '#2ea3ff' },
    })
      .png()
      .toFile(photoPath)

    const fakeUser = new FakeAtprotoUser({
      did,
      createHandler: async () => ({
        uri: asAtUriString(AtUri.make(did, 'build.gunpla.kit', 'with-photo').toString()),
        cid: 'bafytestcid',
      }),
    })

    await new KitsService(fakeUser).create({
      name: 'MGSD Freedom',
      status: 'done',
      photos: [{ tmpPath: photoPath } as never],
    })

    const kit = await Kit.findByOrFail('name', 'MGSD Freedom')
    assert.match(kit.coverPlaceholder ?? '', /^[A-Za-z0-9+/]+={0,2}$/)
  })

  test('editing a kit without changing its cover keeps the stored placeholder', async ({
    assert,
  }) => {
    const did = 'did:plc:builder123'
    const rkey = '3k2y4z3u2b223'
    const kitUri = AtUri.make(did, 'build.gunpla.kit', rkey).toString()
    const coverCid = 'bafkreiadsbmmn4waznesyuz3bjgrj33xzqhxrk6mz3ksq7meugrachh3qe'

    await KitFactory.merge({
      uri: kitUri,
      did,
      name: 'HG Aerial',
      status: 'in-progress',
      photos: [coverCid],
      coverPlaceholder: 'storedHash',
    }).create()

    const fakeUser = new FakeAtprotoUser({
      did,
      getHandler: async () => ({
        uri: asAtUriString(kitUri),
        cid: 'bafytestcid',
        value: lexParse(
          JSON.stringify({
            $type: 'build.gunpla.kit',
            name: 'HG Aerial',
            status: 'in-progress',
            photos: [
              {
                $type: 'blob',
                ref: { $link: coverCid },
                mimeType: 'image/webp',
                size: 1234,
              },
            ],
            createdAt: l.currentDatetimeString(),
          })
        ),
      }),
      putHandler: async () => ({ uri: asAtUriString(kitUri), cid: 'bafytestcid2' }),
    })

    await new KitsService(fakeUser).update(rkey, { name: 'HG Aerial', status: 'done' })

    const kit = await Kit.findByOrFail('uri', kitUri)
    assert.equal(kit.coverPlaceholder, 'storedHash')
  })

  test('delete kit formats canonical AT-URI via AtUri.make and removes record', async ({ db }) => {
    const did = 'did:plc:builder123'
    const rkey = '3k2y4z3u2b222'
    const kitUri = AtUri.make(did, 'build.gunpla.kit', rkey).toString()

    await KitFactory.merge({
      uri: kitUri,
      did,
    }).create()

    const fakeUser = new FakeAtprotoUser({
      did,
      deleteHandler: async () => {},
    })

    const service = new KitsService(fakeUser)
    await service.delete(rkey)

    await db.assertMissing('kits', {
      uri: kitUri,
    })
  })

  test('delete kit throws InvalidRecordKeyError when rkey syntax is invalid', async ({
    assert,
  }) => {
    const fakeUser = new FakeAtprotoUser()
    const service = new KitsService(fakeUser)

    await assert.rejects(() => service.delete('invalid/rkey!'), InvalidRecordKeyError)
  })
})
