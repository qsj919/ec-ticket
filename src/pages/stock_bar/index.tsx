import Taro from '@tarojs/taro'
import React, { Component } from 'react';
import { debounce } from 'lodash'
import { View, Text, Image } from '@tarojs/components'
import CustomNavigation from '@components/CustomNavigation'
import EButton from '@components/Button/EButton'
import { connect } from 'react-redux'
import messageFeedback from '@services/interactive'
import EmptyView from '@components/EmptyView'
import checkIcon from '@/images/checked_circle_36.png'
import unCheckIcon from '@/images/icon/uncheck_circle.png'
import navigatorSvc from '@services/navigator'
import { CloudSource, CLOUD_BILL_FLAG, ICloudBill } from '@@types/base'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { checkedSkuIdsInStockBar, getTotalInStockBar } from '@utils/dva_helper/map_state_to_props'
import { isWeb } from '@constants/index'
import emptyImg from '@/images/empty/cart.png'
import styles from './index.module.scss'
import Shop from './components/Shop'

const mapStateToProps = ({ systemInfo, replenishment, shop }: GlobalState) => {
  const { totalMoney, totalNum, isAllChecked, atLeastOneChecked } = getTotalInStockBar(
    replenishment.stockBarList
  )
  return {
    checkedSkuIds: checkedSkuIdsInStockBar(replenishment),
    gap: systemInfo.gap,
    statusBarHeight: systemInfo.statusBarHeight,
    spus: replenishment.spus,
    stockBarList: replenishment.stockBarList,
    totalNum,
    totalMoney,
    isAllChecked,
    atLeastOneChecked,
    shopList: shop.list
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  manage: boolean
  firstShowLoading: boolean
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class Replenishment extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationStyle: 'custom' as const
  // }

  emptyInfo = { image: emptyImg, label: '进货车里空空如也' }

  state = {
    manage: false,
    firstShowLoading: true
  }

  shouldComponentUpdate() {
    if (this.state.firstShowLoading) {
      this.setState({ firstShowLoading: false })
      Taro.showLoading({ title: '加载中' })
    }
  }
  componentDidUpdate() {
    Taro.hideLoading()
  }
  componentDidShow() {
    this.getList()
  }

  getList = () => {
    Taro.showLoading({ title: '加载中' })
    this.props
      .dispatch({ type: 'replenishment/fetchStockBarList' })
      .then(() => {
        Taro.hideLoading()
      })
      .catch(() => {
        Taro.hideLoading()
      })
  }

  onManageClick = () => {
    this.setState(state => ({ manage: !state.manage }))
  }

  onCheckAll = debounce(() => {
    const { isAllChecked, spus } = this.props
    if (spus.length <= 0) return
    Taro.showLoading({ title: '加载中' }).then(() => {
      this.props.dispatch({
        type: 'replenishment/toggleAllCheckedInStockBar',
        payload: { checked: !isAllChecked }
      })
    })
  }, 200)

  checkShop = (shopIndex: number, checked: boolean) => {
    this.props.dispatch({
      type: 'replenishment/checkShopInStockBar',
      payload: { shopIndex, checked }
    })
  }

  onConfirm = () => {
    const { totalNum, atLeastOneChecked } = this.props
    if (this.state.manage) {
      messageFeedback.showAlertWithCancel(`确认将${totalNum}件商品删除?`, '', () => {
        this.props.dispatch({
          type: 'replenishment/deleteFromCartInStockBar',
          payload: { ids: this.props.checkedSkuIds }
        })
      })
    } else {
      // 确认下单
      if (!atLeastOneChecked || totalNum <= 0)
        return messageFeedback.showToast('请至少选择一件商品')
      this.props.dispatch({
        type: 'replenishment/confirmGoodsInStockBar'
      })
      Taro.navigateTo({
        url: '/subpackages/cloud_bill/pages/replenishment_confirm/index?from=stockBar'
      })
    }
  }

  //  管理按钮
  renderManageBtn = () => {
    const { statusBarHeight, gap } = this.props
    const { manage } = this.state
    return (
      <View
        className={styles['manage-btn']}
        style={`top: ${statusBarHeight + gap}px`}
        onClick={this.onManageClick}
      >
        <Text className={styles['manage-btn_text']}>{manage ? '完成' : '管理'}</Text>
      </View>
    )
  }

  onShopClick = data => {
    const { shopList } = this.props
    const shop = shopList.find(item => item.id === data.mpErpId)
    if (shop) {
      const cloudType =
        shop.cloudBillFlag === CLOUD_BILL_FLAG.never ||
        shop.cloudBillFlag === CLOUD_BILL_FLAG.expire
          ? ICloudBill.replenishment
          : ICloudBill.all
      this.props.dispatch({
        type: 'cloudBill/init',
        payload: { mpErpId: data.mpErpId, cloudType, cloudSource: CloudSource.CLOUD_TAB }
      })
      navigatorSvc.navigateTo({
        url: `/subpackages/cloud_bill/pages/all_goods/index?type=${cloudType}`
      })
    }
  }

  renderShop = () => {
    const { stockBarList, shopList } = this.props
    const { manage } = this.state
    return stockBarList.map((shopItem, shopIndex) => {
      const shop = shopList.find(s => s.id === shopItem.mpErpId)
      return (
        <Shop
          key={shopItem.mpErpId}
          index={shopIndex}
          shopIndex={shopIndex}
          shopItem={shopItem}
          manage={manage}
          checkShop={this.checkShop}
          onShopClick={this.onShopClick}
          industries={shop ? shop.industries : false}
        />
      )
    })
  }

  render() {
    const { stockBarList, isAllChecked, atLeastOneChecked } = this.props
    const { manage } = this.state

    return (
      <CustomNavigation
        enableBack={false}
        stickyTop={false}
        disableIphoneXPaddingBottom
        title='进货车'
        titleTextClass={styles.titleTextClass}
        containerClass={styles.containerClass}
      >
        {this.renderManageBtn()}
        <View className={styles.page}>
          {stockBarList.length > 0 ? (
            <View className={styles.container}>{this.renderShop()}</View>
          ) : (
            <View style={{ flex: 1 }}>
              <EmptyView
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '90%',
                  left: '50%',
                  top: '50%',
                  transform: 'translateX(-50%) translateY(-50%)'
                }}
                needShowButton
                onButtonClick={this.getList}
                emptyInfo={this.emptyInfo}
              />
            </View>
          )}
          <View className={styles.footer} style={isWeb ? { marginBottom: '50px' } : {}}>
            <View className={styles.footer__check_all} onClick={this.onCheckAll}>
              <Image src={isAllChecked ? checkIcon : unCheckIcon} className={styles.check_icon} />
              <Text>全选</Text>
            </View>
            <View className={styles.footer__right}>
              <EButton
                label={manage ? '删除' : '立即下单'}
                width={240}
                onButtonClick={this.onConfirm}
                disabled={!atLeastOneChecked}
              />
            </View>
          </View>
        </View>
      </CustomNavigation>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(Replenishment)