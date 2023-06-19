import Taro from '@tarojs/taro'
import React from 'react'
import { Image, Slider, View } from '@tarojs/components'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { SlideDirection } from '@components/SlideContainer/type'
import classnames from 'classnames'
import config from '@config/config'
import messageFeedback from '@services/interactive'
import styles from './index.module.scss'

interface Props {
  onRequestClose(): void
  visible: boolean
  startDate: string
  endDate: string
}

export default class FollowModal extends React.PureComponent<Props> {
  onSaveClick = () => {
    Taro.downloadFile({
      url: config.followQrUrlFromAct,
      success(res) {
        Taro.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          // @ts-ignore
          success(result) {
            // 保存成功
            messageFeedback.showToast('图片保存成功')
          },
          fail(e) {
            // 保存失败
            if (e.errMsg.includes('auth')) {
              messageFeedback.showToast('请打开相册权限或长按图片保存')
            }
          }
        })
      },
      fail(e) {
        // 下载失败
        messageFeedback.showToast('图片保存失败，请尝试长按保存')
      }
    })
  }

  render() {
    return (
      <SlideContainer
        {...this.props}
        containerClass='bg_trans'
        direction={SlideDirection.Center}
        maxHeight={100}
      >
        <View className={styles.container}>
          <View className={styles.title}>提醒</View>
          <View className={styles.warn}>
            <View>{`活动将在${this.props.startDate}至${this.props.endDate}期间开启`}</View>
            <View>敬请期待</View>
          </View>
          <Image src={config.followQrUrlFromAct} className={styles.qr} showMenuByLongpress />
          <View className={styles.follow}>扫码关注公众号</View>
          <View className={styles.follow_tip}>我们会在活动开始时候提醒您</View>
          <View className={styles.follow_tip_ex}>如需咨询活动信息，可通过公众号内与我们联系</View>
          <View className={styles.buttons}>
            <View
              className={classnames(styles.btn, styles['btn--left'])}
              onClick={this.props.onRequestClose}
            >
              关闭
            </View>
            <View className={styles.btn} onClick={this.onSaveClick}>
              保存到相册
            </View>
          </View>
        </View>
      </SlideContainer>
    )
  }
}
