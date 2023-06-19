import Taro from '@tarojs/taro'
import React from 'react'
import { WebView } from '@tarojs/components'
import config from '@config/config'
import { setNavigationBarTitle } from '@utils/cross_platform_api'

export default class CloudBillGuideH5 extends React.Component {
  componentDidMount() {
    setNavigationBarTitle('新手指南')
  }

  render() {
    const url = config.cloudBillGuideH5Url + new Date().getTime()
    return <WebView src={url}></WebView>
  }
}
