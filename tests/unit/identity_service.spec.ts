import { test } from '@japa/runner'
import IdentityService from '#profile/services/identity_service'

test.group('IdentityService', () => {
  const service = new IdentityService()

  test('resolves valid handle to did and canonical handle', async ({ assert }) => {
    const identity = await service.resolve('grld.dev')

    assert.isNotNull(identity)
    assert.equal(identity?.handle, 'grld.dev')
    assert.equal(identity?.did, 'did:plc:abiaoe3hpp2cqiuptrss75fp')

    const identityWithAt = await service.resolve('@grld.dev')
    assert.isNotNull(identityWithAt)
    assert.equal(identityWithAt?.handle, 'grld.dev')
    assert.equal(identityWithAt?.did, 'did:plc:abiaoe3hpp2cqiuptrss75fp')
  })

  test('resolves handle with mixed casing and leading @ to lowercase canonical handle', async ({
    assert,
  }) => {
    const identity = await service.resolve('@Grld.Dev')

    assert.isNotNull(identity)
    assert.equal(identity?.handle, 'grld.dev')
    assert.equal(identity?.did, 'did:plc:abiaoe3hpp2cqiuptrss75fp')
  })

  test('returns null for empty or whitespace identifiers', async ({ assert }) => {
    assert.isNull(await service.resolve(''))
    assert.isNull(await service.resolve('   '))
    assert.isNull(await service.resolve('@'))
  })

  test('returns null for syntactically invalid handles', async ({ assert }) => {
    assert.isNull(await service.resolve('invalid handle with spaces'))
    assert.isNull(await service.resolve('http://invalid'))
    assert.isNull(await service.resolve('@not a handle!'))
  })

  test('returns null for syntactically invalid DID without invoking resolver', async ({
    assert,
  }) => {
    const identity = await service.resolve('did:invalid-format!')
    assert.isNull(identity)
  })

  test('returns null when identity document contains no valid handle in alsoKnownAs', async ({
    assert,
  }) => {
    const validDid = 'did:web:example.com'
    const fallbackService = new IdentityService()
    ;(fallbackService as any).didResolver = {
      resolve: async (_did: string) => ({
        id: validDid,
        alsoKnownAs: [],
      }),
    }
    const identity = await fallbackService.resolve(validDid)

    assert.isNull(identity)
  })

  test('returns null for non-existent domains that cannot be resolved', async ({ assert }) => {
    assert.isNull(await service.resolve('grld.deve'))
    assert.isNull(await service.resolve('nonexistent-subdomain-123456789.bsky.social'))
  })
})
