import Taro from '@tarojs/taro'
import React from 'react'

import { View, Image, Text } from '@tarojs/components'
import angleRight from '@/images/angle_right_gray_40.png'
import styles from './mine_cell.module.scss'

interface Props {
  icon: string
  label: string
  onCellClick: (i: number) => void
  index: number
}

export default function MineCell({ icon, label, onCellClick, index }: Props) {
  function onClick() {
    onCellClick(index)
  }
  return (
    <View onClick={onClick} className={styles.mine_cell}>
      <View className={styles.mine_cell__left}>
        <Image src={icon} className={styles.mine_cell__left__icon} />
        <Text className={styles.mine_cell__left__text}>{label}</Text>
      </View>
      <Image src={angleRight} className={styles.mine_cell__right} />
    </View>
  )
}
