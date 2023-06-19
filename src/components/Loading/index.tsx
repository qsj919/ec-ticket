import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image } from '@tarojs/components'
import pink from './pink_circle.png'
import gray from './gray_circle.png'

import './index.scss'

export default class Loading extends React.PureComponent {
  render() {
    return (
      <View className='loading-container'>
        <Image src={pink} className='circle circle--pink' />
        <Image src={gray} className='circle circle--gray' />
      </View>
    )
  }
}
