import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import EmptyView from '@components/EmptyView'
import { Goods } from '@@types/base'
import styles from './index.module.scss'
import GoodsItem from '../GoodsItem'

interface Props {
  data: Goods[]
}

export default function ListContent({ data }: Props) {
  return (
    <View className={styles.list_content}>
      {data.length > 0 ? (
        data.map(item => (
          <View className={styles.list__item} key={item.code}>
            <GoodsItem goods={item} />
          </View>
        ))
      ) : (
        <EmptyView type={4} />
      )}
    </View>
  )
}
