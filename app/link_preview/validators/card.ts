import vine from '@vinejs/vine'

export const cardVersionValidator = vine.create({
  v: vine.string().trim().maxLength(100).optional(),
})
