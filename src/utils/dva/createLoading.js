const SHOW = '@@DVA_LOADING/SHOW'
const HIDE = '@@DVA_LOADING/HIDE'
const NULL = '@@DVA_LOADING/NULL'
const NAMESPACE = 'loading'

function createLoading(opts = {}) {
  const namespace = opts.namespace || NAMESPACE

  const { only = [], except = [] } = opts
  if (only.length > 0 && except.length > 0) {
    throw Error('It is ambiguous to configurate `only` and `except` items at the same time.')
  }

  const initialState = {
    global: false,
    models: {},
    effects: {}
  }

  const extraReducers = {
    [namespace](state = initialState, { type, payload }) {
      const { namespace, actionType, error } = payload || {}
      let ret
      switch (type) {
        case SHOW:
          ret = {
            ...state,
            global: true,
            models: { ...state.models, [namespace]: true },
            effects: {
              ...state.effects,
              [actionType]: { loading: true, error: undefined }
            }
          }
          break
        case HIDE: {
          const effects = {
            ...state.effects,
            [actionType]: { loading: false, error }
          }
          const models = {
            ...state.models,
            [namespace]: Object.keys(effects).some(actionType => {
              const _namespace = actionType.split('/')[0]
              if (_namespace !== namespace) return false
              return effects[actionType] && effects[actionType].loading
            })
          }
          const global = Object.keys(models).some(namespace => {
            return models[namespace]
          })
          ret = {
            ...state,
            global,
            models,
            effects
          }
          break
        }
        default:
          ret = state
          break
      }
      return ret
    }
  }

  function onEffect(effect, { put, select, call }, model, actionType) {
    const { namespace } = model
    if (
      (only.length === 0 && except.length === 0) ||
      (only.length > 0 && only.indexOf(actionType) !== -1) ||
      (except.length > 0 && except.indexOf(actionType) === -1)
    ) {
      return function*(...args) {
        let type = SHOW
        if (args && args[0]) {
          const { payload } = args[0]
          type = payload && payload.disableLoading ? NULL : SHOW
        }
        yield put({ type, payload: { namespace, actionType } })
        try {
          yield effect(...args)
        } catch (e) {
          return yield put({
            type: HIDE,
            payload: { namespace, actionType, error: e }
          })
        }
        const loadingState = yield select(state => state.loading)
        const effects = loadingState.effects[actionType]
        // 阻塞0.1s 确保列表已渲染完毕
        if (effects && effects.loading) {
          yield call(
            () =>
              new Promise(resolve => {
                setTimeout(() => {
                  resolve()
                }, 50)
              })
          )
        }
        yield put({ type: HIDE, payload: { namespace, actionType } })
      }
    } else {
      return effect
    }
  }

  return {
    extraReducers,
    onEffect
  }
}

export default createLoading
