import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View } from '@tarojs/components'
import config from '../../config/config'

type PropsType = {}
type StateType = {}
export default class Index extends Component<PropsType, StateType> {
  // UNSAFE_componentWillMount() {
  //   const params = this.$router.params
  //   const state = `${params.sn}_${params.epid}_${params.billid}`
  //   const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.wxAppId}&redirect_uri=${window.location.origin}/slb/ticket/share.do&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`
  //   window.location.href = url
  // }
  render() {
    return <View></View>
  }
}
