import { isWeb } from './cross_platform_api'

export const safePostMeaasge = (() => {
  if (isWeb()) {
    if (window) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        return function(msg) {
          console.log(msg)
          window.ReactNativeWebView.postMessage(msg)
        }
      } else if (window.nativeWebView && window.nativeWebView.postMessage) {
        return function(msg) {
          window.nativeWebView && window.nativeWebView.postMessage(msg)
        }
      }
    }
    return function(msg) {
      // console.log(msg);
      window.postMessage(msg, '*')
    }
  } else {
    return function(msg) {
      console.log(msg, 'post message fail')
    }
  }
})()
