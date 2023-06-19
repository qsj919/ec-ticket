import Taro from '@tarojs/taro'
import React from 'react'
import { WebView } from '@tarojs/components'
import config from '@config/config'
import { setNavigationBarTitle } from '@utils/cross_platform_api'
import dva from '@utils/dva'
import { getTaroParams } from '@utils/utils'

export default class CloudBillGuideH5 extends React.Component {
  componentDidMount() {
    setNavigationBarTitle('云单续费')
  }

  render() {
    // const url = config.cloudBillGuideH5Url + new Date().getTime()
    let { mktToken = '', shopId } = getTaroParams(Taro.getCurrentInstance?.())
    // const url =
    //   config.amktH5 +
    //   '/amktweb/portal/#/cloudBill?time=' +
    //   new Date().getTime() +
    //   '&mktToken=' +
    //   mktToken +
    //   '&shopId=' +
    //   shopId +
    //   '&hideNav=1&skipToBuy=1'
    const wxOpenId = dva.getState().user.wxOpenId
    // http://localhost:8088/#/cloudBill
    const url =
      config.amktH5 +
      '/amktweb/portal/#/cloudBill?time=' +
      new Date().getTime() +
      '&mktToken=' +
      mktToken +
      '&shopId=' +
      shopId +
      '&hideNav=1&skipToBuy=1&iswx=1&isRenew=1' +
      '&payAppId=' +
      config.miniAppId +
      '&wxOpenId=' +
      wxOpenId

    console.log(url)
    return <WebView src={url}></WebView>
  }
}
