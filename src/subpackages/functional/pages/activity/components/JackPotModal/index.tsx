import Taro from '@tarojs/taro'
import React from 'react'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { SlideDirection } from '@components/SlideContainer/type'
import config from '@config/config'
import messageFeedback from '@services/interactive'
import { Button, Image, View } from '@tarojs/components'
import trackSvc from '@services/track'
import events from '@constants/analyticEvents'
import classnames from 'classnames'
import dva from '@utils/dva'
import styles from './index.module.scss'

interface Props {
  visible: boolean
  prize: string
  code?: string
  activityPrizeId: number // 奖品ID
  onRequestClose?(): void
  expireDate: string
}

export default function JackPotModal(props: Props) {
  function onGetPhoneNumber(e) {
    if (e.detail.errMsg.includes('ok')) {
      const { encryptedData, iv, code } = e.detail
      trackSvc.track(events.getThePrize, { prizeName: props.prize })
      dva
        .getDispatch()({
          type: 'user/bindPhone',
          payload: { encryptedData, iv, prizeName: props.prize, code }
        })
        .then(() => {
          messageFeedback.showToast('我们会尽快联系您兑奖。', 3000)
          props.onRequestClose && props.onRequestClose()
        })
    }
  }

  return (
    <SlideContainer
      containerClass='bg_trans'
      visible={props.visible}
      direction={SlideDirection.Center}
      maxHeight={100}
      onRequestClose={props.onRequestClose}
    >
      <View className={styles.container}>
        <View className={styles.content}>
          <View className={styles.title}>中奖啦！</View>
          <View className={styles.intro}>恭喜您获得</View>
          <View className={styles.prize}>{props.prize || '神秘奖品'}</View>
          <View className={styles.tips}>{`请在${props.expireDate.slice(0, 10)}之前兑换奖品`}</View>
          {/* <View className={styles.code}>{`兑换码${props.code}`}</View>
          <Image showMenuByLongpress className={styles.qr} src={config.followQrUrlFromAct} />
          <View className={styles.tips}>请留下您的手机号，我们会在24小时内联系您</View>
          <View className={styles.tips}>您也可以在公众号中留言</View>
          <View className={styles.tips}>我们会有专人帮您完成兑奖流程</View> */}
        </View>
        <View className={styles.buttons}>
          <Button
            className={classnames(styles.button, styles['button--left'])}
            openType='getPhoneNumber'
            onGetPhoneNumber={onGetPhoneNumber}
          >
            立即领取
          </Button>
          {/* <View className={styles.button} onClick={onSaveClick}>
            保存二维码
          </View> */}
        </View>
      </View>
    </SlideContainer>
  )
}

JackPotModal.defaultProps = {
  expireDate: ''
}
