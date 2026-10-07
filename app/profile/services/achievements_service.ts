import type Kit from '#kits/models/kit'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

export type Achievement = {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress?: { current: number; total: number; [key: string]: JSONDataTypes }
  [key: string]: JSONDataTypes
}

export type ProfileStats = {
  totalKits: number
  completed: number
  inProgress: number
  backlog: number
  [key: string]: JSONDataTypes
}

export class AchievementsService {
  computeStats(kits: Kit[]): ProfileStats {
    const completed = kits.filter((k) => k.status === 'done').length
    const inProgress = kits.filter((k) => k.status === 'in-progress').length
    const backlog = kits.filter((k) => k.status === 'backlog').length

    return {
      totalKits: kits.length,
      completed,
      inProgress,
      backlog,
    }
  }

  computeAchievements(kits: Kit[]): Achievement[] {
    const completedKits = kits.filter((k) => k.status === 'done')
    const completedCount = completedKits.length
    const backlogCount = kits.filter((k) => k.status === 'backlog').length

    const normalizeGrade = (g: string | null | undefined): string | null => {
      if (!g) return null
      const u = g.trim().toUpperCase()
      if (u.includes('HG') || u.includes('HIGH GRADE')) return 'HG'
      if (u.includes('RG') || u.includes('REAL GRADE')) return 'RG'
      if (u.includes('MGSD')) return 'MGSD'
      if (u.includes('MG') || u.includes('MASTER GRADE')) return 'MG'
      if (u.includes('PG') || u.includes('PERFECT GRADE')) return 'PG'
      if (u.includes('SD') || u.includes('BB SENSHI')) return 'SD'
      if (u.includes('EG') || u.includes('ENTRY GRADE')) return 'EG'
      if (u.includes('FM') || u.includes('FULL MECHANICS')) return 'FM'
      return u
    }

    const completedGrades = new Set(
      completedKits
        .map((k) => normalizeGrade(k.grade))
        .filter((g): g is string => Boolean(g && g.length > 0))
    )

    const hasMg = completedKits.some((k) => {
      const g = (k.grade || '').toUpperCase()
      return g === 'MG' || g.startsWith('MG ') || g.includes('MASTER GRADE')
    })

    const hasPg = completedKits.some((k) => {
      const g = (k.grade || '').toUpperCase()
      return g === 'PG' || g.startsWith('PG ') || g.includes('PERFECT GRADE')
    })

    return [
      {
        id: 'first-step',
        name: 'First Step',
        description: 'Complete your first Gunpla build',
        icon: '🏆',
        unlocked: completedCount >= 1,
        progress: { current: Math.min(completedCount, 1), total: 1 },
      },
      {
        id: 'hangar-master',
        name: 'Hangar Master',
        description: 'Complete 5 or more Gunpla builds',
        icon: '🎖️',
        unlocked: completedCount >= 5,
        progress: { current: Math.min(completedCount, 5), total: 5 },
      },
      {
        id: 'backlog-hoarder',
        name: 'Backlog Hoarder',
        description: 'Have 5 or more kits in your backlog',
        icon: '📦',
        unlocked: backlogCount >= 5,
        progress: { current: Math.min(backlogCount, 5), total: 5 },
      },
      {
        id: 'master-grade-club',
        name: 'Master Grade Club',
        description: 'Complete at least one Master Grade (MG) kit',
        icon: '⚔️',
        unlocked: hasMg,
      },
      {
        id: 'peak-engineering',
        name: 'Peak Engineering',
        description: 'Complete at least one Perfect Grade (PG) kit',
        icon: '👑',
        unlocked: hasPg,
      },
      {
        id: 'grade-connoisseur',
        name: 'Grade Connoisseur',
        description: 'Complete builds across 3 different grades',
        icon: '🎨',
        unlocked: completedGrades.size >= 3,
        progress: { current: Math.min(completedGrades.size, 3), total: 3 },
      },
      {
        id: 'infinity-gauntlet',
        name: 'The Infinity Gauntlet',
        description: 'Collect all 6 Stones: Complete builds across 6 distinct grades',
        icon: '🧤',
        unlocked: completedGrades.size >= 6,
        progress: { current: Math.min(completedGrades.size, 6), total: 6 },
      },
    ]
  }
}
