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
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/store_kit_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/store_kit_controller').default['render']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/store_kit_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/store_kit_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'kits.edit': {
    methods: ["GET","HEAD"]
    pattern: '/kits/:rkey/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { rkey: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/update_kit_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/update_kit_controller').default['render']>>>
    }
  }
  'kits.update': {
    methods: ["PUT"]
    pattern: '/kits/:rkey'
    types: {
      body: ExtractBody<InferInput<(typeof import('#kits/validators/kit').updateKitValidator)>>
      paramsTuple: [ParamValue]
      params: { rkey: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#kits/validators/kit').updateKitValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/update_kit_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/update_kit_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'kits.destroy': {
    methods: ["DELETE"]
    pattern: '/kits/:rkey'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { rkey: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/kits/controllers/destroy_kit_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/kits/controllers/destroy_kit_controller').default['handle']>>>
    }
  }
  'profile': {
    methods: ["GET","HEAD"]
    pattern: '/profile/:handle'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { handle: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/profile/controllers/show_profile_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/profile/controllers/show_profile_controller').default['render']>>>
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
