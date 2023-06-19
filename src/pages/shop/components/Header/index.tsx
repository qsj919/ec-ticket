/**
 * @Author: Miao Yunliang
 * @Date: 2019-12-04 09:28:11
 * @Desc: 店铺首页的头部
 */
import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import angleRightIcon from '@/images/icon/angle_right_40.png'
import locationIcon from '@/images/icon/location_white_36.png'
import bg from '@/images/special/shop_header_bg.png'
import { ShopDetail } from '@@types/base'
import navigatorSvc from '@services/navigator'
import styles from './header.module.scss'

interface Props {
  data: ShopDetail
}

export default function ShopHeader({ data }: Props) {
  function onAddressClick() {
    const { longitude } = data
    if (!longitude) return
    navigatorSvc.navigateTo({
      url: `/pages/map/index?longitude=${longitude}&latitude=${data.latitude}`
    })
  }

  return (
    <View className={styles.container} style={{ backgroundImage: `url(${bg})` }}>
      <View className={styles.basic}>
        <View className={styles.basic__left}>
          <Image className={styles.basic__left__avatar} src={data.logoUrl} />
          <View className={styles.basic__left__info}>
            <Text>{data.shopName}</Text>
            <ScrollView scrollX className={styles.basic__left__tags}>
              {data.mainClass.map(item => (
                <View className={styles.basic__left__tag} key={item}>
                  <Text>{item}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
        <View className={styles.basic__right}>区域：全国</View>
      </View>
      <View className={styles.address} onClick={onAddressClick}>
        <Image className={styles.location} src={locationIcon} />
        <View className={styles.address__text}>{data.addr || '暂无位置信息'}</View>
        {data.longitude !== 0 && data.latitude !== 0 && (
          <Image className={styles.angle_right} src={angleRightIcon} />
        )}
      </View>
    </View>
  )
}
