/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'profile': {
    methods: ["GET","HEAD"],
    pattern: '/profile/:handle',
    tokens: [{"old":"/profile/:handle","type":0,"val":"profile","end":""},{"old":"/profile/:handle","type":1,"val":"handle","end":""}],
    types: placeholder as Registry['profile']['types'],
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
  'dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [{"old":"/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['dashboard']['types'],
  },
  'kits.new': {
    methods: ["GET","HEAD"],
    pattern: '/kits/new',
    tokens: [{"old":"/kits/new","type":0,"val":"kits","end":""},{"old":"/kits/new","type":0,"val":"new","end":""}],
    types: placeholder as Registry['kits.new']['types'],
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
    methods: ["PUT"],
    pattern: '/kits/:rkey',
    tokens: [{"old":"/kits/:rkey","type":0,"val":"kits","end":""},{"old":"/kits/:rkey","type":1,"val":"rkey","end":""}],
    types: placeholder as Registry['kits.update']['types'],
  },
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
