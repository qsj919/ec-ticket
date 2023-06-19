/*
 * @Author: GaoYuJian
 * @Date: 2019-07-29 14:32:54
 * @Last Modified by: GaoYuJian
 * @Desc toast、alert
 */

import Taro from '@tarojs/taro'
import { NetWorkErrorType } from '@utils/request/error'
import colors from '../style/colors'

/**
 * 文本轻提示
 * @param title
 * @param duration
 */
function showToast(title: string, duration: number = 1500) {
  return Taro.showToast({
    title,
    duration,
    icon: 'none'
  })
}

/**
 * 带图标的toast提示
 * @param title
 * @param image
 * @param duration
 */
// function showToastWithImage(title: string, image: string, duration: number = 1500) {
//   return Taro.showToast({
//     title,
//     duration,
//     image
//   })
// }

/**
 *
 * @param title 断网提示
 * @param duration
 */
function showNetWorkError(title: string, duration: number = 1500) {
  return Taro.showToast({
    title,
    duration,
    image: require('../assets/images/network_not_connected.png')
  })
}

/**
 * 弹框提示，不带取消按钮
 * @param content
 * @param title
 * @param confirmText
 */
function showAlert(
  content: string,
  title: string = '提示',
  confirmText: string = '我知道了',
  onHide: () => void = () => {}
) {
  return Taro.showModal({
    content,
    title,
    confirmText,
    showCancel: false,
    confirmColor: colors.themeColor
  }).then(res => {
    if (res.confirm) {
      onHide && onHide()
    }
  })
}

/**
 * 弹框提示，带取消按钮
 * @param content
 * @param title
 * @param confirm 点击确认回调
 * @param cancel 点击取消回调
 */
function showAlertWithCancel(content: string, title: string = '提示', confirm, cancel?) {
  return Taro.showModal({
    content,
    title,
    confirmColor: colors.themeColor
  }).then(res => {
    if (res.confirm && confirm) {
      confirm()
    } else if (res.cancel && cancel) {
      cancel()
    }
  })
}

/**
 * 根据错误类型选择合适的提示方式, api请求错误统一调用次方法
 * @param e
 */
function showError(e) {
  if (e.type) {
    if (e.type === NetWorkErrorType.NotConnected) {
      return showNetWorkError(e.message)
    } else if (
      e.type === NetWorkErrorType.Timeout ||
      e.type === NetWorkErrorType.HttpError ||
      e.type === NetWorkErrorType.OtherConnectError
    ) {
      return showToast(e.message)
      // 如果错误类型为主动取消请求，不提示用户
    } else if (e.type !== NetWorkErrorType.RequestAbort) {
      return showAlert(e.message)
    }
  } else {
    if (e && !e.notShow) {
      return showAlert(e.message)
    }
  }
  return Promise.resolve()
}

const messageFeedback = {
  showToast,
  // showToastWithImage,
  showNetWorkError,
  showAlert,
  showAlertWithCancel,
  showError
}

export default messageFeedback
