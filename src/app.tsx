import Taro, { ENV_TYPE } from '@tarojs/taro'
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { getTaroParams } from '@utils/utils'
import models from '@models/index'
import { createApp } from '@utils/dva'
import { setCommonParams } from '@utils/request'
// import { tabEventParmas } from '@constants/analyticEvents'
// import { tarBarSvc, setTabIndex, mapTabPathToIndex } from '@services/tabbar'
import { fetchSession } from '@api/user_api_manager'
import { setUrlFromDocumentUrl } from '@services/url'
// import trackSvc from '@services/track'
import messageFeedback from '@services/interactive'
import { persistStore, persistReducer } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import storageSession from 'redux-persist/lib/storage/session'
import * as Sentry from 'sentry-miniapp'
import myLog from '@utils/myLog'
import { getAccountInfoSync, getRequestBaseUrl } from '@utils/cross_platform_api'
import VConsole from 'vconsole'
import config from './config/config'
import './app.scss'
import { APP_VERSION, WX_MOMENTS_SCENE, WX_PUBLIC_SCENE } from './constants'

const isWeb = Taro.getEnv() === ENV_TYPE.WEB

// isWeb &&
//   MtaH5.init({
//     sid: config.mtaSid,
//     cid: config.mtaCid,
//     autoReport: 1, //是否开启自动上报(1:init完成则上报一次,0:使用pgv方法才上报)
//     senseHash: 0, //hash锚点是否进入url统计
//     senseQuery: 0, //url参数是否进入url统计
//     performanceMonitor: 1, //是否开启性能监控
//     ignoreParams: [] //开启url参数上报时，可忽略部分参数拼接上报
//   })

const IS_PRODUCTION = getRequestBaseUrl().includes('bao.hzecool.com')
const environment =
  process.env.NODE_ENV === 'development' ? 'dev' : IS_PRODUCTION ? 'production' : 'test'

const release = IS_PRODUCTION && process.env.NODE_ENV !== 'development' ? APP_VERSION : undefined
// https://76697cbf47af44278fbb33b5cf15ef75@sentrys.hzecool.com/4
// http://76697cbf47af44278fbb33b5cf15ef75@o1.ingest.sentrys.hzecool.com/4
// https://fd6cad72ee5f4f0ca5691f2808bc509b@o1.ingest.sentry.hzecool.com/13
Sentry.init({
  dsn: 'https://76697cbf47af44278fbb33b5cf15ef75@sentrys.hzecool.com/4',
  environment,
  release,
  integrations: [
    new Sentry.Integrations.GlobalHandlers({
      onerror: true,
      onunhandledrejection: false,
      onpagenotfound: true,
      onmemorywarning: false
    })
  ]
})
// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

// const persistConfig = {
//   key: 'root',
//   storage: storageSession
// }
// const persistedReducer = persistReducer(persistConfig, () => {})

const dvaApp = createApp({
  // initialState: state,
  models,
  onError(e) {
    Taro.hideLoading()
    Sentry.captureException(e)
    if (e._dontReject) {
      return
    }
    if (e._keepThrow) {
      throw e
    } else {
      myLog.log(e.message)
      if (!e.notShow) {
        messageFeedback.showError(e)
      }
    }
  },
  onReducer(reducer) {
    if (process.env.TARO_ENV === 'h5') {
      const persistConfig = {
        key: 'yk_ETicket',
        storage: storageSession,
        blacklist: ['searchShop']
      }
      return persistReducer(persistConfig, reducer)
    } else {
      return reducer
    }
  }
})

const store = dvaApp.getStore()

const persistor = persistStore(store, null, () => {
  Taro.eventCenter.trigger('onStateRehydrated')
})

function initAppState() {
  dvaApp.dispatch({
    type: 'user/fetchGrayFunc'
  })
  dvaApp.dispatch({ type: 'shop/fetchShopList' })
  dvaApp.dispatch({ type: 'user/fetchUserData' })
  dvaApp.dispatch({ type: 'user/fetchUserParams' })
}

class App extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  // config: Config = preval`module.exports=(function() {
  //   if (process.env.INDEPENDENT === 'independent') {
  //     return require('../src/config/independent_config.ts')
  //   }else if(process.env.INDEPENDENT === 'foodindependent'){
  //     return require('../src/config/food_independent_config.ts')
  //   }else {
  //     return require('../src/config/mini_config.ts')
  //   }
  // })()`

  componentDidMount() {
    if (process.env.PRODUCT_ENVIRONMENT !== 'product' && process.env.TARO_ENV === 'h5') {
      new VConsole()
    }
    myLog.log(getTaroParams(Taro.getCurrentInstance?.()))
    const info = getAccountInfoSync()
    if (process.env.TARO_ENV === 'weapp') {
      this.checkUpdate()

      Taro.onMemoryWarning(() => {
        myLog.error('==内存告警：onMemoryWarning==')
      })
    }
    // @ts-ignore
    myLog.log(`小程序版本：${info.miniProgram.version}`)

    const systemInfo = Taro.getSystemInfoSync()
    dvaApp.dispatch({ type: 'systemInfo/save', payload: systemInfo })
    dvaApp.dispatch({ type: 'systemInfo/calculateMenuBtn' })
    // @ts-ignore
    if (info.miniProgram.version) {
      dvaApp.dispatch({ type: 'app/save', payload: { appVersion: info.miniProgram.version } })
    }
    // isWeb && this.initTabbarClickEvent()
    // // 延时的原因是app mount时，拿不到页面。 fuck
    // isWeb &&
    //   setTimeout(() => {
    //     this.initTabBarIndex()
    //   }, 300)

    if (isWeb) {
      // this.initApp()
      Taro.eventCenter.on('onStateRehydrated', this.initApp)
    } else {
      this.initApp()
    }

    // @ts-ignore
    if (isWeb && window && window.__wxjs_is_wkwebview) {
      setUrlFromDocumentUrl()
    }
  }

  componentDidShow() {
    const { scene, referrerInfo } = getTaroParams(Taro.getCurrentInstance?.())
    const currentMpAppId = dvaApp.getStore().getState().user.mpAppId || config.wxAppId
    const subscribe = dvaApp.getStore().getState().user.subscribe
    myLog.log(
      `app did show: scene:${scene}, appid: ${referrerInfo &&
        referrerInfo['appId']}, 当前appid: ${currentMpAppId}`
    )
    const isHotStart = dvaApp.getStore().getState().app.isHotStart
    const isFromPublic = WX_PUBLIC_SCENE.includes(Number(scene)) // 来自公众号
    // 入口appid
    const entryMpAppId = isFromPublic ? referrerInfo && referrerInfo['appId'] : currentMpAppId // 仅对公众号入口做处理 提取appid

    // 本次启动入口是不同appid
    const isFromDifferentMpPublic = entryMpAppId && entryMpAppId !== currentMpAppId

    if (entryMpAppId && isFromPublic) {
      dvaApp.dispatch({ type: 'user/save', payload: { mpAppId: entryMpAppId } })
    }
    // 从不同公众号号进来，或者关注状态为0，  且满足热启动并且入口是公众号，则重新登录
    if ((isFromDifferentMpPublic || subscribe === '0') && isFromPublic && isHotStart) {
      myLog.log(`relogin in didshow， subscribe:${subscribe}`)
      const isLogining = dvaApp.getStore().getState().user.logining
      if (!isLogining) {
        this.initApp()
      }
      return
    }

    // 后台进入 刷新店铺列表
    if (dvaApp.getStore().getState().user.sessionId) {
      dvaApp.dispatch({ type: 'shop/fetchShopList' })
    }
  }

  componentDidHide() {
    dvaApp.dispatch({ type: 'app/save', payload: { isHotStart: true } })
  }

  componentDidCatchError() {}

  initApp = () => {
    if (isWeb) {
      const { sessionId, subscribe, mpUserId } = getTaroParams(Taro.getCurrentInstance?.())
      if (subscribe) {
        dvaApp.dispatch({ type: 'user/save', payload: { subscribe } })
      }
      if (sessionId) {
        this.onGotSession(sessionId)
      } else if (mpUserId) {
        this.fetchSession(mpUserId).then(newSessionId => {
          this.onGotSession(newSessionId)
        })
      } else {
        // 刷新时
        const { sessionId } = store.getState().user
        if (sessionId) {
          // 一些海报页没有也不需要session
          this.onGotSession(sessionId)
        }
      }
    } else {
      if (getTaroParams(Taro.getCurrentInstance?.()) && getTaroParams(Taro.getCurrentInstance?.()).scene === WX_MOMENTS_SCENE) return
      dvaApp.dispatch({ type: 'user/login' })
      dvaApp.dispatch({ type: 'image/initMode' })
    }
  }

  fetchSession = (mpUserId: string) => {
    return fetchSession(mpUserId).then(({ data }) => {
      return data.sessionId
    })
  }

  onGotSession = (sessionId: string) => {
    setCommonParams({ sessionId })
    dvaApp.dispatch({
      type: 'user/save',
      payload: { sessionId }
    })
    initAppState()
  }

  // initTabBarIndex = () => {
  //   try {
  //     const pages = Taro.getCurrentPages()
  //     const page = pages[pages.length - 1]
  //     const index = mapTabPathToIndex(page.$router.path)
  //     setTabIndex(index)
  //   } catch (e) {
  //     console.warn(e, 'ee')
  //   }
  // }

  // initTabbarClickEvent = () => {
  //   tarBarSvc.initTabbarClickEvent(i => {
  //     let eventParmaName = ''
  //     switch (i) {
  //       case 0:
  //         eventParmaName = tabEventParmas.ticketList
  //         break
  //       case 1:
  //         eventParmaName = tabEventParmas.statement
  //         break
  //       case 2:
  //         eventParmaName = tabEventParmas.mine
  //         break
  //     }
  //     // 在当前tab重复点击 不上传
  //     if (tarBarSvc.currentTabIndex !== i) {
  //       trackSvc.uploadPage()
  //     }
  //     setTabIndex(i)
  //     trackSvc.track('tab', eventParmaName)
  //   })
  // }

  checkUpdate() {
    if (getTaroParams(Taro.getCurrentInstance?.()) && getTaroParams(Taro.getCurrentInstance?.()).scene === WX_MOMENTS_SCENE) return
    const updateManager = Taro.getUpdateManager()
    updateManager.onCheckForUpdate(function(res) {
      // 请求完新版本信息的回调
      myLog.log(`hasUpdate: ${res.hasUpdate}`)
    })
    updateManager.onUpdateReady(function() {
      Taro.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        // @ts-ignore
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    updateManager.onUpdateFailed(function() {
      // 新的版本下载失败
      Taro.hideLoading()
      Taro.showModal({
        title: '升级失败',
        content: '新版本下载失败，请检查网络！',
        showCancel: false
      })
    })
  }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider store={store}>
        {process.env.TARO_ENV === 'h5' ? (
          <PersistGate persistor={persistor} loading={null}>
            {/*// @ts-ignore*/}
            {this.props.children}
          </PersistGate>
        ) :(
          // @ts-ignore
          this.props.children
        )}
      </Provider>
    )
  }
}

// Taro.render(<App />, document.getElementById('app'))
export default App
