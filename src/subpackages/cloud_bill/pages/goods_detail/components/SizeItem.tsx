/**
 * @author GaoYuJian
 * @create date 2018-11-21
 * @desc
 */

import Taro, {
  SelectorQuery,
  // @ts-ignore
} from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { View, Text, Image } from '@tarojs/components'
import throttle from 'lodash/throttle'
import images from '@config/images'
import { ITouchEvent } from '@tarojs/components/types/common'
import cn from 'classnames'
import StepperV2 from '@components/StepperV2'
import { IColorSizeItem, IGoodsDetail } from '@@types/GoodsType'

import './size.scss'
// import dva from '../../../utils/dva'
// import { State, TipInfo } from '../type'

const MAX_NUM = 9999

type Props = {
  customStyle?: string
  /**
   * normal: 普通模式  group: 按组开单 kid: 童装模式
   */
  mode?: 'normal' | 'kid'
  sizeItem: IColorSizeItem
  onItemClick: (num: number) => void
  goodsDetail: IGoodsDetail
  visible?: boolean
  shopShowSpu: boolean
  shopShowSoldOut: boolean
  marketInvStrategy: boolean
  industries?: boolean
  showPrice?: boolean
}

type PageState = {
  num: number
}

class SizeItem extends PureComponent<Props, PageState> {
  static defaultProps = {
    mode: 'normal' as const,
    showSoldOut: false,
    marketInvStrategy: false,
    sizeItem: {
      id: '-1',
      name: '',
      num: 0,
      groupNum: 0,
      invNum: 0
    },
    goodsDetail: { goodsDetail: {} },
    onItemClick: () => {},
    industries: false
  }

  constructor(props) {
    super(props)
    this.state = {
      num: props.sizeItem.groupNum
        ? props.sizeItem.num / props.sizeItem.groupNum
        : props.sizeItem.num
    }
  }

  // UNSAFE_componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
  //   console.log(nextProps.sizeItem, this.state.num)
  //   if (nextProps.sizeItem.num !== this.state.num) {
  //     this.setState({ num: nextProps.sizeItem.num })
  //   }
  // }

  componentDidUpdate(prevProps: Props) {
    if (this.props.sizeItem.groupNum) {
      if (
        this.props.sizeItem.num !== prevProps.sizeItem.num &&
        this.props.sizeItem.num / this.props.sizeItem.groupNum !== this.state.num
      ) {
        this.setState({ num: this.props.sizeItem.num / this.props.sizeItem.groupNum })
      }
    } else {
      if (
        this.props.sizeItem.num !== prevProps.sizeItem.num &&
        this.props.sizeItem.num !== this.state.num
      ) {
        this.setState({ num: this.props.sizeItem.num })
      }
    }
  }

  onChange = (num: number) => {
    // const { sizeItem, goodsDetail } = this.props
    // const stockNum = this.props.sizeItem.stockNum
    const unit = '件'
    // let startBuyNums = goodsDetail.goods ? goodsDetail.goods.spu.startBuyNums : 1 // 最低起售数
    // if (sizeItem.groupNum > 1 && sizeItem.groupNum < startBuyNums) {
    //   startBuyNums = (Math.floor(startBuyNums / sizeItem.groupNum) + 1) * sizeItem.groupNum
    // }
    // const allowShelvesWhenInventoryLessThanZero = goodsDetail.goods
    //   ? goodsDetail.goods.spu.noStockValidFlag
    //   : 1

    this.setState(
      state => {
        if (num === MAX_NUM) {
          num = this.props.sizeItem.groupNum
            ? this.props.sizeItem.groupNum
            : this.props.sizeItem.num
        }
        return {
          num
        }
      },
      () => {
        this.props.onItemClick(this.state.num)
      }
    )
  }

  render() {
    const {
      sizeItem,
      customStyle,
      goodsDetail,
      mode,
      shopShowSpu,
      shopShowSoldOut,
      industries,
      marketInvStrategy,
      showPrice
    } = this.props
    const { num } = this.state
    let maxNum = MAX_NUM
    const label = sizeItem.name
    const isGroupMode = !!sizeItem.groupNum && sizeItem.groupNum > 1
    let step = 1
    let _invNum = sizeItem.invNum < 0 ? 0 : sizeItem.invNum
    let invNum = shopShowSpu ? String(_invNum) : ''
    const disableSku = shopShowSoldOut && sizeItem.invNum <= 0
    if (shopShowSoldOut) {
      if (disableSku) {
        invNum = '已售罄'
      }
    }

    if (sizeItem.step && sizeItem.step !== 0 && industries) {
      step = sizeItem.step
    }

    return (
      <View
        className={cn('size_item', {
          'size_item--disable': disableSku,
          'size_item--big': isGroupMode
        })}
        style={customStyle}
      >
        <View className='near'>
          <Text className='special_text'>{label}</Text>
          {isGroupMode && <View className='group_num_text'>{`(一手${sizeItem.groupNum}件)`}</View>}
        </View>
        {!industries && <View className='size_text_stock'>{invNum}</View>}
        {(goodsDetail.isSkuPrice || process.env.INDEPENDENT === 'foodindependent') && showPrice && (
          <View className='size_text_price'>{`¥${sizeItem.price}`}</View>
        )}

        {isGroupMode && sizeItem.num > 0 && (
          <Text className='group_num_total'>{`共${sizeItem.num}件`}</Text>
        )}
        <StepperV2
          /** 全行业 下单规则  则禁用input */
          disableInput={industries && sizeItem.step !== 0 && typeof sizeItem.step === 'number'}
          disabled={disableSku}
          type='number'
          min={0}
          max={shopShowSoldOut || (marketInvStrategy && shopShowSpu) ? sizeItem.invNum : maxNum}
          step={step}
          value={num}
          onChange={this.onChange}
        />
        {/* <AtInputNumber
          type='number'
          className='size_input'
          min={0}
          max={MAX_NUM}
          step={sizeItem.groupNum > 1 ? sizeItem.groupNum : 1}
          width={120}
          value={this.state.num}
          onChange={this.onChange.bind(this)}
          onBlur={this.onBlur}
          disabled={disabled}
        /> */}
      </View>
    )
  }
}

export default SizeItem
