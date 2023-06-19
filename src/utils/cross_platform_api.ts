import { APP_VERSION } from '@constants/index'
import Taro, { env, ENV_TYPE } from '@tarojs/taro'
import config from '../config/config'
import { safePostMeaasge } from './postMessage'

export function getRequestBaseUrl() {
  const env = Taro.getEnv()
  if (env === ENV_TYPE.WEAPP) {
    return config.server
  } else {
    return window.location.origin
  }
}

// export function getPlatform() {
//   return Taro.getEnv()
// }

export function isWeb() {
  return Taro.getEnv() === ENV_TYPE.WEB
}

export function isWeapp() {
  return Taro.getEnv() === ENV_TYPE.WEAPP
}

export function getAccountInfoSync() {
  if (isWeb()) {
    return {
      miniProgram: {
        appId: config.wxAppId as string,
        version: APP_VERSION
      }
    }
  } else {
    return Taro.getAccountInfoSync()
  }
}

export function createSelectorQuery() {
  if (isWeapp()) {
    return Taro.createSelectorQuery()
  } else {
    // should implement a SelectorQuery Class
    // for now simple return it
    return {
      select(selectTag: string) {
        const q = document.querySelector(selectTag)
        return {
          node(callback) {
            callback({
              node: Object.assign(q.firstElementChild, {
                createImage() {
                  const image = new Image()
                  image.crossOrigin = 'anonymous'
                  // return new Image()
                  return image
                }
              })
            })
            return {
              exec() {}
            }
          }
        }
      }
    }
  }
}

export function setNavigationBarTitle(title: string) {
  if (isWeb()) {
    safePostMeaasge(
      JSON.stringify({
        eventType: 'setTitle',
        data: title
      })
    )
  } else {
    Taro.setNavigationBarTitle({ title })
  }
}
