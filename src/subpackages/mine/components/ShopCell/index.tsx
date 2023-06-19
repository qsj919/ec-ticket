import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import React from 'react'
import { Shop } from '@@types/base'
import defaultShopLogo from '@/images/default_shop.png'
import styles from './shop_cell.module.scss'

interface Props {
  data: Shop
  buttonText?: string
  buttonIcon?: string
  onBtnClick(data: Shop): void
  onCellClick(data: Shop): void
}

export default function ShopCell({ data, buttonText, buttonIcon, onBtnClick, onCellClick }: Props) {
  function btnClick(e) {
    e.preventDefault()
    onBtnClick(data)
  }

  function cellClick() {
    onCellClick(data)
  }
  const renderBtn = typeof buttonText === 'string'
  const renderBtnIcon = typeof buttonIcon !== 'undefined'
  return (
    <View className={styles.shop_cell} key={data.shopid} onClick={cellClick}>
      <Image className={styles.shop_cell__logo} src={data.logoUrl || defaultShopLogo} />
      <View className={styles.shop_cell__content}>
        <View className={styles.shop_cell__content__title}>{data.shopName}</View>
        <Text className={styles.shop_cell__content__address}>{data.addr}</Text>
      </View>
      {renderBtn && (
        <View className={styles.shop_cell__btn} onClick={btnClick}>
          {renderBtnIcon && <Image src={buttonIcon} className={styles.shop_cell__btn__icon} />}
          <Text className={styles.shop_cell__btn__text}>{buttonText}</Text>
        </View>
      )}
    </View>
  )
}

ShopCell.defaultProps = {
  onBtnClick() {},
  onCellClick() {}
}
