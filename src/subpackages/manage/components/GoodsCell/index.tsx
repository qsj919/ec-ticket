import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import { ISku, ISpu } from '@@types/GoodsType'
import EImage from '@components/EImage'
import DefaultGood from '@/images/default_good_pic.png'
import { round } from 'number-precision'

import SortIcon from '../../images/sort_icon.png'

import './index.scss'

type OwnProps = {
  type: 'hot' | 'special' | string
  sort: boolean
  data: ISpu
  needShowDiscountPrice?: boolean
  onDeleteClick?: (spuId: number) => void
  onSettingClick?: (spuId: number) => void
  onManageClick?: (spuId: number) => void
}

interface State {}

export default class GoodsCell extends React.Component<OwnProps, State> {
  static defaultProps = {
    sort: false,
    data: {}
  }

  getMaxDiscountPriceRange(skus: ISku[]) {
    let maxDiscountDiff
    let maxDiscountPrice = {
      price: undefined as number | undefined,
      origin: undefined as number | undefined
    }

    skus.forEach(s => {
      if (s.originPrice !== undefined && s.price !== undefined) {
        if (maxDiscountDiff === undefined) {
          maxDiscountDiff = s.originPrice - s.price
          maxDiscountPrice.origin = s.originPrice
          maxDiscountPrice.price = s.price
        } else {
          if (maxDiscountDiff < s.originPrice - s.price) {
            maxDiscountDiff = s.originPrice - s.price
            maxDiscountPrice = {
              origin: s.originPrice,
              price: s.price
            }
          }
        }
      }
    })
    return maxDiscountPrice
  }

  render() {
    const {
      type,
      sort,
      data,
      onDeleteClick,
      onSettingClick,
      onManageClick,
      needShowDiscountPrice
    } = this.props
    let price = data.price
    let originPrice = data.originPrice

    if (needShowDiscountPrice && Array.isArray(data.skus) && data.skus.length > 0) {
      const p = this.getMaxDiscountPriceRange(data.skus)
      price = p.price ? String(p.price!) : data.price
      originPrice = p.origin
    }
    return (
      <View className='goods_cell'>
        <View className='goods_cell__image'>
          {data.imgUrls ? (
            <EImage src={data.imgUrls} />
          ) : (
            <Image src={DefaultGood} style='width:100%;height:100%' />
          )}
        </View>
        <View className='goods_cell__content'>
          <View className='goods_cell__content__goodsName'>{data.name || ''}</View>
          <View className='goods_cell__content__goodsCode'>{data.code || ''}</View>
          <View className='aic'>
            <Text className='goods_cell__content__goodsPrice'>
              ¥{price ? round(price, 3) : '0'}
            </Text>
            {type === 'special' && (
              <Text className='goods_cell__content__linethrough'>
                ¥{originPrice ? round(originPrice, 3) : '0'}
              </Text>
            )}
          </View>
        </View>
        {sort && <Image src={SortIcon} className='sort_icon' />}
        {!sort &&
          (type === 'hot' ? (
            <View className='goods_cell__actionView'>
              <View
                className='goods_cell__actionView__action'
                onClick={() => {
                  if (onDeleteClick) {
                    onDeleteClick(data.styleId)
                  }
                }}
              >
                移除
              </View>
            </View>
          ) : (
            <View className='goods_cell__actionView'>
              <View
                className='goods_cell__actionView__action'
                onClick={() => {
                  if (onSettingClick) {
                    onSettingClick(data.styleId)
                  }
                }}
              >
                商品设置
              </View>
              <View
                className='goods_cell__actionView__action'
                onClick={() => {
                  if (onManageClick) {
                    onManageClick(data.styleId)
                  }
                }}
              >
                管理
              </View>
            </View>
          ))}
      </View>
    )
  }
}
