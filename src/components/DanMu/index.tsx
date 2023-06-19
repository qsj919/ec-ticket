/**
 * @Author: Miao Yunliang
 * @Date: 2019-12-05 11:03:49
 * @Desc: 弹幕列表 滚动 仅支持预置好的弹幕列表
 */
import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import styles from './dan_mu.module.scss'

interface Props {
  data: string[]
}

export default class DanMu extends React.PureComponent<Props> {
  static defaultProps = {
    data: []
  }

  getRandomNumber = () => {
    const sign = Math.random() > 0.5 ? '+' : '-'
    const number = Math.random()
    return Number(sign + number)
  }

  render() {
    const { data } = this.props
    return (
      <View className={styles.container}>
        {data.map((item, index) => (
          <View
            key={item}
            className={styles.danmu}
            style={{
              animationDelay: `${index * 7 + this.getRandomNumber() + 0.5}s`,
              top: `${Math.random() * 80}%`
            }}
          >
            {item}
          </View>
        ))}
      </View>
    )
  }
}
