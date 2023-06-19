import { env, ENV_TYPE, getEnv } from '@tarojs/taro'

export interface SystemInfoState {
  brand: string
  model: string
  screenWidth: number
  windowWidth: number
  screenHeight: number
  windowHeight: number
  version: string
  platform: string
  SDKVersion: string
  statusBarHeight: number
  gap: number // 胶囊与导航栏的上/下间距
  navigationHeight: number
  navigationPadding: number // 胶囊与页面的右间距,
  navigationWidth: number // 胶囊宽度（带右边距）,
  pixelRatio: number // 设备像素比
  menuRect: {
    bottom: number
    height: number
    left: number
    right: number
    top: number
    width: number
  }
}

export default {
  namespace: 'systemInfo',
  state: {
    // 手机品牌
    brand: '',
    // 屏幕宽度
    model: '',
    // 手机型号
    screenWidth: '',
    // 屏幕高度
    screenHeight: '',
    // 可使用窗口宽度
    windowWidth: '',
    // 可使用窗口高度
    windowHeight: '',
    // 微信版本号
    version: '',
    // 客户端基础库版本
    SDKVersion: '',
    platform: '',
    statusBarHeight: 0,
    gap: 0, // 胶囊与导航栏的上/下间距
    navigationHeight: 44,
    navigationPadding: 24, // 胶囊与页面的右间距,
    navigationWidth: 100,
    menuRect: {
      bottom: 80,
      height: 32,
      left: 281,
      right: 368,
      top: 48,
      width: 87
    }
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    }
  },
  effects: {
    *calculateMenuBtn(_, { put, select }) {
      if (ENV_TYPE.WEB === getEnv()) {
        yield put({
          type: 'save',
          payload: { gap: 0, navigationPadding: 0, navigationWidth: 0, statusBarHeight: 0 }
        })
        return
      }
      const { statusBarHeight, windowWidth, platform } = yield select(state => state.systemInfo)
      const navigationHeight = platform === 'ios' ? 44 : 48
      // 先给以一个初始值，以防getMenuButtonBoundingClientRect调用出错阻塞app
      let gap = platform === 'ios' ? 7 : 9
      let navigationPadding = platform === 'ios' ? 4 : 6
      let navigationWidth = 100
      let menuRect = { bottom: 80, height: 32, left: 281, right: 368, top: 48, width: 87 }
      try {
        // @ts-ignore Taro.getMenuButtonBoundingClientRect 有bug 使用wx变量
        // eslint-disable-next-line no-undef
        const res = wx.getMenuButtonBoundingClientRect()
        const { right, bottom, height, width } = res
        gap = bottom - statusBarHeight - height
        navigationPadding = windowWidth - right
        navigationWidth = width + navigationPadding
        menuRect = res
      } catch (error) {
        // ignore error
        // 微信存在bug 调用该API可能会报错， 上报sentry统计系统、版本等。
        // sentry.captureException(error)
      }
      yield put({
        type: 'save',
        payload: { gap, navigationHeight, navigationPadding, navigationWidth, menuRect }
      })
    }
  }
}
