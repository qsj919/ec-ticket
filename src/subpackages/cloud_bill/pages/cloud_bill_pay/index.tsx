import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import messageFeedback from '@services/interactive'
import dva from '@utils/dva'
import { getTaroParams } from '@utils/utils'

export default class PayView extends React.PureComponent {
  componentDidMount(): void {
    const p = getTaroParams(Taro.getCurrentInstance?.()).s

    const params = JSON.parse(decodeURIComponent(p))

    // eslint-disable-next-line
    wx.requestPayment({
      ...params,
      success(res) {
        Taro.hideLoading()
        // _this.loadData(billId)
        dva.getDispatch()({ type: 'goodsManage/fetchCloudExpire' })
        Taro.navigateBack({
          delta: 2
        })
      },
      fail(res) {
        console.log(`支付fail回调`, res)
        Taro.hideLoading()
        messageFeedback.showToast('支付失败')
      }
    })
  }

  render() {
    return <View></View>
  }
}
