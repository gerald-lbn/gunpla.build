import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'oauth.logout': { paramsTuple?: []; params?: {} }
    'oauth.login': { paramsTuple?: []; params?: {} }
    'oauth.signup': { paramsTuple?: []; params?: {} }
    'oauth.callback': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'kits.new': { paramsTuple?: []; params?: {} }
    'kits.store': { paramsTuple?: []; params?: {} }
    'kits.edit': { paramsTuple: [ParamValue]; params: {'rkey': ParamValue} }
    'kits.update': { paramsTuple: [ParamValue]; params: {'rkey': ParamValue} }
    'profile': { paramsTuple: [ParamValue]; params: {'handle': ParamValue} }
    'event_stream': { paramsTuple?: []; params?: {} }
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'oauth.callback': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'kits.new': { paramsTuple?: []; params?: {} }
    'kits.edit': { paramsTuple: [ParamValue]; params: {'rkey': ParamValue} }
    'profile': { paramsTuple: [ParamValue]; params: {'handle': ParamValue} }
    'event_stream': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'oauth.callback': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'kits.new': { paramsTuple?: []; params?: {} }
    'kits.edit': { paramsTuple: [ParamValue]; params: {'rkey': ParamValue} }
    'profile': { paramsTuple: [ParamValue]; params: {'handle': ParamValue} }
    'event_stream': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'oauth.logout': { paramsTuple?: []; params?: {} }
    'oauth.login': { paramsTuple?: []; params?: {} }
    'oauth.signup': { paramsTuple?: []; params?: {} }
    'kits.store': { paramsTuple?: []; params?: {} }
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'kits.update': { paramsTuple: [ParamValue]; params: {'rkey': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}