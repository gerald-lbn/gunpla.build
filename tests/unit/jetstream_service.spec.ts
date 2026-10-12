import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { AtUri } from '@atproto/syntax'
import { JetstreamService } from '../../services/jetstream_service.js'
import { KitFactory } from '../../database/factories/kit_factory.js'
import { ProfileFactory } from '../../database/factories/profile_factory.js'
import { KitCommentFactory } from '../../database/factories/kit_comment_factory.js'

test.group('JetstreamService.processEvent (build.gunpla.comment)', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  const kitDid = 'did:plc:kitowner12345678901'
  const kitRkey = 'rkeyabc123'
  const commentDid = 'did:plc:author1234567890123'
  const commentRkey = '3ldkfakekey1'
  const kitUri = AtUri.make(kitDid, 'build.gunpla.kit', kitRkey).toString()
  const expectedCommentUri = AtUri.make(commentDid, 'build.gunpla.comment', commentRkey).toString()

  test('build.gunpla.comment create event persists a KitComment row', async ({ db }) => {
    await ProfileFactory.merge({ did: kitDid, handle: 'kitowner.bsky.social' }).create()
    await KitFactory.merge({ did: kitDid, uri: kitUri }).create()

    const service = new JetstreamService()
    await service.processEvent({
      kind: 'commit',
      time_us: Date.now(),
      did: commentDid,
      commit: {
        operation: 'create',
        collection: 'build.gunpla.comment',
        rkey: commentRkey,
        cid: 'bafytest',
        record: {
          $type: 'build.gunpla.comment',
          text: 'Nice build!',
          subject: kitUri,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
    })

    await db.assertHas('kit_comments', {
      uri: expectedCommentUri,
      did: commentDid,
      text: 'Nice build!',
    })
  })

  test('build.gunpla.comment create event with duplicate URI is skipped without error', async ({
    db,
    assert,
  }) => {
    await ProfileFactory.merge({ did: kitDid, handle: 'kitowner.bsky.social' }).create()
    const kit = await KitFactory.merge({ did: kitDid, uri: kitUri }).create()
    await KitCommentFactory.merge({
      kitId: kit.id,
      did: commentDid,
      uri: expectedCommentUri,
    }).create()

    const service = new JetstreamService()
    await assert.doesNotReject(() =>
      service.processEvent({
        kind: 'commit',
        time_us: Date.now(),
        did: commentDid,
        commit: {
          operation: 'create',
          collection: 'build.gunpla.comment',
          rkey: commentRkey,
          cid: 'bafytest',
          record: {
            $type: 'build.gunpla.comment',
            text: 'Nice build!',
            subject: kitUri,
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        },
      })
    )

    await db.assertCount('kit_comments', 1)
  })

  test('build.gunpla.comment delete event removes the KitComment row', async ({ db }) => {
    await ProfileFactory.merge({ did: kitDid, handle: 'kitowner.bsky.social' }).create()
    const kit = await KitFactory.merge({ did: kitDid, uri: kitUri }).create()
    await KitCommentFactory.merge({
      kitId: kit.id,
      did: commentDid,
      uri: expectedCommentUri,
    }).create()

    const service = new JetstreamService()
    await service.processEvent({
      kind: 'commit',
      time_us: Date.now(),
      did: commentDid,
      commit: {
        operation: 'delete',
        collection: 'build.gunpla.comment',
        rkey: commentRkey,
      },
    })

    await db.assertMissing('kit_comments', { uri: expectedCommentUri })
  })

  test('build.gunpla.comment delete event when comment not found is a no-op', async ({
    db,
    assert,
  }) => {
    const service = new JetstreamService()
    await assert.doesNotReject(() =>
      service.processEvent({
        kind: 'commit',
        time_us: Date.now(),
        did: commentDid,
        commit: {
          operation: 'delete',
          collection: 'build.gunpla.comment',
          rkey: commentRkey,
        },
      })
    )

    await db.assertEmpty('kit_comments')
  })
})

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
