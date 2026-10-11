import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

export const broadcastValidator = vine.create({
  channel: vine.string().trim(),
  payload: vine.any(),
})

export type BroadcastPayload = Infer<typeof broadcastValidator>
