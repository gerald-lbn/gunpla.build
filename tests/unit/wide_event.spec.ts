import { test } from '@japa/runner'
import { Writable } from 'node:stream'
import { Exception } from '@adonisjs/core/exceptions'
import { Logger } from '@adonisjs/core/logger'
import WideEvent from '#observability/wide_event'

function createMemoryLogger() {
  const lines: Record<string, any>[] = []
  const destination = new Writable({
    write(chunk, _encoding, callback) {
      lines.push(JSON.parse(chunk.toString()))
      callback()
    },
  })
  const logger = new Logger({ enabled: true, level: 'info', destination })
  return { logger, lines }
}

test.group('WideEvent', () => {
  test('writes one info line with every field, a success outcome and a duration', ({ assert }) => {
    const { logger, lines } = createMemoryLogger()

    new WideEvent('http.request', { method: 'POST' }).set({ status_code: 302 }).emit(logger)

    assert.lengthOf(lines, 1)
    assert.containSubset(lines[0], {
      level: 30,
      msg: 'http.request',
      event: 'http.request',
      method: 'POST',
      status_code: 302,
      outcome: 'success',
    })
    assert.isNumber(lines[0].duration_ms)
  })

  test('merges objects set under the same key', ({ assert }) => {
    const { logger, lines } = createMemoryLogger()

    new WideEvent('http.request')
      .set({ kit: { name: 'RX-78-2' } })
      .set({ kit: { uri: 'at://did:plc:abc/build.gunpla.kit/1' } })
      .emit(logger)

    assert.deepEqual(lines[0].kit, { name: 'RX-78-2', uri: 'at://did:plc:abc/build.gunpla.kit/1' })
  })

  test('writes an error line with the error and its stack for a server failure', ({ assert }) => {
    const { logger, lines } = createMemoryLogger()

    new WideEvent('http.request')
      .fail(new Error('PDS unreachable', { cause: new Error('ECONNREFUSED') }))
      .emit(logger)

    assert.equal(lines[0].level, 50)
    assert.equal(lines[0].outcome, 'error')
    assert.containSubset(lines[0].error, {
      type: 'Error',
      message: 'PDS unreachable',
      cause: 'ECONNREFUSED',
    })
    assert.isString(lines[0].error.stack)
  })

  test('keeps a 4xx failure at info level as a client error, without a stack', ({ assert }) => {
    const { logger, lines } = createMemoryLogger()

    new WideEvent('http.request')
      .fail(new Exception('Not found', { status: 404, code: 'E_ROW_NOT_FOUND' }))
      .emit(logger)

    assert.equal(lines[0].level, 30)
    assert.equal(lines[0].outcome, 'client_error')
    assert.containSubset(lines[0].error, { status: 404, code: 'E_ROW_NOT_FOUND' })
    assert.notProperty(lines[0].error, 'stack')
  })

  test('records a failed step without failing the event', ({ assert }) => {
    const { logger, lines } = createMemoryLogger()

    new WideEvent('http.request').failStep('profile_sync', new Error('timeout')).emit(logger)

    assert.equal(lines[0].outcome, 'success')
    assert.containSubset(lines[0].profile_sync, {
      outcome: 'error',
      error: { message: 'timeout' },
    })
  })

  test('writes only once when emitted twice', ({ assert }) => {
    const { logger, lines } = createMemoryLogger()
    const event = new WideEvent('jetstream.connection')

    event.emit(logger)
    event.emit(logger)

    assert.lengthOf(lines, 1)
  })
})
