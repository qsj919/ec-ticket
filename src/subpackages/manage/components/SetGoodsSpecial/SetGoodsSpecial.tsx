import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import EImage from '@components/EImage'
import DeleteIcon from '@/images/delete.png'
import cn from 'classnames'
import { IGoodsDetailFromApi } from '@@types/GoodsType'
import messageFeedback from '@services/interactive'
import DefaultGood from '@/images/default_good_pic.png'
import { round } from 'number-precision'

import AngleBottomGray from '../../images/angle_bottom_gray.png'
import './SetGoodsSpecial.scss'

interface PriceType {
  delflag: string
  flagname: string
  id: string
  name: string
  sid: string
}

type OwnProps = {
  showPrice?: boolean
  data: IGoodsDetailFromApi
  priceTypeList: Array<PriceType>
  onSaveClick?: (price: number, styleId: number) => void
  onClose?: () => void
  from?: 'shop_goods' | 'use_goods' | string
}

interface State {
  discountValue: number
  usePriceType: PriceType
  inputPrice: string
}

const disCountMenu = [
  {
    label: '6折',
    value: 6
  },
  {
    label: '7折',
    value: 7
  },
  {
    label: '8折',
    value: 8
  },
  {
    label: '9折',
    value: 9
  }
]

export default class SetGoodsSpecial extends React.Component<OwnProps, State> {
  static defaultProps = {
    priceTypeList: [],
    showPrice: false,
    data: {}
  }

  state = {
    discountValue: -1,
    usePriceType: {} as PriceType,
    inputPrice: ''
  }

  onMaskClick = () => {
    this.props.onClose && this.props.onClose()
  }

  onDiscountInput = e => {
    const { value } = e.detail
    this.setInputPrice(value)
  }

  onDisClick = e => {
    const { value } = e.currentTarget.dataset
    this.setInputPrice(value)
  }

  setInputPrice = value => {
    const { data } = this.props
    const { usePriceType } = this.state
    let _price
    if (this.state.usePriceType.name) {
      _price = (data[`stdPrice${usePriceType.sid}`] * Number(value)) / 10
    } else {
      _price = (Number(data.price) * Number(value)) / 10
    }
    this.setState({
      inputPrice: String(round(_price, 3)),
      discountValue: Number(value)
    })
  }

  onSelectPriceClick = () => {
    const { priceTypeList, data } = this.props
    const _priceTypeList = priceTypeList.filter(item => item.delflag === '1')
    const _itemList = _priceTypeList.map(item => item.name + '：' + data[`stdPrice${item.sid}`])
    Taro.showActionSheet({
      itemList: _itemList,
      success: ({ tapIndex }) => {
        this.setState(
          {
            usePriceType: _priceTypeList[tapIndex]
          },
          () => {
            if (this.state.discountValue > 0) {
              this.setInputPrice(this.state.discountValue)
            } else {
              this.setState(prevState => ({
                inputPrice: String(
                  round(this.props.data[`stdPrice${prevState.usePriceType.sid}`], 3)
                )
              }))
            }
          }
        )
      }
    })
  }

  onSpecialSave = () => {
    const { inputPrice } = this.state
    const { data, showPrice } = this.props
    if (inputPrice) {
      if (Number(inputPrice) >= Number(data.originPrice || data.price) && showPrice) {
        this.showAlert('特价不能超过原始价格', true)
        return
      }
      this.props.onSaveClick &&
        this.props.onSaveClick(Number(inputPrice), Number(this.props.data.styleId))
    } else {
      this.showAlert('请输入价格')
    }
  }

  showAlert = (title, toast = false) => {
    if (toast) {
      messageFeedback.showToast(title)
    } else {
      messageFeedback.showAlert(title, '提示', '好的')
    }
  }

  onPriceInput = e => {
    this.setState({
      inputPrice: e.detail.value
    })
  }

  render() {
    const { discountValue, usePriceType, inputPrice } = this.state
    const { data, priceTypeList, showPrice, from } = this.props
    const priceTypeLabel = priceTypeList.find(item => item.sid === String(data.priceType))
    return (
      <View className='set_goods_special_wapper' onClick={this.onMaskClick}>
        <View className='set_goods_special_wapper__content' onClick={e => e.stopPropagation()}>
          <View className='set_goods_special_wapper__content__header'>
            <View className='set_goods_special_wapper__content__header__headImage'>
              {data.imgUrls ? (
                <EImage mode='aspectFill' src={data.imgUrls} />
              ) : (
                <EImage mode='aspectFill' src={data.imgUrl || DefaultGood} />
              )}
            </View>
            <View className='set_goods_special_wapper__content__header__goodsInfo'>
              <View className='goods_name'>{data.name}</View>
              {showPrice && (
                <View className='goods_price_view'>
                  <Text className='goods_price_view__label'>原始价格</Text>
                  <Text className='goods_price_view__price'>
                    <Text className='price_icon'>¥</Text>
                    {data.originPrice || data.price}
                  </Text>
                  {priceTypeLabel && (
                    <View className='goods_price_view__type'>{priceTypeLabel.name}</View>
                  )}
                </View>
              )}
            </View>
            <Image src={DeleteIcon} className='delete_icon' onClick={this.onMaskClick} />
          </View>
          <View className='set_goods_special_wapper__content__inputView'>
            <View className='set_goods_special_wapper__content__inputView__label special_label'>
              特价价格
            </View>
            <Input
              className='set_goods_special_wapper__content__inputView__input'
              placeholderClass='placeholder_class'
              placeholder='输入价格'
              type='number'
              value={inputPrice}
              onInput={this.onPriceInput}
            />
            <View className='set_goods_special_wapper__content__inputView__label'>
              优惠¥
              {round(Number(data.originPrice || data.price) - Number(inputPrice || data.price), 3)}
            </View>
          </View>
          <View className='set_goods_special_wapper__content__setprice'>
            <View className='set_goods_special_wapper__content__setprice__title'>快速定价</View>
            <View className='col'>
              <View className='set_goods_special_wapper__content__setprice__setView'>
                <View
                  className='select_price_type set_price_view'
                  onClick={this.onSelectPriceClick}
                >
                  {usePriceType.name || '价格类型'}
                  <Image src={AngleBottomGray} className='angle_bottom_icon' />
                </View>
                <View className='setView_label'>的</View>
                <View className='price_discount set_price_view'>
                  <Input
                    type='number'
                    placeholderClass='placeholder_class'
                    placeholder='折扣数'
                    className='input_view'
                    value={discountValue > 0 ? String(discountValue) : ''}
                    onInput={this.onDiscountInput}
                  />
                </View>
                <View className='setView_label'>折</View>
              </View>
              <View className='discount_bg_view'>
                {disCountMenu.map(dis => (
                  <View
                    key={dis.value}
                    data-value={dis.value}
                    onClick={this.onDisClick}
                    className={cn('discount_bg_view__item', {
                      ['discount_bg_view__item--active']: discountValue === dis.value
                    })}
                  >
                    {dis.label}
                  </View>
                ))}
              </View>
            </View>
          </View>
          <View className='set_goods_special_wapper__content__bottom'>
            <View
              className='set_goods_special_wapper__content__bottom_action'
              onClick={this.onSpecialSave}
            >
              {from === 'use_goods' ? '添加为特价商品' : '保存'}
            </View>
          </View>
        </View>
      </View>
    )
  }
}
