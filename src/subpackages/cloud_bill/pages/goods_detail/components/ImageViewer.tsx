/**
 * @author GaoYuJian
 * @create date 2018-11-20
 * @desc 图片浏览
 */

import Taro, {
  SelectorQuery,
  VideoContext,
  getCurrentPages
} from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { Text, View, Video, Swiper, SwiperItem, Image } from '@tarojs/components'
import cn from 'classnames'
import images from '@config/images'
import noImage from '@/images/no_image.png'
import saveIcon from '@/images/icon/save_fill_white_circle.png'
import i18n from '@@/i18n'
import download from '@utils/download'
import debounce from 'lodash/debounce'
import myLog from '@utils/myLog'
import { httpToHttps } from '@utils/stringUtil'

import SwiperWrap from './SwiperWrap'
import './image_viewer.scss'

type OwnProps = {
  medias: Array<{
    url: string[] | string
    /**
     * 1: 图片， 3: 视频
     */
    typeId: number

    coverUrl?: string
  }>
  disableControl?: boolean
  imageStyle?: string
  onDownLoadClick?(): void
  disableDownload: boolean
  goodsItemIndex?: number
  currentGoodsItemIndex?: number
  clickGoodsItemIndex?: number
}

type State = {
  index: number
  resetIndex: number | null
  videoVisible: boolean
  videoMuted: boolean | null
  loading: boolean
  // imageUrls: string[]
  // video: {
  //   url: string
  //   coverUrl: string
  // } | null
}

// 当前网络类型
let networkType

// 获取当前网络类型
Taro.getNetworkType({
  success: res => {
    networkType = res.networkType
  }
})

// 检测网络类型变化
Taro.onNetworkStatusChange(res => {
  networkType = res.networkType
})

type IProps = OwnProps

class ImageViewer extends PureComponent<IProps, State> {
  static defaultProps = {
    medias: [],
    disableDownload: false
  }

  constructor(props) {
    super(props)
    this.state = {
      index: 0,
      resetIndex: null,
      videoVisible: true,
      videoMuted: null,
      loading: false
    }
  }

  timer: NodeJS.Timeout

  videoIns: VideoContext

  componentDidMount() {
    if (this.props.clickGoodsItemIndex === 0) {
      this.videoAutoPlay()
    }
  }

  componentDidUpdate() {
    const ROUTERS = getCurrentPages()
    if (ROUTERS[ROUTERS.length - 1].route.includes('goods_detail_new')) {
      this.videoAutoPlay()
    }
  }
  videoAutoPlay = () => {
    this.timer = setTimeout(() => {
      const { medias, goodsItemIndex, currentGoodsItemIndex } = this.props
      if (medias[0] && medias[0].typeId === 3) {
        if (!this.videoIns) {
          this.videoIns = Taro.createVideoContext('myVideo', Taro.getCurrentInstance().page as any)
        }
        if (goodsItemIndex === currentGoodsItemIndex) {
          this.videoIns.play()
        } else {
          this.videoIns.pause()
        }
      }
    }, 200)
  }

  generateMedias = () => {
    const { medias } = this.props
    const imageUrls = medias.filter(item => item && item.typeId === 1).map(item => item.url)
    let video: { url: string; coverUrl: string | undefined } | null = null
    if (medias.length > 0) {
      const vItem = medias[0]
      if (vItem && vItem.typeId === 3) {
        video = { url: vItem.url as string, coverUrl: vItem.coverUrl }
      }
    }

    return { imageUrls, video }
  }

  onClick = () => {
    const media = this.props.medias[this.state.index]
    const { imageUrls } = this.generateMedias()
    const urls = typeof imageUrls === 'string' ? imageUrls : imageUrls.map(url => url[0])
    if (media) {
      // 商品明细闪退fix
      if (media.typeId === 1) {
        Taro.previewImage({
          urls: urls,
          current: media.url[0]
        })
      } else if (media.typeId === 3) {
        this.onVideoVisiblechange(true)
      }
    }
  }

  onChange = ({ detail }) => {
    const { current } = detail
    if (current !== this.state.index) {
      this.setState({ index: current }, () => {
        if (current < 1) {
          setTimeout(() => {
            this.onVideoVisiblechange(true)
          }, 500)
        }
      })
    }
  }

  onVideoVisiblechange(visible) {
    this.setState({ videoVisible: visible })
  }

  /**
   * 切换视频和图片
   * @param type 0: 视频 1: 图片
   */
  onMediaSwitch(type: number) {
    this.setState({ resetIndex: type, index: type }, () => {
      this.setState({ resetIndex: null })
      if (type === 1) {
        this.onVideoVisiblechange(false)
      } else {
        if (networkType === 'wifi') {
          setTimeout(() => {
            this.onVideoVisiblechange(true)
          }, 500)
        }
      }
    })
  }

  onMediaClick = e => {
    e.stopPropagation()
  }

  toggleVideoVoice = () => {
    this.setState(state => ({ videoMuted: !state.videoMuted }))
  }

  onDownloadClick = e => {
    e.stopPropagation()
    const { onDownLoadClick } = this.props
    onDownLoadClick && onDownLoadClick()
  }

  downloadVideo = debounce((url: string) => {
    Taro.showLoading({
      title: '加载中'
    })
    myLog.log(`http:视频地址${url}---https视频地址：${httpToHttps(url)}`)
    url &&
      download.downloadSaveFile(
        httpToHttps(url),
        () => {
          Taro.hideLoading()
          Taro.showToast({
            title: '视频已保存至相册'
          })
        },
        e => {
          Taro.hideLoading()
          myLog.log(`视频下载失败${e}`)
        }
      )
  }, 400)

  render() {
    const { medias, disableControl, imageStyle, disableDownload } = this.props
    const { index, videoVisible, videoMuted, loading } = this.state
    const currentMedia = medias[index]
    const { imageUrls, video } = this.generateMedias()
    const isNoImage =
      imageUrls.length === 0 || (imageUrls.length === 1 && imageUrls[0] === '/images/no_image.png')
    // 如果有图片就设置视频控制器不能使用
    const disableVideoControl = imageUrls.length > 0 ? true : disableControl

    let imageIndex = 0
    if (currentMedia && currentMedia.typeId === 1) {
      imageIndex = imageUrls.findIndex(url => url === currentMedia.url)
    }
    return (
      <View className='image_viewer' onClick={this.onClick}>
        {((imageUrls.length > 0 && (!video || !videoVisible)) || !videoVisible) && (
          <SwiperWrap
            medias={medias}
            imageStyle={imageStyle}
            onChange={this.onChange}
            resetIndex={this.state.resetIndex}
            index={this.state.index}
          />
        )}
        {isNoImage && (
          <Image style={{ width: '100%', height: '100%' }} src={noImage} mode='aspectFit' />
        )}
        <View className='bottom_item'>
          {currentMedia && currentMedia.typeId === 1 && (
            <View className='indicator_num'>
              <Text className='indicator-text'>
                <Text className='indicator-text_main'>{`${imageIndex + 1}/`}</Text>
                {imageUrls.length}
              </Text>
            </View>
          )}
          {imageUrls.length > 0 && video && (
            <View className='media_switch' onClick={this.onMediaClick}>
              <View
                className='switch_item'
                style={{ color: currentMedia && currentMedia.typeId === 3 ? 'black' : 'white' }}
                onClick={this.onMediaSwitch.bind(this, 0)}
              >
                {i18n.t._('video')}
              </View>
              <View
                className='switch_item'
                style={{ color: currentMedia && currentMedia.typeId === 1 ? 'black' : 'white' }}
                onClick={this.onMediaSwitch.bind(this, 1)}
              >
                {i18n.t._('image')}
              </View>
              <View
                className={cn('switch_item_white', {
                  'switch_item_white--left': currentMedia && currentMedia.typeId === 3,
                  'switch_item_white--right': currentMedia && currentMedia.typeId === 1
                })}
              />
            </View>
          )}
          {!isNoImage && currentMedia && currentMedia.typeId === 1 && !disableDownload && (
            // <View
            //   className={
            //     loading ? 'bottom_item_download bottom_item_download_gray' : 'bottom_item_download'
            //   }
            //   onClick={this.onDownloadClick}
            // >
            //   {i18n.t._('downloadAllImages')}
            // </View>
            <View
              className={loading ? 'bottom_item_save bottom_item_save_gray' : 'bottom_item_save'}
              onClick={this.onDownloadClick}
            >
              {i18n.t._('saveAllImages')}
              <Image className='bottom_item_save_icon' src={saveIcon}></Image>
            </View>
          )}
        </View>

        {video && videoVisible && (
          <Swiper onChange={this.onMediaSwitch.bind(this, 1)} className='video_container'>
            <SwiperItem>
              <Video
                controls={!disableVideoControl}
                style='width: 100%; height: 100%'
                src={video.url}
                // autoplay={isAutoPlay}
                poster={video.coverUrl}
                initialTime={0}
                enable-play-gesture
                muted={!!videoMuted}
                id='myVideo'
              >
                {/* <CoverImage */}
                {/* className='modal_close_action' */}
                {/* style='width: 33px; height: 33px' */}
                {/* src={close} */}
                {/* onClick={this.onVideoVisiblechange.bind(this, false)} */}
                {/* /> */}
              </Video>
              <View className='bottom_item'>
                <View className='indicator' onClick={this.toggleVideoVoice}>
                  <Image
                    src={videoMuted ? images.goods.volume_slash : images.goods.volume}
                    className='volume_icon'
                  />
                </View>
                {!disableDownload && (
                  <View
                    className='bottom_item_save'
                    onClick={this.downloadVideo.bind(this, video.url)}
                  >
                    {i18n.t._('downloadVideo')}
                    <Image className='bottom_item_save_icon' src={saveIcon}></Image>
                  </View>
                )}
              </View>
            </SwiperItem>
            {/* 为了触发swiper的onChange事件,在有图片的情况下添加一个swiperitem */}
            {imageUrls.length > 0 && (
              <SwiperItem>
                <View>
                  <Image src={imageUrls[0][0]} mode='aspectFit' />
                </View>
              </SwiperItem>
            )}
          </Swiper>
        )}
      </View>
    )
  }
}

export default ImageViewer
