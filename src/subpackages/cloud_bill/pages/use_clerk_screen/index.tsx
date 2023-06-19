import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import dva from '@utils/dva'
import { setNavigationBarTitle } from '@utils/cross_platform_api'
import './index.scss'

export default class UseClerkScreen extends React.Component {
  // config = {
  //   navigationBarTitleText: '选择店员'
  // }

  componentDidMount() {
    const { stafflist } = dva.getState().goodsManage
    if (!stafflist) {
      dva.getDispatch()({
        type: 'goodsManage/selectShopStaffList',
        payload: {
          curpageno: 1,
          noBindFlag: false
        }
      })
    }
  }
  componentDidShow() {
    setNavigationBarTitle('选择店员')
  }

  onClerkItemClick = e => {
    const { id, name } = e.currentTarget.dataset
    Taro.eventCenter.trigger('USE_CLERK', {
      id,
      name
    })
    Taro.navigateBack()
  }

  render() {
    const { stafflist } = dva.getState().goodsManage
    return (
      <View className='use_clerk_container'>
        <View className='use_clerk_list'>
          {stafflist.map(staff => (
            <View
              key={staff.id}
              className='use_clerk_list_item'
              data-id={staff.id}
              data-name={staff.name}
              onClick={this.onClerkItemClick}
            >
              {staff.name}
            </View>
          ))}
        </View>
      </View>
    )
  }
}
