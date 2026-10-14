import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { AtUri } from '@atproto/syntax'
import IdentityService from '#profile/services/identity_service'
import RepoSyncService from '#kits/services/repo_sync_service'
import type { SyncResult } from '#types/kits'
import { FakeProfileService } from '#tests/helpers/fake_profile_service'
import { FakeIdentityService } from '#tests/helpers/fake_identity_service'
import { TestableRepoSyncService } from '#tests/helpers/testable_repo_sync_service'
import { KitFactory } from '#database/factories/kit_factory'
import KitLike from '#kits/models/kit_like'

test.group('RepoSyncService', () => {
  const identityService = new IdentityService()
  const fakeProfileService = new FakeProfileService()
  const syncService = new RepoSyncService(identityService, fakeProfileService)

  test('resolves PDS endpoint for a known DID', async ({ assert }) => {
    const pds = await syncService.resolvePdsEndpoint('did:plc:abiaoe3hpp2cqiuptrss75fp')
    assert.isNotNull(pds)
    assert.isTrue(pds!.startsWith('https://') || pds!.startsWith('http://'))
  })

  test('returns null for an unresolvable DID', async ({ assert }) => {
    const pds = await syncService.resolvePdsEndpoint('did:plc:nonexistentfake123456789')
    assert.isNull(pds)
  })

  test('fails gracefully when syncing an invalid handle', async ({ assert }) => {
    await assert.rejects(
      () => syncService.syncAccount('invalid handle with spaces'),
      /Could not resolve ATProto identity/
    )
  })

  test('syncAccounts aggregates results for multiple identifiers', async ({ assert }) => {
    const customService = new RepoSyncService(identityService, fakeProfileService)
    customService.syncAccount = async (id: string): Promise<SyncResult> => {
      if (id === 'user1.bsky.social') {
        return {
          did: 'did:plc:user1',
          handle: 'user1.bsky.social',
          pdsEndpoint: 'https://pds1',
          kitsSynced: 2,
          kitsPruned: 0,
        }
      }
      return {
        did: 'did:plc:user2',
        handle: 'user2.bsky.social',
        pdsEndpoint: 'https://pds2',
        kitsSynced: 3,
        kitsPruned: 0,
      }
    }

    const result = await customService.syncAccounts(['user1.bsky.social', 'user2.bsky.social'])
    assert.equal(result.totalKits, 5)
    assert.isFalse(result.hasFailures)
    assert.lengthOf(result.results, 2)
    assert.isTrue(result.results[0].success)
    assert.isTrue(result.results[1].success)
  })

  test('syncAccounts isolates individual errors and marks hasFailures true', async ({ assert }) => {
    const customService = new RepoSyncService(identityService, fakeProfileService)
    customService.syncAccount = async (id: string): Promise<SyncResult> => {
      if (id === 'invalid.bsky.social') {
        throw new Error('Connection refused to PDS')
      }
      return {
        did: 'did:plc:valid',
        handle: 'valid.bsky.social',
        pdsEndpoint: 'https://pds',
        kitsSynced: 4,
        kitsPruned: 0,
      }
    }

    const result = await customService.syncAccounts(['invalid.bsky.social', 'valid.bsky.social'])
    assert.isTrue(result.hasFailures)
    assert.lengthOf(result.results, 2)
    assert.isFalse(result.results[0].success)
    assert.equal(result.results[0].error, 'Connection refused to PDS')
    assert.isTrue(result.results[1].success)
    assert.equal(result.totalKits, 4)
  })

  test('syncAccount invokes ProfileService.syncProfile when profileService is injected', async ({
    assert,
  }) => {
    const fakeIdentity = new FakeIdentityService({
      resolver: () => ({ did: 'did:plc:abiaoe3hpp2cqiuptrss75fp', handle: 'mockuser.bsky.social' }),
    })
    const fakeProfile = new FakeProfileService()
    const service = new TestableRepoSyncService(fakeIdentity, fakeProfile, {
      kitsSynced: 2,
    })

    const result = await service.syncAccount('mockuser.bsky.social')
    assert.equal(result.did, 'did:plc:abiaoe3hpp2cqiuptrss75fp')
    assert.equal(result.kitsSynced, 2)
    assert.lengthOf(fakeProfile.syncedProfiles, 1)
    assert.equal(fakeProfile.syncedProfiles[0].did, 'did:plc:abiaoe3hpp2cqiuptrss75fp')
    assert.equal(fakeProfile.syncedProfiles[0].handle, 'mockuser.bsky.social')
  })
})

test.group('RepoSyncService.reconciliation', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('prunes local kits not present in remote PDS and cascade deletes their kit_likes', async ({
    db,
    assert,
  }) => {
    const userDid = 'did:plc:reconcileuser123'
    const keepUri = AtUri.make(userDid, 'build.gunpla.kit', 'keep123').toString()
    const pruneUri = AtUri.make(userDid, 'build.gunpla.kit', 'prune123').toString()
    const likeUri = AtUri.make('did:plc:liker456', 'build.gunpla.like', 'like1').toString()

    const kitToKeep = await KitFactory.merge({
      did: userDid,
      uri: keepUri,
      name: 'Kit To Keep',
    }).create()

    const kitToPrune = await KitFactory.merge({
      did: userDid,
      uri: pruneUri,
      name: 'Kit To Prune',
    }).create()

    await KitLike.create({
      did: 'did:plc:liker456',
      kitId: kitToPrune.id,
      uri: likeUri,
    })

    const identityService = new IdentityService()
    const profileService = new FakeProfileService()
    class TestRepoSyncService extends RepoSyncService {
      public runSyncKits(client: any, did: any) {
        return this.syncKits(client, did)
      }
    }

    const fakeClient = {
      listAll: async function* () {
        yield {
          valid: true,
          uri: keepUri,
          cid: 'cid-keep',
          value: {
            name: 'Kit To Keep',
            status: 'completed',
          },
        }
      },
    }

    const service = new TestRepoSyncService(identityService, profileService)
    const result = await service.runSyncKits(fakeClient as any, userDid as any)

    assert.equal(result.synced, 1)
    assert.equal(result.pruned, 1)

    await db.assertHas('kits', { id: kitToKeep.id })
    await db.assertMissing('kits', { id: kitToPrune.id })
    await db.assertMissing('kit_likes', { kit_id: kitToPrune.id })
  })
})
