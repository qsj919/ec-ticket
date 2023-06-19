import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'

import phoneIcon from '@/images/icon/phone_gray_28.png'
import rightIcon from '@/images/icon/right_circle_40.png'

import styles from './index.module.scss'
import { AuthData } from '../../types'

interface Props {
  onCellClick?(data: AuthData): void
  buttonLabel?: string
  onButtonClick?(data: AuthData): void
  showButton?: boolean
  showRightCaret?: boolean
  data: AuthData
  showRem?: boolean
}

export default function AuthCell({
  data,
  onCellClick,
  buttonLabel,
  showRightCaret,
  showButton,
  onButtonClick,
  showRem
}: Props) {
  function onCellClickFunc() {
    onCellClick && onCellClick(data)
  }

  function onButtonClickFunc() {
    onButtonClick && onButtonClick(data)
  }

  function onPhoneClick(e) {
    e.stopPropagation()
    if (data.phone) {
      Taro.makePhoneCall({ phoneNumber: data.phone })
    }
  }
  const showNickName = !!data.nickName
  return (
    <View className={styles.cell} onClick={onCellClickFunc}>
      <Image mode='aspectFill' src={data.avatar} className={styles.cell__avatar}></Image>
      <View className={styles.cell__content}>
        <View className={styles.cell__content__info}>
          <Text className={styles.cell__info__name}>
            {data.name}
            {showNickName && showRem && (
              <Text className={styles['cell__info__name--rem']}>({data.nickName})</Text>
            )}
          </Text>
          <View className={styles.cell__info__phone} onClick={onPhoneClick}>
            <Image src={phoneIcon} className={styles.phone_icon} />
            <Text>{data.phone}</Text>
          </View>
        </View>
        {showButton && (
          <View className={styles.button} onClick={onButtonClickFunc}>
            {buttonLabel}
          </View>
        )}
        {showRightCaret && <Image src={rightIcon} className={styles.right_icon} />}
      </View>
    </View>
  )
}

AuthCell.defaultProps = {
  data: {},
  showRem: true
}
