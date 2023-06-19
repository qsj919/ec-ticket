import Taro from '@tarojs/taro'
import React from 'react'
import { WebView } from '@tarojs/components'
import dva from '@utils/dva'
export default class MerchantWallet extends React.Component {
  render() {
    const {
      merchantParams: { token, bizLine, merchantId }
    } = dva.getState().goodsManage
    const _params = `token=${encodeURIComponent(token)}&bizLine=${bizLine}&merchantId=${merchantId}`
    let _url = `https://hzdev.hzdlsoft.com/ecPayH5/#/walletHome?${_params}`
    if (process.env.PRODUCT_ENVIRONMENT === 'product') {
      _url = `https://merfin.hzdlsoft.com/merfinweb/#/walletHome?${_params}`
    }
    console.log('state', dva.getState())
    return <WebView src={_url}></WebView>
  }
}
