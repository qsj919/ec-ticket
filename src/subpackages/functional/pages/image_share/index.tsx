import { Image } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import bg from '../../images/share_model_img.png'

export default class UpdateModelImage extends React.PureComponent {
  // config = {
  //   navigationBarTitleText: '云单'
  // }

  render() {
    return <Image style={{ width: '750rpx', height: '1610rpx' }} src={bg} />
  }
}
