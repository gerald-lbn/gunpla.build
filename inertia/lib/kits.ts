/**
 * Shared vocabulary for kits on the client: statuses in the words builders use,
 * the grade ladder, and the small formatters every screen repeats.
 */

export type KitStatus = 'backlog' | 'in-progress' | 'on-hold' | 'dropped' | 'done'

export const STATUS_ORDER: KitStatus[] = ['done', 'in-progress', 'backlog', 'on-hold', 'dropped']

export const STATUS_LABEL: Record<string, string> = {
  'backlog': 'Backlog',
  'in-progress': 'Building',
  'on-hold': 'On hold',
  'dropped': 'Dropped',
  'done': 'Built',
}

export function statusLabel(status: string) {
  return STATUS_LABEL[status] ?? status
}

/**
 * The grades a builder can climb, from the snap-fit Entry Grade to the
 * Perfect Grade. Same normalisation as the server's achievements, so the
 * ladder and "Grade Connoisseur" always agree.
 */
export const GRADE_LADDER = [
  { code: 'EG', name: 'Entry Grade' },
  { code: 'HG', name: 'High Grade' },
  { code: 'RG', name: 'Real Grade' },
  { code: 'MG', name: 'Master Grade' },
  { code: 'PG', name: 'Perfect Grade' },
  { code: 'SD', name: 'Super Deformed' },
  { code: 'MGSD', name: 'Master Grade SD' },
  { code: 'FM', name: 'Full Mechanics' },
] as const

export function normalizeGrade(grade: string | null | undefined): string | null {
  if (!grade) return null
  const u = grade.trim().toUpperCase()
  if (!u) return null
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

/** "MGSD · 1/144 · Bandai", skipping what the record leaves empty. */
export function kitSpec(kit: {
  grade?: string | null
  scale?: string | null
  manufacturer?: string | null
}) {
  return [kit.grade, kit.scale, kit.manufacturer].filter(Boolean).join(' · ')
}

export function shortHandle(handle: string | null | undefined) {
  return (handle ?? '').split('.')[0]
}

export function plural(count: number, one: string, many = `${one}s`) {
  return `${count.toLocaleString('en')} ${count === 1 ? one : many}`
}

export function formatDate(iso: string, style: 'long' | 'short' = 'long') {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
  })
}
