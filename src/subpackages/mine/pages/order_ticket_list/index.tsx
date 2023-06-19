/*
 * @Author: HuKai
 * @Date: 2019-08-24 09:55:09
 */
// eslint-disable-next-line
import Taro from '@tarojs/taro'
import React, { Component, ComponentType } from 'react'
import { View, Image, ScrollView, Block } from '@tarojs/components'
import CustomNavigation from '@components/CustomNavigation'
import { getTaroParams } from '@utils/utils'
import TicketList from './components/TicketList'

class Index extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  // config = {
  //   // navigationBarTitleText: '订货单'
  //   navigationStyle: 'custom'
  // }

  onBackClick = () => {
    const { from = '' } = getTaroParams(Taro.getCurrentInstance?.())
    if (from === 'landPage') {
      Taro.switchTab({ url: '/pages/eTicketList/index' })
    } else {
      Taro.navigateBack()
    }
  }

  render() {
    return (
      <CustomNavigation stickyTop={false} title='订货单' enableBack onBackClick={this.onBackClick}>
        <View style={{ height: '100%' }}>
          <TicketList ticketType={2} />
        </View>
      </CustomNavigation>
    )
  }
}

export default Index as ComponentType
