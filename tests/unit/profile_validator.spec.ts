import { test } from '@japa/runner'
import { errors } from '@vinejs/vine'
import { showProfileParamsValidator, showKitParamsValidator } from '#profile/validators/profile'

test.group('Profile validator', () => {
  test('showProfileParamsValidator accepts valid ATProto handle and rejects malformed strings', async ({
    assert,
  }) => {
    const valid = await showProfileParamsValidator.validate({ handle: 'alice.bsky.social' })
    assert.deepEqual(valid, { handle: 'alice.bsky.social' })

    const invalidHandles = ['invalid handle!', 'handle..double', '@alice']
    for (const handle of invalidHandles) {
      await assert.rejects(
        () => showProfileParamsValidator.validate({ handle }),
        errors.E_VALIDATION_ERROR
      )
    }
  })

  test('showKitParamsValidator accepts valid handle and TID rkey and rejects malformed inputs', async ({
    assert,
  }) => {
    const valid = await showKitParamsValidator.validate({
      handle: 'amuro.bsky.social',
      rkey: '3mx7c72iqn62f',
    })
    assert.deepEqual(valid, {
      handle: 'amuro.bsky.social',
      rkey: '3mx7c72iqn62f',
    })

    await assert.rejects(
      () =>
        showKitParamsValidator.validate({
          handle: 'bad handle',
          rkey: '3mx7c72iqn62f',
        }),
      errors.E_VALIDATION_ERROR
    )

    await assert.rejects(
      () =>
        showKitParamsValidator.validate({
          handle: 'amuro.bsky.social',
          rkey: 'invalid/rkey',
        }),
      errors.E_VALIDATION_ERROR
    )
  })
})
