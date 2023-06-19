import Taro, { eventCenter } from '@tarojs/taro'
import React from 'react'
import { setNavigationBarTitle } from '@utils/cross_platform_api'
import GoodsManageList from '../../components/GoodsManageList'

export default class GoodsManagePage extends React.PureComponent {
  config = {
    navigationBarTitleText: '货品编辑'
  }

  componentDidShow() {
    setNavigationBarTitle('货品编辑')
  }

  onReachBottom() {
    eventCenter.trigger('goods_manage_list_on_reach_bottom', 'op')
  }

  render() {
    return <GoodsManageList type='edit' />
  }
}
