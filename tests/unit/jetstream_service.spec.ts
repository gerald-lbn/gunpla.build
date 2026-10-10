import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { AtUri } from '@atproto/syntax'
import { JetstreamService } from '../../services/jetstream_service.js'
import { KitFactory } from '../../database/factories/kit_factory.js'

test.group('JetstreamService.processEvent', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  const did = 'did:plc:testfakeuser12345'
  const rkey = 'testkey123'
  const expectedUri = AtUri.make(did, 'build.gunpla.kit', rkey).toString()

  test('valid kit record creates a Kit row in the database', async ({ db }) => {
    const service = new JetstreamService()

    await service.processEvent({
      kind: 'commit',
      time_us: Date.now(),
      did,
      commit: {
        operation: 'create',
        collection: 'build.gunpla.kit',
        rkey,
        cid: 'bafytest',
        record: {
          $type: 'build.gunpla.kit',
          name: 'HG RX-78-2',
          createdAt: '2024-01-01T00:00:00.000Z',
          status: 'backlog',
        },
      },
    })

    await db.assertHas('kits', {
      uri: expectedUri,
    })
  })

  test('invalid kit record is skipped without writing to the database', async ({ db }) => {
    const service = new JetstreamService()

    await service.processEvent({
      kind: 'commit',
      time_us: Date.now(),
      did,
      commit: {
        operation: 'create',
        collection: 'build.gunpla.kit',
        rkey,
        cid: 'bafytest',
        record: { $type: 'build.gunpla.kit' },
      },
    })

    await db.assertMissing('kits', {
      uri: expectedUri,
    })
  })

  test('kit delete event removes the Kit row from the database', async ({ db }) => {
    await KitFactory.merge({
      uri: expectedUri,
      did,
    }).create()

    const service = new JetstreamService()

    await service.processEvent({
      kind: 'commit',
      time_us: Date.now(),
      did,
      commit: {
        operation: 'delete',
        collection: 'build.gunpla.kit',
        rkey,
      },
    })

    await db.assertMissing('kits', {
      uri: expectedUri,
    })
  })
})
