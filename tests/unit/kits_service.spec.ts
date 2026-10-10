import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { asAtUriString, AtUri, InvalidRecordKeyError } from '@atproto/syntax'
import { l } from '@atproto/lex'
import { KitsService } from '#kits/services/kits_service'
import { KitFactory } from '#database/factories/kit_factory'
import { FakeAtprotoUser } from '../helpers/fake_atproto_user.js'

test.group('KitsService', (group) => {
  group.each.setup(() => testUtils.db().truncate())

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
