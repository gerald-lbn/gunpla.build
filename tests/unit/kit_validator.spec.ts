import { test } from '@japa/runner'
import { errors } from '@vinejs/vine'
import {
  syncIdentifierValidator,
  createKitValidator,
  likeKitParamsValidator,
} from '#kits/validators/kit'

test.group('Kit validator', () => {
  test('accepts valid ATProto handles', async ({ assert }) => {
    const output = await syncIdentifierValidator.validate({ identifier: 'alice.bsky.social' })
    assert.deepEqual(output, { identifier: 'alice.bsky.social' })
  })

  test('accepts valid ATProto DIDs', async ({ assert }) => {
    const plcOutput = await syncIdentifierValidator.validate({
      identifier: 'did:plc:ragtjsm2j2vknwk2zOverflow',
    })
    assert.deepEqual(plcOutput, { identifier: 'did:plc:ragtjsm2j2vknwk2zOverflow' })

    const webOutput = await syncIdentifierValidator.validate({
      identifier: 'did:web:example.com',
    })
    assert.deepEqual(webOutput, { identifier: 'did:web:example.com' })
  })

  test('rejects invalid identifier strings', async ({ assert }) => {
    assert.plan(1)
    try {
      await syncIdentifierValidator.validate({ identifier: 'not a valid identifier!' })
    } catch (error) {
      assert.instanceOf(error, errors.E_VALIDATION_ERROR)
    }
  })

  test('validates and normalizes YYYY-MM-DD acquired dates', async ({ assert }) => {
    const output = await createKitValidator.validate({
      name: 'RG Nu Gundam',
      status: 'backlog',
      acquiredAt: '2026-05-15',
    })
    assert.isDefined(output.acquiredAt)
    assert.match(output.acquiredAt!, /^2026-05-15/)
  })

  test('rejects unparseable date formats', async ({ assert }) => {
    assert.plan(1)
    try {
      await createKitValidator.validate({
        name: 'RG Nu Gundam',
        status: 'backlog',
        acquiredAt: 'invalid-date',
      })
    } catch (error) {
      assert.instanceOf(error, errors.E_VALIDATION_ERROR)
    }
  })

  test('accepts valid handle and TID rkey in likeKitParamsValidator', async ({ assert }) => {
    const output = await likeKitParamsValidator.validate({
      handle: 'amuro.bsky.social',
      rkey: '3mx7c72iqn62f',
    })
    assert.deepEqual(output, {
      handle: 'amuro.bsky.social',
      rkey: '3mx7c72iqn62f',
    })
  })

  test('rejects invalid handle in likeKitParamsValidator', async ({ assert }) => {
    assert.plan(1)
    try {
      await likeKitParamsValidator.validate({
        handle: 'invalid handle!',
        rkey: '3mx7c72iqn62f',
      })
    } catch (error) {
      assert.instanceOf(error, errors.E_VALIDATION_ERROR)
    }
  })

  test('rejects invalid rkey in likeKitParamsValidator', async ({ assert }) => {
    assert.plan(1)
    try {
      await likeKitParamsValidator.validate({
        handle: 'amuro.bsky.social',
        rkey: 'invalid/rkey!',
      })
    } catch (error) {
      assert.instanceOf(error, errors.E_VALIDATION_ERROR)
    }
  })
})
