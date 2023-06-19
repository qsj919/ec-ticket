import Taro, { Config } from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import { GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import defaultLogo from '@/images/default_shop.png'
import SearchbarView from '@components/SearchBarView/SearchbarView'
import { Shop } from '@@types/base'
import { getDateLabel } from '@utils/utils'
import trackSvc from '@services/track'
import events from '@constants/analyticEvents'
import cn from 'classnames'

import styles from './index.module.scss'

const mapStateToProps = ({ shop }: GlobalState) => {
  const _shopList = shop.list.sort((f, s) => f.showOrder - s.showOrder)
  return {
    allShopList: _shopList
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  shopList: Array<Shop>
}

// @connect(mapStateToProps)
class AllShops extends React.Component<StateProps, State> {
  // config: Config = {
  //   navigationBarTitleText: '全部拿货门店'
  // }

  state = {
    shopList: [] as Shop[]
  }

  componentDidMount() {
    this.setState({
      shopList: this.props.allShopList.map(s => ({ ...s }))
    })
  }

  onItemClick = e => {
    const { allShopList } = this.props
    const { _id } = e.currentTarget.dataset
    const _idx = allShopList.findIndex(s => s.id === _id)
    trackSvc.track(events.allShopsShopClick)
    Taro.redirectTo({
      url: `/subpackages/ticket/pages/ticket_home/index?id=${allShopList[_idx].id}&type=2`
    })
  }

  onSearch = (searchValue: string) => {
    this.setState({
      shopList: this.getFilterShopList(searchValue)
    })
    trackSvc.track(events.allShopsSearchClick)
  }

  getFilterShopList = searchValue => {
    const { allShopList } = this.props
    return allShopList.filter(s => s.shopName.includes(searchValue))
  }

  render() {
    const { shopList } = this.state
    return (
      <View className={styles.allShopView}>
        <View className={styles.allShopStickyView}>
          <View className={styles.search_container}>
            <SearchbarView
              onClearSearchClick={this.onSearch}
              placeholder='搜索拿货门店'
              onSearchClick={this.onSearch}
              backgroundColor='white'
              containerStyle='border: 1px solid #E62E4D;'
            />
            {/* <Text className={styles.shops_search_cancel}>取消</Text> */}
            {/* <View className={styles.search_result}>{searchTitle}</View> */}
          </View>
        </View>
        <View className={styles.allShopView__shops_content}>
          <View className={styles.allShopView__shops_content___shops}>
            {shopList.map(shop => (
              <View
                key={shop.id}
                className={styles.allShopView__shops_content___shops____shopItem}
                data-_id={shop.id}
                onClick={this.onItemClick}
              >
                {/* <Image
                src={shop.logoUrl ? shop.logoUrl : defaultLogo}
                className={styles.allShop_shopLogourl}
                mode='aspectFill'
              />
              <Text className={styles.allShopsShopName}>{shop.shopName}</Text> */}
                <View
                  className={styles.allShopView__shops_content___shops____shopItem_____shoplogo}
                >
                  {shop.logoUrl ? (
                    <Image
                      src={shop.logoUrl ? shop.logoUrl : defaultLogo}
                      className={styles.allShop_shopLogourl}
                      mode='aspectFill'
                    />
                  ) : (
                    <View className={cn(styles.allShop_shopLogourl, styles.noLogoView)}>
                      <View
                        className={cn(styles.noLogoText, {
                          [styles['text_center']]: shop.shopName.length <= 3
                        })}
                        style={{
                          fontSize: `25rpx`
                        }}
                      >
                        <Text
                          style={{
                            fontSize: `${shop.shopName.length <= 3 && '30rpx'}`
                          }}
                        >
                          {shop.shopName}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
                <View
                  className={styles.allShopView__shops_content___shops____shopItem_____shopContent}
                >
                  <Text>{shop.shopName}</Text>
                  <Text className={styles.pick_goods_time}>
                    {/* {shop.lastBuyDate && getDateLabel(shop.lastBuyDate.split(' ')[0])} */}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        {/* <View className={styles.cancelView}>
        <View className={styles.cancel_action} onClick={this.onAllShopCancelClick}>
          取消
        </View>
      </View> */}
      </View>
    )
  }
}
export default connect(mapStateToProps)(AllShops)