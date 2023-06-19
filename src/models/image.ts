import { Model } from '@@types/dva'
import { APP_VERSION, storage } from '@constants/index'
import Taro from '@tarojs/taro'
import myLog from '@utils/myLog'

export interface ImageState {
  /**
   * 图片加载机制
   * 0:默认，1:背景图，2:版本戳，3:混合1 + 2，即背景图+时间戳
   */
  mode: number
}

const appModel: Model<ImageState> = {
  namespace: 'image',
  state: {
    mode: 2
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    }
  },
  effects: {
    *initMode(_, { select, put }) {
      try {
        const res = yield Taro.getStorage({ key: storage.IMAGE_LOAD_MODE })
        yield put({ type: 'save', payload: { mode: res.data } })
      } catch (error) {
        // ignore
        myLog.log(`获取图片加载机制失败:${error.message}`)
      }
    },
    *updateMode({ payload }, { select, put }) {
      const { mode } = payload
      yield Taro.setStorage({ key: storage.IMAGE_LOAD_MODE, data: mode })
      yield put({ type: 'save', payload: { mode: mode } })
    }
  }
}

export default appModel
