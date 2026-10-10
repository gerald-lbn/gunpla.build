import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

test.group('SQLite WAL Concurrency', () => {
  test('verifies connection enables WAL mode, normal synchronous, and 5000ms busy timeout', async ({
    assert,
  }) => {
    const journalModeResult = await db.rawQuery('PRAGMA journal_mode;')
    const busyTimeoutResult = await db.rawQuery('PRAGMA busy_timeout;')
    const synchronousResult = await db.rawQuery('PRAGMA synchronous;')

    const journalMode = (journalModeResult[0]?.journal_mode ?? '').toLowerCase()
    const busyTimeout = Number(busyTimeoutResult[0]?.timeout)
    const synchronous = Number(synchronousResult[0]?.synchronous)

    assert.equal(journalMode, 'wal')
    assert.equal(busyTimeout, 5000)
    assert.equal(synchronous, 1)
  })
})
