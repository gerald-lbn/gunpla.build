import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { SimpleMessagesProvider } from '@vinejs/vine'
import { KitCommentsService } from '#kits/services/kit_comments_service'
import KitCommentTransformer from '#kits/transformers/kit_comment_transformer'
import {
  destroyKitCommentParamsValidator,
  kitCommentParamsValidator,
  listKitCommentsQueryValidator,
  storeKitCommentValidator,
} from '#kits/validators/kit_comment'

const commentMessages = new SimpleMessagesProvider({
  'text.required': 'Comment cannot be blank.',
  'text.minLength': 'Comment cannot be blank.',
  'text.maxLength': 'Comment cannot exceed 300 characters.',
})

@inject()
export default class KitCommentsController {
  constructor(private kitCommentsService: KitCommentsService) {}

  async index({ request, response, params, containerResolver }: HttpContext) {
    const { handle, rkey } = await request.validateUsing(kitCommentParamsValidator, {
      data: params,
    })
    const { page } = await request.validateUsing(listKitCommentsQueryValidator)
    const paginator = await this.kitCommentsService.list(handle, rkey, page ?? 1)
    const result = await KitCommentTransformer.paginate(paginator.all(), {
      ...paginator.getMeta(),
      hasMorePages: paginator.hasMorePages,
    })
      .depth(2)
      .resolve(containerResolver, 0)
    return response.json(result)
  }

  async store({ request, response, params, auth, containerResolver }: HttpContext) {
    const { handle, rkey } = params as { handle: string; rkey: string }
    const payload = await request.validateUsing(storeKitCommentValidator, {
      messagesProvider: commentMessages,
    })
    const user = auth.getUserOrFail()
    const comment = await this.kitCommentsService.create(handle, rkey, user, payload.text)
    const result = await KitCommentTransformer.transform(comment)
      .depth(2)
      .resolve(containerResolver, 0)
    return response.json(result)
  }

  async destroy({ request, response, params, auth }: HttpContext) {
    const { commentId } = await request.validateUsing(destroyKitCommentParamsValidator, {
      data: params,
    })
    const user = auth.getUserOrFail()
    await this.kitCommentsService.destroy(commentId, user)
    return response.json({ success: true })
  }
}
