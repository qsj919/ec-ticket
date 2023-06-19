import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text, Input } from '@tarojs/components'
import DeleteIcon from '@/images/delete.png'

import './index.scss'

type OwnProps = {
  realPrice: number
  onCloseClick: () => void
  onCallback: (value: number) => void
}

interface State {}

export default class UpdatePrice extends React.Component<OwnProps, State> {
  static defaultProps = {
    realPrice: 0
  }
  priceValue: number

  onPriceInput = e => {
    this.priceValue = Number(e.detail.value)
  }

  onSaveClick = () => {
    this.props.onCallback(this.priceValue)
  }

  onClose = () => {
    this.props.onCloseClick()
  }

  render() {
    const { realPrice } = this.props
    return (
      <View className='update_price_mask' onClick={this.onClose}>
        <View className='update_price_mask__content' onClick={e => e.stopPropagation()}>
          <View className='update_price_mask__content__title'>
            <Text>改价</Text>
            <Image src={DeleteIcon} onClick={this.onClose} className='delete_icon' />
          </View>
          <View className='update_price_mask__content__price_item'>
            <Text className='update_price_mask__content__price_item__label'>原价</Text>
            <Text className='update_price_mask__content__price_item__value'>¥{realPrice}</Text>
          </View>
          <View className='update_price_mask__content__price_item'>
            <Text className='update_price_mask__content__price_item__label'>直播价格</Text>
            <Input
              type='digit'
              onInput={this.onPriceInput}
              placeholder='请输入'
              placeholderStyle='color: #ccc;'
              className='update_price_mask__content__price_item__input'
            />
          </View>
          <View className='update_price_mask__content__action' onClick={this.onSaveClick}>
            保存
          </View>
        </View>
      </View>
    )
  }
}
