import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import SlideContainer, { SlideDirection } from '@components/SlideContainer/SlideContainer'
import bg from '@/images/mini_qr_code_bg.png'
import closeIcon from '@/images/icon/close_gray_32.png'
import styles from './index.module.scss'

interface Props {
  visible: boolean
  url: string
  onRequestClose(): void
  shopName: string
}

export default function QRCodeModal({ visible, url, onRequestClose, shopName }: Props) {
  return (
    <SlideContainer
      visible={visible}
      direction={SlideDirection.Center}
      containerClass='bg_trans'
      onRequestClose={onRequestClose}
    >
      <View className={styles.container} style={{ backgroundImage: `url(${bg})` }}>
        <Image className={styles.close} src={closeIcon} onClick={onRequestClose} />
        <View className={styles.title}>{shopName}</View>
        <Image src={url} className={styles.qr_code} />
        <View className={styles.tip}>长按识别二维码进入微商城</View>
      </View>
    </SlideContainer>
  )
}
