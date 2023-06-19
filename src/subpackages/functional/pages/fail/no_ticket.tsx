import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import { t } from '@models/language'
import warning from '@/images/warning.png'
import { getTaroParams } from '@utils/utils'
import guideImg from './images/ticket_unlock_guide.png'
import guideImg2 from './images/ticket_unlock_guide_g2.png'
import guideImg3 from './images/ticket_unlock_guide_chain.png'
import styles from './index.module.scss'

export default class Fail extends React.PureComponent<{}, { saasType: string }> {
  // config = {
  //   navigationBarTitleText: '领取失败'
  // }

  UNSAFE_componentWillMount() {
    const { saasType = '1' } = getTaroParams(Taro.getCurrentInstance?.())
    this.setState({ saasType })
  }

  componentDidMount() {
    Taro.hideHomeButton()
  }

  render() {
    let tip1, guide
    let tip2 = t('noTicketTip2')
    const { saasType } = this.state
    if (saasType === '1') {
      // 1代
      tip1 = t('noTicketTip1')
      guide = guideImg
    } else if (saasType === '2') {
      // 笑铺
      tip1 = t('noTicketTip1OfG2')
      guide = guideImg2
    } else {
      //  连锁
      tip1 = t('noTicketTip1OfG2')
      guide = guideImg3
    }
    return (
      <View className={styles.container}>
        <Image src={warning} className={styles.warning} />
        <View className={styles.title}>电子小票领取失败</View>
        <View className={styles.content}>
          <Text>{tip1}</Text>
          <View className={styles.content__line}>{tip2}</View>
        </View>
        <Image src={guide} className={this.state.saasType === '1' ? styles.guide : styles.guide2} />
      </View>
    )
  }
}
