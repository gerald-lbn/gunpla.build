import { test } from '@japa/runner'
import { AtUri } from '@atproto/syntax'
import type { ModelAttributes } from '@adonisjs/lucid/types/model'
import { AchievementsService } from '#profile/services/achievements_service'
import Kit from '#kits/models/kit'

function createKit(overrides: Partial<ModelAttributes<Kit>> = {}): Kit {
  const kit = new Kit()
  kit.merge({
    id: 1,
    uri: AtUri.make('did:plc:test', 'build.gunpla.kit', '1').toString(),
    did: 'did:plc:test',
    name: 'Test Kit',
    status: 'backlog',
    grade: null,
    scale: '1/144',
    ...overrides,
  })
  return kit
}

test.group('AchievementsService | computeStats', () => {
  const service = new AchievementsService()

  test('computes counts across various kit statuses', ({ assert }) => {
    const kits = [
      createKit({ status: 'done' }),
      createKit({ status: 'done' }),
      createKit({ status: 'in-progress' }),
      createKit({ status: 'backlog' }),
      createKit({ status: 'backlog' }),
      createKit({ status: 'backlog' }),
    ]

    const stats = service.computeStats(kits)

    assert.equal(stats.totalKits, 6)
    assert.equal(stats.completed, 2)
    assert.equal(stats.inProgress, 1)
    assert.equal(stats.backlog, 3)
  })

  test('handles empty collections safely', ({ assert }) => {
    const stats = service.computeStats([])

    assert.equal(stats.totalKits, 0)
    assert.equal(stats.completed, 0)
    assert.equal(stats.inProgress, 0)
    assert.equal(stats.backlog, 0)
  })
})

test.group('AchievementsService | computeAchievements', () => {
  const service = new AchievementsService()

  test('unlocks first-step and hangar-master based on completed counts', ({ assert }) => {
    const zeroKits = service.computeAchievements([])
    const firstStepZero = zeroKits.find((a) => a.id === 'first-step')
    const hangarMasterZero = zeroKits.find((a) => a.id === 'hangar-master')

    assert.isFalse(firstStepZero?.unlocked)
    assert.deepEqual(firstStepZero?.progress, { current: 0, total: 1 })
    assert.isFalse(hangarMasterZero?.unlocked)
    assert.deepEqual(hangarMasterZero?.progress, { current: 0, total: 5 })

    const fiveKits = [
      createKit({ status: 'done' }),
      createKit({ status: 'done' }),
      createKit({ status: 'done' }),
      createKit({ status: 'done' }),
      createKit({ status: 'done' }),
    ]
    const fiveAch = service.computeAchievements(fiveKits)
    const firstStepFive = fiveAch.find((a) => a.id === 'first-step')
    const hangarMasterFive = fiveAch.find((a) => a.id === 'hangar-master')

    assert.isTrue(firstStepFive?.unlocked)
    assert.deepEqual(firstStepFive?.progress, { current: 1, total: 1 })
    assert.isTrue(hangarMasterFive?.unlocked)
    assert.deepEqual(hangarMasterFive?.progress, { current: 5, total: 5 })
  })

  test('unlocks backlog-hoarder when user has 5 or more kits in backlog', ({ assert }) => {
    const fourBacklog = [
      createKit({ status: 'backlog' }),
      createKit({ status: 'backlog' }),
      createKit({ status: 'backlog' }),
      createKit({ status: 'backlog' }),
    ]
    const achFour = service.computeAchievements(fourBacklog)
    const bhFour = achFour.find((a) => a.id === 'backlog-hoarder')
    assert.isFalse(bhFour?.unlocked)
    assert.deepEqual(bhFour?.progress, { current: 4, total: 5 })

    const fiveBacklog = [...fourBacklog, createKit({ status: 'backlog' })]
    const achFive = service.computeAchievements(fiveBacklog)
    const bhFive = achFive.find((a) => a.id === 'backlog-hoarder')
    assert.isTrue(bhFive?.unlocked)
    assert.deepEqual(bhFive?.progress, { current: 5, total: 5 })
  })

  test('unlocks master-grade-club and peak-engineering for completed MG and PG kits', ({
    assert,
  }) => {
    const mgKitOnly = [createKit({ grade: 'MG 1/100', status: 'done' })]
    const ach1 = service.computeAchievements(mgKitOnly)
    assert.isTrue(ach1.find((a) => a.id === 'master-grade-club')?.unlocked)
    assert.isFalse(ach1.find((a) => a.id === 'peak-engineering')?.unlocked)

    const mgInBacklog = [createKit({ grade: 'MG', status: 'backlog' })]
    const ach2 = service.computeAchievements(mgInBacklog)
    assert.isFalse(ach2.find((a) => a.id === 'master-grade-club')?.unlocked)

    const pgKit = [createKit({ grade: 'Perfect Grade', status: 'done' })]
    const ach3 = service.computeAchievements(pgKit)
    assert.isTrue(ach3.find((a) => a.id === 'peak-engineering')?.unlocked)
  })

  test('unlocks The Infinity Gauntlet when collecting 6 distinct normalized grades', ({
    assert,
  }) => {
    const fiveGrades = [
      createKit({ grade: 'High Grade', status: 'done' }), // HG
      createKit({ grade: 'Real Grade', status: 'done' }), // RG
      createKit({ grade: 'MG', status: 'done' }), // MG
      createKit({ grade: 'PG Unleashed', status: 'done' }), // PG
      createKit({ grade: 'Entry Grade', status: 'done' }), // EG
      createKit({ grade: 'SD BB Senshi', status: 'backlog' }), // Ignored because in backlog
    ]

    const achFive = service.computeAchievements(fiveGrades)
    const gauntletFive = achFive.find((a) => a.id === 'infinity-gauntlet')

    assert.isDefined(gauntletFive)
    assert.equal(gauntletFive?.name, 'The Infinity Gauntlet')
    assert.equal(gauntletFive?.icon, '🧤')
    assert.isFalse(gauntletFive?.unlocked)
    assert.deepEqual(gauntletFive?.progress, { current: 5, total: 6 })

    const sixGrades = [
      ...fiveGrades.slice(0, 5),
      createKit({ grade: 'SD BB Senshi', status: 'done' }),
    ]

    const achSix = service.computeAchievements(sixGrades)
    const gauntletSix = achSix.find((a) => a.id === 'infinity-gauntlet')

    assert.isTrue(gauntletSix?.unlocked)
    assert.deepEqual(gauntletSix?.progress, { current: 6, total: 6 })
  })
})
