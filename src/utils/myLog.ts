/**
 * @author lgl
 * @create date 2019/4/1
 * @desc 记录日志
 */
/* eslint-disable no-undef */

 import Taro from '@tarojs/taro'
import * as Sentry from 'sentry-miniapp'

/**
 *
 * @param str 要记录的日志内容
 * @param filterMsg 实时日志过滤字段
 * @param type 日志类型 'info' | 'error' 默认 info
 */
function logCommon(str: string, filterMsg?: string, type?: 'info' | 'error') {
  // 调试日志
  if (type && type === 'error') {
    console.error(str)
  } else {
    console.log(str)
  }

  if (process.env.TARO_ENV === 'weapp') {
    // 本地文件日志
    const isLogerAvailable = Taro.canIUse('getLogManager')
    if (isLogerAvailable) {
      // @ts-ignore
      const logger = wx.getLogManager()
      if (type && type === 'error') {
        Sentry.addBreadcrumb({ level: Sentry.Severity.Error, message: str, category: 'log' })
        logger.warn(str)
      } else {
        Sentry.addBreadcrumb({ level: Sentry.Severity.Info, message: str, category: 'log' })
        logger.log(str)
      }
    }
    // 实时日志
    // @ts-ignore
    const logRealtime = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null
    if (!logRealtime) return
    if (type && type === 'error') {
      // eslint-disable-next-line prefer-spread
      logRealtime.error.apply(logRealtime, arguments)
    } else {
      // eslint-disable-next-line prefer-spread
      logRealtime.info.apply(logRealtime, arguments)
    }
    if (filterMsg) {
      if (!logRealtime || !logRealtime.setFilterMsg) return
      if (typeof filterMsg !== 'string') return
      logRealtime.setFilterMsg(filterMsg)
    }
  }
}

/**
 *  记录日志
 * @param str 记录的内容
 * @param filterMsg 实时日志过滤字段
 */
function log(str: string, filterMsg?: string) {
  logCommon(str, filterMsg, 'info')
}

/**
 *  错误日志
 * @param str 记录的内容
 * @param filterMsg 实时日志过滤字段
 */
function error(str: string, filterMsg?: string) {
  logCommon(str, filterMsg, 'error')
}

/**
 *  实时日志
 * @param str 记录的内容
 * @param filterMsg 实时日志过滤字段
 */
function realTimeLog(
  str: Record<string, any> | string,
  filterMsg?: string,
  type?: 'info' | 'error'
) {
  // 实时日志
  const logRealtime = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null
  if (!logRealtime) return
  if (type && type === 'error') {
    // eslint-disable-next-line prefer-spread
    logRealtime.error.apply(logRealtime, arguments)
  } else {
    // eslint-disable-next-line prefer-spread
    logRealtime.info.apply(logRealtime, arguments)
  }
  if (filterMsg) {
    if (!logRealtime || !logRealtime.setFilterMsg) return
    if (typeof filterMsg !== 'string') return
    logRealtime.setFilterMsg(filterMsg)
  }
}

export default {
  log,
  error,
  realTimeLog
}
