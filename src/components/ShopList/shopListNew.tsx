import Taro from '@tarojs/taro'
import React from 'react'
import { View, ScrollView, Text, Image } from '@tarojs/components'
import cn from 'classnames'
import { CLOUD_BILL_FLAG, Shop } from '@@types/base'
import AllShopsLabel from '@/images/all_shops_label.png'
import trackSvc from '@services/track'
import events from '@constants/analyticEvents'
import defaultLogo from '@/images/multi_shop_logo.png'

import styles from './shopListNew.module.scss'

type PropsType = {
  onShopNameClick: (shop) => void
  shopList: Array<Shop>
}
type StateType = {}
export default class shopListNew extends React.PureComponent<PropsType, StateType> {
  static defaultProps = {
    activeColor: '#F2503D',
    size: 'small',
    checkShopIndex: 0,
    shopItem: {},
    shopList: []
  }

  onItemClick = e => {
    const { onShopNameClick, shopList } = this.props
    const { _id } = e.currentTarget.dataset
    const _idx = shopList.findIndex(s => s.id === _id)
    onShopNameClick(shopList[_idx])
  }

  getFilterShopList = searchValue => {
    const { shopList } = this.props
    return shopList.filter(s => s.shopName.includes(searchValue))
  }

  onAllShopsClick = () => {
    trackSvc.track(events.allShopsClick)
    Taro.navigateTo({
      url: '/subpackages/ticket/pages/all_shops/index'
    })
  }

  getShopList = () => {
    const { shopList = [] } = this.props
    if (shopList.length <= 10) return shopList.map(s => ({ ...s }))
    if (shopList.length > 10) return shopList.slice(0, 9).map(s => ({ ...s }))
    return []
  }

  renderMoreShops = () => {
    const { shopList } = this.props
    const lastFourShop = shopList.slice(shopList.length - 4)
    return (
      <View onClick={this.onAllShopsClick} className={styles.sln_container_shops__shop}>
        <View className={styles.all_shops_item_view}>
          <Image src={lastFourShop[0].logoUrl || defaultLogo} className={styles.last_shop__first} />
          <Image
            src={lastFourShop[1].logoUrl || defaultLogo}
            className={styles.last_shop__second}
          />
          <Image src={lastFourShop[2].logoUrl || defaultLogo} className={styles.last_shop__third} />
          <Image
            src={lastFourShop[3].logoUrl || defaultLogo}
            className={styles.last_shop__fourth}
          />
        </View>
        <Image className={styles.all_shops_label} src={AllShopsLabel} />
      </View>
    )
  }

  render() {
    const { shopList } = this.props
    const _shopList: Array<Shop> = this.getShopList()
    return (
      <View className={styles.sln_container}>
        <View style='width:100%;height:100%;'>
          <View className={styles.sln_container_shops}>
            {_shopList.map((shopItem, index) => (
              <View
                id={(index === 0 && 'shopItem') || ''}
                key={shopItem.shopid}
                data-_id={shopItem.id}
                onClick={this.onItemClick}
                className={styles.sln_container_shops__shop}
              >
                {shopItem.logoUrl ? (
                  <Image
                    className={styles.sln_shopLogoUrl}
                    src={shopItem.logoUrl}
                    mode='aspectFill'
                  />
                ) : (
                  <View className={cn(styles.sln_shopLogoUrl, styles.noLogoView)}>
                    <View
                      className={cn(styles.noLogoText, {
                        [styles['text_center']]: shopItem.shopName.length <= 3
                      })}
                      style={{
                        fontSize: `17rpx`
                      }}
                    >
                      <Text
                        style={{
                          fontSize: `${shopItem.shopName.length <= 3 && '25rpx'}`
                        }}
                      >
                        {shopItem.shopName}
                      </Text>
                    </View>
                  </View>
                )}
                <Text className={styles.sln_shopName}>{shopItem.shopName}</Text>
              </View>
            ))}
            {shopList.length > 10 && this.renderMoreShops()}
          </View>
        </View>
      </View>
    )
  }
}
