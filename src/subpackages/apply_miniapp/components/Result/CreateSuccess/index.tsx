import { View, Image, Text } from '@tarojs/components'
import React from 'react'
import Success from '../../../images/success.png'
import styles from '../index.module.scss'

export default function CreateSuccess() {
  return (
    <View className={styles.page}>
      <Image className={styles.img} src={Success} mode='widthFix'></Image>
      <Text className={styles.title}>小程序创建成功</Text>
    </View>
  )
}
