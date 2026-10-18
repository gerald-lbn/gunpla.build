/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'event_stream': {
    methods: ["GET","HEAD"]
    pattern: '/__transmit/events'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'subscribe': {
    methods: ["POST"]
    pattern: '/__transmit/subscribe'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'unsubscribe': {
    methods: ["POST"]
    pattern: '/__transmit/unsubscribe'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/feed/controllers/feed_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/feed/controllers/feed_controller').default['index']>>>
    }
  }
  'stats': {
    methods: ["GET","HEAD"]
    pattern: '/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/stats/controllers/stats_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/stats/controllers/stats_controller').default['index']>>>
    }
  }
  'explore': {
    methods: ["GET","HEAD"]
    pattern: '/explore'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#kits/validators/kit').listKitsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/explore/controllers/explore_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/explore/controllers/explore_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'explore.filter_values': {
    methods: ["GET","HEAD"]
    pattern: '/explore/filter-values'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#kits/validators/kit').filterValuesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/explore/controllers/explore_controller').default['filterValues']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/explore/controllers/explore_controller').default['filterValues']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'login': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/sessions_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/sessions_controller').default['create']>>>
    }
  }
  'oauth.login': {
    methods: ["POST"]
    pattern: '/oauth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators/oauth').loginRequestValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#auth/validators/oauth').loginRequestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/sessions_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/sessions_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'oauth.signup': {
    methods: ["POST"]
    pattern: '/oauth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators/oauth').signupRequestValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#auth/validators/oauth').signupRequestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/registrations_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/registrations_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'oauth.callback': {
    methods: ["GET","HEAD"]
    pattern: '/oauth/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/sessions_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/sessions_controller').default['show']>>>
    }
  }
  'oauth.logout': {
    methods: ["POST"]
    pattern: '/oauth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/sessions_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/sessions_controller').default['destroy']>>>
    }
  }
  'shelf': {
    methods: ["GET","HEAD"]
    pattern: '/shelf'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/kits_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/kits_controller').default['index']>>>
    }
  }
  'kits.create': {
    methods: ["GET","HEAD"]
    pattern: '/kits/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/kits_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/kits_controller').default['create']>>>
    }
  }
  'kits.store': {
    methods: ["POST"]
    pattern: '/kits'
    types: {
      body: ExtractBody<InferInput<(typeof import('#kits/validators/kit').createKitValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#kits/validators/kit').createKitValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/kits_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/kits_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'kits.edit': {
    methods: ["GET","HEAD"]
    pattern: '/kits/:rkey/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { rkey: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#kits/validators/kit').kitParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/kits_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/kits_controller').default['edit']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'kits.update': {
    methods: ["PUT","PATCH"]
    pattern: '/kits/:rkey'
    types: {
      body: ExtractBody<InferInput<(typeof import('#kits/validators/kit').kitParamsValidator)>|InferInput<(typeof import('#kits/validators/kit').updateKitValidator)>>
      paramsTuple: [ParamValue]
      params: { rkey: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#kits/validators/kit').kitParamsValidator)>|InferInput<(typeof import('#kits/validators/kit').updateKitValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/kits_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/kits_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'kits.destroy': {
    methods: ["DELETE"]
    pattern: '/kits/:rkey'
    types: {
      body: ExtractBody<InferInput<(typeof import('#kits/validators/kit').kitParamsValidator)>>
      paramsTuple: [ParamValue]
      params: { rkey: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#kits/validators/kit').kitParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/kits_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/kits_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile': {
    methods: ["GET","HEAD"]
    pattern: '/profile/:handle'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { handle: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#profile/validators/profile').showProfileParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/profile/controllers/profiles_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/profile/controllers/profiles_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'kit': {
    methods: ["GET","HEAD"]
    pattern: '/profile/:handle/kit/:rkey'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { handle: ParamValue; rkey: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#profile/validators/profile').showKitParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/profile/controllers/profiles_controller').default['showKit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/profile/controllers/profiles_controller').default['showKit']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'kits.comments.index': {
    methods: ["GET","HEAD"]
    pattern: '/profile/:handle/kit/:rkey/comments'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { handle: ParamValue; rkey: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#kits/validators/kit_comment').kitCommentParamsValidator)>|InferInput<(typeof import('#kits/validators/kit_comment').listKitCommentsQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/kit_comments_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/kit_comments_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'kits.comments.store': {
    methods: ["POST"]
    pattern: '/profile/:handle/kit/:rkey/comments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#kits/validators/kit_comment').kitCommentParamsValidator)>|InferInput<(typeof import('#kits/validators/kit_comment').storeKitCommentValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { handle: ParamValue; rkey: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#kits/validators/kit_comment').kitCommentParamsValidator)>|InferInput<(typeof import('#kits/validators/kit_comment').storeKitCommentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/kit_comments_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/kit_comments_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'kits.comments.destroy': {
    methods: ["DELETE"]
    pattern: '/profile/:handle/kit/:rkey/comments/:commentId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#kits/validators/kit_comment').destroyKitCommentParamsValidator)>>
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { handle: ParamValue; rkey: ParamValue; commentId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#kits/validators/kit_comment').destroyKitCommentParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/kit_comments_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/kit_comments_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'kits.like': {
    methods: ["POST"]
    pattern: '/profile/:handle/kit/:rkey/like'
    types: {
      body: ExtractBody<InferInput<(typeof import('#kits/validators/kit').likeKitParamsValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { handle: ParamValue; rkey: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#kits/validators/kit').likeKitParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/kit_likes_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/kit_likes_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'kits.unlike': {
    methods: ["DELETE"]
    pattern: '/profile/:handle/kit/:rkey/like'
    types: {
      body: ExtractBody<InferInput<(typeof import('#kits/validators/kit').likeKitParamsValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { handle: ParamValue; rkey: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#kits/validators/kit').likeKitParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/kit_likes_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/kit_likes_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
