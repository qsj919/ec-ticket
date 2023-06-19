import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Image } from '@tarojs/components'

import noDataImg from '@/images/no_data.png'

import styles from './index.module.scss'

type PropsType = {
  height?: string
  label: string
}
type StateType = {}
export default class Empty extends Component<PropsType, StateType> {
  static defaultProps = {
    label: '暂无数据'
  }

  render() {
    const { height, label } = this.props
    return (
      <View className={styles.noDataPage} style={{ height }}>
        <Image src={noDataImg} className={styles.img} />
        <View className={styles.text}>{label}</View>
      </View>
    )
  }
}
