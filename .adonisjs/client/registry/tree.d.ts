/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  oauth: {
    logout: typeof routes['oauth.logout']
    login: typeof routes['oauth.login']
    signup: typeof routes['oauth.signup']
    callback: typeof routes['oauth.callback']
  }
  kits: {
    new: typeof routes['kits.new']
    store: typeof routes['kits.store']
  }
  home: typeof routes['home']
  profile: typeof routes['profile']
  login: typeof routes['login']
  dashboard: typeof routes['dashboard']
}
