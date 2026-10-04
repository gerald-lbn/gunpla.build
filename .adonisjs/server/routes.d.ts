import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'oauth.logout': { paramsTuple?: []; params?: {} }
    'oauth.login': { paramsTuple?: []; params?: {} }
    'oauth.signup': { paramsTuple?: []; params?: {} }
    'oauth.callback': { paramsTuple?: []; params?: {} }
    'kits.new': { paramsTuple?: []; params?: {} }
    'kits.store': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'oauth.callback': { paramsTuple?: []; params?: {} }
    'kits.new': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'oauth.callback': { paramsTuple?: []; params?: {} }
    'kits.new': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'oauth.logout': { paramsTuple?: []; params?: {} }
    'oauth.login': { paramsTuple?: []; params?: {} }
    'oauth.signup': { paramsTuple?: []; params?: {} }
    'kits.store': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}