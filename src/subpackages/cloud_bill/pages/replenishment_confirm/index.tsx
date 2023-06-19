import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text, Textarea, Button } from '@tarojs/components'
import EButton from '@components/Button/EButton'
import RemInput from '@components/RemInput'
import GoodsRem from '@components/GoodsRem'
import { throttle } from 'lodash'
import trackSvc from '@services/track'
import events from '@constants/analyticEvents'
import messageFeedback from '@services/interactive'
import { getTaroParams } from '@utils/utils'
import { connect } from 'react-redux'
import classnames from 'classnames'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { SlideDirection } from '@components/SlideContainer/type'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { spusToSkuTable, getTotal, getTotalInStockBar } from '@utils/dva_helper/map_state_to_props'
import angleIcon from '@/images/angle_right_gray_40.png'
import addressIcon from '@/images/icon/order_address.png'
import default_goods from '@/images/default_goods.png'
import defaultShopLogo from '@/images/default_shop_logo_fang.png'
import { launchOrderPay } from '@api/apiManage'
import { getShopParamVal } from '@api/goods_api_manager'
import navigatorSvc from '@services/navigator'
import { isIndependent } from '@constants/index'
import {
  CloudSource,
  CLOUD_BILL_FLAG,
  ICloudBill,
  LIVE_SCENE,
  stockBarItemForBillConfirm
} from '@@types/base'
import styles from './index.module.scss'

interface State {
  addressScope: boolean
  inputModal: boolean
  inputModal_rem: string
  inputModal_mpErpId: number
  fromPage: string
}

const mapStateToProps = ({ replenishment, cloudBill, shop, user }: GlobalState) => ({
  // sn: replenishment.sn,
  // epid: replenishment.epid,
  billid: replenishment.billId,
  // dwId: replenishment.dwId,
  shopList: shop.list,
  address: replenishment.address,
  stockBarForbillDetail: replenishment.stockBarForbillDetail,
  mpErpId: cloudBill.mpErpId,
  retryGetPhoneNumber: user.retryGetPhoneNumber,
  orderPay: cloudBill.shopParams.orderPay === '1',
  boundPhone: user.phone.length > 0,
  cardPwd: replenishment.cardPwd,
  ...getTotalInStockBar(replenishment.stockBarForbillDetail, replenishment.isGiftCard)
})

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class ReplenishmentConfirm extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationBarTitleText: '提交订单'
  // }

  state = {
    addressScope: true,
    inputModal: false,
    inputModal_rem: '',
    inputModal_mpErpId: 0,
    fromPage: ''
  }

  UNSAFE_componentWillMount() {
    const { from } = getTaroParams(Taro.getCurrentInstance?.())
    if (from) {
      this.setState({ fromPage: from })
    }
    this.props.dispatch({ type: 'replenishment/fetchAddress' })
  }

  onRemClick = stockBarItem => {
    this.setState({
      inputModal: true,
      inputModal_mpErpId: stockBarItem.mpErpId,
      inputModal_rem: stockBarItem.remark
    })
  }

  hideInputModal = () => {
    this.setState({ inputModal: false, inputModal_rem: '' })
  }

  onAddressClick = () => {
    if (!this.state.addressScope) {
      this.goAuthAddress()
    }
    // Taro.chooseAddress().then()
    Taro.getSetting().then(res => {
      if (res.authSetting['scope.address']) {
        this.chooseAddress()
      } else {
        Taro.authorize({ scope: 'scope.address' })
          .then(() => {
            this.chooseAddress()
          })
          .catch(error => {
            messageFeedback.showAlert('点击去授权', '获取地址失败').then(() => {
              this.goAuthAddress()
            })
            this.setState({ addressScope: false })
          })
      }
    })
  }

  goAuthAddress = () => {
    Taro.openSetting().then(res => {
      if (res.authSetting['scope.address']) {
        this.setState({ addressScope: true })
        this.chooseAddress()
      }
    })
  }

  _chooseAddress = () => {
    Taro.chooseAddress().then(res => {
      const { errMsg, ...address } = res
      const _address = {
        province: address.provinceName,
        city: address.cityName,
        county: address.countyName,
        addrDetail: address.detailInfo,
        receiveName: address.userName,
        receivePhone: address.telNumber
      }
      this.props.dispatch({ type: 'replenishment/save', payload: { address: _address } })
    })
  }

  chooseAddress = throttle(this._chooseAddress, 1500, { leading: true })

  onRemInput = rem => {
    this.props.dispatch({
      type: 'replenishment/updateRemarkInConfirmPage',
      payload: { rem, mpErpId: this.state.inputModal_mpErpId }
    })
    this.hideInputModal()
  }

  onRemConfirm = (rem: string, mpErpId: number, id: number) => {
    this.props.dispatch({
      type: 'replenishment/updateRemInConfirmPage',
      payload: { rem, mpErpId, id }
    })
  }
  // boundPhone
  onGetPhone = e => {
    if (e.detail.errMsg.includes('ok')) {
      Taro.showLoading()
      const { encryptedData, iv, code } = e.detail
      this.props
        .dispatch({
          type: 'user/verifyPhone',
          payload: { encryptedData, iv, wechat: true, code }
        })
        .then(() => {
          Taro.hideLoading()
          this.onConfirm()
        })
        .catch(e => {
          Taro.hideLoading()
        })
    }
  }

  onConfirm = () => {
    const { boundPhone, address } = this.props
    if (!boundPhone) return messageFeedback.showToast('请先绑定手机号')
    // eslint-disable-next-line
    const options = wx.getEnterOptionsSync()
    if (isIndependent) {
      if (!address.city) return messageFeedback.showToast('请选择地址')
    }
    if (LIVE_SCENE.includes(options.scene)) {
      if (!address.city) return messageFeedback.showToast('请选择地址')

      // eslint-disable-next-line
      if (wx.checkBeforeAddOrder) {
        // eslint-disable-next-line
        wx.checkBeforeAddOrder({
          success: res => {
            this.confirmOrder({
              traceId: res.data.traceId,
              appScene: 'channelLive'
            })
          },
          fail: err => {
            console.log(err)
          }
        })
      } else {
        messageFeedback.showAlert('微信版本过低，请升级微信至8.0.19及以上')
      }

      return
    }
    this.confirmOrder()
  }

  confirmOrder = (_payload?: { traceId: string; appScene: string }) => {
    // eslint-disable-next-line
    const options = wx.getEnterOptionsSync()
    const { address, totalNum, totalSkuNum, mpErpId, orderPay } = this.props
    const { fromPage } = this.state
    Taro.showLoading({ title: '正在提交...', mask: true })
    this.props.dispatch({ type: 'replenishment/order', payload: { ..._payload } }).then(data => {
      // 此处进货车中下单先不埋点 李果大数据也未统计数据
      if (fromPage !== 'stockBar') {
        trackSvc.track(events.replenishSuccess, {
          skunum: totalSkuNum,
          totalnum: totalNum,
          // sn: String(sn),
          // epid: String(epid),
          // dwid: String(dwId),
          // billid: String(billid),
          province: address.province,
          city: address.city,
          county: address.county,
          mp_erp_id: String(mpErpId)
        })

        const shop = this.props.shopList.find(sp => sp.id === mpErpId)
        if (shop) {
          const { sn, epid, shopid } = shop
          trackSvc.trackToBigData({
            sn,
            epid,
            shop: shopid,
            data: [{ key: 'submit_order', value: 1 }],
            tag: {
              sku_num: totalSkuNum,
              total_num: totalNum
            }
          })
        }
        let _billId = data.billId
        if (
          ((shop && shop.independentType === 2) || LIVE_SCENE.includes(options.scene)) &&
          !this.props.cardPwd
        ) {
          // 支付
          Taro.showLoading({ title: '请稍等...' })
          getShopParamVal({
            code: 'order_pay',
            mpErpId
          }).then(({ data }) => {
            if (data.val === '1' || LIVE_SCENE.includes(options.scene)) {
              launchOrderPay({
                mpErpId,
                billId: _billId
              })
                .then(({ data }) => {
                  // eslint-disable-next-line
                  let _params = {
                    timeStamp: data.timeStamp.toString(),
                    nonceStr: data.nonceStr,
                    package: data.package,
                    signType: data.signType,
                    paySign: data.paySign,
                    success(res) {
                      Taro.hideLoading()
                      Taro.redirectTo({
                        url: `/subpackages/cloud_bill/pages/replenish_success/index?billId=${_billId}`
                      })
                      return
                    },
                    fail(err) {
                      Taro.hideLoading()
                      console.log(`支付fail回调`, err)
                      const query = `billId=${_billId}&mpErpId=${mpErpId}&orderPay=${orderPay}`
                      Taro.redirectTo({
                        url: `/subpackages/mine/pages/order_list/order_list_detail/index?${query}`
                      })
                      return
                    }
                  }
                  if (LIVE_SCENE.includes(options.scene)) {
                    // eslint-disable-next-line
                    wx.requestOrderPayment(_params)
                  } else {
                    // eslint-disable-next-line
                    wx.requestPayment(_params)
                  }
                })
                .catch(e => {
                  Taro.hideLoading()
                })
            } else {
              Taro.hideLoading()
              Taro.redirectTo({
                url: `/subpackages/cloud_bill/pages/replenish_success/index?billId=${_billId}`
              })
            }
          })
        } else {
          Taro.hideLoading()
          Taro.redirectTo({
            url: `/subpackages/cloud_bill/pages/replenish_success/index?billId=${_billId}`
          })
        }
      } else {
        Taro.hideLoading()
        Taro.redirectTo({
          url: `/subpackages/cloud_bill/pages/replenish_success/index?billId=${data.billId}`
        })
      }
    })
  }

  onGetPhoneClick = () => {
    this.props.dispatch({
      type: 'user/save',
      payload: {
        retryGetPhoneNumber: false
      }
    })
  }

  onShopInfoClick = (data: stockBarItemForBillConfirm) => {
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

  render() {
    const { inputModal_rem, inputModal } = this.state
    const {
      address,
      stockBarForbillDetail,
      totalNum,
      totalMoney,
      boundPhone,
      shopList,
      mpErpId,
      retryGetPhoneNumber
    } = this.props
    const isAddressVisible = address.city !== ''
    const _shop = shopList.find(s => s.id === mpErpId)
    return (
      <View className={styles.page}>
        <View className={styles.content}>
          {/* 地址栏 */}
          <View className={styles.address} onClick={this.onAddressClick}>
            {isAddressVisible ? (
              <View className={styles.address__detail}>
                <Image src={addressIcon} className={styles.address__detail__icon} />
                <View className={styles.address__detail__info}>
                  <View className={styles.address__detail__main}>
                    <Text>{`${address.receiveName}    ${address.receivePhone}`}</Text>
                  </View>
                  <View className={styles.address__detail__sub}>
                    {`${address.province}${address.city}${address.county || ''}${
                      address.addrDetail
                    }`}
                  </View>
                </View>
                <Image src={angleIcon} className={styles.address__detail__angle_icon} />
              </View>
            ) : (
              <View>请添加收货地址</View>
            )}
          </View>
          {stockBarForbillDetail.map(stockBarItem => (
            <View className={styles.shop} key={stockBarItem.mpErpId}>
              <View
                className={styles.shop__info}
                onClick={() => this.onShopInfoClick(stockBarItem)}
              >
                <Image
                  className={styles.shop__info__image}
                  src={stockBarItem.logoUrl || defaultShopLogo}
                  key={stockBarItem.logoUrl}
                />
                <View className={styles.shop__info__name}>{stockBarItem.shopName}</View>
                <Image src={angleIcon} className={styles.shop__info__angle} />
              </View>
              {/* 尺码表 */}
              {stockBarItem.spuTable.map(spu => (
                <View className={styles.spus} key={spu.code}>
                  <View className={styles.spus__spu}>
                    <View className={styles.spus__spu__header}>
                      <Image
                        mode='aspectFill'
                        src={spu.imgUrl || default_goods}
                        className={styles.spus__spu__img}
                        onClick={() =>
                          Taro.previewImage({
                            urls: Array.isArray(spu.imgUrl) ? spu.imgUrl : [spu.imgUrl]
                          })
                        }
                      />
                      <View className={styles.spus__spu__info}>
                        <Text className={styles.spus__spu__code}>{spu.code}</Text>
                        <Text className={styles.spus__spu__name}>{spu.name}</Text>
                        {_shop && _shop.industries ? (
                          <View className='col'>
                            {spu.skus.map(sku => (
                              <Text className={styles.spus__spu__total}>
                                {`¥${sku.price}/${sku.sizeName}`}
                                <Text style='margin-left:10px;'>{`X${sku.num}`}</Text>
                              </Text>
                            ))}
                          </View>
                        ) : (
                          <Text className={styles.spus__spu__total}>{`${spu.totalNum}`}</Text>
                        )}
                        <View className={styles.spus__spu__price}>
                          <Text className={styles.price_tag}>¥</Text>
                          <Text>{spu.totalMoney}</Text>
                        </View>
                      </View>
                    </View>

                    {(!_shop || !_shop.industries) && (
                      <View className={styles.spus__spu__table}>
                        {spu.table.map((s, idx) => (
                          <View key={idx} className={styles.spus__spu__row}>
                            {s.map((v, i) => (
                              <View key={i} className={styles.spus__spu__row_item}>
                                {idx === 0 && i === 0 ? '颜色/尺码' : v}
                              </View>
                            ))}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  {/* <GoodsRem
                    rem={spu.rem}
                    onConfirm={rem => this.onRemConfirm(rem, stockBarItem.mpErpId, spu.id)}
                  /> */}
                </View>
              ))}
              {/* 分割线 */}
              <View className={styles.segmentation}>
                <View className={styles.segmentation__left__circle}></View>
                <View className={styles.segmentation__line}></View>
                <View className={styles.segmentation__right__circle}></View>
              </View>
              {/* 总额 总数 */}
              <View className={styles.total}>
                <View className={styles.total__row}>
                  <View className={styles.total__row__label}>总数</View>
                  <View>{`${stockBarItem.totalTable!.totalNum}`}</View>
                </View>
                <View className={styles.total__row}>
                  <View className={styles.total__row__label}>总额</View>
                  <View className={styles.total__row__amount}>{`￥${
                    stockBarItem.totalTable!.totalMoney
                  }`}</View>
                </View>
                <View className={styles.total__row}>
                  <View className={styles.total__row__label}>备注</View>
                  <View
                    className={styles.total__row__remark}
                    onClick={() => this.onRemClick(stockBarItem)}
                  >
                    {stockBarItem.remark ? stockBarItem.remark : '请输入备注'}
                  </View>
                </View>
              </View>
              {/* 备注 */}
              {/* <View className={styles.rem_c} onClick={() => this.onRemClick(stockBarItem)}>
                <View
                  className={classnames(styles.rem, {
                    [styles['rem--input']]: stockBarItem.remark
                  })}
                >
                  {stockBarItem.remark ? stockBarItem.remark : '请输入备注'}
                </View>
              </View> */}
            </View>
          ))}
        </View>
        {/* 按钮 */}
        <View>
          <View className={styles.tips}>最终货款以商家开单数据为准</View>
          <View className={styles.bottom}>
            <View className={styles.bottom__total}>
              共{totalNum}件 合计:
              <View className={styles.bottom__total__price}>
                ¥<View className={styles.bottom__total__price__num}>{totalMoney}</View>
              </View>
            </View>
            <Button
              openType={boundPhone ? undefined : 'getPhoneNumber'}
              onGetPhoneNumber={this.onGetPhone}
            >
              <EButton label='立即提交' onButtonClick={this.onConfirm} width={200} />
            </Button>
          </View>
        </View>

        <RemInput
          rem={this.state.inputModal_rem}
          visible={inputModal}
          onConfirm={this.onRemInput}
          onRequestClose={this.hideInputModal}
        />
        {retryGetPhoneNumber && (
          <View className={styles.getphone_fail_view__mask}>
            <View className={styles.getphone_fail_view__mask__content}>
              <Text className={styles.getphone_fail_view__mask__content__title}>确认手机号</Text>
              <Text className={styles.getphone_fail_view__mask__content__label}>
                还需要确认您的手机号，请重新获取
              </Text>
              <Button
                openType='getPhoneNumber'
                onGetPhoneNumber={this.onGetPhone}
                onClick={this.onGetPhoneClick}
                className={styles.getphone_fail_view__mask__content__btn}
              >
                立即获取
              </Button>
            </View>
          </View>
        )}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(ReplenishmentConfirm)