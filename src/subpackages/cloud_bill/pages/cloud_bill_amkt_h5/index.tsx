import Taro from '@tarojs/taro'
import React from 'react'
import { WebView } from '@tarojs/components'
import config from '@config/config'
import { getTaroParams } from '@utils/utils'
import { setNavigationBarTitle } from '@utils/cross_platform_api'

export default class CloudBillGuideH5 extends React.Component {
  componentDidMount() {
    setNavigationBarTitle('云单充值')
    window.addEventListener('message', this.receiveMessage, false)
  }

  handleMessage(e) {
    console.error(e)
  }

  receiveMessage(event) {
    let json = event.data

    if (typeof json === 'string') {
      try {
        var obj = JSON.parse(json)
        if (typeof obj === 'object' && obj.eventType === 'amktH5Close') {
          let pages = Taro.getCurrentPages() // 获取当前的页面栈
          let prevPage = pages[pages.length - 2] //  获取上一页面
          prevPage.isAmktBack = 1 // 设置上一个页面的值
          Taro.navigateBack({ delta: 1 })
        }
      } catch (e) {
        console.log(e)
      }
    }
  }

  render() {
    let { mktToken = '', shopId } = getTaroParams(Taro.getCurrentInstance?.())
    const url =
      config.amktH5 +
      '/amktweb/portal/#/cloudBill?time=' +
      new Date().getTime() +
      '&mktToken=' +
      mktToken +
      '&shopId=' +
      shopId +
      '&hideNav=1&skipToBuy=1'

    // const url =
    //   'http://172.16.161.45:8088/#/cloudBill?mktToken=mkt_d7914389f4e24636a9cde01f12e375fd&json=%7B%22showEsignJumpBtn%22%3Atrue%7D&appName=slh&version=10.76&shopId=113797&staffId=440753&sn=1509454373920&epid=21665&hideNav=1&isWxMiniProgram=1'
    return (
      // eslint-disable-next-line react/forbid-elements
      <iframe
        src={url}
        onMessage={this.handleMessage}
        style={{ width: '100%', height: '100vh' }}
      ></iframe>
    )
  }
}
