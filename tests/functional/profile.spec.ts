import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Kit from '#kits/models/kit'
import { DateTime } from 'luxon'

test.group('Profile', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('renders profile page with empty stats for user with no kits', async ({ client }) => {
    const response = await client.get('/profile/empty.user').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('profile')
    response.assertInertiaPropsContains({
      handle: 'empty.user',
      kits: [],
      stats: {
        totalKits: 0,
        completed: 0,
        inProgress: 0,
        backlog: 0,
        buildLogs: 0,
      },
    })
  })

  test('renders profile with unlocked Infinity Gauntlet achievement when user completed 6 grades', async ({
    client,
    db,
    assert,
  }) => {
    const handle = 'amuro.bsky.social'
    const grades = ['HG', 'RG', 'MG', 'PG', 'SD', 'EG']

    for (const [index, grade] of grades.entries()) {
      await Kit.create({
        uri: `at://did:plc:amuro/build.gunpla.kit/${index}`,
        did: 'did:plc:amuro',
        handle,
        name: `Kit ${grade}`,
        grade,
        scale: '1/144',
        status: 'done',
        indexedAt: DateTime.now(),
      })
    }

    await db.assertCount('kits', 6)
    await db.assertHas('kits', { handle, grade: 'PG' })

    const response = await client.get(`/profile/${handle}`).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('profile')
    response.assertInertiaPropsContains({
      handle,
      stats: {
        totalKits: 6,
        completed: 6,
        inProgress: 0,
        backlog: 0,
      },
    })

    const body = response.body() as {
      props: {
        achievements: Array<{
          id: string
          unlocked: boolean
          progress?: { current: number; total: number }
        }>
      }
    }
    const gauntlet = body.props.achievements.find((a) => a.id === 'infinity-gauntlet')

    assert.isDefined(gauntlet)
    assert.isTrue(gauntlet?.unlocked)
    assert.equal(gauntlet?.progress?.current, 6)
  })
})
