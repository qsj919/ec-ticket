import Taro from '@tarojs/taro'
import React from 'react'
import { Image, Text, View } from '@tarojs/components'

import EmptyView from '@components/EmptyView'
import { GlobalState } from '@@types/model_state'

import { connect } from 'react-redux'
import PhoneGetter from '@components/PhoneGetter'
import defaultShopLogo from '@/images/default_shop.png'
import { Shop } from '@@types/base'
import { fetchDownStreamShop, fetchUserType } from '@api/factory_api_manager'
import { urlQueryParse, getTaroParams } from '@utils/utils'

import emptyImg from '../../images/search_empty.png'

import styles from './index.module.scss'

const mapStateToProps = ({ user }: GlobalState) => ({
  phoneGetterVisible: !!user.sessionId && !user.phone,
  sessionId: user.sessionId,
  logining: user.logining
})

type StateProps = ReturnType<typeof mapStateToProps>

type State = {
  shopList: Shop[]
}

// @connect(mapStateToProps)
class FactoryIndex extends React.PureComponent<StateProps> {
  // config = {
  //   navigationBarTitleText: '下游档口'
  // }

  emptyInfo = {
    label: '当前手机号未找到匹配信息',
    image: emptyImg
  }

  state = {
    shopList: [] as Shop[]
  }

  componentDidMount() {
    Taro.showLoading({ title: '登录中...' })
    if (this.props.sessionId) {
      this.init()
    }
  }

  componentDidUpdate(prevProps: Readonly<StateProps>) {
    if (
      (!prevProps.sessionId && this.props.sessionId) ||
      (prevProps.phoneGetterVisible && !this.props.phoneGetterVisible)
    ) {
      this.init()
    }
  }

  init = async () => {
    let _sn, _epid, _shopid
    try {
      const { q, sn, epid, shopid } = getTaroParams(Taro.getCurrentInstance?.())
      _sn = sn
      _epid = epid
      _shopid = shopid
      if (q) {
        const { sn, epid, shopid } = urlQueryParse(decodeURIComponent(q))
        _sn = sn
        _epid = epid
        _shopid = shopid
      }
      if (_sn) {
        try {
          const { data: res } = await fetchUserType({ sn: _sn, epid: _epid, shopid: _shopid })
        } catch (e) {}
      }

      const { data } = await fetchDownStreamShop()
      this.setState({ shopList: data.rows })
      // if (res.result === 1) {

      // }
      Taro.hideLoading()
    } catch (e) {
      Taro.hideLoading()
    }
  }

  onChangePhone = () => {
    // this.props.dispatch({type: 'user/verifyPhone', payload})
    // this.setState({PhoneGetter})
  }

  onShopClick = (shop: Shop) => {
    Taro.navigateTo({
      url: `/subpackages/factory/pages/shop/index?mpErpId=${shop.id}&shopName=${encodeURIComponent(
        shop.shopName
      )}`
    })
  }

  onCustomClick = () => {
    Taro.switchTab({ url: '/pages/eTicketList/index' })
  }

  render() {
    const { phoneGetterVisible, logining } = this.props
    const { shopList } = this.state

    return (
      !logining && (
        <View className={styles.container}>
          {shopList.length > 0 ? (
            <View style={{ padding: '0 40rpx', backgroundColor: 'white' }}>
              {shopList.map(shop => (
                <View
                  className={styles.shop_cell}
                  key={shop.shopid}
                  onClick={() => this.onShopClick(shop)}
                >
                  <Image className={styles.shop_cell__logo} src={shop.logoUrl || defaultShopLogo} />
                  <View className={styles.shop_cell__content}>
                    <View className={styles.shop_cell__content__title}>{shop.shopName}</View>
                    <Text className={styles.shop_cell__content__address}>{shop.phone}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <EmptyView
              emptyInfo={this.emptyInfo}
              buttonLabel='更改手机号'
              onButtonClick={this.onChangePhone}
            />
          )}

          <PhoneGetter visible={phoneGetterVisible} desc='请使用手机号登录' />

          <View className={styles.custom_btn} onClick={this.onCustomClick}>
            进入客户版
          </View>
        </View>
      )
    )
  }
}
export default connect(mapStateToProps)(FactoryIndex)