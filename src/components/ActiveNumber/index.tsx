import Taro from '@tarojs/taro'
import React, { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import styles from './number.module.scss'

interface Props {
  number: number
}

export default function ActiveNumber({ number }: Props) {
  const zeroToNineArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const numberStr = String(number)
    .padStart(2, '0')
    .split('')
  const [lengthArray, setLength] = useState(numberStr)
  useEffect(() => {
    const numberStr = String(number)
      .padStart(2, '0')
      .split('')
    setLength(numberStr)
  }, [number])
  return (
    <View className={styles.container}>
      {lengthArray.map(current => (
        <View
          className={styles.num_container}
          style={{ transform: `translateY(-${current}00%)` }}
          key={current}
        >
          {zeroToNineArray.map(item => (
            <View className={styles.num} key={item}>
              {item}
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}
