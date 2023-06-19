import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image } from '@tarojs/components'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { SlideDirection } from '@components/SlideContainer/type'
// import followText from '@/images/special/follow_text.png'
import config from '@config/config'
import styles from './index.module.scss'

interface Props {
  visible: boolean
  onRequestClose?(): void
  qrUrl?: string
}

export default class FollowGuide extends React.PureComponent<Props> {
  render() {
    const { qrUrl } = this.props
    return (
      <SlideContainer
        visible={this.props.visible}
        direction={SlideDirection.Center}
        maxHeight={100}
        containerClass='bg_trans'
        onRequestClose={this.props.onRequestClose}
      >
        <View className={styles.container}>
          {/* <View className={styles.header}>
            <Image src={followText} className={styles.header__text} />
          </View> */}
          <View className={styles.qr_content}>
            <Image
              src={qrUrl || config.followQrUrl}
              className={styles.qr_content__qr_code}
              showMenuByLongpress
            />
          </View>
          <View className={styles.tips}>
            <View className={styles.tips__title}>操作步骤</View>
            <View className={styles.tips__item}>1.可长按保存二维码至手机相册</View>
            <View className={styles.tips__item}>2.用微信识别二维码并关注</View>
          </View>
        </View>
      </SlideContainer>
    )
  }
}
