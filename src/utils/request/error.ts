export enum NetWorkErrorType {
  NotConnected = 'noNetwork', // 网络未连接
  Timeout = 'timeout', // 连接超时
  OtherConnectError = 'others', // 其它连接错误
  HttpError = 'http', // reponseCode != 200
  BusinessError = 'business', // 请求成功，业务错误,
  UnknownError = 'unknown', // 未知错误
  RequestAbort = 'canceled' // 请求被取消
}

export class YKError extends Error {
  code: number

  type: NetWorkErrorType

  // 错误消息不提示
  notShow: boolean = false

  // needRetry: boolean = false // 是否需要重试

  constructor(message: string, type: NetWorkErrorType, code: number = 0) {
    super(message)
    this.type = type
    this.code = code
  }
}
