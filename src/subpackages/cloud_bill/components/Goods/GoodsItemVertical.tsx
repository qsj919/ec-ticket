import Taro, { VideoContext } from '@tarojs/taro'
import React from 'react'
import { ITouchEvent } from '@tarojs/components/types/common'
import { View, Text, Image } from '@tarojs/components'
import { defaultMapDispatchToProps, DefaultDispatchProps, GlobalState } from '@@types/model_state'
import cn from 'classnames'
import myLog from '@utils/myLog'
import noImage from '@/images/no_image.png'
import goodsHotFlag from '@/images/goods_hot_flag.png'
import { ISpu } from '@@types/GoodsType'
import EImage from '@components/EImage'
import * as Sentry from 'sentry-miniapp'
import { debounceCaptureException } from '@utils/utils'
import './goods_item_v.scss'
import GoodsInfoView from './GoodsInfoView'

type OwnProps = {
  data: ISpu
  onItemClick?: (data: ISpu, type?: string) => void
  showVideo?: boolean
  videoId?: string
  videoReady?: boolean
  startVideoId?: string
  size: string
  imageMode?: string
  isCartBtnVisible?: boolean
  blur: boolean
  showPrice: boolean
  showViewCount?: boolean
  showHotIcon?: boolean
  showInvNum?: boolean
}

interface State {
  enableTransition: boolean
}

type IProps = OwnProps

class GoodsItemVertical extends React.PureComponent<IProps, State> {
  static defaultProps = {
    showVideo: false,
    data: {} as ISpu,
    size: 'normal',
    blur: false,
    showPrice: false,
    showViewCount: false,
    showHotIcon: true,
    showInvNum: true
  }

  videoIns: VideoContext | null = null

  componentDidMount() {
    this.setState({ enableTransition: true })
  }

  onGoodsItemClick = (e: ITouchEvent) => {
    // e.stopPropagation()
    const { onItemClick, data, blur } = this.props
    if (data.flag === 1 || data.marketFlag === 0 || blur) {
      return
    }
    onItemClick && onItemClick(data)
  }

  onImageLoadError = (url: string, errMsg: string) => {
    Sentry.withScope(scope => {
      scope.setTag('type', 'image-error')
      debounceCaptureException(
        new Error(
          `高可用图片加载失败，错误信息：${errMsg},地址：${JSON.stringify(this.props.data.imgUrls)}`
        )
      )
    })
    myLog.error(`高可用图片加载失败，错误信息：${errMsg}`)
  }

  render() {
    const {
      data,
      videoReady,
      size,
      onItemClick,
      isCartBtnVisible,
      blur,
      showPrice,
      showViewCount,
      showHotIcon,
      showInvNum
    } = this.props
    const { enableTransition } = this.state
    const isInvalid = data.flag === 1 || data.marketFlag === 0
    return (
      <View
        className={cn('good_item_vertical', {
          'good_item_vertical--small': size === 'small',
          'good_item_vertical--transition': enableTransition,
          'good_item_vertical--checked': data.checked
        })}
        key={data.id}
      >
        <View className='good_item_vertical_container'>
          <View className='block-view'>
            {data.hotFlag === 1 && showHotIcon && (
              <Image className='goods_item__hot' src={goodsHotFlag} />
            )}
            {showViewCount && <View className='view_count'>浏览{data.viewCount || 0}次</View>}
            {showInvNum && <View className='goods_inv_num'>库存 {data.invNum || 0}</View>}
            <View
              onClick={this.onGoodsItemClick}
              className={`image${videoReady ? ' video-ready' : ''}`}
            >
              {data.imgUrls ? (
                <EImage src={data.imgUrls} mode='aspectFill' />
              ) : (
                <EImage mode='aspectFill' src={data.imgUrl || noImage} />
              )}

              {showPrice && (
                <View className='code'>
                  <Text className='code__text'>{data.code}</Text>
                </View>
              )}
              {isInvalid && <View className='invalid_goods_mask'>商品已失效</View>}
              {blur && <View className='blur_goods'></View>}
            </View>
          </View>
          <GoodsInfoView
            blur={blur}
            data={data}
            onItemClick={this.onGoodsItemClick}
            isCartBtnVisible={isCartBtnVisible}
            showPrice={showPrice}
          />
        </View>
      </View>
    )
  }
}

export default GoodsItemVertical
