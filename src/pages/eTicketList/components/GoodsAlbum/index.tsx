import Taro from '@tarojs/taro'
import React, { memo, FC, useState, useCallback, useEffect } from 'react'
import { View, Image, Text } from '@tarojs/components'
import { DefaultDispatchProps } from '@@types/model_state'
import DefaultGood from '@/images/default_good_pic2.png'
import GoodsItemBg from '@/images/goods_album_item_bg.png'
import { daysDistance } from '@utils/utils'
import EmptyView from '@components/EmptyView'
import { round } from 'number-precision'
import { EsDresGoods, ShopBillListItem } from '../../types'

import './index.scss'

const GOODS_TABS_MENU = [
  {
    label: '最新',
    value: 'latestProDate'
  },
  {
    label: '最多',
    value: 'totalNum'
  }
]

interface OwnProps {
  sortTabClick?: (sortType: string) => void
  sortViewVisible?: boolean
  goodsData: Array<EsDresGoods>
  onItemClick?: (goods: ShopBillListItem) => void
  emptyView?: boolean
  sortType?: string
  onShopClick?(goods: ShopBillListItem): void
}

function GoodsAlbum({
  onItemClick,
  sortTabClick,
  goodsData,
  sortViewVisible,
  emptyView,
  sortType: _sortType,
  onShopClick
}: OwnProps & DefaultDispatchProps) {
  const [sortType, setSortType] = useState(_sortType || 'latestProDate')

  const goodsTabsClick = useCallback(
    e => {
      setSortType(e.currentTarget.dataset._value)
      sortTabClick && sortTabClick(e.currentTarget.dataset._value)
    },
    [sortTabClick]
  )

  const goodsItemClick = useCallback(
    e => {
      const { goods } = e.currentTarget.dataset
      onItemClick && onItemClick(goods)
    },
    [onItemClick]
  )

  // useEffect(() => {
  //   console.log(sortType, 'sortType')
  //   console.log(goodsData, 'goodsData===')
  // }, [sortType, goodsData])

  const getDateLabel = date => {
    const day = parseInt(daysDistance(date).toString())
    const month = parseInt((day / 30).toString())
    const year = parseInt((month / 12).toString())
    if (day === 0) {
      return '今天'
    }
    if (day === 1) {
      return '昨天'
    }
    if (day > 30) {
      if (month > 12) {
        return `${year}年前`
      }
      return `${month}月前`
    }
    return `${day}天前`
  }

  // function _onShopClick(e, goods) {
  //   e.stopPropagation()
  //   onShopClick && onShopClick(goods)
  // }

  return (
    <View className='goods_list_content'>
      {!sortViewVisible && goodsData.length && (
        <View className='tabs_viewer'>
          <View className='tabs_viewer__timer'>近3个月拿货相册</View>
          <View className='tabs_viewer__orderTabs'>
            {GOODS_TABS_MENU.map(item => (
              <View
                key={item.value}
                className='tabs_viewer__orderTabs___item'
                style={{
                  backgroundColor: `${sortType === item.value ? '#fff' : ''}`,
                  boxShadow: `${sortType === item.value ? '0 3px 7px rgba(0, 0, 0, 0.15)' : ''}`
                }}
                data-_value={item.value}
                onClick={goodsTabsClick}
              >
                {item.label}
              </View>
            ))}
          </View>
        </View>
      )}
      <View className='goods_list_content__goodsList'>
        {goodsData.map(goods => (
          <View
            key={goods.styleId}
            className='goods_item_view'
            data-goods={goods}
            onClick={goodsItemClick}
          >
            <Image src={GoodsItemBg} className='goods_album_item_bg' />
            <View className='goods_item_view__image'>
              <Image
                src={(goods.imgUrl && goods.imgUrl.split(',')[0]) || DefaultGood}
                mode='aspectFill'
                className='goods_item_view__image___goodsImage'
              />
              <View className='sale_num'>累计{round(goods.totalNum, 4)}件</View>
            </View>
            <View className='goods_item_view__goodsinfo'>
              <Text className='goods_item_view__goodsinfo___styleName'>{goods.styleName}</Text>
              <Text className='goods_item_view__goodsinfo___styleCode'>{goods.styleCode}</Text>
            </View>
            <View
              className='goods_item_view__shopinfo'
              onClick={e => {
                e.stopPropagation()
                onShopClick && onShopClick(goods)
              }}
            >
              <View style='display: flex;'>
                <Image
                  src={goods.shopLogo || DefaultGood}
                  className='goods_item_view__shopinfo___shoplogo'
                />
                <Text className='goods_item_view__shopinfo___shopName'>{goods.shopName}</Text>
              </View>
              <Text className='take_good_time'>{getDateLabel(goods.proDate)}</Text>
            </View>
          </View>
        ))}
      </View>
      {goodsData.length === 0 && emptyView && <EmptyView />}
    </View>
  )
}

export default memo(GoodsAlbum) as FC<OwnProps>

GoodsAlbum.defaultProps = {
  goodsData: [],
  sortViewVisible: false,
  emptyView: true
}
