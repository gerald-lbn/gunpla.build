/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  eventStream: typeof routes['event_stream']
  subscribe: typeof routes['subscribe']
  unsubscribe: typeof routes['unsubscribe']
  home: typeof routes['home']
  stats: typeof routes['stats']
  explore: typeof routes['explore'] & {
    filterValues: typeof routes['explore.filter_values']
  }
  login: typeof routes['login']
  oauth: {
    login: typeof routes['oauth.login']
    signup: typeof routes['oauth.signup']
    callback: typeof routes['oauth.callback']
    logout: typeof routes['oauth.logout']
  }
  shelf: typeof routes['shelf']
  kits: {
    create: typeof routes['kits.create']
    store: typeof routes['kits.store']
    edit: typeof routes['kits.edit']
    update: typeof routes['kits.update']
    destroy: typeof routes['kits.destroy']
    comments: {
      index: typeof routes['kits.comments.index']
      store: typeof routes['kits.comments.store']
      destroy: typeof routes['kits.comments.destroy']
    }
    like: typeof routes['kits.like']
    unlike: typeof routes['kits.unlike']
  }
  profile: typeof routes['profile']
  kit: typeof routes['kit']
}
