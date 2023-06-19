/**
 * @Author: Miao Yunliang
 * @Date: 2019-12-04 09:27:11
 * @Desc: 店铺首页,从搜索进入
 */
import Taro, { pxTransform } from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import { AtModal } from 'taro-ui'
import Empty from '@components/Empty'
import EButton from '@components/Button/EButton'
import { connect } from 'react-redux'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { applyOpenGoodsData } from '@api/shop_api_manager'
import qrBg from '@/images/qr_code_bg.png'
import { getTaroParams } from '@utils/utils'
import ShopHeader from './components/Header'
import ListContent from './components/ListContent'
import QRCodeModal from './components/QRCodeModal'

import styles from './shop.module.scss'
import colors from '../../style/colors'

interface State {
  isQRVisible: boolean
  isFeedbackModalVisible: boolean
  hasRequested: boolean
  previewMode: boolean
}
const mapStateToProps = ({ searchShop }: GlobalState) => ({
  shopInfo: searchShop.shopInfo,
  goodsList: searchShop.goodsList,
  mallData: searchShop.mallData
})

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class Shop extends React.PureComponent<StateProps & DefaultDispatchProps, State> {
  pageNo = 1

  state = {
    isQRVisible: false,
    isFeedbackModalVisible: false,
    hasRequested: false,
    previewMode: false
  }

  UNSAFE_componentWillMount() {
    const { mpErpId, preview } = getTaroParams(Taro.getCurrentInstance?.())
    if (mpErpId) {
      this.props.dispatch({
        type: 'searchShop/fetchShop',
        payload: { mpErpId },
        preview: preview === '1'
      })
    }
    if (preview === '1') {
      this.setState({ previewMode: true })
    }
  }

  componentDidUpdate() {
    if (this.props.shopInfo.saasType !== 1) {
      Taro.showModal({
        title: '提示',
        content: '该店铺未开通主页',
        complete: Taro.navigateBack,
        confirmColor: colors.themeColor
      })
    }
  }

  componentWillUnmount() {
    this.props.dispatch({ type: 'searchShop/resetShop' })
  }

  showQr = () => {
    this.setState({ isQRVisible: true })
  }

  hideQr = () => {
    this.setState({ isQRVisible: false })
  }

  showFeedback = () => {
    this.setState({ isFeedbackModalVisible: true })
  }

  hideFeedback = () => {
    this.setState({ isFeedbackModalVisible: false })
  }

  onReachBottom() {
    const { dispatch, shopInfo } = this.props
    const { previewMode } = this.state
    if (shopInfo.openStyleTime > 0 || previewMode) {
      dispatch({
        type: 'searchShop/fetchGoodsList',
        payload: { mpErpId: shopInfo.id, pageNo: ++this.pageNo, previewMode }
      })
    }
  }

  requestOpen = () => {
    const { shopInfo } = this.props
    applyOpenGoodsData(shopInfo.id).then(() => {
      this.showFeedback()
      this.setState({ hasRequested: true })
    })
  }

  renderMiniCode = () => {
    const {
      shopInfo: { mallTenantId },
      mallData
    } = this.props
    return (
      typeof mallTenantId === 'number' &&
      mallTenantId !== 0 && (
        <View className={styles.mini_code} onClick={this.showQr}>
          {/* 背景 */}
          <Image className={styles.mini_code__bg} src={qrBg} />
          <Image className={styles.mini_code__img} src={mallData.shopCodeOrg} />
          <View className={styles.mini_code__text}>
            <View>长按小程序码识别</View>
            <Text>也可点击放大</Text>
          </View>
        </View>
      )
    )
  }

  renderNoPermission = () => {
    return (
      <View className={styles.np_wrapper}>
        <Empty label='商家暂未开通在线浏览' />
        <View style={{ height: pxTransform(40) }} />
        <EButton
          label='我要看款'
          width={312}
          onButtonClick={this.requestOpen}
          disabled={this.state.hasRequested}
        />
      </View>
    )
  }

  render() {
    const { isQRVisible, isFeedbackModalVisible, previewMode } = this.state
    const { shopInfo, goodsList, mallData } = this.props
    return (
      shopInfo.id > 0 &&
      shopInfo.saasType === 1 && (
        <View className={styles.container}>
          {/* 头部 */}
          <ShopHeader data={shopInfo} />
          {/* 小程序码 */}
          {this.renderMiniCode()}
          {/* 内容区 */}
          {shopInfo.openStyleTime > 0 || previewMode ? (
            <View className={styles.content}>
              <ListContent data={goodsList} />
            </View>
          ) : (
            <View className={styles.np_container}>{this.renderNoPermission()}</View>
          )}

          <QRCodeModal
            visible={isQRVisible}
            onRequestClose={this.hideQr}
            url={mallData.shopCodeOrg}
            shopName={mallData.shopName}
          />

          <AtModal
            isOpened={isFeedbackModalVisible}
            title='看款请求已发送'
            content='老板同意后会通过《商陆花信息服务号》公众号推送消息给您喔～'
            confirmText='好的'
            onConfirm={this.hideFeedback}
          />
        </View>
      )
    )
  }
}
connect<StateProps, DefaultDispatchProps>(mapStateToProps)(Shop)