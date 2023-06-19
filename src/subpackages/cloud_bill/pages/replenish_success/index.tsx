import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text, Button } from '@tarojs/components'
import { connect } from 'react-redux'
import { GlobalState } from '@@types/model_state'
import { getTaroParams } from '@utils/utils'
import { VIDEO_SCENE } from '@constants/index'
import successIcon from '@/images/icon/success.png'
import styles from './index.module.scss'

const mapStateToProps = ({ shop, cloudBill, replenishment }: GlobalState) => {
  return {
    shop: shop.list.find(s => s.id == cloudBill.mpErpId),
    stockBarForbillDetail: replenishment.stockBarForbillDetail
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

type State = {
  showNoti: boolean
}

// @connect(mapStateToProps)
class OrderSuccess extends React.PureComponent<StateProps, State> {
  // config = {
  //   navigationBarTitleText: '提交成功'
  // }

  _sn: string | number = ''

  _epid: string | number = ''

  _shopName: string | number = ''

  constructor(props) {
    super(props)
    // eslint-disable-next-line
    const options = wx.getEnterOptionsSync()

    const fromVideo = VIDEO_SCENE.includes(options.scene)
    this.state = {
      showNoti: !fromVideo
    }
  }

  componentDidMount() {
    // 下单成功后重置是否为礼品卡参数
    this.props.dispatch({
      type: 'replenishment/save',
      payload: {
        isGiftCard: false
      }
    })
    if (this.props.shop) {
      this._sn = this.props.shop.sn
      this._epid = this.props.shop.epid
      this._shopName = this.props.shop.shopName
    }
  }

  componentDidUpdate() {
    if (this.props.shop) {
      this._sn = this.props.shop.sn
      this._epid = this.props.shop.epid
      this._shopName = this.props.shop.shopName
    }
  }

  onCheckBillClick = () => {
    const { stockBarForbillDetail } = this.props
    // 单门店下单跳订单详情，多门店跳订单列表
    if (stockBarForbillDetail.length === 1) {
      const shop = stockBarForbillDetail[0]
      const query = `sn=${this._sn}&epid=${this._epid}&billId=${getTaroParams(Taro.getCurrentInstance?.()).billId}&mpErpId=${shop.mpErpId}`
      Taro.redirectTo({
        url: `/subpackages/mine/pages/order_list/order_list_detail/index?${query}`
      })
    } else if (stockBarForbillDetail.length > 1) {
      Taro.redirectTo({
        url: `/subpackages/mine/pages/order_list/index`
      })
    }
  }

  onShareAppMessage(obj: Taro.ShareAppMessageObject): Taro.ShareAppMessageReturn {
    const { stockBarForbillDetail } = this.props
    let mperpid
    if (obj.target && obj.target.dataset) {
      mperpid = obj.target.dataset.mperpid
    } else {
      mperpid = stockBarForbillDetail[0] ? stockBarForbillDetail[0].mpErpId : ''
    }

    const shop = stockBarForbillDetail.find(item => mperpid === item.mpErpId)
    const query = `sn=${this._sn}&epid=${this._epid}&billId=${shop.orderData.billId}&type=2&shareFlag=1&mpErpId=${shop.mpErpId}`
    return {
      title: `${shop.shopName},您有一份来自云单的订单`,
      // path: `/pages/eTicketDetail/landscapeModel?sn=${this._sn}&epid=${this._epid}&pk=${billId}&type=2`,
      path: `/subpackages/mine/pages/order_list/order_list_detail/index?${query}`,
      imageUrl: shop.logoUrl // todo 默认图片
    }
  }

  render() {
    const { stockBarForbillDetail } = this.props
    const { showNoti } = this.state
    return (
      <View className={styles.page}>
        <View className={styles.top}>
          <View className={styles.title}>
            <Image src={successIcon} className={styles.icon} />
            订单提交成功
          </View>
          <View className={styles.top__button} onClick={this.onCheckBillClick}>
            查看单据
          </View>
          {/* <View className={styles.tip}>您可以在我的 👉 订货单 中查看历史单据</View> */}
        </View>

        {showNoti && (
          <View className={styles.body}>
            <View className={styles.body__title}>
              <Text>给商家报单</Text>
              <Text className={styles.body__title__tip}>微信通知商家</Text>
            </View>
            <View className={styles.body__list}>
              {stockBarForbillDetail.map(stockBarItem => (
                <View key={stockBarItem.mpErpId} className={styles.body__list__item}>
                  <Image src={stockBarItem.logoUrl} className={styles.body__list__item__icon} />
                  <View className={styles.body__list__item__info}>
                    <View>{stockBarItem.shopName}</View>
                    <View className={styles.body__list__item__info__total}>
                      下单{stockBarItem.totalTable.totalNum} {stockBarItem.totalTable.totalMoney}元
                    </View>
                  </View>
                  <Button
                    className={styles.button}
                    openType='share'
                    data-mperpid={stockBarItem.mpErpId}
                  >
                    去报单
                  </Button>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    )
  }
}
export default connect(mapStateToProps)(OrderSuccess)