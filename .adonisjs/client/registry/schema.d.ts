/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/feed/controllers/feed_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/feed/controllers/feed_controller').default['render']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/login_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/login_controller').default['render']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/logout_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/logout_controller').default['handle']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/login_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/login_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/signup_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/signup_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/callback_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/callback_controller').default['handle']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/list_kits_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/list_kits_controller').default['render']>>>
    }
  }
  'kits.new': {
    methods: ["GET","HEAD"]
    pattern: '/kits/new'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/store_kit_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/store_kit_controller').default['create']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/store_kit_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/store_kit_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/update_kit_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/update_kit_controller').default['edit']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'kits.update': {
    methods: ["PUT"]
    pattern: '/kits/:rkey'
    types: {
      body: ExtractBody<InferInput<(typeof import('#kits/validators/kit').kitParamsValidator)>|InferInput<(typeof import('#kits/validators/kit').updateKitValidator)>>
      paramsTuple: [ParamValue]
      params: { rkey: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#kits/validators/kit').kitParamsValidator)>|InferInput<(typeof import('#kits/validators/kit').updateKitValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/update_kit_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/update_kit_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/destroy_kit_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/destroy_kit_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/profile/controllers/show_profile_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/profile/controllers/show_profile_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/profile/controllers/show_kit_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/profile/controllers/show_kit_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
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
  'stats': {
    methods: ["GET","HEAD"]
    pattern: '/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/stats/controllers/stats_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/stats/controllers/stats_controller').default['render']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/explore/controllers/explore_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/explore/controllers/explore_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
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
}
