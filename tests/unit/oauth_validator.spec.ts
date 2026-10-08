import { test } from '@japa/runner'
import { errors } from '@vinejs/vine'
import { loginRequestValidator, signupRequestValidator } from '#auth/validators/oauth'

test.group('OAuth Validator', () => {
  test('accepts valid ATProto handles', async ({ assert }) => {
    const output = await loginRequestValidator.validate({ input: 'alice.bsky.social' })
    assert.deepEqual(output, { input: 'alice.bsky.social' })
  })

  test('accepts valid ATProto DIDs', async ({ assert }) => {
    const plcOutput = await loginRequestValidator.validate({
      input: 'did:plc:ragtjsm2j2vknwk2zOverflow',
    })
    assert.deepEqual(plcOutput, { input: 'did:plc:ragtjsm2j2vknwk2zOverflow' })

    const webOutput = await loginRequestValidator.validate({
      input: 'did:web:example.com',
    })
    assert.deepEqual(webOutput, { input: 'did:web:example.com' })
  })

  test('rejects service URL as login input', async ({ assert }) => {
    assert.plan(1)
    try {
      await loginRequestValidator.validate({ input: 'https://bsky.social' })
    } catch (error) {
      assert.instanceOf(error, errors.E_VALIDATION_ERROR)
    }
  })

  test('rejects invalid identifier strings', async ({ assert }) => {
    assert.plan(1)
    try {
      await loginRequestValidator.validate({ input: 'invalid identifier or string' })
    } catch (error) {
      assert.instanceOf(error, errors.E_VALIDATION_ERROR)
    }
  })

  test('accepts valid ATProto service URL for signup', async ({ assert }) => {
    const output = await signupRequestValidator.validate({ input: 'https://bsky.social' })
    assert.deepEqual(output, { input: 'https://bsky.social' })
  })

  test('accepts omitted or undefined service URL for signup', async ({ assert }) => {
    const output = await signupRequestValidator.validate({})
    assert.deepEqual(output, {})
  })

  test('rejects invalid service URL strings for signup', async ({ assert }) => {
    assert.plan(1)
    try {
      await signupRequestValidator.validate({ input: 'not-a-service-url' })
    } catch (error) {
      assert.instanceOf(error, errors.E_VALIDATION_ERROR)
    }
  })
})
