import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { KitFactory } from '#database/factories/kit_factory'
import { ProfileFactory } from '#database/factories/profile_factory'

test.group('ExploreController.filterValues', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('filterValues returns distinct values alphabetically for {label}')
    .with([
      {
        label: 'grade',
        type: 'grade',
        seededValues: ['MG', 'HG'],
        expectedValues: ['HG', 'MG'],
      },
      {
        label: 'scale',
        type: 'scale',
        seededValues: ['1/144', '1/100'],
        expectedValues: ['1/100', '1/144'],
      },
      {
        label: 'manufacturer',
        type: 'manufacturer',
        seededValues: ['Kotobukiya', 'Bandai'],
        expectedValues: ['Bandai', 'Kotobukiya'],
      },
      {
        label: 'grade (empty)',
        type: 'grade',
        seededValues: [],
        expectedValues: [],
      },
    ] as const)
    .run(async ({ client, assert }, { type, seededValues, expectedValues }) => {
      for (const v of seededValues) {
        await KitFactory.merge({ [type]: v, status: 'done' }).create()
      }
      await KitFactory.merge({ [type]: null, status: 'done' }).create()

      const response = await client.get('/explore/filter-values').qs({ type })

      response.assertStatus(200)
      assert.deepEqual(response.body(), { values: expectedValues })
    })

  test('filterValues returns matching builder handles when query has 2+ characters', async ({
    client,
    assert,
  }) => {
    const profileA = await ProfileFactory.merge({ handle: 'ze-builder.bsky.social' }).create()
    await KitFactory.merge({ did: profileA.did, status: 'done' }).create()

    const profileB = await ProfileFactory.merge({ handle: 'zeonic-modeler.bsky.social' }).create()
    await KitFactory.merge({ did: profileB.did, status: 'done' }).create()

    const profileC = await ProfileFactory.merge({ handle: 'other-builder.bsky.social' }).create()
    await KitFactory.merge({ did: profileC.did, status: 'done' }).create()

    const response = await client.get('/explore/filter-values').qs({ type: 'builder', q: 'ze' })

    response.assertStatus(200)
    assert.deepEqual(response.body(), {
      values: ['ze-builder.bsky.social', 'zeonic-modeler.bsky.social'],
    })
  })

  test('filterValues returns empty array for builder type when query is under 2 characters', async ({
    client,
    assert,
  }) => {
    const profile = await ProfileFactory.merge({ handle: 'ze-builder.bsky.social' }).create()
    await KitFactory.merge({ did: profile.did, status: 'done' }).create()

    const response = await client.get('/explore/filter-values').qs({ type: 'builder', q: 'z' })

    response.assertStatus(200)
    assert.deepEqual(response.body(), { values: [] })
  })

  test('filterValues returns 422 for an invalid type value', async ({ client, assert }) => {
    const response = await client.get('/explore/filter-values').qs({ type: 'status' } as any)

    response.assertStatus(422)
    const body = response.body() as Record<string, unknown>
    assert.exists(body.errors)
  })
})
