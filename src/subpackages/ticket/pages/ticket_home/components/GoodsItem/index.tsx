import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import DefaultGood from '@/images/default_good_pic2.png'
import ShoppingIcon from '@/images/shopping_icon.png'
import DownloadIcon from '@/images/download_icon_red.png'
import './index.scss'

type OwnProps = {
  goodsItem: {
    code: string
    name: string
    fileOrgUrl: string
    saleNum: number
    styleId: string
    marketFlag: string
  }
  actionClick: (type, data) => void
}

interface State {}

export default class GoodsItem extends React.Component<OwnProps, State> {
  static defaultProps = {
    goodsItem: {
      code: '',
      name: '',
      fileOrgUrl: '',
      sale_num: ''
    }
  }

  onActionClick = e => {
    const { type } = e.currentTarget.dataset
    const { goodsItem, actionClick } = this.props
    actionClick(type, goodsItem)
  }

  render() {
    const { goodsItem } = this.props
    const { fileOrgUrl, code, name, saleNum, marketFlag } = goodsItem
    return (
      <View className='goods_item_view'>
        <View className='goods_item_view__image' onClick={this.onActionClick} data-type='goods'>
          <Image
            src={(fileOrgUrl && fileOrgUrl.split(',')[0]) || DefaultGood}
            mode='aspectFill'
            className='goods_item_view__image___goodsImage'
          />
          <View className='sale_num'>累计{saleNum}件</View>
        </View>
        <View className='goods_item_view__styleName'>{name}</View>
        <View className='goods_item_view__styleCode'>{code}</View>
        <View className='goods_item_view__actionView'>
          <View
            className='goods_item_view__actionView___action'
            onClick={this.onActionClick}
            data-type='download'
          >
            <Image src={DownloadIcon} className='action_icon' />
            <Text>下载</Text>
          </View>
          {marketFlag === 'true' && (
            <View
              className='goods_item_view__actionView___action'
              onClick={this.onActionClick}
              data-type='replenishment'
            >
              <Image src={ShoppingIcon} className='action_icon' />
              <Text>补货</Text>
            </View>
          )}
        </View>
      </View>
    )
  }
}
