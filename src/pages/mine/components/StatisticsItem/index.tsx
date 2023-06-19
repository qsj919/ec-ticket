import Taro from '@tarojs/taro'
import React from 'react'

import { View, Text, Image } from '@tarojs/components'
import { BaseItem } from '@@types/base'
import classNames from 'classnames'
import arrowUpIcon from '@/images/arrow_up_red_20.png'
import arrowDownIcon from '@/images/arrow_down_green_20.png'
import { moneyInShort } from '@utils/utils'
import styles from './index.module.scss'

interface Prpos extends BaseItem {
  ringRatio: string
}

export function StatisticsItem({ label, value, ringRatio }: Prpos) {
  const isUp = ringRatio.substring(0, 1) === '+'

  return (
    <View className={styles.statistics_item}>
      <Text className={styles.statistics_item__label}>{label}</Text>
      <Text className={styles.statistics_item__value}>{value}</Text>
      <View
        className={classNames(styles.statistics_item__diff, {
          [styles['statistics_item__diff--up']]: isUp,
          [styles['statistics_item__diff--down']]: !isUp
        })}
      >
        <Image
          src={isUp ? arrowUpIcon : arrowDownIcon}
          className={styles.statistics_item__diff__icon}
        />
        {ringRatio.substring(1)}
      </View>
    </View>
  )
}

StatisticsItem.defaultProps = {
  ringRatio: ''
}
