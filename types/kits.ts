import type { Main as KitRecordValue } from '#lexicons/build/gunpla/kit.defs'

export type KitRecordEntry = {
  uri: string
  value: KitRecordValue
}

export type KitRecord = {
  uri: string
  cid?: string
  value: KitRecordValue
}

export type CreatedKitRecord = {
  uri: string
  cid?: string
}

export type UpdatedKitResult = {
  uri: string
  value: KitRecordValue
}

export type SyncResult = {
  did: string
  handle: string
  pdsEndpoint: string
  kitsSynced: number
  kitsPruned: number
}

export type SyncAccountResult = {
  identifier: string
  success: boolean
  data?: SyncResult
  error?: string
}

export type BatchSyncResult = {
  results: SyncAccountResult[]
  totalKits: number
  totalPruned: number
  hasFailures: boolean
}
