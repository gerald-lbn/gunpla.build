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

export type ResolvedIdentity = {
  did: string
  handle: string
}
