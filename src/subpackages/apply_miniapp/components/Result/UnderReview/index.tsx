import { View, Image, Text } from '@tarojs/components'
import React from 'react'
import InfoBg from '../../../images/info_bg.png'
import styles from '../index.module.scss'

export default function UnderReview() {
  return (
    <View className={styles.page}>
      <Image className={styles.img} src={InfoBg} mode='widthFix'></Image>
      <Text className={styles.title}>资料提交成功</Text>
      <Text className={styles.label}>您即将收到微信官方发送的资质审核的服务通知</Text>
      <Text className={styles.label}>
        请于<Text className={styles.label__color}>24小时</Text>之内完成资质审核
      </Text>
    </View>
  )
}
