export type StatsData = {
  totalKits: number
  totalBuilders: number
  totalPhotos: number
  totalLikes: number
  gradeBreakdown: { grade: string; count: number }[]
  topBuilders: { handle: string; count: number }[]
  recentActivity: { month: string; count: number }[]
}
