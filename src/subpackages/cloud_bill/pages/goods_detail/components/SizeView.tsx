/**
 * @author GaoYuJian
 * @create date 2018-11-21
 * @desc
 */
import Taro from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { View, Text } from '@tarojs/components'
// import { getCustomSizeCharacter } from '@utils/localizableString'
import i18n from '@@/i18n'
import { IColorSizeItem, IGoodsDetail } from '@@types/GoodsType'

import SizeItem from './SizeItem'
// import { State, TipInfo } from '../type'
import './size.scss'

type Props = {
  /**
   * normal: 普通模式  group: 按组开单 kid: 童装模式
   */
  mode: 'normal'
  sizeItems: Array<IColorSizeItem>
  onItemClick: (ids: string, sizeStr: string, num: number, addOrSet?: string) => void
  goodsDetail: IGoodsDetail
  shopShowSpu: boolean
  shopShowSoldOut: boolean
  marketInvStrategy: boolean
  label?: string
  industries?: boolean
  showPrice?: boolean
}

type PageState = {}

export default class SizeView extends PureComponent<Props, PageState> {
  static defaultProps = {
    mode: 'normal',
    sizeItems: [],
    goodsDetail: { goodsDetail: {} },
    shopShowSpu: false,
    marketInvStrategy: false,
    label: '尺码',
    industries: false
  }

  static options = {
    addGlobalClass: true
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  onItemClick = (ids: string, sizeStrs: string, num: number, addOrSet: string) => {
    this.props.onItemClick(ids, sizeStrs, num, addOrSet)
  }

  // onTipItemClick = (tip: TipInfo) => {
  //   this.props.onTipClick(tip)
  // }

  render() {
    const {
      sizeItems,
      mode,
      goodsDetail,
      shopShowSpu,
      shopShowSoldOut,
      label,
      industries,
      marketInvStrategy,
      showPrice
    } = this.props
    // if (sizeItems) {
    //   sizeItems.forEach((v, i) => {
    //     v.key = v.id + i
    //   })
    // }
    const ids = sizeItems.map(item => item.id)
    const names = sizeItems.map(item => item.name)
    const content = (
      <View>
        {sizeItems.map(item => {
          return (
            <SizeItem
              goodsDetail={goodsDetail}
              key='name'
              sizeItem={item}
              onItemClick={this.onItemClick.bind(this, item.id, item.name)}
              shopShowSpu={shopShowSpu}
              shopShowSoldOut={shopShowSoldOut}
              marketInvStrategy={marketInvStrategy}
              showPrice={showPrice}
              // onTipClick={this.onTipItemClick}
              // visible={visible}
              industries={industries}
            />
          )
        })}
      </View>
    )

    const numLabel = sizeItems.some(size => size.groupNum && size.groupNum > 1)
      ? '手数'
      : i18n.t._('number')

    return (
      <View className='goods_detail_size'>
        <View className='size_header'>
          <Text className='size_header_text'>{label}</Text>
          {shopShowSpu && <Text className='size_header_stock'>{i18n.t._('stock')}</Text>}
          {goodsDetail.isSkuPrice && showPrice && <Text className='size_header_stock'>单价</Text>}
          <View className='size_header_num_container'>
            {/* <Image
                src=''
                className='todo_image'
              /> */}
            <Text className='size_header_num'>{numLabel}</Text>
            {/* <Image
                src=''
                className='todo_image'
              /> */}
          </View>
        </View>
        {content}
      </View>
    )
  }
}
;
