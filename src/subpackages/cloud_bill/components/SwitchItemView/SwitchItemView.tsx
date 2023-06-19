import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text, Switch, Image } from '@tarojs/components'
import rightIcon from '../../images/angle_right_gray_40.png'
import './SwitchItemView.scss'
import { MODE } from './mode'

type OwnProps = {
  title?: string
  explain?: string
  defaultValue: any
  onItemClick: Function
  mode?: number
  switchDisable?: boolean
}

export default class SwitchItemView extends React.Component<OwnProps> {
  defaultProps = {
    title: '',
    explain: '',
    mode: -1
  }

  renderItem() {
    const { onItemClick, defaultValue, mode, switchDisable } = this.props
    switch (mode) {
      case MODE.switch: {
        return (
          <Switch checked={defaultValue} onChange={e => onItemClick(e)} disabled={switchDisable} />
        )
      }
      case MODE.selectBox: {
        return (
          <View onClick={() => onItemClick()} className='selectText'>
            <Text>{defaultValue}</Text>
            <Image className='righticon' src={rightIcon} />
          </View>
        )
      }
    }
  }
  render() {
    const { title, explain } = this.props
    return (
      <View className='switch_item_view_center'>
        <View className='switch_item_view_center_item'>
          <View className='switch_item_view_center_item_first'>
            <Text>{title}</Text>
            <Text className='switch_item_view_center_item_first_gray'>{explain}</Text>
          </View>
          {this.renderItem()}
        </View>
      </View>
    )
  }
}
