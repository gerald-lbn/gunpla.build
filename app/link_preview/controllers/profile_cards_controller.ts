import { Readable } from 'node:stream'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import linkPreviewConfig from '#config/link_preview'
import LinkPreviewService from '#link_preview/services/link_preview_service'
import { cardVersionValidator } from '#link_preview/validators/card'
import { showProfileParamsValidator } from '#profile/validators/profile'

export default class ProfileCardsController {
  @inject()
  async show({ params, request, response }: HttpContext, linkPreviewService: LinkPreviewService) {
    const { handle } = await request.validateUsing(showProfileParamsValidator, { data: params })
    const { v } = await request.validateUsing(cardVersionValidator)

    const { card, image } = await linkPreviewService.drawProfileCard(handle)

    response.header('Content-Type', linkPreviewConfig.cards.type)
    response.header('Content-Length', image.length)
    response.header('Cache-Control', card.cacheControl(v))
    return response.stream(Readable.from([image]))
  }
}
