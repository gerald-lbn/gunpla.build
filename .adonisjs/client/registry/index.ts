/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'event_stream': {
    methods: ["GET","HEAD"],
    pattern: '/__transmit/events',
    tokens: [{"old":"/__transmit/events","type":0,"val":"__transmit","end":""},{"old":"/__transmit/events","type":0,"val":"events","end":""}],
    types: placeholder as Registry['event_stream']['types'],
  },
  'subscribe': {
    methods: ["POST"],
    pattern: '/__transmit/subscribe',
    tokens: [{"old":"/__transmit/subscribe","type":0,"val":"__transmit","end":""},{"old":"/__transmit/subscribe","type":0,"val":"subscribe","end":""}],
    types: placeholder as Registry['subscribe']['types'],
  },
  'unsubscribe': {
    methods: ["POST"],
    pattern: '/__transmit/unsubscribe',
    tokens: [{"old":"/__transmit/unsubscribe","type":0,"val":"__transmit","end":""},{"old":"/__transmit/unsubscribe","type":0,"val":"unsubscribe","end":""}],
    types: placeholder as Registry['unsubscribe']['types'],
  },
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'stats': {
    methods: ["GET","HEAD"],
    pattern: '/stats',
    tokens: [{"old":"/stats","type":0,"val":"stats","end":""}],
    types: placeholder as Registry['stats']['types'],
  },
  'explore': {
    methods: ["GET","HEAD"],
    pattern: '/explore',
    tokens: [{"old":"/explore","type":0,"val":"explore","end":""}],
    types: placeholder as Registry['explore']['types'],
  },
  'login': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['login']['types'],
  },
  'oauth.logout': {
    methods: ["POST"],
    pattern: '/oauth/logout',
    tokens: [{"old":"/oauth/logout","type":0,"val":"oauth","end":""},{"old":"/oauth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['oauth.logout']['types'],
  },
  'oauth.login': {
    methods: ["POST"],
    pattern: '/oauth/login',
    tokens: [{"old":"/oauth/login","type":0,"val":"oauth","end":""},{"old":"/oauth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['oauth.login']['types'],
  },
  'oauth.signup': {
    methods: ["POST"],
    pattern: '/oauth/signup',
    tokens: [{"old":"/oauth/signup","type":0,"val":"oauth","end":""},{"old":"/oauth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['oauth.signup']['types'],
  },
  'oauth.callback': {
    methods: ["GET","HEAD"],
    pattern: '/oauth/callback',
    tokens: [{"old":"/oauth/callback","type":0,"val":"oauth","end":""},{"old":"/oauth/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['oauth.callback']['types'],
  },
  'shelf': {
    methods: ["GET","HEAD"],
    pattern: '/shelf',
    tokens: [{"old":"/shelf","type":0,"val":"shelf","end":""}],
    types: placeholder as Registry['shelf']['types'],
  },
  'kits.create': {
    methods: ["GET","HEAD"],
    pattern: '/kits/create',
    tokens: [{"old":"/kits/create","type":0,"val":"kits","end":""},{"old":"/kits/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['kits.create']['types'],
  },
  'kits.store': {
    methods: ["POST"],
    pattern: '/kits',
    tokens: [{"old":"/kits","type":0,"val":"kits","end":""}],
    types: placeholder as Registry['kits.store']['types'],
  },
  'kits.edit': {
    methods: ["GET","HEAD"],
    pattern: '/kits/:rkey/edit',
    tokens: [{"old":"/kits/:rkey/edit","type":0,"val":"kits","end":""},{"old":"/kits/:rkey/edit","type":1,"val":"rkey","end":""},{"old":"/kits/:rkey/edit","type":0,"val":"edit","end":""}],
    types: placeholder as Registry['kits.edit']['types'],
  },
  'kits.update': {
    methods: ["PUT","PATCH"],
    pattern: '/kits/:rkey',
    tokens: [{"old":"/kits/:rkey","type":0,"val":"kits","end":""},{"old":"/kits/:rkey","type":1,"val":"rkey","end":""}],
    types: placeholder as Registry['kits.update']['types'],
  },
  'kits.destroy': {
    methods: ["DELETE"],
    pattern: '/kits/:rkey',
    tokens: [{"old":"/kits/:rkey","type":0,"val":"kits","end":""},{"old":"/kits/:rkey","type":1,"val":"rkey","end":""}],
    types: placeholder as Registry['kits.destroy']['types'],
  },
  'profile': {
    methods: ["GET","HEAD"],
    pattern: '/profile/:handle',
    tokens: [{"old":"/profile/:handle","type":0,"val":"profile","end":""},{"old":"/profile/:handle","type":1,"val":"handle","end":""}],
    types: placeholder as Registry['profile']['types'],
  },
  'kit': {
    methods: ["GET","HEAD"],
    pattern: '/profile/:handle/kit/:rkey',
    tokens: [{"old":"/profile/:handle/kit/:rkey","type":0,"val":"profile","end":""},{"old":"/profile/:handle/kit/:rkey","type":1,"val":"handle","end":""},{"old":"/profile/:handle/kit/:rkey","type":0,"val":"kit","end":""},{"old":"/profile/:handle/kit/:rkey","type":1,"val":"rkey","end":""}],
    types: placeholder as Registry['kit']['types'],
  },
  'kits.comments.index': {
    methods: ["GET","HEAD"],
    pattern: '/profile/:handle/kit/:rkey/comments',
    tokens: [{"old":"/profile/:handle/kit/:rkey/comments","type":0,"val":"profile","end":""},{"old":"/profile/:handle/kit/:rkey/comments","type":1,"val":"handle","end":""},{"old":"/profile/:handle/kit/:rkey/comments","type":0,"val":"kit","end":""},{"old":"/profile/:handle/kit/:rkey/comments","type":1,"val":"rkey","end":""},{"old":"/profile/:handle/kit/:rkey/comments","type":0,"val":"comments","end":""}],
    types: placeholder as Registry['kits.comments.index']['types'],
  },
  'kits.comments.store': {
    methods: ["POST"],
    pattern: '/profile/:handle/kit/:rkey/comments',
    tokens: [{"old":"/profile/:handle/kit/:rkey/comments","type":0,"val":"profile","end":""},{"old":"/profile/:handle/kit/:rkey/comments","type":1,"val":"handle","end":""},{"old":"/profile/:handle/kit/:rkey/comments","type":0,"val":"kit","end":""},{"old":"/profile/:handle/kit/:rkey/comments","type":1,"val":"rkey","end":""},{"old":"/profile/:handle/kit/:rkey/comments","type":0,"val":"comments","end":""}],
    types: placeholder as Registry['kits.comments.store']['types'],
  },
  'kits.comments.destroy': {
    methods: ["DELETE"],
    pattern: '/profile/:handle/kit/:rkey/comments/:commentId',
    tokens: [{"old":"/profile/:handle/kit/:rkey/comments/:commentId","type":0,"val":"profile","end":""},{"old":"/profile/:handle/kit/:rkey/comments/:commentId","type":1,"val":"handle","end":""},{"old":"/profile/:handle/kit/:rkey/comments/:commentId","type":0,"val":"kit","end":""},{"old":"/profile/:handle/kit/:rkey/comments/:commentId","type":1,"val":"rkey","end":""},{"old":"/profile/:handle/kit/:rkey/comments/:commentId","type":0,"val":"comments","end":""},{"old":"/profile/:handle/kit/:rkey/comments/:commentId","type":1,"val":"commentId","end":""}],
    types: placeholder as Registry['kits.comments.destroy']['types'],
  },
  'kits.like': {
    methods: ["POST"],
    pattern: '/profile/:handle/kit/:rkey/like',
    tokens: [{"old":"/profile/:handle/kit/:rkey/like","type":0,"val":"profile","end":""},{"old":"/profile/:handle/kit/:rkey/like","type":1,"val":"handle","end":""},{"old":"/profile/:handle/kit/:rkey/like","type":0,"val":"kit","end":""},{"old":"/profile/:handle/kit/:rkey/like","type":1,"val":"rkey","end":""},{"old":"/profile/:handle/kit/:rkey/like","type":0,"val":"like","end":""}],
    types: placeholder as Registry['kits.like']['types'],
  },
  'kits.unlike': {
    methods: ["DELETE"],
    pattern: '/profile/:handle/kit/:rkey/like',
    tokens: [{"old":"/profile/:handle/kit/:rkey/like","type":0,"val":"profile","end":""},{"old":"/profile/:handle/kit/:rkey/like","type":1,"val":"handle","end":""},{"old":"/profile/:handle/kit/:rkey/like","type":0,"val":"kit","end":""},{"old":"/profile/:handle/kit/:rkey/like","type":1,"val":"rkey","end":""},{"old":"/profile/:handle/kit/:rkey/like","type":0,"val":"like","end":""}],
    types: placeholder as Registry['kits.unlike']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
