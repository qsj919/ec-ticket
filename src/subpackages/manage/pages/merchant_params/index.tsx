import Taro from '@tarojs/taro'
import React from 'react'
import { WebView } from '@tarojs/components'
import dva from '@utils/dva'
import myLog from '@utils/myLog'

export default class MerchantParam extends React.Component {
  render() {
    const {
      merchantParams: { token, bizLine, bizSn, appId, callbackUrl, merchantId, storeId }
    } = dva.getState().goodsManage
    let _callbackUrl = encodeURIComponent(callbackUrl)
    const _params = `mktToken=${token}&bizLine=${bizLine}&bizId=${storeId}&callbackUrl=${_callbackUrl}&appId=${appId}&merchantId=${merchantId}`
    let _url = `https://hzdev.hzdlsoft.com/ecPayH5/#/portal?${_params}`
    if (process.env.PRODUCT_ENVIRONMENT === 'product') {
      _url = `https://merfin.hzdlsoft.com/merfinweb/#/portal?${_params}`
    }
    console.log(`进件h5 url:${_url}`)
    myLog.log(`进件h5url:${_url}`)
    return <WebView src={_url} />
  }
}
