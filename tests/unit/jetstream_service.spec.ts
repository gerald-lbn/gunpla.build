import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { JetstreamService } from '../../services/jetstream_service.js'
import { KitFactory } from '../../database/factories/kit_factory.js'
import { BuildLogFactory } from '../../database/factories/build_log_factory.js'

test.group('JetstreamService.processEvent', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('valid kit record creates a Kit row in the database', async ({ db }) => {
    const service = new JetstreamService({
      wantedCollections: ['build.gunpla.kit', 'build.gunpla.buildLog'],
    })

    await service.processEvent({
      kind: 'commit',
      time_us: Date.now(),
      did: 'did:plc:testfakeuser12345',
      commit: {
        operation: 'create',
        collection: 'build.gunpla.kit',
        rkey: 'testkey123',
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
      uri: 'at://did:plc:testfakeuser12345/build.gunpla.kit/testkey123',
    })
  })

  test('invalid kit record is skipped without writing to the database', async ({ db }) => {
    const service = new JetstreamService({
      wantedCollections: ['build.gunpla.kit', 'build.gunpla.buildLog'],
    })

    await service.processEvent({
      kind: 'commit',
      time_us: Date.now(),
      did: 'did:plc:testfakeuser12345',
      commit: {
        operation: 'create',
        collection: 'build.gunpla.kit',
        rkey: 'testkey123',
        cid: 'bafytest',
        record: { $type: 'build.gunpla.kit' },
      },
    })

    await db.assertMissing('kits', {
      uri: 'at://did:plc:testfakeuser12345/build.gunpla.kit/testkey123',
    })
  })

  test('valid build log record creates a BuildLog row in the database', async ({ db }) => {
    const service = new JetstreamService({
      wantedCollections: ['build.gunpla.kit', 'build.gunpla.buildLog'],
    })

    await service.processEvent({
      kind: 'commit',
      time_us: Date.now(),
      did: 'did:plc:testfakeuser12345',
      commit: {
        operation: 'create',
        collection: 'build.gunpla.buildLog',
        rkey: 'logkey123',
        cid: 'bafytest',
        record: {
          $type: 'build.gunpla.buildLog',
          kit: 'at://did:plc:testfakeuser12345/build.gunpla.kit/testkey123',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
    })

    await db.assertHas('build_logs', {
      uri: 'at://did:plc:testfakeuser12345/build.gunpla.buildLog/logkey123',
    })
  })

  test('invalid build log record is skipped without writing to the database', async ({ db }) => {
    const service = new JetstreamService({
      wantedCollections: ['build.gunpla.kit', 'build.gunpla.buildLog'],
    })

    await service.processEvent({
      kind: 'commit',
      time_us: Date.now(),
      did: 'did:plc:testfakeuser12345',
      commit: {
        operation: 'create',
        collection: 'build.gunpla.buildLog',
        rkey: 'logkey123',
        cid: 'bafytest',
        record: { $type: 'build.gunpla.buildLog', text: 'hello' },
      },
    })

    await db.assertMissing('build_logs', {
      uri: 'at://did:plc:testfakeuser12345/build.gunpla.buildLog/logkey123',
    })
  })

  test('kit delete event removes the Kit row from the database', async ({ db }) => {
    await KitFactory.merge({
      uri: 'at://did:plc:testfakeuser12345/build.gunpla.kit/testkey123',
      did: 'did:plc:testfakeuser12345',
    }).create()

    const service = new JetstreamService({
      wantedCollections: ['build.gunpla.kit', 'build.gunpla.buildLog'],
    })

    await service.processEvent({
      kind: 'commit',
      time_us: Date.now(),
      did: 'did:plc:testfakeuser12345',
      commit: {
        operation: 'delete',
        collection: 'build.gunpla.kit',
        rkey: 'testkey123',
      },
    })

    await db.assertMissing('kits', {
      uri: 'at://did:plc:testfakeuser12345/build.gunpla.kit/testkey123',
    })
  })

  test('build log delete event removes the BuildLog row from the database', async ({ db }) => {
    await BuildLogFactory.merge({
      uri: 'at://did:plc:testfakeuser12345/build.gunpla.buildLog/logkey123',
      did: 'did:plc:testfakeuser12345',
    }).create()

    const service = new JetstreamService({
      wantedCollections: ['build.gunpla.kit', 'build.gunpla.buildLog'],
    })

    await service.processEvent({
      kind: 'commit',
      time_us: Date.now(),
      did: 'did:plc:testfakeuser12345',
      commit: {
        operation: 'delete',
        collection: 'build.gunpla.buildLog',
        rkey: 'logkey123',
      },
    })

    await db.assertMissing('build_logs', {
      uri: 'at://did:plc:testfakeuser12345/build.gunpla.buildLog/logkey123',
    })
  })
})
