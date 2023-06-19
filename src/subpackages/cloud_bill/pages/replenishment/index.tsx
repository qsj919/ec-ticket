import Taro from '@tarojs/taro'
import React from 'react'
import { debounce } from 'lodash'
import { View, Text, Image } from '@tarojs/components'
import CustomNavigation from '@components/CustomNavigation'
import EButton from '@components/Button/EButton'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { connect } from 'react-redux'
import messageFeedback from '@services/interactive'
import { getTaroParams } from '@utils/utils'
import EmptyView from '@components/EmptyView'
import checkIcon from '@/images/checked_circle_36.png'
import unCheckIcon from '@/images/icon/uncheck_circle.png'
import images from '@config/images'
import navigatorSvc from '@services/navigator'
import { checkedSkuIds, getTotal } from '@utils/dva_helper/map_state_to_props'
import styles from './index.module.scss'
import Spu from './components/Spu'

const mapStateToProps = ({ systemInfo, replenishment, cloudBill, shop }: GlobalState) => {
  const { totalMoney, totalNum, isAllChecked, atLeastOneChecked } = getTotal(replenishment.spus)
  return {
    checkedSkuIds: checkedSkuIds(replenishment),
    gap: systemInfo.gap,
    statusBarHeight: systemInfo.statusBarHeight,
    spus: replenishment.spus,
    totalNum,
    totalMoney,
    isAllChecked,
    atLeastOneChecked,
    mpErpId: cloudBill.mpErpId,
    spuShowPrice: cloudBill.shopParams.spuShowPrice === '1',
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

  emptyInfo = { image: images.goods.cart_no_goods, label: '进货车里空空如也' }

  state = {
    manage: false,
    firstShowLoading: true
  }

  UNSAFE_componentWillMount() {
    if (this.state.firstShowLoading) {
      this.setState({ firstShowLoading: false })
      Taro.showLoading({ title: '加载中' })
    }
  }

  componentDidMount() {
    Taro.hideLoading()
  }

  onManageClick = () => {
    this.setState(state => ({ manage: !state.manage }))
  }

  onCheckAll = debounce(() => {
    const { isAllChecked, spus } = this.props
    if (spus.length <= 0) return
    Taro.showLoading({ title: '加载中' }).then(() => {
      this.props.dispatch({
        type: 'replenishment/toggleAllChecked',
        payload: { checked: !isAllChecked }
      })
    })
  }, 200)

  componentDidUpdate(prevProps) {
    if (prevProps.isAllChecked !== this.props.isAllChecked) {
      Taro.hideLoading()
    }
  }

  onConfirm = () => {
    const { totalNum, atLeastOneChecked, spuShowPrice } = this.props
    if (this.state.manage) {
      messageFeedback.showAlertWithCancel(`确认将${totalNum}件商品删除?`, '', () => {
        this.props.dispatch({
          type: 'replenishment/deleteFromCart',
          payload: { ids: this.props.checkedSkuIds }
        })
      })
    } else {
      // 确认下单
      if (!atLeastOneChecked || totalNum <= 0)
        return messageFeedback.showToast('请至少选择一件商品')
      this.props.dispatch({
        type: 'replenishment/confirmGoodsAndGetShopInfo',
        payload: { spuShowPrice }
      })
      Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/replenishment_confirm/index' })
    }
  }

  onReload = () => {
    Taro.showLoading({ title: '加载中' })
    this.props
      .dispatch({ type: 'replenishment/fetchCartGoodsList' })
      .then(() => {
        Taro.hideLoading()
      })
      .catch(() => {
        Taro.hideLoading()
      })
  }

  onGoListClick = () => {
    const { from, mpErpId } = getTaroParams(Taro.getCurrentInstance?.())
    if (from === 'ticketDetail') {
      this.props.dispatch({ type: 'cloudBill/init', payload: { mpErpId } })
      navigatorSvc.redirectTo({ url: '/subpackages/cloud_bill/pages/all_goods/index' })
    } else {
      Taro.navigateBack({ delta: 1 })
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

  render() {
    // console.log('render parent')

    // 这里解构了mpErpId却没有用，是为了将其作为埋点的其中一个参数上报至小程序后台
    // 如果不解构，mpErpId的值不会发生变更
    const {
      spus,
      totalMoney,
      totalNum,
      isAllChecked,
      atLeastOneChecked,
      mpErpId,
      spuShowPrice,
      shopList
    } = this.props
    const { manage } = this.state
    const _shop = shopList.find(s => s.id === Number(mpErpId))
    return (
      <CustomNavigation
        enableBack
        stickyTop={false}
        disableIphoneXPaddingBottom
        title='进货车'
        titleTextClass={styles.titleTextClass}
        containerClass={styles.containerClass}
        navigationClass={styles.navigationClass}
      >
        {this.renderManageBtn()}
        <View className={styles.page}>
          {spus.length > 0 ? (
            <View className={styles.container}>
              {spus.map((spu, index) => (
                <Spu
                  dispatch={this.props.dispatch}
                  spu={spu}
                  spuShowPrice={spuShowPrice}
                  key={spu.code}
                  index={index}
                  manage={manage}
                  industries={_shop ? _shop.industries : false}
                />
              ))}
            </View>
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
                onButtonClick={this.onGoListClick}
                emptyInfo={this.emptyInfo}
                buttonLabel='去逛逛'
              />
            </View>
          )}

          <View className={styles.footer}>
            <View className={styles.footer__check_all} onClick={this.onCheckAll}>
              <Image src={isAllChecked ? checkIcon : unCheckIcon} className={styles.check_icon} />
              <Text>全选</Text>
            </View>
            <View className={styles.footer__right}>
              {!manage && (
                <View className={styles.footer__right__total}>
                  {`${totalNum}件`}
                  {spuShowPrice && <Text className='highlight_text'>{`¥${totalMoney}元`}</Text>}
                </View>
              )}
              <EButton
                label={manage ? '删除' : '确认下单'}
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