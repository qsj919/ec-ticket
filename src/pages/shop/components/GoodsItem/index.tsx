import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import { Goods } from '@@types/base'

import styles from './index.module.scss'

interface Props {
  goods: Goods
}

export default function GoodsItem({ goods }: Props) {
  return (
    <View className={styles.container}>
      <Image className={styles.img} mode='aspectFill' src={goods.firstFileOrgUrl} />
      <View className={styles.info}>
        <View className={styles.info__texts}>
          <View className={styles.info__texts__code}>{goods.code}</View>
          <Text className={styles.info__texts__name}>{goods.name}</Text>
        </View>
        {/* <Image className={styles.info__favor} /> */}
      </View>
    </View>
  )
}
