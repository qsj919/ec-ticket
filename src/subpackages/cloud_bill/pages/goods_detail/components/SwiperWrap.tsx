/**
 * @author GaoYuJian
 * @create date 2018-11-21
 * @desc
 */
import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { Swiper, SwiperItem, Image, View } from '@tarojs/components'
import images from '@config/images'
import EImage from '@components/EImage'

import './swiper_wrap.scss'

type Props = {
  medias: Array<{
    url: string[] | string
    /**
     * 1: 图片， 2: 视频
     */
    typeId: number

    coverUrl?: string
  }>
  onChange: (event: any) => void
  index: number
  resetIndex: number | null
  imageStyle?: string // 控制图片的样式
  indicatorDots: boolean
  indicatorActiveColor: string
  indicatorColor: string
}

export default class SwiperWrap extends Component<Props> {
  static defaultProps = {
    medias: [],
    indicatorDots: false,
    indicatorActiveColor: '',
    indicatorColor: ''
  }

  shouldComponentUpdate(
    nextProps: Readonly<Props>,
    nextState: Readonly<{}>,
    nextContext: any
  ): boolean {
    return (
      (nextProps.resetIndex !== null && nextProps.resetIndex !== this.props.resetIndex) ||
      this.props.medias !== nextProps.medias
    )
  }

  render() {
    const {
      medias,
      index,
      resetIndex,
      imageStyle,
      indicatorDots,
      indicatorActiveColor,
      indicatorColor
    } = this.props
    return (
      <Swiper
        className='image_viewer_swiper'
        onChange={this.props.onChange}
        current={resetIndex !== null ? resetIndex : index}
        indicatorDots={indicatorDots}
        indicatorActiveColor={indicatorActiveColor}
        indicatorColor={indicatorColor}
      >
        {medias.map((item, _index) => {
          return (
            <SwiperItem key={_index} className='swiper-item'>
              {item.typeId === 1 ? (
                <View className='image_media_container'>
                  <EImage
                    className='swiper-media'
                    src={item.url as string[]}
                    mode='aspectFit'
                    style={imageStyle}
                  />
                </View>
              ) : (
                <View className='video_media_container'>
                  <Image className='play_video_btn' src={images.common.play_96} />
                  <Image
                    style='background-color: #000'
                    className='swiper-media'
                    src={item.coverUrl ? item.coverUrl : ''}
                    mode='aspectFit'
                  />
                </View>
              )}
            </SwiperItem>
          )
        })}
      </Swiper>
    )
  }
}
