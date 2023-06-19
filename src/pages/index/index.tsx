import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Image } from '@tarojs/components'
import { connect } from 'react-redux'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import config from '@config/config'
// import LoginView from '@components/LoginView/LoginView'
// import { ScanError } from '@@types/base'
import clarkGif from '@/images/clark.gif'
import styles from './index.module.scss'

type PropsType = {}
type StateType = {
  // phoneMode: boolean
  // phone: string
}

const mapStateToProp = ({ user, shop, cloudBill }: GlobalState) => ({
  logining: user.logining,
  sessionId: user.sessionId,
  mpAppId: user.mpAppId,
  independentMpErpId: user.independentMpErpId,
  shopList: shop.list,
  data: cloudBill.videoPageData,
  phone: user.phone,
  productVersion: user.productVersion
})

type StateProps = ReturnType<typeof mapStateToProp>
// @connect<StateProps>(mapStateToProp, defaultMapDispatchToProps)
class Index extends Component<PropsType & StateProps & DefaultDispatchProps, StateType> {
  // config = {
  //   navigationBarTitleText: ''
  // }

  state = {
    // phoneMode: false,
    // phone: ''
  }

  componentDidMount() {
    if (
      process.env.INDEPENDENT === 'independent' ||
      process.env.INDEPENDENT === 'foodindependent'
    ) {
      this.init()
    } else {
      this.goIndexTab()
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.independentMpErpId !== prevProps.independentMpErpId) {
      this.init()
    }
    if (
      process.env.INDEPENDENT === 'independent' ||
      process.env.INDEPENDENT === 'foodindependent'
    ) {
      this.ifScanError()
    } else {
      this.goIndexTab()
    }
  }

  ifScanError = () => {
    const { shopList, independentMpErpId } = this.props
    const shop = shopList.find(item => Number(item.id) === Number(independentMpErpId))
    console.log('ifScanError', this.props.data.scanError)
    console.log('phone', this.props.phone)

    if (this.props.data.scanError !== -1) {
      this.goAllGoods()
    }
    // this.goAllGoods()
    // return
    // if (
    //   (this.props.data.scanError !== -1 &&
    //     this.props.data.scanError !== ScanError.NONE_USER &&
    //     this.props.data.scanError !== ScanError.NONE_NICKNAME &&
    //     this.props.data.scanError !== ScanError.NONE_PHONE &&
    //     this.props.data.scanError !== ScanError.NONE_NICKNAME_AND_PHONE &&
    //     this.props.phone &&
    //     !logining) ||
    //   (shop && shop.independentType === 1)
    // ) {
    //   this.goAllGoods()
    // }
  }

  init = () => {
    const { independentMpErpId } = this.props
    if (independentMpErpId > 0) {
      this.props.dispatch({
        type: 'cloudBill/fetchVideoPageDataByMpErpId',
        payload: {
          mpErpId: independentMpErpId
        }
      })
      // Taro.redirectTo({
      //   url: `/subpackages/cloud_bill/pages/all_goods/index?mpErpId=${independentMpErpId}`
      // })
    }
  }

  goAllGoods = () => {
    const { independentMpErpId } = this.props
    if (process.env.INDEPENDENT === 'foodindependent') {
      Taro.redirectTo({
        url: `/subpackages/cloud_bill/pages/food_all_goods/index?mpErpId=${independentMpErpId}`
      })
    } else {
      Taro.redirectTo({
        url: `/subpackages/cloud_bill/pages/all_goods/index?mpErpId=${independentMpErpId}`
      })
    }
  }

  goIndexTab = () => {
    // 已关注用户 or 独立部署的客户
    if (this.props.sessionId || this.props.mpAppId !== config.wxAppId) {
      if (this.props.productVersion === 'weChatAudit') {
        Taro.switchTab({ url: '/pages/eTicketList/index' })
      } else {
        Taro.switchTab({ url: '/pages/cloud_bill_tab/index' })
      }
    }
  }

  // onGetUserInfo = e => {
  //   if (this.props.sessionId) return
  //   const { iv, encryptedData } = e.detail
  //   if (iv && encryptedData) {
  //     Taro.showLoading({ title: '登录中...' })
  //     this.props.dispatch({ type: 'user/login' }).then(() => {
  //       Taro.hideLoading()
  //     })
  //   }
  // }

  // onButtonLongPress = () => {
  //   this.setState({ phoneMode: true })
  // }

  // onInput = e => {
  //   this.setState({ phone: e.detail.value })
  // }

  // onPhoneConfirm = () => {
  //   this.props.dispatch({ type: 'user/login', payload: { phone: this.state.phone } })
  // }

  render() {
    const { logining, sessionId, shopList, independentMpErpId, data, phone } = this.props
    // const { phoneMode, phone } = this.state
    // const notLogin = !logining && !sessionId
    const shop: any = shopList.find(item => Number(item.id) === Number(independentMpErpId))
    // const isIndependent =
    //   process.env.INDEPENDENT === 'independent' ||
    //   process.env.INDEPENDENT === 'foodindependent' ||
    //   (shop && shop.independentType > 0)
    return (
      <View className={styles.page_index_wrapper}>
        {/* {notLogin &&
          (phoneMode ? (
            <View className={styles.check}>
              <View>审核人员入口</View>
              <View style={{ margin: '20rpx 0' }}>如果你是审核人员，请在下方输入测试手机号码</View>
              <View className='aic  '>
                <Input
                  className={styles.input}
                  type='number'
                  onConfirm={this.onPhoneConfirm}
                  value={phone}
                  onInput={this.onInput}
                  placeholder='输入手机号'
                />
                <View>确定</View>
              </View>
            </View>
          ) : (
            <View className={styles.noDataPage}>
              <Image src={config.followQrUrl} className={styles.img} />
              <View>{`扫码关注公众号：《${config.wxPublicName}》咨询使用问题`}</View>
              <View>如果你曾使用过，可以点击下方登录继续</View>
              <Button
                className={styles.btn}
                openType='getUserInfo'
                onGetUserInfo={this.onGetUserInfo}
                onLongPress={this.onButtonLongPress}
              >
                立即登录
              </Button>
            </View>
          ))} */}
        <Image src={clarkGif} style={{ width: '250px', height: '250px' }} />
        {/* <LoginView
          phone={phone}
          needPhone={!this.props.logining}
          scanError={isIndependent ? data.scanError : 0}
          mpErpId={independentMpErpId}
        /> */}
      </View>
    )
  }
}
export default connect<StateProps>(mapStateToProp)(Index)
