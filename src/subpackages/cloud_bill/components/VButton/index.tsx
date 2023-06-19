/**
 * @author GaoYuJian
 * @create date 2018-12-06
 * @desc Image、Text垂直排版
 */
import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Image, Text } from '@tarojs/components'

import './vbutton.scss'
import WithBadge from '../WithBadge/index'

type Props = {
  customerStyle?: string
  imageStyle?: string
  textStyle?: string
  src: string
  title: string | number
  badge?: string | number
  maxBadge?: number
  onClick?: () => void
}

export default class VButton extends Component<Props> {
  onClick = () => {
    const { onClick } = this.props
    if (onClick) {
      onClick()
    }
  }

  render(): any {
    const { customerStyle, imageStyle, textStyle, src, title, badge, maxBadge } = this.props
    return (
      <View className='v_button' style={customerStyle} onClick={this.onClick}>
        <WithBadge value={badge ? badge : 0} maxValue={maxBadge} position='bottom'>
          <View className='container'>
            <Image className='v_button_image' style={imageStyle} src={src} />
            <Text style={textStyle}>{title}</Text>
          </View>
        </WithBadge>
      </View>
    )
  }
}
