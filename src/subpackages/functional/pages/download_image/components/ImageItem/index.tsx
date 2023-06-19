import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image } from '@tarojs/components'
import classNames from 'classnames'
import styles from './image.module.scss'

interface Data {
  code: string
  tenantSpuId: number
  name: string
  allImgUrlBig: string
  videoUrl: string
  coverUrl: string
}

interface Props {
  data: Data
  onDownloadClick: (id: number) => void
  onDownloadVideo: (url: string) => void
  goodsLength: number
}

export default function ImageItem({
  data: { code, name, allImgUrlBig, tenantSpuId, videoUrl, coverUrl },
  onDownloadClick,
  onDownloadVideo,
  goodsLength
}: Props) {
  const images = (allImgUrlBig && allImgUrlBig.split(',')) || []

  return (
    <View>
      <View className={styles.header}>
        <View className={styles.header__info}>
          <View className={styles.header__info__name}>{name}</View>
          <View className={styles.header__info__code}>{code}</View>
        </View>

        <View className={styles.header__btns}>
          {!!videoUrl && (
            <View className={styles.header__btn} onClick={() => onDownloadVideo(videoUrl)}>
              下载视频
            </View>
          )}
          {images.length > 0 && goodsLength > 1 && (
            <View className={styles.header__btn} onClick={() => onDownloadClick(tenantSpuId)}>
              下载图片
            </View>
          )}
        </View>
      </View>
      <View className={styles.imgs}>
        {images.map(url => {
          return (
            <Image
              mode='aspectFill'
              key={url}
              className={styles.imgs__img}
              src={url}
              onClick={() => Taro.previewImage({ urls: images, current: url })}
            />
          )
        })}
      </View>
    </View>
  )
}

ImageItem.defaultProps = {
  data: {
    allImgUrlBig: ''
  },
  onDownloadClick: () => null
}
