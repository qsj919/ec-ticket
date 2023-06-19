import Taro, { VideoContext } from '@tarojs/taro'
import React from 'react'
import { Image, Swiper, SwiperItem, Text, Video, View } from '@tarojs/components'
import shopLogo from '@/images/ticket_default_shop.png'
import images from '@config/images'
import EImage from '@components/EImage'
import { ISpu } from '@@types/GoodsType'
import { IVideo, IVideoWithShop } from '@@types/base'
import download from '@utils/download'
import { httpToHttps } from '@utils/stringUtil'
import angleRightWhite from '../../images/angle_right_white_12.png'
import angleRightRed from '../../images/angle_right_red_16.png'
import DownloadIcon from '../../images/download_file_icon.png'

import styles from './index.module.scss'

type Props = {
  videoList: IVideo[] | IVideoWithShop[]
  onChange(current: number): void
  onAnimationFinish(current: number): void
  onShopClick(tab?: string): void
  top?: number
  onAllShopClick?(): void
  showAllShop?: boolean
  showShopInfo: boolean
  showBackIcon: boolean
  showBottomBtn: boolean
  showPrice?: boolean
  onTicketClick?(): void
  onLeftFlip?(): void
  goodsList?: ISpu[]
  onGoodsClick?(good: ISpu): void
  onGoodsDetailClick?(styleId: string): void
  initialIndex: number
  onAddClick?: (spuId: number) => void
}

type State = {
  videoPaused: boolean
  currentVideoIndex: number
}

export default class VideoSwiper extends React.PureComponent<Props, State> {
  static defaultProps = {
    top: 0,
    renderCurrent: () => {},
    videoList: [],
    showAllShop: false,
    showShopInfo: true,
    showBackIcon: false,
    showBottomBtn: true,
    initialIndex: 0
  }

  constructor(props) {
    super(props)
    this.state = {
      currentVideoIndex: props.initialIndex,
      videoPaused: false
    }
  }

  videoIns: (VideoContext | null)[]

  startX = 0

  preventNavigate = true

  componentDidMount() {
    this.videoIns = [Taro.createVideoContext('video_0', Taro.getCurrentInstance().page as any)]
  }

  getVideoIns = (idx?: number) => {
    const { currentVideoIndex } = this.state
    idx = typeof idx === 'number' ? idx : currentVideoIndex
    const ins = this.videoIns[idx]
    if (ins) {
      return ins
    } else {
      return Taro.createVideoContext(`video_${idx}`, Taro.getCurrentInstance().page as any)
    }
  }

  addVideoIns = (idx: number) => {
    if (!this.videoIns[idx]) {
      this.videoIns[idx] = Taro.createVideoContext(`video_${idx}`, Taro.getCurrentInstance().page as any)
    }
  }

  removeVideoIns = (idx: number) => {
    this.videoIns[idx] = null
  }

  removeUnusedIns = (base: number) => {
    this.videoIns.forEach((ins, idx) => {
      if (Math.abs(base - idx) > 1 && ins) {
        this.removeVideoIns(idx)
      }
    })
  }

  onVideoClick = () => {
    const videoIns = this.getVideoIns()
    if (this.state.videoPaused) {
      videoIns.play()
    } else {
      videoIns.pause()
    }
  }

  onVideoPlay = e => {
    const [_, idx] = e.target.id.split('_')
    if (this.state.currentVideoIndex === Number(idx)) {
      this.setState({ videoPaused: false })
    }
  }

  onVideoPause = e => {
    const [_, idx] = e.target.id.split('_')
    if (this.state.currentVideoIndex === Number(idx)) {
      this.setState({ videoPaused: true })
    }
  }

  onTouchStart = e => {
    this.startX = e.changedTouches[0].pageX
  }

  onTouchMove = e => {
    this.preventNavigate = false
  }

  onTouchEnd = e => {
    if (e.changedTouches[0].pageX - this.startX <= -80 && !this.preventNavigate) {
      this.props.onLeftFlip && this.props.onLeftFlip()
    } else {
      this.preventNavigate = true
    }
  }

  onChange = e => {
    this.props.onChange(e.detail.current)
  }

  onAnimationFinish = e => {
    const { current } = e.detail
    this.props.onAnimationFinish(current)
    const prevIndex = this.state.currentVideoIndex
    if (this.state.currentVideoIndex !== current) {
      this.setState({ currentVideoIndex: current }, () => {
        const prevIns = this.getVideoIns(prevIndex)
        const ins = Taro.createVideoContext(`video_${current}`, Taro.getCurrentInstance().page as any)
        prevIns.pause()
        ins.play()
        this.addVideoIns(current)
        this.removeUnusedIns(current)
      })
    }
  }

  onGoodsClick = (item: ISpu) => {
    const { onGoodsClick } = this.props
    onGoodsClick && onGoodsClick(item)
  }

  onGoodsDetailClick = v => {
    const { styleId } = v
    const { onGoodsDetailClick } = this.props
    onGoodsDetailClick && onGoodsDetailClick(styleId)
  }

  onGoodAddClick = e => {
    e.stopPropagation()
    const { spu_id } = e.currentTarget.dataset
    this.props.onAddClick && this.props.onAddClick(spu_id)
  }

  onDownloadClick = e => {
    const { video_url } = e.currentTarget.dataset
    if (video_url) {
      Taro.showLoading({ title: '正在下载视频...' })
      download.downloadSaveFile(
        httpToHttps(video_url),
        () => {
          Taro.hideLoading()
          Taro.showToast({
            title: '已保存至相册'
          })
        },
        e => {
          Taro.hideLoading()
        }
      )
    }
  }

  render() {
    const { videoPaused, currentVideoIndex } = this.state
    const {
      videoList,
      top,
      showAllShop,
      goodsList,
      showShopInfo,
      showBottomBtn,
      showPrice = false
    } = this.props
    return (
      <View
        className={styles.page}
        onTouchStart={this.onTouchStart}
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onTouchEnd}
      >
        <Swiper
          className={styles.wrapper}
          vertical
          current={currentVideoIndex}
          onChange={this.onChange}
          onAnimationFinish={this.onAnimationFinish}
          style={{ backgroundColor: 'black' }}
        >
          {videoList.map((v, idx) => (
            <SwiperItem
              className={styles.wrapper}
              style={{ paddingTop: `${top}px` }}
              key={v.mpErpId}
            >
              <View className={styles.wrapper}>
                {showShopInfo && (
                  <View className={styles.shop_info} onClick={() => this.props.onShopClick()}>
                    <Image className={styles.shop_info__avatar} src={v.logoUrl || shopLogo} />
                    <View className={styles.shop_info__base}>
                      <View className={styles.shop_info__name}>{v.shopName}</View>
                      <View className={styles.shop_info__addr}>{v.addr}</View>
                    </View>
                  </View>
                )}

                {!!showAllShop && (
                  <View className={styles.all_shop_btn} onClick={this.props.onAllShopClick}>
                    <Text>拿货店铺</Text>
                    <Image className={styles.all_shop_btn__angle} src={angleRightWhite} />
                  </View>
                )}

                {goodsList &&
                  goodsList.length > 0 &&
                  currentVideoIndex === idx &&
                  v.saasProductType !== 40 && (
                    <View className={styles.side}>
                      {goodsList.map(good => (
                        <Image
                          mode='aspectFill'
                          className={styles.side__goods}
                          key={good.id}
                          src={good.imgUrl}
                          onClick={() => this.onGoodsClick(good)}
                        />
                      ))}

                      <View
                        className={styles.side__all_goods}
                        onClick={() => this.props.onShopClick('goods')}
                      >
                        全部款式
                      </View>
                    </View>
                  )}

                {showBottomBtn &&
                  (!!v.billid ? (
                    <View className={styles.ticket} onClick={this.props.onTicketClick}>
                      <View className={styles.ticket__info}>
                        <View>本小票合计</View>
                        {v.saasProductType === 40 ? (
                          <View>
                            <Text className={styles.__highlight_small}>
                              货品数: {v.goodsNum || ''}
                            </Text>{' '}
                            <Text className={styles.__highlight_small}>金额: {v.totalSum}</Text>元
                          </View>
                        ) : (
                          <View>
                            <Text className={styles.ticket__highlight}>{v.totalNum}</Text>件{' '}
                            <Text className={styles.ticket__highlight}>{v.totalSum}</Text>元
                          </View>
                        )}
                      </View>
                      <View className={styles.ticket__btn}>
                        立即查看
                        <Image src={angleRightRed} className={styles.ticket__btn__angle} />
                      </View>
                    </View>
                  ) : (
                    <View
                      className={styles.bottom_go_to_shop}
                      onClick={() => this.props.onShopClick()}
                    >
                      进店看看
                    </View>
                  ))}
                {videoPaused && (
                  <Image
                    className={styles.play_btn}
                    src={images.common.play_96}
                    onClick={this.onVideoClick}
                  />
                )}
                {Math.abs(currentVideoIndex - idx) <= 1 ? (
                  <Video
                    id={`video_${idx}`}
                    src={v.videoUrl}
                    className={styles.video}
                    autoplay={currentVideoIndex === idx}
                    poster={v.coverUrl}
                    playBtnPosition='center'
                    showFullscreenBtn={false}
                    showPlayBtn={false}
                    onClick={this.onVideoClick}
                    controls={false}
                    enableProgressGesture={false}
                    onPlay={this.onVideoPlay}
                    onPause={this.onVideoPause}
                    onWaiting={this.onVideoPlay}
                    showCenterPlayBtn={false}
                    loop
                    objectFit='contain'
                  />
                ) : (
                  <Image className={styles.video} src={v.coverUrl} mode='aspectFit' />
                )}
              </View>
              {v.fromFlag === 1 && (
                <View
                  className={styles.wrapper__goods_item}
                  onClick={() => {
                    this.onGoodsDetailClick(v)
                  }}
                >
                  <View className={styles.wrapper__goods_item__goodsImage}>
                    <EImage src={v.imgUrls} />
                  </View>
                  <View className={styles.wrapper__goods_item__goodsInfo}>
                    <View className={styles.wrapper__goods_item__goodsInfo__goodsName}>
                      {v.name}
                    </View>
                    <View className={styles.wrapper__goods_item__goodsInfo__goodsCode}>
                      {v.code}
                    </View>
                    {showPrice && (
                      <View className={styles.wrapper__goods_item__goodsInfo__goodsPrice}>
                        ¥{v.price}
                      </View>
                    )}
                  </View>

                  <View
                    className={styles.replenish_btn}
                    onClick={this.onGoodAddClick}
                    data-spu_id={v.styleId}
                  >
                    <View className={styles.replenish_btn__h}></View>
                    <View className={styles.replenish_btn__v}></View>
                  </View>
                </View>
              )}
              <Image
                src={DownloadIcon}
                data-video_url={v.videoUrl}
                className={styles.download_icon}
                onClick={this.onDownloadClick}
              />
            </SwiperItem>
          ))}
        </Swiper>
      </View>
    )
  }
}
