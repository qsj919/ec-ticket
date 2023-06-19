import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import { formatDate } from '@utils/utils'
import { OrderListItem } from '@@/subpackages/factory/types'
import styles from './index.module.scss'

type Props = {
  data: OrderListItem
  onOrderClick(data: OrderListItem): void
}
export default function OrderCell(props: Props) {
  const { data, onOrderClick } = props
  return (
    <View className={styles.container} onClick={() => onOrderClick(data)}>
      <View className={styles.batch}>{`批次${data.billNo}`}</View>
      <View className={styles.base}>
        <View className={styles.base__item}>{`门店：${data.invName}`}</View>
        <View className={styles.base__item}>{`操作人：${data.opName}`}</View>
        <View className={styles.base__item}>{`订货日期：${formatDate(
          data.proDate,
          'YYYY-MM-DD'
        )}`}</View>
      </View>
    </View>
  )
}

OrderCell.defaultProps = {
  data: {}
}
