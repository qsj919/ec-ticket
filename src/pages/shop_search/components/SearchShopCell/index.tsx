import Taro, { pxTransform } from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import classNames from 'classnames'
import { SearchShop } from '@@types/base'
import defaultLogo from '@/images/default_shop.png'
import phoneIcon from '@/images/icon/phone_gray_28.png'
import locationIcon from '@/images/icon/location_gray_32.png'
import trackSvc from '@services/track'
import events from '@constants/analyticEvents'
import styles from './index.module.scss'

interface Props {
  data: SearchShop
  onCellClick?(data: SearchShop): void
}

export default function ShopSearchCell({ data, onCellClick }: Props) {
  function cellClick() {
    onCellClick && onCellClick(data)
  }

  function onTelClick(e) {
    e.stopPropagation()
    trackSvc.track(events.shopSearchPhoneClick)
    if (data.phone) {
      Taro.makePhoneCall({ phoneNumber: data.phone })
    }
  }

  const isRemVisible = data.newDres7 + data.newDres30 > 0

  return (
    <View
      className={styles.search_shop}
      style={{ paddingBottom: isRemVisible ? pxTransform(30) : 0 }}
    >
      <View className={styles.shop_cell} key={data.shopid} onClick={cellClick}>
        <Image className={styles.shop_cell__logo} src={data.logoUrl || defaultLogo} />
        <View className={styles.shop_cell__content}>
          <View className={styles.shop_cell__content__title}>{data.shopName}</View>
          <View
            className={classNames(styles.shop_cell__content__line, {
              [styles['shop_cell__content__line--phone']]: !!data.phone
            })}
            onClick={onTelClick}
          >
            <Image className={styles.line__image} src={phoneIcon} />
            <Text>{data.phone || '暂无店铺联系方式'}</Text>
          </View>
          <View
            className={classNames(styles.shop_cell__content__line)}
            // onClick={onAddrClick}
          >
            <Image className={styles.line__image} src={locationIcon} />
            <Text>{data.addr || '暂无店铺位置信息'}</Text>
          </View>
        </View>
      </View>
      {isRemVisible && (
        <View className={styles.rem}>
          <View className={styles.rem__angle_top} />
          <Text>
            {data.newDres7 > 0 && (
              <Text>
                近7天上新<Text className='highlight_text'>{data.newDres7}</Text>款；
              </Text>
            )}
            {data.newDres30 > 0 && (
              <Text>
                近30天上新<Text className='highlight_text'>{data.newDres30}</Text>款
              </Text>
            )}
          </Text>
        </View>
      )}
    </View>
  )
}

ShopSearchCell.defaultProps = {
  onBtnClick() {},
  onCellClick() {}
}
