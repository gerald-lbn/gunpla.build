import type { HttpContext } from '@adonisjs/core/http'
import { l } from '@atproto/lex'
import gunplaKit from '#lexicons/build/gunpla/kit'
import Kit from '#models/kit'
import { createKitValidator, updateKitValidator } from '#validators/kit'
import KitRecordTransformer from '#transformers/kit_record_transformer'
import { DateTime } from 'luxon'

export default class KitsController {
  async index({ auth, inertia }: HttpContext) {
    const { records } = await auth.user!.client.list(gunplaKit)
    const kits = KitRecordTransformer.transform(
      records.filter((r) => r.valid).map((r) => ({ uri: r.uri as string, value: r.value }))
    )
    return inertia.render('dashboard', { kits })
  }

  async new({ inertia }: HttpContext) {
    return inertia.render('kits/new', {})
  }

  async store({ request, auth, response, session }: HttpContext) {
    const data = await request.validateUsing(createKitValidator)

    const record = await auth.user!.client.create(gunplaKit, {
      ...data,
      createdAt: l.currentDatetimeString(),
    })

    const existingKit = await Kit.query()
      .where('did', auth.user!.did)
      .whereNotNull('handle')
      .first()
    const handle = existingKit?.handle ?? null

    await Kit.updateOrCreate(
      { uri: record.uri },
      {
        did: auth.user!.did,
        handle,
        name: data.name,
        grade: data.grade ?? null,
        scale: data.scale ?? null,
        status: data.status,
        recordCreatedAt: DateTime.now(),
        indexedAt: DateTime.now(),
      }
    )

    session.flash('success', `Kit "${data.name}" added to your shelf`)
    return response.redirect().toRoute('dashboard')
  }

  async edit({ params, auth, inertia, response }: HttpContext) {
    const rkey = params.rkey as string

    try {
      const remote = await auth.user!.client.get(gunplaKit, { rkey })
      return inertia.render('kits/edit', {
        kit: {
          rkey,
          uri: remote.uri,
          name: remote.value.name,
          grade: remote.value.grade ?? '',
          scale: remote.value.scale ?? '',
          status: remote.value.status,
        },
      })
    } catch {
      return response.notFound('Kit not found')
    }
  }

  async update({ params, request, auth, response, session }: HttpContext) {
    const rkey = params.rkey as string
    const data = await request.validateUsing(updateKitValidator)

    try {
      const remote = await auth.user!.client.get(gunplaKit, { rkey })
      const val = remote.value

      const updatedVal = {
        ...val,
        name: data.name,
        status: data.status,
        grade: data.grade || undefined,
        scale: data.scale || undefined,
      }

      if (data.status === 'in-progress' && !val.startedAt) {
        updatedVal.startedAt = l.currentDatetimeString()
      } else if (data.status === 'done' && !val.completedAt) {
        updatedVal.completedAt = l.currentDatetimeString()
      }

      await auth.user!.client.put(gunplaKit, updatedVal, { rkey })

      const kitUri = `at://${auth.user!.did}/build.gunpla.kit/${rkey}`
      await Kit.query()
        .where('uri', kitUri)
        .update({
          name: data.name,
          status: data.status,
          grade: data.grade || null,
          scale: data.scale || null,
        })

      session.flash('success', `Updated "${data.name}"`)
      return response.redirect().toRoute('dashboard')
    } catch {
      session.flash('error', 'Failed to update kit on ATProto')
      return response.redirect().back()
    }
  }
}
