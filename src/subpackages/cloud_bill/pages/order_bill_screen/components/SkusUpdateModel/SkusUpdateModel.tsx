import Taro from '@tarojs/taro'
import React from 'react'
import { Text, View, Image, Input } from '@tarojs/components'
import { OrderSku } from '@@types/GoodsType'
import ReduceIcon from '../../../../images/order_reduce_icon.png'
import PlusIcon from '../../../../images/order_plus_icon.png'
import './SkusUpdateModel.scss'

type Props = {
  skus: Array<OrderSku>
  onCancelClick: () => void
  onSaveClick: () => void
  onActionClick: (type, index) => void
  onPriceUpdate: (value: string) => void
  onPriceBlur: (value: string) => void
}

type State = {}

export default class SkusUpdateModel extends React.Component<Props, State> {
  static defaultProps = {
    skus: [
      {
        colorName: '',
        num: 0,
        price: 0,
        money: '',
        sizeName: '',
        sizeid: -1
      }
    ]
  }

  onCancelClick = e => {
    e.stopPropagation()
    this.props.onCancelClick && this.props.onCancelClick()
  }

  onSaveClick = e => {
    e.stopPropagation()
    this.props.onSaveClick && this.props.onSaveClick()
  }

  onActionClick = e => {
    e.stopPropagation()
    const { type, index } = e.currentTarget.dataset
    this.props.onActionClick && this.props.onActionClick(type, index)
  }

  onModelClick = e => {
    e.stopPropagation()
  }

  onPriceInput = e => {
    this.props.onPriceUpdate && this.props.onPriceUpdate(e.detail.value)
  }

  onPriceBlur = e => {
    this.props.onPriceBlur && this.props.onPriceBlur(e.detail.value)
  }

  render() {
    const { skus } = this.props
    return (
      <View className='mask' onClick={this.onCancelClick}>
        <View className='skus_update_model' onClick={this.onModelClick}>
          <View className='skus_update_model_header'>
            <Text className='header_label'>修改商品</Text>
            <Text className='header_cancel' onClick={this.onCancelClick}>
              取消
            </Text>
          </View>

          <View className='skus_update_model_priceView'>
            <Text className='price_label'>价格</Text>
            <Input
              className='price_content'
              onInput={this.onPriceInput}
              onBlur={this.onPriceBlur}
              value={skus && skus[0].price.toString()}
            />
          </View>

          <View className='skus_update_model_skus'>
            {skus.map((sku, index) => (
              <View key={index} className='skus_update_model_skus__sku'>
                <View className='sku_labelView'>
                  <View className='sku'>{sku.colorName}</View>
                  <View className='sku_size'>{sku.sizeName}</View>
                </View>
                <View className='sku_actionView'>
                  <View
                    className='action_btn'
                    data-index={index}
                    data-type='reduce'
                    onClick={this.onActionClick}
                  >
                    <Image src={ReduceIcon} className='reduces_icon' />
                  </View>
                  <Text className='sku_action_price'>{sku.num}</Text>
                  <View
                    className='action_btn'
                    data-index={index}
                    data-type='plus'
                    onClick={this.onActionClick}
                  >
                    <Image src={PlusIcon} className='reduces_icon' />
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View className='skus_update_model_saveAction' onClick={this.onSaveClick}>
            保存
          </View>
        </View>
      </View>
    )
  }
}
