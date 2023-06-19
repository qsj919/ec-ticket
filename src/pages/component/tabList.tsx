import Taro, { pxTransform } from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import styles from './tabList.module.scss'

interface Props {
  listData: Array<{
    title: string
  }>
  onTabItemClick: (index: number | string, flag?: boolean) => void
  current: number
  animation: any
  titleSize?: number
  lineWidth?: number
  lineColor?: string
  borderLine?: string
}

interface State {}

export default class Index extends React.PureComponent<Props, State> {
  static defaultProps = {
    listData: []
  }

  onTabItemClick = index => {
    const { onTabItemClick } = this.props
    onTabItemClick(index)
  }

  render() {
    const { listData, current, animation, titleSize, lineWidth, borderLine } = this.props

    return (
      <View className={styles.listTop} style={borderLine ? { border: borderLine } : {}}>
        {listData.map((item, index) => {
          return (
            <View
              className={styles.tabItem}
              key={index}
              onClick={this.onTabItemClick.bind(this, index)}
              style={titleSize ? { fontSize: `${titleSize}px` } : ''}
            >
              <View className={current === index && styles.activeTitle}>{item.title}</View>
              {index === 0 && (
                <View
                  className={styles.redLine}
                  animation={animation}
                  style={{
                    width: `${pxTransform(lineWidth || 40)}`,
                    backgroundColor: current === 0 ? '#ff6f72' : '#FF9933'
                  }}
                />
              )}
            </View>
          )
        })}
      </View>
    )
  }
}
