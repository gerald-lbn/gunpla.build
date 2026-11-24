import { Readable } from 'node:stream'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import linkPreviewConfig from '#config/link_preview'
import LinkPreviewService from '#link_preview/services/link_preview_service'
import { cardVersionValidator } from '#link_preview/validators/card'
import { showKitParamsValidator } from '#profile/validators/profile'

export default class KitCardsController {
  @inject()
  async show({ params, request, response }: HttpContext, linkPreviewService: LinkPreviewService) {
    const { handle, rkey } = await request.validateUsing(showKitParamsValidator, { data: params })
    const { v } = await request.validateUsing(cardVersionValidator)

    const { card, image } = await linkPreviewService.drawKitCard(handle, rkey)

    response.header('Content-Type', linkPreviewConfig.cards.type)
    response.header('Content-Length', image.length)
    response.header('Cache-Control', card.cacheControl(v))
    return response.stream(Readable.from([image]))
  }
}
