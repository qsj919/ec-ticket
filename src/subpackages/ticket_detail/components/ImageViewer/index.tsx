import Taro from '@tarojs/taro'
import React, { PureComponent }  from 'react'
import { View, ScrollView, Image, Swiper, SwiperItem } from '@tarojs/components'
import classNames from 'classnames'
import { BaseEventOrig } from '@tarojs/components/types/common'

import styles from './swiper.module.scss'

interface Props {
  type: number // 类型
  source: string[]
  onImageChange?: (url: string, index: number) => void
}

interface State {
  activeIndex: number
}

export default class ImageViewer extends React.PureComponent<Props, State> {
  state = {
    activeIndex: 0
  }

  onImageClick = (i: number) => {
    const { source, onImageChange } = this.props
    this.setState({ activeIndex: i }, () => {
      const { activeIndex } = this.state
      onImageChange && onImageChange(source[activeIndex], activeIndex)
    })
  }

  onBigImageClick = () => {
    const { source } = this.props
    const { activeIndex } = this.state
    /* eslint-disable no-undef */
    // @ts-ignore
    wx.ready(function() {
      // @ts-ignore
      wx.previewImage({
        current: source[activeIndex],
        urls: source // 需要预览的图片http链接列表
      })
    })
    /* eslint-enable no-undef */
  }

  onSwiperChange = (e: BaseEventOrig<{ current: number; source: 'autoplay' | 'touch' | '' }>) => {
    this.setState({ activeIndex: e.detail.current })
  }

  renderIndicator = (mode: number = 1) => {
    const { activeIndex } = this.state
    const { source } = this.props
    return (
      <View className={styles['indicator' + mode]}>
        {source.map((item, index) => (
          <View
            key={item}
            className={classNames(styles.indicator, {
              [styles['indicator--active']]: index === activeIndex
            })}
          />
        ))}
      </View>
    )
  }

  renderMode1 = () => {
    const { source } = this.props
    const { activeIndex } = this.state
    return (
      <View className={styles.container_mode_1}>
        <Image
          onClick={this.onBigImageClick}
          mode='aspectFill'
          src={source[activeIndex]}
          className={styles.image}
        />
        <ScrollView className={styles.image_list} scrollY>
          {source.map((item, index) => (
            <Image
              mode='aspectFill'
              className={classNames(styles.thumb, {
                [styles.thumb__active]: index === activeIndex
              })}
              src={item}
              key={item}
              onClick={() => this.onImageClick(index)}
            />
          ))}
        </ScrollView>
      </View>
    )
  }

  renderMode2 = () => {
    const { source } = this.props
    return (
      <View style={{ position: 'relative' }}>
        <Swiper className={styles.container_mode_2} onChange={this.onSwiperChange}>
          {source.map(item => (
            <SwiperItem key={item}>
              <Image src={item} className={styles.image} />
            </SwiperItem>
          ))}
        </Swiper>
        {this.renderIndicator()}
      </View>
    )
  }

  renderMode3 = () => {
    const { source } = this.props
    const { activeIndex } = this.state
    return (
      <View className={styles.container_mode_3}>
        <Swiper className={styles.swiper_wrapper} onChange={this.onSwiperChange}>
          {source.map((item, index) => (
            <SwiperItem key={item} className={styles.swiper}>
              <Image
                src={item}
                className={classNames(styles.image, {
                  [styles['image--active']]: index === activeIndex
                })}
              />
            </SwiperItem>
          ))}
        </Swiper>
        {this.renderIndicator(2)}
      </View>
    )
  }

  // renderImages = () => {
  //   const { type } = this.props
  //   // const renderMethodName = `renderMode${type}`
  //   switch (type) {
  //     case 1:
  //       return this.renderMode1()
  //     default:
  //       return null
  //   }
  // }

  render() {
    const { type } = this.props
    // let result
    // switch (type) {
    //   case 1:
    //     result = this.renderMode1()
    //     break
    //   case 2:
    //     result = this.renderMode2()
    //     break
    //   case 3:
    //     result = this.renderMode3()
    //     break
    //   default:
    //     result = null
    // }
    return (
      <View style={{ overflow: 'hidden' }}>
        {type === 1 && this.renderMode1()}
        {type === 2 && this.renderMode2()}
        {type === 3 && this.renderMode3()}
      </View>
    )
  }
}
