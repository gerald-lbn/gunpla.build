import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { AtUri } from '@atproto/syntax'
import { ProfileFactory } from '#database/factories/profile_factory'
import { KitFactory } from '#database/factories/kit_factory'
import { KitCommentFactory } from '#database/factories/kit_comment_factory'
import AuthMiddleware from '#middleware/auth_middleware'
import FakeAuthMiddlewareWithUser from '../../helpers/fake_auth_middleware_with_user.js'
import KitCommentsService from '#kits/services/kit_comments_service'
import { FakeKitCommentsService } from '../../helpers/fake_kit_comments_service.js'

test.group('KitCommentsController.index', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('returns empty data array when kit has no comments', async ({ client }) => {
    const profile = await ProfileFactory.merge({
      did: 'did:plc:kitowner12345678',
      handle: 'kitowner.bsky.social',
    }).create()
    const kit = await KitFactory.merge({
      did: profile.did,
      uri: AtUri.make(profile.did, 'build.gunpla.kit', 'rkey001').toString(),
    }).create()

    const response = await client.visit('kits.comments.index', {
      handle: profile.handle,
      rkey: new AtUri(kit.uri).rkey,
    })

    response.assertStatus(200)
    response.assertBodyContains({ data: [], metadata: { hasMorePages: false } })
  })

  test('returns first 20 comments newest-first with author details when more than 20 exist', async ({
    client,
    assert,
  }) => {
    const kitProfile = await ProfileFactory.merge({
      did: 'did:plc:kitowner12345678',
      handle: 'kitowner.bsky.social',
    }).create()
    const kit = await KitFactory.merge({
      did: kitProfile.did,
      uri: AtUri.make(kitProfile.did, 'build.gunpla.kit', 'rkey001').toString(),
    }).create()
    const commentProfile = await ProfileFactory.merge({
      did: 'did:plc:commenter12345678',
      handle: 'commenter.bsky.social',
    }).create()

    for (let i = 0; i < 21; i++) {
      const commentDid = commentProfile.did
      const commentRkey = `rkey${String(i).padStart(3, '0')}`
      await KitCommentFactory.merge({
        kitId: kit.id,
        did: commentDid,
        uri: AtUri.make(commentDid, 'build.gunpla.comment', commentRkey).toString(),
        text: `Comment ${i}`,
      }).create()
    }

    const response = await client.visit('kits.comments.index', {
      handle: kitProfile.handle,
      rkey: new AtUri(kit.uri).rkey,
    })

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.data.length, 20)
    assert.isTrue(body.metadata.hasMorePages)
    assert.property(body.data[0], 'author')
    assert.property(body.data[0].author, 'handle')
  })

  test('page=2 returns the next older batch', async ({ client, assert }) => {
    const kitProfile = await ProfileFactory.merge({
      did: 'did:plc:kitowner12345678',
      handle: 'kitowner.bsky.social',
    }).create()
    const kit = await KitFactory.merge({
      did: kitProfile.did,
      uri: AtUri.make(kitProfile.did, 'build.gunpla.kit', 'rkey001').toString(),
    }).create()
    const commentProfile = await ProfileFactory.merge({
      did: 'did:plc:commenter12345678',
      handle: 'commenter.bsky.social',
    }).create()

    for (let i = 0; i < 21; i++) {
      const commentDid = commentProfile.did
      const commentRkey = `rkey${String(i).padStart(3, '0')}`
      await KitCommentFactory.merge({
        kitId: kit.id,
        did: commentDid,
        uri: AtUri.make(commentDid, 'build.gunpla.comment', commentRkey).toString(),
        text: `Comment ${i}`,
      }).create()
    }

    const response = await client
      .visit('kits.comments.index', {
        handle: kitProfile.handle,
        rkey: new AtUri(kit.uri).rkey,
      })
      .qs({ page: 2 } as any) // TODO: Remove `as any` and figure out why TypeScript is complaining

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.data.length, 1)
    assert.equal(body.metadata.currentPage, 2)
  })

  test('unknown handle returns 404', async ({ client }) => {
    const response = await client.visit('kits.comments.index', {
      handle: 'no-such-handle.bsky.social',
      rkey: 'abc123def456',
    })

    response.assertStatus(404)
  })

  test('unknown rkey returns 404', async ({ client }) => {
    const profile = await ProfileFactory.merge({
      did: 'did:plc:kitowner12345678',
      handle: 'kitowner.bsky.social',
    }).create()

    const response = await client.visit('kits.comments.index', {
      handle: profile.handle,
      rkey: 'no-such-rkey1',
    })

    response.assertStatus(404)
  })
})

test.group('KitCommentsController.store', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('unauthenticated POST redirects to login', async ({ client }) => {
    const profile = await ProfileFactory.merge({
      did: 'did:plc:kitowner12345678',
      handle: 'kitowner.bsky.social',
    }).create()
    const kit = await KitFactory.merge({
      did: profile.did,
      uri: AtUri.make(profile.did, 'build.gunpla.kit', 'rkey001').toString(),
    }).create()

    const response = await client
      .visit('kits.comments.store', {
        handle: profile.handle,
        rkey: new AtUri(kit.uri).rkey,
      })
      .redirects(0)

    response.assertStatus(302)
  })

  test('unknown handle returns 404', async ({ client, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:fake12345678901'))

    const response = await client
      .visit('kits.comments.store', {
        handle: 'no-such-handle.bsky.social',
        rkey: 'abc123def456',
      })
      .withCsrfToken()
      .json({ text: 'Hello' })

    response.assertStatus(404)
  })

  test('unknown rkey returns 404', async ({ client, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:fake12345678901'))

    const profile = await ProfileFactory.merge({
      did: 'did:plc:kitowner12345678',
      handle: 'kitowner.bsky.social',
    }).create()

    const response = await client
      .visit('kits.comments.store', {
        handle: profile.handle,
        rkey: 'no-such-rkey1',
      })
      .withCsrfToken()
      .json({ text: 'Hello' })

    response.assertStatus(404)
  })

  test('blank or whitespace-only text returns 422 with "Comment cannot be blank."', async ({
    client,
    swap,
  }) => {
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:fake12345678901'))

    const profile = await ProfileFactory.merge({
      did: 'did:plc:kitowner12345678',
      handle: 'kitowner.bsky.social',
    }).create()
    const kit = await KitFactory.merge({
      did: profile.did,
      uri: AtUri.make(profile.did, 'build.gunpla.kit', 'rkey001').toString(),
    }).create()

    const response = await client
      .visit('kits.comments.store', {
        handle: profile.handle,
        rkey: new AtUri(kit.uri).rkey,
      })
      .withCsrfToken()
      .accept('json')
      .json({ text: '   ' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ message: 'Comment cannot be blank.' }] })
  })

  test('text exceeding 300 characters returns 422 with "Comment cannot exceed 300 characters."', async ({
    client,
    swap,
  }) => {
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:fake12345678901'))

    const profile = await ProfileFactory.merge({
      did: 'did:plc:kitowner12345678',
      handle: 'kitowner.bsky.social',
    }).create()
    const kit = await KitFactory.merge({
      did: profile.did,
      uri: AtUri.make(profile.did, 'build.gunpla.kit', 'rkey001').toString(),
    }).create()

    const response = await client
      .visit('kits.comments.store', {
        handle: profile.handle,
        rkey: new AtUri(kit.uri).rkey,
      })
      .withCsrfToken()
      .accept('json')
      .json({ text: 'a'.repeat(301) })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [{ message: 'Comment cannot exceed 300 characters.' }],
    })
  })

  test('valid text returns 200 with comment JSON including author details', async ({
    client,
    swap,
  }) => {
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:fake12345678901'))
    swap(KitCommentsService, new FakeKitCommentsService())

    const kitProfile = await ProfileFactory.merge({
      did: 'did:plc:kitowner12345678',
      handle: 'kitowner.bsky.social',
    }).create()
    const kit = await KitFactory.merge({
      did: kitProfile.did,
      uri: AtUri.make(kitProfile.did, 'build.gunpla.kit', 'rkey001').toString(),
    }).create()
    await ProfileFactory.merge({
      did: 'did:plc:fake12345678901',
      handle: 'commenter.bsky.social',
    }).create()

    const response = await client
      .visit('kits.comments.store', {
        handle: kitProfile.handle,
        rkey: new AtUri(kit.uri).rkey,
      })
      .withCsrfToken()
      .json({ text: 'Great build!' })

    response.assertStatus(200)
    response.assertBodyContains({
      did: 'did:plc:fake12345678901',
      text: 'Great build!',
      author: { handle: 'commenter.bsky.social' },
    })
  })

  test('invalid-format handle in store comment params returns 422', async ({
    client,
    swap,
    assert,
    db,
  }) => {
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:fake12345678901'))

    const response = await client
      .visit('kits.comments.store', {
        handle: 'notahandle',
        rkey: 'abc123def456',
      })
      .withCsrfToken()
      .accept('json')
      .json({ text: 'Hello' })

    response.assertStatus(422)
    const body = response.body() as any
    assert.isArray(body.errors)
    assert.isAbove(body.errors.length, 0)
    await db.assertMissing('kit_comments', { text: 'Hello' })
  })

  test('invalid-format rkey in store comment params returns 422', async ({
    client,
    swap,
    assert,
    db,
  }) => {
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:fake12345678901'))

    const response = await client
      .visit('kits.comments.store', {
        handle: 'kitowner.bsky.social',
        rkey: 'invalid/rkey!',
      })
      .withCsrfToken()
      .accept('json')
      .json({ text: 'Hello' })

    response.assertStatus(422)
    const body = response.body() as any
    assert.isArray(body.errors)
    assert.isAbove(body.errors.length, 0)
    await db.assertMissing('kit_comments', { text: 'Hello' })
  })

  test('valid text creates a kit_comments DB row', async ({ client, swap, db }) => {
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:fake12345678901'))
    swap(KitCommentsService, new FakeKitCommentsService())

    const kitProfile = await ProfileFactory.merge({
      did: 'did:plc:kitowner12345678',
      handle: 'kitowner.bsky.social',
    }).create()
    const kit = await KitFactory.merge({
      did: kitProfile.did,
      uri: AtUri.make(kitProfile.did, 'build.gunpla.kit', 'rkey001').toString(),
    }).create()
    await ProfileFactory.merge({
      did: 'did:plc:fake12345678901',
      handle: 'commenter.bsky.social',
    }).create()

    await client
      .visit('kits.comments.store', {
        handle: kitProfile.handle,
        rkey: new AtUri(kit.uri).rkey,
      })
      .withCsrfToken()
      .json({ text: 'Great build!' })

    await db.assertHas('kit_comments', {
      kit_id: kit.id,
      did: 'did:plc:fake12345678901',
      text: 'Great build!',
    })
  })
})

test.group('KitCommentsController.destroy', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('unauthenticated DELETE redirects to login', async ({ client }) => {
    const profile = await ProfileFactory.merge({
      did: 'did:plc:author123456789012',
      handle: 'author.bsky.social',
    }).create()
    const kit = await KitFactory.merge({
      did: profile.did,
      uri: AtUri.make(profile.did, 'build.gunpla.kit', 'rkey001').toString(),
    }).create()
    const comment = await KitCommentFactory.merge({
      kitId: kit.id,
      did: profile.did,
      uri: AtUri.make(profile.did, 'build.gunpla.comment', 'crkey001').toString(),
    }).create()

    const response = await client
      .visit('kits.comments.destroy', {
        handle: profile.handle,
        rkey: new AtUri(kit.uri).rkey,
        commentId: comment.id,
      })
      .redirects(0)

    response.assertStatus(302)
  })

  test('unknown commentId returns 404', async ({ client, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:fake12345678901'))

    const profile = await ProfileFactory.merge({
      did: 'did:plc:kitowner12345678',
      handle: 'kitowner.bsky.social',
    }).create()
    const kit = await KitFactory.merge({
      did: profile.did,
      uri: AtUri.make(profile.did, 'build.gunpla.kit', 'rkey001').toString(),
    }).create()

    const response = await client
      .visit('kits.comments.destroy', {
        handle: profile.handle,
        rkey: new AtUri(kit.uri).rkey,
        commentId: 999999,
      })
      .withCsrfToken()

    response.assertStatus(404)
  })

  test('non-author returns 403', async ({ client, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:viewer12345678901'))

    const authorProfile = await ProfileFactory.merge({
      did: 'did:plc:author123456789012',
      handle: 'author.bsky.social',
    }).create()
    const kit = await KitFactory.merge({
      did: authorProfile.did,
      uri: AtUri.make(authorProfile.did, 'build.gunpla.kit', 'rkey001').toString(),
    }).create()
    const comment = await KitCommentFactory.merge({
      kitId: kit.id,
      did: authorProfile.did,
      uri: AtUri.make(authorProfile.did, 'build.gunpla.comment', 'crkey001').toString(),
    }).create()

    const response = await client
      .visit('kits.comments.destroy', {
        handle: authorProfile.handle,
        rkey: new AtUri(kit.uri).rkey,
        commentId: comment.id,
      })
      .withCsrfToken()
      .accept('json')

    response.assertStatus(403)
  })

  test('author DELETE returns 200 with success body', async ({ client, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:author123456789012'))
    swap(KitCommentsService, new FakeKitCommentsService())

    const authorProfile = await ProfileFactory.merge({
      did: 'did:plc:author123456789012',
      handle: 'author.bsky.social',
    }).create()
    const kit = await KitFactory.merge({
      did: authorProfile.did,
      uri: AtUri.make(authorProfile.did, 'build.gunpla.kit', 'rkey001').toString(),
    }).create()
    const comment = await KitCommentFactory.merge({
      kitId: kit.id,
      did: authorProfile.did,
      uri: AtUri.make(authorProfile.did, 'build.gunpla.comment', 'crkey001').toString(),
    }).create()

    const response = await client
      .visit('kits.comments.destroy', {
        handle: authorProfile.handle,
        rkey: new AtUri(kit.uri).rkey,
        commentId: comment.id,
      })
      .withCsrfToken()

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
  })

  test('author DELETE removes the kit_comments DB row', async ({ client, swap, db }) => {
    swap(AuthMiddleware, new FakeAuthMiddlewareWithUser('did:plc:author123456789012'))
    swap(KitCommentsService, new FakeKitCommentsService())

    const authorProfile = await ProfileFactory.merge({
      did: 'did:plc:author123456789012',
      handle: 'author.bsky.social',
    }).create()
    const kit = await KitFactory.merge({
      did: authorProfile.did,
      uri: AtUri.make(authorProfile.did, 'build.gunpla.kit', 'rkey001').toString(),
    }).create()
    const comment = await KitCommentFactory.merge({
      kitId: kit.id,
      did: authorProfile.did,
      uri: AtUri.make(authorProfile.did, 'build.gunpla.comment', 'crkey001').toString(),
    }).create()

    await client
      .visit('kits.comments.destroy', {
        handle: authorProfile.handle,
        rkey: new AtUri(kit.uri).rkey,
        commentId: comment.id,
      })
      .withCsrfToken()

    await db.assertMissing('kit_comments', { id: comment.id })
  })
})
