import config from '@config/config'
import { APP_VERSION } from '@constants/index'
import Taro, { getEnv, ENV_TYPE } from '@tarojs/taro'
import request from '@utils/request'
import dayjs from 'dayjs'
// import MtaH5 from 'mta-h5-analysis'
import debounce from 'lodash/debounce'
import dva from '@utils/dva'

const trackSvc = {
  isWeb: getEnv() === ENV_TYPE.WEB,
  track(eventName: string, eventParamName?: string | object) {
    if (this.isWeb) {
      if (typeof eventParamName === 'string') {
        // MtaH5.clickStat(eventName, { [eventParamName]: 'true' })
      } else {
        // MtaH5.clickStat(eventName)
      }
    } else {
      // eslint-disable-next-line
      wx.reportEvent(eventName, eventParamName || {})
    }
  },
  uploadPage: debounce(function() {
    if (this.isWeb) {
      // MtaH5.pgv()
    }
  }, 200),
  trackToBigData(params: {
    sn: string
    epid: string
    shop: number
    // userId: number
    billId?: string
    data: Array<{ key: string; value: string | number }>
    tag?: object
  }) {
    if (process.env.PRODUCT_ENVIRONMENT !== 'product') return

    const event = params.billId ? 'mp-ticket' : 'mp-ticket-cloud'
    const userId = dva.getState().user.mpUserId
    const _p = {
      product: 'eTicket',
      type: 'md',
      productVersion: APP_VERSION,
      event,
      userId,
      datetime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      ...params
    }
    return request(
      {
        'Content-Type': 'application/json',
        url: config.bigDataServer,
        data: _p
      },
      { slient: true }
    )
  }
}

export default trackSvc
