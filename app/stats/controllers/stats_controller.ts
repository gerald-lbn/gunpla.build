import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class StatsController {
  async render({ inertia }: HttpContext) {
    const [
      totalKits,
      totalBuilders,
      totalPhotos,
      monthlyActiveBuilders,
      gradeBreakdown,
      topBuilders,
      recentActivity,
    ] = await Promise.all([
      db.from('kits').count('* as total').first(),

      db.from('kits').countDistinct('did as total').first(),

      db.from('kits').whereNotNull('photo_cid').count('* as total').first(),

      db
        .from('kits')
        .countDistinct('did as total')
        .whereRaw("indexed_at >= datetime('now', '-30 days')")
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
        .select('handle')
        .count('* as count')
        .whereNotNull('handle')
        .groupBy('handle')
        .orderBy('count', 'desc')
        .limit(5),

      db
        .from('kits')
        .select(db.raw("strftime('%Y-%m', indexed_at) as month"))
        .count('* as count')
        .groupByRaw("strftime('%Y-%m', indexed_at)")
        .orderBy('month', 'desc')
        .limit(12),
    ])

    return inertia.render('stats', {
      totalKits: Number(totalKits?.total ?? 0),
      totalBuilders: Number(totalBuilders?.total ?? 0),
      totalPhotos: Number(totalPhotos?.total ?? 0),
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
    })
  }
}
