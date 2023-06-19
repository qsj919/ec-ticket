/*
 * @Author: HuKai
 * @Date: 2019-06-26 10:52:32
 * @Last Modified by: Miao Yunliang
 * @Desc 网络请求
 */
import Taro from '@tarojs/taro'
import transform from 'lodash/transform'
import messageFeedback from '@services/interactive'
import myLog from '@utils/myLog'
import * as Sentry from 'sentry-miniapp'
import config from '@config/config'
import dayjs from 'dayjs'
import trackSvc from '@services/track'
import events from '@constants/analyticEvents'
import { YKError, NetWorkErrorType } from './error'

type RequestParams = {
  /**
   * 默认POST
   */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT' | 'OPTIONS'
  url?: string
  /**
   * 默认x-www-form-urlencoded
   */
  'Content-Type'?: string

  data?: any
  hideErrorMessage?: boolean
}

interface RetryInfo {
  count: number
  error: YKError
  params: RequestParams
}
interface RequestOptions {
  slient?: boolean
  retryInfo?: RetryInfo
  disableRetry?: boolean
}

function filterUpload(e: YKError) {
  let target = 0.05
  if (
    e.type === NetWorkErrorType.BusinessError &&
    e &&
    !e.message.includes('缺少sessionId参数') &&
    !e.message.includes('会话已失效，请重新登录')
  ) {
    target = 0.1
  }

  return Math.random() < target
}

/**
 * 过滤null undefined 以及 'undefined'
 * @param input
 */
function filterVoidParams(input: any): any {
  return transform(input, (result, value, key) => {
    if (value && typeof value === 'object') {
      result[key] = filterVoidParams(value)
    } else {
      // 从URL传递读取参数 参数可能为字符串的undefined
      if (value !== null && value !== undefined && value !== 'undefined') {
        result[key] = value
      }
    }
  })
}

let serverList = [config.server, config.backServer]
let baseUrl = config.server
let commonParams = {}

export function setBaseUrl(url: string) {
  baseUrl = url
}
export function setServerList(urls: string[]) {
  serverList = urls
}
export function setCommonParams(params: object) {
  commonParams = { ...commonParams, ...params }
}

const request = (params: RequestParams, requestOptions: RequestOptions = {}) => {
  const { method = 'POST' } = params
  // let url = params.url || ''
  let url = baseUrl + (params.url || '/slb/api.do')
  if (params.url && params.url.includes('http')) {
    url = params.url
  }
  // url = url +
  //   '?_cid=' + requestConfig.commonParams._cid
  //   + '&_tid=' + requestConfig.commonParams._tid
  let data = { ...commonParams, ...params.data }
  if (data!.jsonParam && typeof data.jsonParam === 'object') {
    data.jsonParam = JSON.stringify(data.jsonParam)
  }
  // debugger
  let contentType = 'application/x-www-form-urlencoded'
  if (params['Content-Type']) {
    contentType = params['Content-Type']
  }
  let startTime = new Date().getTime()
  const time = dayjs().format('MM-DD HH:mm:ss')
  data = filterVoidParams(data)
  if (contentType === 'application/json') {
    data = JSON.stringify(data)
  }
  myLog.log(`${time},发起请求：${data.apiKey},请求参数${JSON.stringify(data)},`)
  return Taro.request({
    url,
    data,
    method,
    header: {
      'Content-Type': contentType
    },
    mode: 'cors'
  })
    .then(
      res => {
        let requestTime = (new Date().getTime() - startTime) / 1000
        const { statusCode } = res

        if (statusCode >= 200 && statusCode < 300) {
          myLog.log(
            `收到返回：${data.apiKey}\nglobalid:${res.data.globalId}【耗时：${requestTime}s】`
          )
          // 详情页接口性能 放这里确实他妈的不合适
          if (data.apiKey === 'ec-shareMpSaleBillTicket') {
            // eslint-disable-next-line no-undef
            wx.reportPerformance(1001, requestTime * 1000, baseUrl)
          }
          // 请求李果大数据埋点接口，返回的数据仅有ok
          if (res.data.code >= 0 || res.data === 'ok') {
            process.env.NODE_ENV === 'development' && myLog.log(JSON.stringify(res.data))
            return res.data
          } else if (!params.hideErrorMessage) {
            throw new YKError(res.data.msg, NetWorkErrorType.BusinessError, res.data.code)
          }
        } else {
          throw new YKError(`服务器开小差了，请稍后重试(${statusCode})`, NetWorkErrorType.HttpError)
        }
      },
      error => {
        return Taro.getNetworkType().then(
          res => {
            if (res.networkType === 'none') {
              throw new YKError('网络未连接', NetWorkErrorType.NotConnected)
            } else if (
              error.errMsg &&
              (error.errMsg.includes('timeout') || error.errMsg.includes('超时'))
            ) {
              // 埋点是为了获得地域等信息
              trackSvc.track(events.timeout, { api: data.apiKey })
              Taro.reportMonitor('0', 1)
              throw new YKError('网络不给力，请重试', NetWorkErrorType.Timeout)
            } else {
              throw new YKError(`网络连接错误:${error.errMsg}`, NetWorkErrorType.OtherConnectError)
            }
          },
          error => {
            throw new YKError(`网络请求错误:${error.errMsg}`, NetWorkErrorType.OtherConnectError)
          }
        )
      }
    )
    .catch(e => {
      let requestTime = (new Date().getTime() - startTime) / 1000
      console.log(`【耗时：${requestTime}s】`)
      if (!requestOptions.disableRetry && isNeedRetry(e, requestOptions.retryInfo)) {
        let nextRetryInfo: RetryInfo
        if (requestOptions.retryInfo) {
          requestOptions.retryInfo.count += 1
          nextRetryInfo = requestOptions.retryInfo
        } else {
          let _params = params
          // if (_params.data.apiKey === 'ec-shareMpSaleBillTicket') {
          //   const timestamp = Date.now()
          //   _params.data.timestamp = timestamp
          //   _params.data.sign = detailApiEncode(timestamp)
          // }
          nextRetryInfo = {
            count: 1,
            error: e,
            params: _params
          }
        }

        myLog.log(
          `【网络请求出错(第${nextRetryInfo.count}次): ${
            params.data.apiKey
          } 】【耗时：${requestTime}s】 ${new Date().toLocaleString()} ${url} \n${e.message}`,
          params.data.apiKey
        )

        return retry(nextRetryInfo)
      } else {
        if (!e.type) {
          let errMsg = '网络请求错误'
          let errorType = NetWorkErrorType.UnknownError
          if (e.errMsg) {
            errMsg = e.errMsg
          } else if (e.message) {
            errMsg = e.message
          } else if (e.status >= 500) {
            errMsg = `服务器开小差了，请稍后重试(${e.status})`
            errorType = NetWorkErrorType.HttpError
          }

          e = new YKError(errMsg, errorType)
        }

        if (filterUpload(e)) {
          Sentry.withScope(scope => {
            scope.setTag('type', 'api-error')
            if (data.apiKey) {
              // 根据apiKey聚合错误
              scope.setFingerprint([data.apiKey])
              scope.setTag('api-key', data.apiKey)
            }
            scope.setTag('api-error-type', e.type)
            Sentry.captureException(e)
          })
        }

        myLog.error(`接口出错【${data.apiKey}】：${e.message}`)
        !requestOptions.slient && messageFeedback.showError(e)
        e.notShow = true
        throw e
      }
    })
}

function isNeedRetry(error, retryInfo?: RetryInfo) {
  if (retryInfo) {
    if (retryInfo.count < 2) {
      return true
    }
  } else {
    if (error.needRetry) {
      return true
    } else {
      if (error.type) {
        if (
          error.type !== NetWorkErrorType.BusinessError &&
          error.type !== NetWorkErrorType.UnknownError
        ) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * 网络请求出错时进行重试，重试规则如下
 * 除了业务错误其它三种错误都要进行重试与切换
 * 网络未连接:  最多重试三次，失败后提示错误
 * 连接超时：失败后先用当前域名重试一次，任然失败进行主、备域名切换后重试，最终还是失败进行错误提示
 * statusCode != 200: 出错后先进行主备域名切换，任然失败继续用主域名重试，成功则把域名切换为备份域名
 * @param retryInfo
 */
function retry(retryInfo: RetryInfo) {
  const errorType = retryInfo.error.type
  if (
    errorType === NetWorkErrorType.NotConnected ||
    errorType === NetWorkErrorType.OtherConnectError
  ) {
    return request(retryInfo.params, { retryInfo })
  } else if (errorType === NetWorkErrorType.Timeout) {
    if (retryInfo.count === 1) {
      return request(retryInfo.params, { retryInfo })
    } else if (retryInfo.count === 2) {
      const backServer = serverList!.find(host => host !== baseUrl)
      if (backServer) {
        setBaseUrl(backServer)
      }
      return request(retryInfo.params, { retryInfo })
    }
  } else if (errorType === NetWorkErrorType.HttpError) {
    if (retryInfo.count === 1) {
      const backServer = serverList!.find(host => host !== baseUrl)
      if (backServer) {
        setBaseUrl(backServer)
      }
      return request(retryInfo.params, { retryInfo })
    }
  } else {
    return request(retryInfo.params, { retryInfo })
  }
}

export default request
