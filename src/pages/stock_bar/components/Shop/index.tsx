import Taro from '@tarojs/taro'
import React, { useMemo, memo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { connect } from 'react-redux'
import checkIcon from '@/images/checked_circle_36.png'
import unCheckIcon from '@/images/icon/uncheck_circle.png'
import { stockBarItem } from '@@types/base'
import { getTotal } from '@utils/dva_helper/map_state_to_props'
import angleIcon from '@/images/angle_right_gray_40.png'
import defaultShopLogo from '@/images/default_shop.png'

import styles from './index.module.scss'
import Spu from '../Spu'

interface Props {
  shopItem: stockBarItem
  shopIndex: number
  checkShop: Function
  onShopClick: Function
  manage: boolean
  industries?: boolean
}

const mapStateToProps = () => ({})

type StateProps = ReturnType<typeof mapStateToProps>

function Shop({
  shopItem,
  shopIndex,
  checkShop,
  onShopClick,
  manage,
  industries
}: Props & StateProps) {
  const result = useMemo(() => {
    return getTotal(shopItem.spus)
  }, [shopItem.spus])

  const _isAllChecked = useMemo(() => {
    return result.isAllChecked
  }, [result])

  return (
    <View key={shopItem.shopName} className={styles.shopItem}>
      <View className={styles.shopItem__shop}>
        <View
          className={styles.shopItem__check}
          onClick={() => checkShop(shopIndex, !_isAllChecked)}
        >
          <Image
            src={_isAllChecked ? checkIcon : unCheckIcon}
            className={styles.shopItem__check_icon}
          />
        </View>
        <View className={styles.shopItem__shop_info} onClick={() => onShopClick(shopItem)}>
          <Image
            className={styles.shopItem__shop_info_image}
            src={shopItem.logoUrl || defaultShopLogo}
          />
          <Text className={styles.shopItem__shop_info_text}>{shopItem.shopName}</Text>
          <Image src={angleIcon} className={styles.shopItem__shop_info_icon} />
        </View>
      </View>
      {shopItem.spus.map(
        (spu, index) =>
          spu.skus &&
          spu.skus.length && (
            <Spu
              key={spu.code}
              index={index}
              shopIndex={shopIndex}
              spu={spu}
              spuShowPrice={shopItem.spuShowPrice}
              manage={manage}
              industries={industries}
            />
          )
      )}
    </View>
  )
}

// @ts-ignore
export default connect(mapStateToProps)(memo(Shop)) as FC<Props>

Shop.defaultProps = {
  shopItem: {
    spus: []
  },
  industries: false
}
