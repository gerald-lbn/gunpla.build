/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  profile: typeof routes['profile']
  login: typeof routes['login']
  oauth: {
    logout: typeof routes['oauth.logout']
    login: typeof routes['oauth.login']
    signup: typeof routes['oauth.signup']
    callback: typeof routes['oauth.callback']
  }
  dashboard: typeof routes['dashboard']
  kits: {
    new: typeof routes['kits.new']
    store: typeof routes['kits.store']
    edit: typeof routes['kits.edit']
    update: typeof routes['kits.update']
  }
  eventStream: typeof routes['event_stream']
  subscribe: typeof routes['subscribe']
  unsubscribe: typeof routes['unsubscribe']
}
