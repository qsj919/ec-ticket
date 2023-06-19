import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text, Image, Input, Block, ScrollView } from '@tarojs/components'
import EImage from '@components/EImage'
import DeleteIcon from '@/images/delete.png'
import cn from 'classnames'
import { IGoodsDetailFromApi, ISku } from '@@types/GoodsType'
import messageFeedback from '@services/interactive'
import DefaultGood from '@/images/default_good_pic.png'
import { round } from 'number-precision'
import TextInput from '@components/TextInput'
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
  onSaveClick?: (skus: SkuState[], styleId: number) => void
  onClose?: () => void
  from?: 'shop_goods' | 'use_goods' | string
}

export interface SkuState {
  _inputPrice?: number
  _discountValue?: number
  _usePriceType?: PriceType
  sku: ISku
}

interface State {
  skus: SkuState[]
  spuPriceRange: number[]
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

export default class SetGoodsSpecialFood extends React.Component<OwnProps, State> {
  static defaultProps = {
    priceTypeList: [],
    showPrice: false,
    data: {}
  }

  state = {
    spuPriceRange: [] as number[],
    skus: [] as SkuState[]
  }

  constructor(props) {
    super(props)
    const { data } = props
    const priceSet = new Set<number>()
    let min = data.price || 0,
      max = data.price || 0
    if (Array.isArray(data.skus)) {
      data.skus.forEach(s => {
        priceSet.add(s.originPrice || s.price)
      })
    }
    if (priceSet.size === 0) {
      priceSet.add(data.price)
    } else {
      min = Math.min(...priceSet)
      max = Math.max(...priceSet)
    }
    this.state = {
      skus: data.skus ? data.skus.map(sku => ({ sku })) : [],
      spuPriceRange: min === max ? [min] : [min, max]
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { data } = nextProps
    const priceSet = new Set<number>()
    let min = data.price || 0,
      max = data.price || 0
    if (Array.isArray(data.skus)) {
      data.skus.forEach(s => {
        priceSet.add(s.originPrice || s.price)
      })
    }
    if (priceSet.size === 0) {
      priceSet.add(data.price)
    } else {
      min = Math.min(...priceSet)
      max = Math.max(...priceSet)
    }
    console.log('data111', data)
    this.setState({
      skus: data.skus ? data.skus.map(sku => ({ sku })) : [],
      spuPriceRange: min === max ? [min] : [min, max]
    })
  }

  onMaskClick = () => {
    this.props.onClose && this.props.onClose()
  }

  onDiscountInput = (e, sku: SkuState) => {
    const { value } = e.detail
    this.setInputPriceBySku(value, sku)
  }

  onFoodDisClick = (sku: SkuState, value) => {
    this.setInputPriceBySku(value, sku)
  }

  setInputPriceBySku = (value, skuState: SkuState) => {
    const { data } = this.props
    const { _usePriceType, sku } = skuState
    const { price } = skuState.sku
    const { skus } = this.state
    let _price
    if (_usePriceType !== undefined && _usePriceType.name) {
      _price =
        ((sku[`stdPrice${_usePriceType.sid}`] || data[`stdPrice${_usePriceType.sid}`]) *
          Number(value)) /
        10
    } else {
      _price = (Number(price) * Number(value)) / 10
    }
    const newSkus = [...skus]
    skuState._inputPrice = round(_price, 3)
    skuState._discountValue = value
    this.setState({
      skus: newSkus
    })
  }

  onSelectPriceClick = skuState => {
    const { priceTypeList, data } = this.props
    const { skus } = this.state
    const { _discountValue, sku } = skuState
    const _priceTypeList = priceTypeList.filter(item => item.delflag === '1')
    const _itemList = _priceTypeList.map(
      item => item.name + '：' + (sku[`stdPrice${item.sid}`] || data[`stdPrice${item.sid}`])
    )
    Taro.showActionSheet({
      itemList: _itemList,
      success: ({ tapIndex }) => {
        const newSkus = [...skus]
        skuState._usePriceType = _priceTypeList[tapIndex]
        this.setState(
          {
            skus: newSkus
          },
          () => {
            const newSkus = [...skus]
            skuState._inputPrice = _discountValue
            this.setState({
              skus: newSkus
            })
            if (_discountValue > 0) {
              this.setInputPriceBySku(_discountValue, skuState)
            } else {
              skuState._inputPrice = String(
                round(
                  sku[`stdPrice${skuState._usePriceType.sid}`] ||
                    data[`stdPrice${skuState._usePriceType.sid}`],
                  3
                )
              )
            }
            //  else {
            // this.setState(prevState => ({
            //   inputPrice: String(
            //     round(this.props.data[`stdPrice${prevState.usePriceType.sid}`], 3)
            //   )
            // }))
            // }
          }
        )
      }
    })
  }

  onSpecialSave = () => {
    const { skus } = this.state
    const operatedSkus = skus.filter(
      sku => sku._inputPrice !== undefined && Number(sku._inputPrice) >= 0
    )

    let overFlag = false
    operatedSkus.forEach(skuState => {
      const { _inputPrice, sku } = skuState
      const discountPrice = round(
        Number(sku.originPrice || sku.price) - Number(_inputPrice || sku.price),
        3
      )

      if (discountPrice < 0) {
        overFlag = true
      }
    })

    if (overFlag) {
      this.showAlert('特价不能超过原始价格', true)
      return
    }
    if (operatedSkus.length > 0) {
      this.props.onSaveClick &&
        this.props.onSaveClick(operatedSkus, Number(this.props.data.styleId))
    } else {
      this.showAlert('请输入价格')
    }
    // if (inputPrice) {
    //   if (Number(inputPrice) >= Number(data.originPrice || data.price) && showPrice) {
    //     this.showAlert('特价不能超过原始价格', true)
    //     return
    //   }
    //   this.props.onSaveClick &&
    //     this.props.onSaveClick(Number(inputPrice), Number(this.props.data.styleId))
    // } else {
    //   this.showAlert('请输入价格')
    // }
  }

  showAlert = (title, toast = false) => {
    if (toast) {
      messageFeedback.showToast(title)
    } else {
      messageFeedback.showAlert(title, '提示', '好的')
    }
  }

  onPriceInput = (e, sku: SkuState) => {
    const { skus } = this.state
    const newSkus = [...skus]
    sku._inputPrice = e.target.value === '' ? undefined : Number(e.target.value)
    this.setState({ skus: newSkus })
  }

  render() {
    const { skus, spuPriceRange } = this.state
    const { data, priceTypeList, showPrice, from } = this.props
    const priceTypeLabel = priceTypeList.find(item => item.sid === String(data.priceType))

    console.log('skus', skus)
    return (
      <View className='set_goods_special_wapper' onClick={this.onMaskClick}>
        <View
          className='set_goods_special_wapper__content'
          style={{ height: 'auto' }}
          onClick={e => e.stopPropagation()}
        >
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
                    {spuPriceRange.length === 2
                      ? `${spuPriceRange[0]} ~ ${spuPriceRange[1]}`
                      : spuPriceRange[0]}
                  </Text>
                  {priceTypeLabel && (
                    <View className='goods_price_view__type'>{priceTypeLabel.name}</View>
                  )}
                </View>
              )}
            </View>
            <Image src={DeleteIcon} className='delete_icon' onClick={this.onMaskClick} />
          </View>
          <ScrollView
            scrollY
            className='set_goods_special_wapper__content__units'
            style={{ height: `${skus.length >= 2 ? 300 : 200}px` }}
            onTouchMove={e => e.stopPropagation()}
          >
            {skus.length > 0 &&
              skus.map(skuState => {
                const { sku, _inputPrice, _discountValue, _usePriceType } = skuState
                const { sizeName } = sku

                let discountPrice =
                  typeof _inputPrice === 'undefined'
                    ? sku.originPrice
                      ? Number(sku.originPrice) - Number(sku.price)
                      : 0
                    : Number(sku.originPrice || sku.price) - Number(_inputPrice || 0)

                discountPrice = round(discountPrice, 3)
                return (
                  <Block key={sizeName}>
                    <View className='set_goods_special_wapper__content__inputView'>
                      <View className='set_goods_special_wapper__content__inputView__label unit_label'>
                        特价价格({sizeName})
                      </View>
                      <TextInput
                        className='set_goods_special_wapper__content__inputView__input'
                        placeholderClass='placeholder_class'
                        placeholder='输入价格'
                        type='number'
                        value={_inputPrice}
                        onInput={e => this.onPriceInput(e, skuState)}
                      />
                      <View className='set_goods_special_wapper__content__inputView__label'>
                        优惠¥{discountPrice}
                      </View>
                    </View>
                    <View className='set_goods_special_wapper__content__setprice'>
                      <View className='set_goods_special_wapper__content__setprice__title'>
                        快速定价
                      </View>
                      <View className='col'>
                        <View className='set_goods_special_wapper__content__setprice__setView'>
                          <View
                            className='select_price_type set_price_view'
                            onClick={() => this.onSelectPriceClick(skuState)}
                          >
                            {_usePriceType ? _usePriceType.name : '价格类型'}
                            <Image src={AngleBottomGray} className='angle_bottom_icon' />
                          </View>
                          <View className='setView_label'>的</View>
                          <View className='price_discount set_price_view'>
                            <TextInput
                              type='number'
                              placeholderClass='placeholder_class'
                              placeholder='折扣数'
                              className='input_view'
                              value={
                                _discountValue !== undefined && _discountValue > 0
                                  ? String(_discountValue)
                                  : ''
                              }
                              onInput={e => this.onDiscountInput(e, skuState)}
                            />
                          </View>
                          <View className='setView_label'>折</View>
                        </View>
                        <View className='discount_bg_view'>
                          {disCountMenu.map(dis => (
                            <View
                              key={dis.value}
                              data-value={dis.value}
                              onClick={e => this.onFoodDisClick(skuState, dis.value)}
                              className={cn('discount_bg_view__item', {
                                ['discount_bg_view__item--active']: _discountValue === dis.value
                              })}
                            >
                              {dis.label}
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  </Block>
                )
              })}
          </ScrollView>
          <View className='set_goods_special_wapper__content__bottom__food'>
            <View
              className='set_goods_special_wapper__content__bottom__food_action'
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
