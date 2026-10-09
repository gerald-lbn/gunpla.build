/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  login: typeof routes['login']
  oauth: {
    logout: typeof routes['oauth.logout']
    login: typeof routes['oauth.login']
    signup: typeof routes['oauth.signup']
    callback: typeof routes['oauth.callback']
  }
  shelf: typeof routes['shelf']
  kits: {
    new: typeof routes['kits.new']
    store: typeof routes['kits.store']
    edit: typeof routes['kits.edit']
    update: typeof routes['kits.update']
    destroy: typeof routes['kits.destroy']
    like: typeof routes['kits.like']
    unlike: typeof routes['kits.unlike']
  }
  profile: typeof routes['profile']
  kit: typeof routes['kit']
  stats: typeof routes['stats']
  explore: typeof routes['explore']
  eventStream: typeof routes['event_stream']
  subscribe: typeof routes['subscribe']
  unsubscribe: typeof routes['unsubscribe']
}
