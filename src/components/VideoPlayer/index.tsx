import Taro, { VideoContext } from '@tarojs/taro'
import React from 'react'
import { View, Image, Swiper, SwiperItem, Video } from '@tarojs/components'
import playIcon from '@/images/icon/play_140.png'
import classNames from 'classnames'
import backIcon from '@/images/icon/arrow_left_white_48.png'
import styles from './index.module.scss'

interface Props {
  poster?: string
  src: string
  onRequestClose(): void
  imgs: string[]
}

interface State {
  isPlaying: boolean
  currentIndex: number
}

export default class VideoPlayer extends React.PureComponent<Props, State> {
  firstPlay = true

  swiper: any

  videoIns: VideoContext

  componentDidMount() {
    this.videoIns = Taro.createVideoContext('video', Taro.getCurrentInstance().page as any)
  }

  state = {
    isPlaying: false,
    currentIndex: 0
  }

  onVideoPlay = () => {
    this.setState({ isPlaying: true })
  }

  onVideoPause = () => {
    this.setState({ isPlaying: false })
  }

  onVideoEnd = () => {
    this.setState({ isPlaying: false })
    // this.videoIns && (this.videoIns.currentTime = 0)
  }

  onPlayClick = () => {
    this.videoIns && this.videoIns.play()
    // if (this.videoIns) {
    //   this.state.isPlaying ? this.videoIns.pause() : this.videoIns.play()
    // }
  }

  onVideoClick = () => {
    this.videoIns && this.videoIns.pause()
    if (this.videoIns) {
      this.state.isPlaying ? this.videoIns.pause() : this.videoIns.play()
    }
  }

  onSwiperChange = e => {
    // const { current: currentIndex } = e.detail
    // this.setState({ currentIndex })
    // if (currentIndex > 0) {
    //   this.videoIns && this.videoIns.pause()
    // } else {
    //   this.setState({ isPlaying: false })
    //   // this.videoIns && this.videoIns.play()
    // }
  }

  onSwiperAnimationEnd = e => {
    const { current: currentIndex } = e.detail
    this.setState({ currentIndex })
    if (currentIndex > 0) {
      this.videoIns && this.videoIns.pause()
    } else {
      // this.setState({ isPlaying: false })
      // this.videoIns && this.videoIns.play()
    }
  }

  onSwitchVideo = () => {
    this.setState({ currentIndex: 0 })
    // 在h5下 设置current=0不起作用。手动执行
    // this.swiper && this.swiper.mySwiper.slideTo(0)
  }

  onSwitchImg = () => {
    this.setState({ currentIndex: 1 })
  }

  onTouchMove = e => {
    e.stopPropagation()
  }

  render() {
    const { src, poster, onRequestClose, imgs } = this.props
    const { isPlaying, currentIndex } = this.state
    return (
      <View className={styles.container} onTouchMove={this.onTouchMove}>
        <Swiper
          ref={ins => (this.swiper = ins)}
          className={styles.wrapper}
          // onChange={this.onSwiperChange}
          onAnimationFinish={this.onSwiperAnimationEnd}
          current={currentIndex}
        >
          <SwiperItem>
            <View>
              {/* 使用原生video */}
              {/* eslint-disable-next-line */}
              <Video
                // ref={ins => {
                //   if (this.firstPlay) {
                //     ins && ins.play()
                //     this.videoIns = ins
                //     this.firstPlay = false
                //   }
                // }}
                controls={false}
                id='video'
                autoplay
                // x5-video-player-fullscreen='true'
                // x5-video-player-type='h5-page'
                className={styles.video}
                src={src}
                onEnded={this.onVideoPause}
                onPlay={this.onVideoPlay}
                onPause={this.onVideoPause}
                poster={poster}
                onClick={this.onVideoClick}
              />
              {!isPlaying && (
                <Image src={playIcon} className={styles.play} onClick={this.onPlayClick} />
              )}
            </View>
          </SwiperItem>
          {imgs.map(item => (
            <SwiperItem key={item}>
              <Image className={styles.image} src={item} mode='aspectFit' />
            </SwiperItem>
          ))}
        </Swiper>
        <View className={styles.indicator}>
          {currentIndex > 0 && (
            <View className={styles.indicator__index}>{`${currentIndex}/${imgs.length}`}</View>
          )}
          <View className={styles.indicator__media_type}>
            <View className={styles.indicator__media_type__item} onClick={this.onSwitchVideo}>
              视频
            </View>
            <View className={styles.indicator__media_type__item} onClick={this.onSwitchImg}>
              图片
            </View>
            <View
              className={classNames(styles.indicator__media_type__active, {
                [styles['indicator__media_type__active--left']]: currentIndex === 0,
                [styles['indicator__media_type__active--right']]: currentIndex > 0
              })}
            />
          </View>
        </View>
        <Image src={backIcon} className={styles.back} onClick={onRequestClose} />
      </View>
    )
  }
}
