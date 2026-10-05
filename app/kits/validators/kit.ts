import vine from '@vinejs/vine'

export const createKitValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(300),
  status: vine.enum(['backlog', 'in-progress', 'on-hold', 'dropped', 'done'] as const),
  grade: vine.string().trim().optional(),
  scale: vine.string().trim().optional(),
  photo: vine
    .file({
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })
    .optional(),
})

export const updateKitValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(300),
  status: vine.enum(['backlog', 'in-progress', 'on-hold', 'dropped', 'done'] as const),
  grade: vine.string().trim().optional(),
  scale: vine.string().trim().optional(),
  photo: vine
    .file({
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })
    .optional(),
})
