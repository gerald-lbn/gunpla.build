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
  photos: vine
    .array(
      vine.file({
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })
    )
    .maxLength(20)
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
  photos: vine
    .array(
      vine.file({
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })
    )
    .maxLength(20)
    .optional(),
  existingPhotos: vine.array(vine.string()).maxLength(20).optional(),
  photosSubmitted: vine.boolean().optional(),
})
