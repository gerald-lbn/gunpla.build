import db from '@adonisjs/lucid/services/db'
import type { StatsData } from '#types/stats'

export default class StatsService {
  async gather(): Promise<StatsData> {
    const [
      totalKits,
      totalBuilders,
      totalPhotos,
      totalLikes,
      gradeBreakdown,
      topBuilders,
      recentActivity,
    ] = await Promise.all([
      db.from('kits').count('* as total').first(),

      db.from('kits').countDistinct('did as total').first(),

      db
        .from('kits')
        .select(
          db.raw(
            'COALESCE(SUM(COALESCE(JSON_LENGTH(photos), CASE WHEN photo_cid IS NOT NULL THEN 1 ELSE 0 END)), 0) as total'
          )
        )
        .first(),

      db.from('kit_likes').count('* as total').first(),

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
