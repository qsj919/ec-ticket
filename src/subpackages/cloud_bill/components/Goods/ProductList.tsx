import Taro, { VideoContext } from '@tarojs/taro'
import React from 'react'
import { ITouchEvent } from '@tarojs/components/types/common'
import { View, Text, Image } from '@tarojs/components'
import { defaultMapDispatchToProps, DefaultDispatchProps, GlobalState } from '@@types/model_state'
import cn from 'classnames'
import myLog from '@utils/myLog'
import noImage from '@/images/no_image.png'
import newGood from '@/images/new_good.png'
import { ISpu } from '@@types/GoodsType'
import EImage from '@components/EImage'
import * as Sentry from 'sentry-miniapp'
import { debounceCaptureException } from '@utils/utils'
import goodsHotFlag from '@/images/goods_hot_flag.png'
import './product_list.scss'
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
  from?: string
  showHotIconForShare?: number
  useLastPrice?: boolean
}

interface State {
  enableTransition: boolean
}

type IProps = OwnProps

class ProductList extends React.PureComponent<IProps, State> {
  static defaultProps = {
    showVideo: false,
    data: {} as ISpu,
    size: 'normal',
    blur: false,
    showPrice: false,
    showHotIconForShare: -1
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
    myLog.log(`高可用图片加载失败，错误信息：${errMsg}`)
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
      from,
      showHotIconForShare,
      useLastPrice
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
            <View
              onClick={this.onGoodsItemClick}
              className={`image${videoReady ? ' video-ready' : ''}`}
            >
              {data.imgUrls ? (
                <EImage src={data.imgUrls} mode='aspectFill' />
              ) : (
                <EImage mode='aspectFill' src={data.imgUrl || noImage} />
              )}
              {/* <EImage lazyLoad mode='aspectFit' src={data.imgUrl || noImage} /> */}
              {/* <Image
                src={data.imgUrl + `?t=${Date.now()}`}
                style={{ width: '100%', height: '100%' }}
                onError={er => console.log(`加载失败,${er}`)}
                onLoad={ev => console.log(`加载成功,${JSON.stringify(ev)}`)}
              /> */}
              {/* {showPrice && (
                <View className='code'>
                  <Text className='code__text'>{data.code}</Text>
                </View>
              )} */}
              {isInvalid && <View className='invalid_goods_mask'>商品已失效</View>}
              {blur && <View className='blur_goods'></View>}
              {data.hotFlag === 1 && showHotIconForShare === 1 && (
                <Image className='goods_item__hot' src={goodsHotFlag} />
              )}
            </View>
          </View>
          <GoodsInfoView
            useLastPrice={useLastPrice}
            blur={blur}
            data={data}
            from={from}
            onItemClick={this.onGoodsItemClick}
            isCartBtnVisible={isCartBtnVisible}
            showPrice={showPrice}
            showNewIcon={showHotIconForShare === 2}
          />
        </View>
      </View>
    )
  }
}

export default ProductList
