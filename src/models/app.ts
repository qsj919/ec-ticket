import { Model } from '@@types/dva'
import { APP_VERSION } from '@constants/index'

export interface AppState {
  sessionId: string
  appVersion: string
  isHotStart: boolean
}

const appModel: Model<AppState> = {
  namespace: 'app',
  state: {
    sessionId: '',
    appVersion: APP_VERSION,
    isHotStart: false
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    }
  }
}

export default appModel
