/**
 * @Author: Miao Yunliang
 * @Date: 2019-09-29 16:28:05
 * @Desc: dva类型文件 复制自dva仓库 略有修改
 */

import {
  Action,
  AnyAction,
  Dispatch,
  MiddlewareAPI,
  StoreEnhancer,
  bindActionCreators
} from 'redux'

/*
 * Reducers are the most important concept in Redux.
 *
 * *Do not put API calls into reducers.*
 *
 * @template S The type of state consumed and produced by this reducer.
 * @template A The type of actions the reducer can potentially respond to.
 */
export type Reducer<S = any, A extends Action = AnyAction> = (state: S, action: A) => S

/**
 * Object whose values correspond to different reducer functions.
 *
 * @template A The type of actions the reducers can potentially respond to.
 */
export type ReducersMapObject<S = any, A extends Action = AnyAction> = {
  [K: string]: Reducer<S, A>
}

export interface onActionFunc {
  (api: MiddlewareAPI<any>): void
}

export interface ReducerEnhancer {
  (reducer: Reducer<any>): void
}

export interface Hooks {
  onError?: (e: Error, dispatch: Dispatch<any>) => void
  onAction?: onActionFunc | onActionFunc[]
  onStateChange?: () => void
  onReducer?: ReducerEnhancer
  onEffect?: () => void
  onHmr?: () => void
  extraReducers?: ReducersMapObject
  extraEnhancers?: StoreEnhancer<any>[]
}

export type DvaOption = Hooks & {
  namespacePrefixWarning?: boolean
  initialState?: Record<string, any>
  history?: Record<string, any>
}

interface Put {
  <A extends AnyAction>(action: A): any
  resolve: <A extends AnyAction>(action: A) => any
}

export interface EffectsCommandMap {
  put: Put
  call: Function
  select: Function
  take: Function
  cancel: Function
  [key: string]: any
}

export type Effect = (action: AnyAction, effects: EffectsCommandMap) => void
export type EffectType = 'takeEvery' | 'takeLatest' | 'watcher' | 'throttle'
export type EffectWithType = [Effect, { type: EffectType }]
export type Subscription = (api: SubscriptionAPI, done: Function) => void
export type ReducersMapObjectWithEnhancer = [ReducersMapObject, ReducerEnhancer]

export interface EffectsMapObject {
  [key: string]: Effect | EffectWithType
}

export interface SubscriptionAPI {
  history: History
  dispatch: Dispatch<any>
}

export interface SubscriptionsMapObject {
  [key: string]: Subscription
}

export interface Model<T = any> {
  namespace: string
  state?: T
  reducers?: ReducersMapObject<T> | ReducersMapObjectWithEnhancer
  effects?: EffectsMapObject
  subscriptions?: SubscriptionsMapObject
}

export interface DvaInstance {
  /**
   * Register an object of hooks on the application.
   *
   * @param hooks
   */
  use: (hooks: Hooks) => void

  /**
   * Register a model.
   *
   * @param model
   */
  model: (model: Model) => void

  /**
   * Unregister a model.
   *
   * @param namespace
   */
  unmodel: (namespace: string) => void

  /**
   * Config router. Takes a function with arguments { history, dispatch },
   * and expects router config. It use the same api as react-router,
   * return jsx elements or JavaScript Object for dynamic routing.
   *
   * @param router
   */
  // router: (router: Router) => void

  /**
   * Start the application. Selector is optional. If no selector
   * arguments, it will return a function that return JSX elements.
   *
   * @param selector
   */
  start: (selector?: HTMLElement | string) => any
}

export default function dva(opts?: DvaOption): DvaInstance

export { bindActionCreators }
