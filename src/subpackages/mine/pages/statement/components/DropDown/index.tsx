import Taro from '@tarojs/taro'
import React, { useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import classNames from 'classnames'
import caretDown from '@/images/caret_down_gray_32.png'
import { ActiveItem } from '@@types/base'
import styles from './drop_down.module.scss'

interface DropDownProps {
  data: ActiveItem[]
  onItemClick: (item: ActiveItem) => void
}

export default function DropDown({ data, onItemClick }: DropDownProps) {
  const [isMenuVisible, changeMenuViible] = useState(false)
  const current = data.find(item => item.active) || data[0]
  function toggleDropDown() {
    changeMenuViible(prevState => !prevState)
  }
  return (
    <View id='drop_down' className={styles.container} onClick={toggleDropDown}>
      <View className={styles.content}>
        <Text>{current.label}</Text>
        <Image src={caretDown} className={styles.caret_down} />
      </View>
      <View
        className={classNames(styles.drop_down, {
          [styles['drop_down--active']]: isMenuVisible
        })}
      >
        {data.map(item => (
          <View
            key={item.value}
            className={classNames(styles.drop_down__menu, {
              [styles['drop_down__menu--active']]: item.active
            })}
            onClick={() => onItemClick(item)}
          >
            {item.label}
          </View>
        ))}
      </View>

      {isMenuVisible && <View className={styles.mask} onTouchStart={toggleDropDown} />}
    </View>
  )
}

DropDown.defaultProps = {
  data: []
}
