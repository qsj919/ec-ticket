import { Model } from '@@types/dva'
import { APP_VERSION } from '@constants/index'

export interface AppState {
  // sessionId: string
  // appVersion: string
  // isHotStart: boolean
}

const initState = {}

type CartState = typeof initState

const appModel: Model<CartState> = {
  namespace: 'cart',
  state: {
    // sessionId: '',
    // appVersion: APP_VERSION,
    // isHotStart: false
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    }
  }
}

export default appModel
