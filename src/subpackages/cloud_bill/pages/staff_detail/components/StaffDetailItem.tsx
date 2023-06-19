import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import './StaffDetailItem.scss'

type OwnProps = {
  item: {
    logo: string
    mpUserId: number
    nickName: string
    role?: string
    staffId?: number
    staffName?: string
  }
  btnIsVisible?: boolean
  onItemClick: Function
  activeTabIndex: number
}

interface State {}

type IProps = OwnProps

export default class StaffDetailItem extends React.Component<IProps, State> {
  static defaultProps = {
    data: {}
  }

  onItemClick(mpUserId) {
    this.props.onItemClick(mpUserId)
  }
  render() {
    const { item, activeTabIndex, btnIsVisible } = this.props
    return (
      <View className='staff_items_item' key={item.mpUserId}>
        <View className='staff_items_headImg'>
          <Image src={item.logo} className='head_portrait' />
        </View>
        <View className='staff_info'>
          <View>{item.nickName}</View>
          {item.staffName && (
            <View className='staff_role'>
              绑定员工：{item.staffName}
              <Text>（{item.role}）</Text>
            </View>
          )}
        </View>
        {btnIsVisible && (
          <View
            className='staff_items_btn'
            onClick={() => {
              this.onItemClick(item.mpUserId)
            }}
          >
            <Text className='staff_unbound'>{activeTabIndex === 0 ? '限制访问' : '允许访问'}</Text>
          </View>
        )}
      </View>
    )
  }
}
