import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { asAtUriString } from '@atproto/syntax'
import { KitsService } from '#kits/services/kits_service'
import { KitFactory } from '#database/factories/kit_factory'
import CannotResolveHandleException from '#kits/exceptions/cannot_resolve_handle_exception'
import { FakeAtprotoUser } from '../helpers/fake_atproto_user.js'
import { FakeIdentityService } from '../helpers/fake_identity_service.js'

test.group('KitsService', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('resolves user handle on first kit creation and links to profile', async ({ db }) => {
    const did = 'did:plc:builder123'

    await KitFactory.merge({
      did,
    }).create()

    const fakeIdentityService = new FakeIdentityService({
      resolver: (identifier) => {
        if (identifier === did) {
          return { did, handle: 'new-handle.bsky.social' }
        }
        return null
      },
    })

    const fakeUser = new FakeAtprotoUser({
      did,
      createHandler: async () => ({
        uri: asAtUriString(`at://${did}/build.gunpla.kit/new-kit`),
        cid: 'bafytestcid',
      }),
    })

    const service = new KitsService(fakeUser, fakeIdentityService)

    await service.create({
      name: 'RG Zeta',
      status: 'done',
    })

    await db.assertHas('kits', {
      name: 'RG Zeta',
      did,
    })

    await db.assertHas('profiles', {
      did,
      handle: 'new-handle.bsky.social',
    })
  })

  test('throws CannotResolveHandleException without calling remote PDS when handle resolution fails', async ({
    assert,
    db,
  }) => {
    const did = 'did:plc:builder123'

    const fakeIdentityService = new FakeIdentityService({ defaultHandle: null })

    let clientCreateCalled = false
    let clientUploadBlobCalled = false

    const fakeUser = new FakeAtprotoUser({
      did,
      createHandler: async () => {
        clientCreateCalled = true
        return {
          uri: asAtUriString(`at://${did}/build.gunpla.kit/new-kit`),
          cid: 'bafytestcid',
        }
      },
      uploadBlobHandler: async () => {
        clientUploadBlobCalled = true
        return {
          body: { blob: {} },
        }
      },
    })

    const service = new KitsService(fakeUser, fakeIdentityService)

    await assert.rejects(async () => {
      await service.create({
        name: 'MG Freedom',
        status: 'backlog',
      })
    }, CannotResolveHandleException)

    assert.isFalse(clientCreateCalled)
    assert.isFalse(clientUploadBlobCalled)

    await db.assertEmpty('kits')
  })
})
