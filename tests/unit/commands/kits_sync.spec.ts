import { test } from '@japa/runner'
import ace from '@adonisjs/core/services/ace'
import KitsSync from '../../../commands/kits/sync.js'
import { RepoSyncService } from '#kits/services/repo_sync_service'
import { FakeRepoSyncService } from '#tests/helpers/fake_repo_sync_service'

test.group('Command kits:sync', (group) => {
  group.each.setup(() => {
    ace.ui.switchMode('raw')
    return () => ace.ui.switchMode('normal')
  })

  test('fails with exit code 1 when invoked with no arguments', async () => {
    const command = await ace.create(KitsSync, [])
    await command.exec()

    command.assertFailed()
    command.assertExitCode(1)
    command.assertLogMatches(/At least one user handle or identifier is required\./)
  })

  test('syncs records for provided accounts and prints detailed summary with profile links', async ({
    swap,
  }) => {
    swap(
      RepoSyncService,
      () =>
        new FakeRepoSyncService({
          handler: async () => ({
            did: 'did:plc:abiaoe3hpp2cqiuptrss75fp',
            handle: 'grld.dev',
            pdsEndpoint: 'https://eurosky.social',
            kitsSynced: 3,
          }),
        })
    )

    const command = await ace.create(KitsSync, ['grld.dev'])
    await command.exec()

    command.assertSucceeded()
    command.assertExitCode(0)
    command.assertLogMatches(/@grld\.dev/)
    command.assertLogMatches(/did:plc:abiaoe3hpp2cqiuptrss75fp/)
    command.assertLogMatches(/https:\/\/eurosky\.social/)
    command.assertLogMatches(/3 kit\(s\)/)
    command.assertLogMatches(/Profile: \/@grld\.dev/)
  })

  test('logs informational notice when an account has zero kit records', async ({ swap }) => {
    swap(
      RepoSyncService,
      () =>
        new FakeRepoSyncService({
          handler: async () => ({
            did: 'did:plc:empty123',
            handle: 'empty.bsky.social',
            pdsEndpoint: 'https://empty.pds',
            kitsSynced: 0,
          }),
        })
    )

    const command = await ace.create(KitsSync, ['empty.bsky.social'])
    await command.exec()

    command.assertSucceeded()
    command.assertExitCode(0)
    command.assertLogMatches(/0 kit records found for @empty\.bsky\.social/)
  })

  test('logs specific error for failing account, finishes remaining accounts, and exits code 1', async ({
    swap,
  }) => {
    swap(
      RepoSyncService,
      () =>
        new FakeRepoSyncService({
          handler: async (id: string) => {
            if (id === 'bad.user') {
              throw new Error('Could not resolve identity')
            }
            return {
              did: 'did:plc:good',
              handle: 'good.bsky.social',
              pdsEndpoint: 'https://good.pds',
              kitsSynced: 1,
            }
          },
        })
    )

    const command = await ace.create(KitsSync, ['bad.user', 'good.user'])
    await command.exec()

    command.assertFailed()
    command.assertExitCode(1)
    command.assertLogMatches(/Failed to sync "bad\.user": Could not resolve identity/)
    command.assertLogMatches(/Synced @good\.bsky\.social/)
  })

  test('aborts immediately with exit code 1 when an invalid identifier is encountered', async ({
    swap,
    assert,
  }) => {
    let syncCalled = false
    swap(
      RepoSyncService,
      () =>
        new FakeRepoSyncService({
          handler: async () => {
            syncCalled = true
            return {
              did: 'did:plc:abiaoe3hpp2cqiuptrss75fp',
              handle: 'grld.dev',
              pdsEndpoint: 'https://eurosky.social',
              kitsSynced: 1,
            }
          },
        })
    )

    const command = await ace.create(KitsSync, ['not_a_valid_id!', 'grld.dev'])
    await command.exec()

    command.assertFailed()
    command.assertExitCode(1)
    command.assertLogMatches(/Invalid identifier format: "not_a_valid_id!"/)
    assert.isFalse(syncCalled)
  })
})
