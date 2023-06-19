import Taro, { pxTransform } from '@tarojs/taro'
import React, { useState, ReactText} from 'react'
import { View, Text, Image } from '@tarojs/components'
import classNames from 'classnames'
import defaultLogo from '@/images/default_goods.png'
import { getMoneyPrefix } from '@utils/utils'
import styles from './detail_cell.module.scss'

interface Props {
  imgThumbUrl: string
  code: string
  name: string
  total: number
  num: string | number
  skus: ReactText[][]
  styleType: number
}

export default function({ imgThumbUrl, code, name, total, skus, num, styleType }: Props) {
  const [isSkusVisible, changeSkusVisible] = useState(false)
  function toggleSkus() {
    if (styleType === 9) {
      return
    }
    changeSkusVisible(skusVisible => !skusVisible)
  }
  return (
    <View
      className={classNames(styles.container, {
        [styles['container--skus']]: isSkusVisible
      })}
      style={{
        height: pxTransform((isSkusVisible ? (skus.length + 1) * 40 : 0) + 120)
      }}
    >
      <View className={styles.detail_cell} onClick={toggleSkus}>
        <Image className={styles.avatar} src={imgThumbUrl || defaultLogo} />
        <View className={styles.content}>
          <View className={classNames(styles.content__left, styles.content__block)}>
            <Text className={styles.content__block__title}>{code}</Text>
            <Text className={styles.content__block__text}>{name}</Text>
          </View>
          <View className={classNames(styles.content__right, styles.content__block)}>
            <Text className={styles.content__block__title}>{`${getMoneyPrefix(
              total,
              true
            )}¥${Math.abs(total)}`}</Text>
            {styleType !== 9 && <Text className={styles.content__block__text}>{num}件</Text>}
          </View>
        </View>
      </View>
      {isSkusVisible && isSkusVisible && (
        <View className={styles.skus} style={{ overflowX: skus[0].length > 5 ? 'scroll' : 'auto' }}>
          {skus.map((row, index) => (
            <View
              className={styles.skus__row}
              key={index.toString()}
              style={{ display: row.length <= 5 ? 'flex' : 'block' }}
            >
              {row.map(text => (
                <View key={text} className={styles.skus__row__text}>
                  {text}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
