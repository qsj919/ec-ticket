import Taro, { pxTransform } from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import { connect } from 'react-redux'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import EButton from '@components/Button/EButton'
import PageHeader from '@components/PageHeader'
import ShopCell from '@@/subpackages/mine/components/ShopCell'
import classNames from 'classnames'
import locationIcon from '@/images/location_icon.png'
import { t } from '@models/language'
import { getTaroParams } from '@utils/utils'
import noDataImg from '@/images/no_data.png'
import defaultLogo from '@/images/default_shop.png'
import navigatorSvc from '@services/navigator'
import { CLOUD_BILL_FLAG, Shop } from '@@types/base'
import styles from './index.module.scss'

const mapStateToPrps = ({ shop, user }: GlobalState) => ({
  shopList: shop.list,
  sessionId: user.sessionId
})

type StateProps = ReturnType<typeof mapStateToPrps>

enum PageFrom {
  BindPhone = '0',
  Mine = '1',
  Cloud = '2'
}
interface State {
  from: PageFrom
}

// @connect<StateProps, {}, DefaultDispatchProps>(mapStateToPrps)
class ShopList extends React.PureComponent<StateProps & DefaultDispatchProps, State> {
  // config = {
  //   navigationBarTitleText: '拿货店铺'
  // }

  constructor(props) {
    super(props)
    const { from = PageFrom.Mine } = getTaroParams(Taro.getCurrentInstance?.())
    this.state = {
      from: from as PageFrom
    }
  }

  componentDidMount() {
    if (this.state.from === PageFrom.BindPhone) document.title = '绑定成功'
    if (this.state.from === PageFrom.Cloud) {
      Taro.setNavigationBarTitle({ title: '选择店铺' })
    }
  }

  onBtnClick = () => {
    const { sessionId } = this.props
    const query = `?menuBtn=1&subscribe=1&sessionId=${sessionId}`
    navigatorSvc.switchTab({ url: '/pages/statement/index' + query })
  }

  onShopBtnClick = (data: Shop) => {
    const { from } = this.state
    if (from === PageFrom.Cloud) {
      this.props.dispatch({ type: 'cloudBill/init', payload: { mpErpId: data.id } })
      // navigatorSvc.navigateTo({ url: '/subpackages/cloud_bill/pages/all_goods/index' })
      Taro.navigateBack()
    } else {
      this.props.dispatch({ type: 'shop/unfollow', payload: data })
    }
  }

  onShopItemClick = (mpErpId: number) => {
    // navigatorSvc.navigateTo({ url: `/pages/shop/index?mpErpId=${mpErpId}` })
  }

  getShopList = () => {
    const { shopList } = this.props
    const { from } = this.state
    return shopList.filter(shop =>
      from === PageFrom.Cloud ? shop.cloudBillFlag > CLOUD_BILL_FLAG.close : shop.id
    )
  }

  render() {
    const _shopList = this.getShopList()
    const { from } = this.state
    const buttonText = from === PageFrom.Cloud ? '进入店铺' : '取消关注'
    return (
      <View className={styles.container}>
        {_shopList.length > 0 ? (
          <View className={styles.container}>
            <View
              className={styles.shop_list}
              style={{ paddingBottom: from === PageFrom.BindPhone ? pxTransform(160) : 0 }}
            >
              <View className={styles.shop_list_wrapper}>
                {_shopList.map(item => (
                  <ShopCell
                    key={item.id}
                    data={item}
                    buttonText={buttonText}
                    onBtnClick={this.onShopBtnClick}
                  />
                ))}
              </View>
            </View>
            {from === PageFrom.BindPhone && (
              <View className={styles.button}>
                <EButton
                  label={t('checkAllTickets')}
                  size='large'
                  onButtonClick={this.onBtnClick}
                />
              </View>
            )}
          </View>
        ) : (
          <View className={styles.no_data_container}>
            <Image src={noDataImg} className={styles.no_data} />
            <Text>暂无店铺信息，请联系商家</Text>
            {/* <Text>返回首页</Text> */}
          </View>
        )}
      </View>
    )
  }
}
export default connect<StateProps, {}, DefaultDispatchProps>(mapStateToPrps)(ShopList)