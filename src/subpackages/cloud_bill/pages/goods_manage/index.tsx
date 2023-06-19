import Taro, { eventCenter } from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import { setNavigationBarTitle } from '@utils/cross_platform_api'
import GoodsManageList from '../../components/GoodsManageList'

export default class GoodsManagePage extends React.PureComponent {
  config = {
    navigationBarTitleText: '货品管理',
    onReachBottomDistance: 250
  }

  onReachBottom() {
    eventCenter.trigger('goods_manage_list_on_reach_bottom', 'op')
  }
  componentDidShow() {
    setNavigationBarTitle('货品管理')
  }

  render() {
    return <GoodsManageList type='op' />
  }
}
