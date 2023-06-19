/*
 * @Author: HuKai
 * @Date: 2019-08-27 08:54:39
 * @Last Modified by: Miao Yunliang
 */
// eslint-disable-next-line
import Taro from '@tarojs/taro'
import React, { Component } from 'react';
import { View } from '@tarojs/components'
import { getTaroParams } from '@utils/utils'
import styles from './landscapeModel.module.scss'

export default class TicketDetailPage extends Component {
  // config: Taro.Config = {
  //   navigationBarTitleText: '小票详情'
  // }

  // 2022 03:17  受主包限制影响  将小票详情页面移入分包 subpackages/ticket_detail
  componentDidMount() {
    if (process.env.TARO_ENV === 'weapp') {
      const { params = {} } = getTaroParams(Taro.getCurrentInstance?.())
      Taro.redirectTo({
        url: `/subpackages/ticket_detail/pages/eTicketDetail/landscapeModel?${this.getRouterParamsToUrl(
          params
        )}`
      })
    }
  }

  getRouterParamsToUrl = params => {
    let urls: Array<string> = []
    for (let k in params) {
      urls.push(`${k}=${params[k]}`)
    }
    return urls.join('&')
  }

  render() {
    return <View></View>
  }
}
