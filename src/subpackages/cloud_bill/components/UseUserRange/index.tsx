import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import { UserRangeType } from '@@types/base'
import './index.scss'

const menu = [
  {
    text: '全部客户可见',
    rule: 0
  },
  {
    text: '部分客户可见',
    rule: 1
  },
  {
    text: '部分客户不可见',
    rule: 2
  },
  {
    text: '取消',
    rule: -1
  }
]
export default class UserRange extends React.PureComponent<UserRangeType> {
  config = {
    navigationBarTitleText: '客户管理'
  }

  constructor(props) {
    super(props)
    this.state = {}
  }
  onItemClick = m => {
    const { onRangeItemClick } = this.props
    onRangeItemClick && onRangeItemClick(m)
  }
  render() {
    return (
      <View className='user_range_wrap'>
        {menu.map(m => {
          return (
            <View className='user_range_wrap_item' onClick={this.onItemClick.bind(this, m)}>
              {m.text}
            </View>
          )
        })}
      </View>
    )
  }
}
