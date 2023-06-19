import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image } from '@tarojs/components'
import classNames from 'classnames'
import defaultLogo from '@/images/default_shop.png'
import stickyFlag from '@/images/sticky_flag.png'
// import newIcon from '@/images/new_icon.png'
import images from '@config/images'
import { CLOUD_BILL_FLAG, Shop } from '@@types/base'

import styles from './shopList.module.scss'

type PropsType = {
  onShopNameClick: Function
  shopItem: Shop
  index: number
  checkShopIndex: number
  activeColor: string
  size: 'small' | 'medium'
}
type StateType = {}
export default class ShopListItem extends React.PureComponent<PropsType, StateType> {
  static defaultProps = {
    activeColor: '#F2503D',
    size: 'small',
    checkShopIndex: 0,
    shopItem: {}
  }

  onItemClick = () => {
    const { shopItem, index, onShopNameClick } = this.props
    onShopNameClick(shopItem, index)
  }
  render() {
    const { shopItem, index, checkShopIndex, activeColor, size } = this.props
    const shopName = shopItem.shopName
    return (
      <View
        className={classNames(styles.shopItem, {
          [styles['shopItem--active']]: checkShopIndex === index,
          [styles['shopItem--small']]: size === 'small'
        })}
        key={index}
        onClick={this.onItemClick}
        style={checkShopIndex === index ? { color: activeColor } : {}}
      >
        {!shopItem.cloudBillFlag && shopItem.mallTenantId && shopItem.mallTenantId > 0 && (
          <Image src={images.e_ticket.slh_mall_logo} className={styles.micro_mall} />
        )}
        {shopItem.cloudBillFlag > CLOUD_BILL_FLAG.close && (
          <Image src={images.e_ticket.cloud_bill_logo} className={styles.cloud} />
        )}
        {shopItem.showOrder === 1 && <Image src={stickyFlag} className={styles.sticky_flag} />}
        <View className={styles.logoCover}>
          <Image
            src={shopItem.logoUrl ? shopItem.logoUrl : defaultLogo}
            className={styles.shopLogo}
          />
        </View>
        <View className={styles.shopName}>{shopName}</View>
        {/* {shopItem.isNew && <Image src={newIcon} className={styles.new_icon} />} */}
      </View>
    )
  }
}
