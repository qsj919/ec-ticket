import { isWeb } from '@utils/cross_platform_api'
import Taro from '@tarojs/taro'

export const NATIVE_EVENTS = {
  GO_CLOUD_ORDER_Bill: 'goCloudOrderBill'
}

function onGetMessage(event: MessageEvent<any>) {
  try {
    const data = JSON.parse(event.data)
    switch (data.type) {
      case NATIVE_EVENTS.GO_CLOUD_ORDER_Bill:
        const pages = Taro.getCurrentPages()

        const currentPage = pages[pages.length - 1]
        if (currentPage.$router.path.includes('cloud_bill/pages/order_bill_screen/index')) {
          console.log('triger!!!')
          Taro.eventCenter.trigger(NATIVE_EVENTS.GO_CLOUD_ORDER_Bill)
        } else {
          Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/order_bill_screen/index' })
        }
        break
    }
  } catch (e) {
    // ignore
  }
}

export const cloudOrderBillEvent = {
  addEventListener() {
    if (isWeb()) {
      window.addEventListener('message', onGetMessage)
    }
  },
  removeEventListener() {
    if (isWeb()) {
      window.removeEventListener('message', onGetMessage)
    }
  }
}
