import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'stats': { paramsTuple?: []; params?: {} }
    'explore': { paramsTuple?: []; params?: {} }
    'explore.filter_values': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'oauth.login': { paramsTuple?: []; params?: {} }
    'oauth.signup': { paramsTuple?: []; params?: {} }
    'oauth.callback': { paramsTuple?: []; params?: {} }
    'oauth.logout': { paramsTuple?: []; params?: {} }
    'shelf': { paramsTuple?: []; params?: {} }
    'kits.create': { paramsTuple?: []; params?: {} }
    'kits.store': { paramsTuple?: []; params?: {} }
    'kits.edit': { paramsTuple: [ParamValue]; params: {'rkey': ParamValue} }
    'kits.update': { paramsTuple: [ParamValue]; params: {'rkey': ParamValue} }
    'kits.destroy': { paramsTuple: [ParamValue]; params: {'rkey': ParamValue} }
    'profile': { paramsTuple: [ParamValue]; params: {'handle': ParamValue} }
    'kit': { paramsTuple: [ParamValue,ParamValue]; params: {'handle': ParamValue,'rkey': ParamValue} }
    'kits.comments.index': { paramsTuple: [ParamValue,ParamValue]; params: {'handle': ParamValue,'rkey': ParamValue} }
    'kits.comments.store': { paramsTuple: [ParamValue,ParamValue]; params: {'handle': ParamValue,'rkey': ParamValue} }
    'kits.comments.destroy': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'handle': ParamValue,'rkey': ParamValue,'commentId': ParamValue} }
    'kits.like': { paramsTuple: [ParamValue,ParamValue]; params: {'handle': ParamValue,'rkey': ParamValue} }
    'kits.unlike': { paramsTuple: [ParamValue,ParamValue]; params: {'handle': ParamValue,'rkey': ParamValue} }
  }
  GET: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'stats': { paramsTuple?: []; params?: {} }
    'explore': { paramsTuple?: []; params?: {} }
    'explore.filter_values': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'oauth.callback': { paramsTuple?: []; params?: {} }
    'shelf': { paramsTuple?: []; params?: {} }
    'kits.create': { paramsTuple?: []; params?: {} }
    'kits.edit': { paramsTuple: [ParamValue]; params: {'rkey': ParamValue} }
    'profile': { paramsTuple: [ParamValue]; params: {'handle': ParamValue} }
    'kit': { paramsTuple: [ParamValue,ParamValue]; params: {'handle': ParamValue,'rkey': ParamValue} }
    'kits.comments.index': { paramsTuple: [ParamValue,ParamValue]; params: {'handle': ParamValue,'rkey': ParamValue} }
  }
  HEAD: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'stats': { paramsTuple?: []; params?: {} }
    'explore': { paramsTuple?: []; params?: {} }
    'explore.filter_values': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'oauth.callback': { paramsTuple?: []; params?: {} }
    'shelf': { paramsTuple?: []; params?: {} }
    'kits.create': { paramsTuple?: []; params?: {} }
    'kits.edit': { paramsTuple: [ParamValue]; params: {'rkey': ParamValue} }
    'profile': { paramsTuple: [ParamValue]; params: {'handle': ParamValue} }
    'kit': { paramsTuple: [ParamValue,ParamValue]; params: {'handle': ParamValue,'rkey': ParamValue} }
    'kits.comments.index': { paramsTuple: [ParamValue,ParamValue]; params: {'handle': ParamValue,'rkey': ParamValue} }
  }
  POST: {
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'oauth.login': { paramsTuple?: []; params?: {} }
    'oauth.signup': { paramsTuple?: []; params?: {} }
    'oauth.logout': { paramsTuple?: []; params?: {} }
    'kits.store': { paramsTuple?: []; params?: {} }
    'kits.comments.store': { paramsTuple: [ParamValue,ParamValue]; params: {'handle': ParamValue,'rkey': ParamValue} }
    'kits.like': { paramsTuple: [ParamValue,ParamValue]; params: {'handle': ParamValue,'rkey': ParamValue} }
  }
  PUT: {
    'kits.update': { paramsTuple: [ParamValue]; params: {'rkey': ParamValue} }
  }
  PATCH: {
    'kits.update': { paramsTuple: [ParamValue]; params: {'rkey': ParamValue} }
  }
  DELETE: {
    'kits.destroy': { paramsTuple: [ParamValue]; params: {'rkey': ParamValue} }
    'kits.comments.destroy': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'handle': ParamValue,'rkey': ParamValue,'commentId': ParamValue} }
    'kits.unlike': { paramsTuple: [ParamValue,ParamValue]; params: {'handle': ParamValue,'rkey': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}