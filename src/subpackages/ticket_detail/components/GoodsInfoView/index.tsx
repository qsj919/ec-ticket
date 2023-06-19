import Taro from '@tarojs/taro'
import React, { PureComponent }  from 'react'
import { View, Text, Image } from '@tarojs/components'
import shareIcon from '@/images/share_button.png'
import styles from './goods_info.module.scss'
import { GoodsParmas } from '../../pages/eTicketDetail/typeConfig'

interface Props {
  code: string
  name: string
  colors: string
  sizes: string
  shareBtn: boolean
  onShareClick: () => void
  goodsParams: GoodsParmas
}

const params = [
  { label: '材质', value: 'fabricName' },
  { label: '类别', value: 'className' },
  { label: '季节', value: 'seasonName' },
  { label: '风格', value: 'themeName' }
]

export default class GoodsInfoView extends React.PureComponent<Props> {
  static defaultProps = {
    shareBtn: false
  }

  onShareClick = () => {
    this.props.onShareClick()
  }

  render() {
    const { code, name, colors, sizes, shareBtn, goodsParams } = this.props
    const goodsParamsVisible = Object.getOwnPropertyNames(goodsParams).length > 0
    return (
      <View className={styles.container}>
        <View className={styles.basic}>
          <Text>{code}</Text>
          <View className={styles.name}>{name}</View>
          {shareBtn && (
            <Image src={shareIcon} className={styles.share} onClick={this.onShareClick} />
          )}
        </View>
        <View className={styles.color_size}>
          <View className={styles.color_size__item}>
            <Text className={styles.color_size__item__tag}>颜色</Text>
            <View>{colors}</View>
          </View>
          <View className={styles.color_size__item}>
            <Text className={styles.color_size__item__tag}>尺码</Text>
            <View>{sizes}</View>
          </View>
        </View>
        {goodsParamsVisible && (
          <View className={styles.good_attribute}>
            {params.map(item => {
              const value = goodsParams[item.value]
              if (value) {
                return (
                  <Text className={styles.good_attribute__item}>{`${item.label}： ${value}`}</Text>
                )
              }
            })}
          </View>
        )}
      </View>
    )
  }
}
