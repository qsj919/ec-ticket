import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import backIcon from '@/images/angle_left_black_60.png'
import styles from './header.module.scss'

interface Props {
  title: string
}

export default function PageHeader({ title }: Props) {
  function back() {
    Taro.navigateBack()
  }
  return (
    <View className={styles.header}>
      <Image src={backIcon} className={styles.header__back} onClick={back} />
      <Text className={styles.header__title}>{title}</Text>
    </View>
  )
}
