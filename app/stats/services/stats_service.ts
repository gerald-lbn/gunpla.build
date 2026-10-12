import db from '@adonisjs/lucid/services/db'

export type StatsData = {
  totalKits: number
  totalBuilders: number
  totalPhotos: number
  totalLikes: number
  monthlyLikes: number
  monthlyActiveBuilders: number
  gradeBreakdown: { grade: string; count: number }[]
  topBuilders: { handle: string; count: number }[]
  recentActivity: { month: string; count: number }[]
}

export default class StatsService {
  async gather(): Promise<StatsData> {
    const [
      totalKits,
      totalBuilders,
      totalPhotos,
      totalLikes,
      monthlyLikes,
      monthlyActiveBuilders,
      gradeBreakdown,
      topBuilders,
      recentActivity,
    ] = await Promise.all([
      db.from('kits').count('* as total').first(),

      db.from('kits').countDistinct('did as total').first(),

      db.from('kits').whereNotNull('photo_cid').count('* as total').first(),

      db.from('kit_likes').count('* as total').first(),

      db
        .from('kit_likes')
        .whereRaw('created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)')
        .count('* as total')
        .first(),

      db
        .from('kits')
        .countDistinct('did as total')
        .whereRaw('indexed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)')
        .first(),

      db
        .from('kits')
        .select('grade')
        .count('* as count')
        .whereNotNull('grade')
        .groupBy('grade')
        .orderBy('count', 'desc'),

      db
        .from('kits')
        .join('profiles', 'kits.did', 'profiles.did')
        .select('profiles.handle as handle')
        .count('* as count')
        .whereNotNull('profiles.handle')
        .groupBy('profiles.handle')
        .orderBy('count', 'desc')
        .limit(5),

      db
        .from('kits')
        .select(db.raw("DATE_FORMAT(indexed_at, '%Y-%m') as month"))
        .count('* as count')
        .groupByRaw("DATE_FORMAT(indexed_at, '%Y-%m')")
        .orderBy('month', 'desc')
        .limit(12),
    ])

    return {
      totalKits: Number(totalKits?.total ?? 0),
      totalBuilders: Number(totalBuilders?.total ?? 0),
      totalPhotos: Number(totalPhotos?.total ?? 0),
      totalLikes: Number(totalLikes?.total ?? 0),
      monthlyLikes: Number(monthlyLikes?.total ?? 0),
      monthlyActiveBuilders: Number(monthlyActiveBuilders?.total ?? 0),
      gradeBreakdown: (gradeBreakdown as { grade: string; count: number }[]).map((r) => ({
        grade: r.grade,
        count: Number(r.count),
      })),
      topBuilders: (topBuilders as { handle: string; count: number }[]).map((r) => ({
        handle: r.handle,
        count: Number(r.count),
      })),
      recentActivity: (recentActivity as { month: string; count: number }[])
        .map((r) => ({ month: r.month, count: Number(r.count) }))
        .reverse(),
    }
  }
}
