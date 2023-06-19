import Taro, { Config } from '@tarojs/taro'
import { View, Image, Text, Block, Input, Button } from '@tarojs/components'
import React from 'react'
import { debounce } from 'lodash'
import classNames from 'classnames'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { connect } from 'react-redux'
import { getOrderListNum, giftTicketGetMat } from '@api/apiManage'
import settingIcon from '@/images/mine/setting.png'
import authIcon from '@/images/mine/auth.png'
import factoryIcon from '@/images/mine/factory.png'
import shopIcon from '@/images/mine/goods_shop.png'
import takeIcon from '@/images/mine/take.png'
import bgImg from '@/images/mine/bg.png'
import billIcon1 from '@/images/mine/no_send.png'
import billIcon2 from '@/images/mine/has_send.png'
import billIcon3 from '@/images/mine/has_cancel.png'
import billIcon4 from '@/images/mine/offline_bill.png'
import historyCheckBillIcon from '@/images/mine/history_check_bill.png'
import trackSvc from '@services/track'
import messageFeedback from '@services/interactive'
import events from '@constants/analyticEvents'
import closeIcon from '@/images/icon/close_gray_32.png'
import navigatorSvc from '@services/navigator'
import CopySuccess from '@@/assets/images/copy_success.png'
import myLog from '@utils/myLog'
import goodsSvc from '@services/goodsSvc'
import { SkuForBuy, SPUForBuy } from '@@types/base'
import CustomNavigation from '@components/CustomNavigation'
import RightIcon from '@@/assets/images/angle_right_gray_40.png'
import WechatIcon from '../../images/wechat_icon_small.png'
import PhoneIcon from '../../images/phone_icon_small.png'
import styles from './mine.module.scss'

interface State {
  billNumArr: Array<number> //
  auditIsShow: boolean
  callShopIsShow: boolean
  clipSuccessIsShow: boolean
  giftCardIsShow: boolean
  cardPwd: string
}

const mapStateToProps = ({
  user,
  shop,
  systemInfo,
  image,
  goodsManage,
  cloudBill,
  replenishment
}: GlobalState) => ({
  phone: user.phone,
  nickName: user.nickName,
  buyGoodsData: user.buyGoodsData,
  avatar: user.avatar,
  firstShop: shop.list[0],
  sessionId: user.sessionId,
  statusBarHeight: systemInfo.statusBarHeight,
  gap: systemInfo.gap,
  navigationHeight: systemInfo.navigationHeight,
  isLogining: user.logining,
  mode: image.mode,
  shopInfo: goodsManage.shopInfo,
  mpErpId: cloudBill.mpErpId,
  sn: cloudBill.sn,
  epid: cloudBill.epid,
  shopid: cloudBill.shopId,
  spuShowPrice: cloudBill.shopParams.spuShowPrice === '1',
  shopParams: cloudBill.shopParams,
  stockBarForbillDetail: replenishment.stockBarForbillDetail
})

type StateProps = ReturnType<typeof mapStateToProps>

const MENU = [
  {
    label: '快速补货',
    key: 'rep'
  },
  {
    label: '礼品卡兑换',
    key: 'card'
  },
  {
    label: '我要开店',
    key: 'open'
  },
  {
    label: '联系档口',
    key: 'call'
  }
]

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class Mine extends React.PureComponent<StateProps & DefaultDispatchProps, State> {
  config: Config = {
    navigationStyle: 'custom'
    // navigationBarTitleText: '我的'
  }

  menu = [
    { label: '拿货门店', icon: shopIcon },
    { label: '历史对账单', icon: historyCheckBillIcon },
    { label: '累计拿货', icon: takeIcon },
    { label: '授权管理', icon: authIcon },
    { label: '设置', icon: settingIcon },
    { label: '厂商入口', icon: factoryIcon }
  ]

  bill = [
    { label: '未发货', icon: billIcon1, key: 'noSend' },
    { label: '已发货', icon: billIcon2, key: 'hasSend' },
    { label: '已取消', icon: billIcon3, key: 'hasCancel' },
    { label: '售后单', icon: billIcon4, key: 'offlineBill' }
  ]

  versionClicked = 0

  orderClickCount = 0

  auditClickCount = 0

  auditValue: string = ''

  state = {
    billNumArr: [0, 0, 0],
    auditIsShow: false,
    callShopIsShow: false,
    clipSuccessIsShow: false,
    giftCardIsShow: false,
    cardPwd: ''
  }

  componentDidMount() {
    trackSvc.track(events.mine)
    myLog.log(`sessionid:${this.props.sessionId}`)
  }

  componentDidShow() {
    if (!this.props.isLogining && this.props.sessionId) {
      this.init()
    }
  }
  componentDidUpdate(prevProps) {
    if (!this.props.isLogining && !prevProps.sessionId && this.props.sessionId) {
      this.init()
    }
  }

  init = () => {
    this.versionClicked = 0
    getOrderListNum().then(res => {
      const { data } = res
      const arr = [data.notDeliveredNum, data.deliveredNum, data.cancelledNum]
      this.setState({
        billNumArr: arr
      })
    })
  }

  onUpdateWXInfo = () => {
    // eslint-disable-next-line no-undef
    wx.getUserProfile({
      desc: '用于完善个人资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: res => {
        Taro.showLoading({ title: '正在更新信息...' })
        const { nickName, avatarUrl } = res.userInfo
        this.props
          .dispatch({
            type: 'user/updateNickNameAndAvatar',
            payload: {
              nickName,
              headimgurl: avatarUrl
            }
          })
          .then(() => {
            messageFeedback.showToast('更新成功')
            Taro.hideLoading()
          })
          .catch(() => {
            Taro.hideLoading()
          })
      }
    })
  }

  onBillClick = (key: string) => {
    switch (key) {
      case 'noSend':
        navigatorSvc.navigateTo({
          url: '/subpackages/mine/pages/order_list/index?activeTabIndex=2'
        })
        break
      case 'hasSend':
        navigatorSvc.navigateTo({
          url: '/subpackages/mine/pages/order_list/index?activeTabIndex=3'
        })
        break
      case 'hasCancel':
        navigatorSvc.navigateTo({
          url: '/subpackages/mine/pages/order_list/index?activeTabIndex=4'
        })
        break
      case 'offlineBill':
        navigatorSvc.navigateTo({
          url: '/subpackages/mine/pages/order_list/index?activeTabIndex=5'
        })
        break
      default:
        // 全部订单
        navigatorSvc.navigateTo({
          url: '/subpackages/mine/pages/order_list/index?activeTabIndex=0'
        })
    }
  }

  onMenuClick = e => {
    const { key } = e.currentTarget.dataset
    if (key === 'rep') {
      Taro.navigateTo({
        url: '/subpackages/cloud_bill/pages/bought_goods_list/index'
      })
    } else if (key === 'open') {
      Taro.navigateTo({
        url: '/subpackages/independent/pages/open_shop/index'
      })
    } else if (key === 'call') {
      this.setState({
        callShopIsShow: true
      })
    } else if (key === 'card') {
      this.setState({
        giftCardIsShow: true
      })
    }
  }

  onCallShopClose = () => {
    this.setState({
      callShopIsShow: false
    })
  }

  onPhoneClick = () => {
    if (this.props.phone === '') {
      trackSvc.track('minePhoneClick')
    }
    navigatorSvc.navigateTo({ url: '/subpackages/mine/pages/bind_phone/index' })
  }

  onOrderClick = () => {
    this.orderClickCount++
    this.debounceClearCount()
    if (this.orderClickCount === 8) {
      this.orderClickCount = 0
      Taro.showActionSheet({
        itemList: [
          '默认模式',
          '背景图模式',
          '版本戳模式(推荐)',
          '混合模式',
          '时间戳',
          `当前模式：${this.props.mode}`
        ]
      }).then(r => {
        this.props.dispatch({
          type: 'image/updateMode',
          payload: { mode: Math.min(r.tapIndex, 4) }
        })
      })
    }
  }

  debounceClearCount = debounce(() => {
    this.orderClickCount = 0
  }, 1000)

  onAuditInput = e => {
    this.auditValue = e.detail.value
  }

  onAuditClick = () => {
    this.props.dispatch({
      type: 'user/login',
      payload: {
        phone: this.auditValue
      }
    })
    this.auditValue = ''
    this.auditClickCount = 0
    this.setState({ auditIsShow: false })
  }

  onAuditShowClick = () => {
    this.auditClickCount++
    if (this.auditClickCount === 10) {
      this.setState({
        auditIsShow: true
      })
    }
  }

  setClipboardData = () => {
    if (this.props.shopInfo.wxCode) {
      Taro.setClipboardData({
        data: this.props.shopInfo.wxCode,
        success: () => {
          this.setState({
            callShopIsShow: false,
            clipSuccessIsShow: true
          })
        }
      })
    }
  }

  onWxcodeClick = () => {
    Taro.previewImage({
      urls: [this.props.shopInfo.wxQrUrl || '']
    })
  }

  onSuccessClick = () => {
    this.setState({
      clipSuccessIsShow: false
    })
  }

  callPhone = () => {
    if (this.props.shopInfo.phone) {
      Taro.makePhoneCall({
        phoneNumber: this.props.shopInfo.phone || ''
      })
    }
  }

  onCardCancel = () => {
    this.setState({
      giftCardIsShow: false
    })
  }
  onCardConfirm = async () => {
    console.log(this.props.shopInfo, 'shopInfo===')
    const { cardPwd } = this.state
    const { mpErpId, sn, shopid, epid } = this.props
    const param = {
      mpErpId,
      sn,
      epid,
      shopid,
      pwd: cardPwd
    }
    if (!cardPwd) {
      messageFeedback.showToast('请输入卡密')
      return
    }
    try {
      Taro.showLoading({ title: '请稍等...' })
      const response = await giftTicketGetMat(param)
      Taro.hideLoading()
      const skus = response.data.rows.map((item: any) => {
        return {
          colorId: item.mat_propdres_colorid,
          sizeId: item.mat_propdres_sizeid,
          styleCode: item.show_mat_propdres_styleid,
          styleId: item.mat_propdres_styleid,
          styleName: item.mat_propdres_style_name,
          colorName: item.show_mat_propdres_colorid,
          sizeName: item.show_mat_propdres_sizeid,
          num: Number(item.num),
          price: Number(item.price),
          mpErpId: item.mpErpId,
          styleImg: item.mat_propdres_style_imgUrl,
          checked: true,
          ...item
        }
      })

      // 组装数据
      const { shopParams, mpErpId } = this.props
      let rows = goodsSvc.sortSkusBySize<SkuForBuy>(skus, mpErpId)
      // 失效货品排后面
      rows.sort((a, b) => b.flag - a.flag)
      const spus = rows.reduce<SPUForBuy[]>((spus, sku) => {
        const _spu = spus.find(spu => spu.id === sku.styleId)
        if (_spu) {
          _spu.skus.push({
            ...sku,
            price: shopParams.spuShowPrice === '1' ? sku.price : 0,
            originPrice: sku.price
          })
        } else {
          spus.push({
            flag: sku.flag,
            name: sku.styleName,
            code: sku.styleCode,
            imgUrl: sku.styleImg,
            id: sku.styleId,
            skus: [
              {
                ...sku,
                price: shopParams.spuShowPrice === '1' ? sku.price : 0,
                originPrice: sku.price
              }
            ]
          })
        }
        return spus
      }, [])
      this.props.dispatch({ type: 'replenishment/save', payload: { spus, mpErpId } })
      this.props.dispatch({
        type: 'replenishment/confirmGoodsAndGetShopInfo',
        payload: { spuShowPrice: this.props.spuShowPrice }
      })
      // 修改总额
      this.props.dispatch({
        type: 'replenishment/save',
        payload: {
          isGiftCard: true,
          cardPwd,
          stockBarForbillDetail: this.props.stockBarForbillDetail.map(stockBarItem => {
            return {
              ...stockBarItem,
              totalTable: {
                ...stockBarItem.totalTable,
                totalMoney: 0
              }
            }
          })
        }
      })
      Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/replenishment_confirm/index' })
      this.setState({ giftCardIsShow: false })
    } catch (e) {
      Taro.hideLoading()
      messageFeedback.showError(e.message)
    }
  }

  cardInput = e => {
    this.setState({
      cardPwd: e.detail.value
    })
  }

  renderExchangeView = () => {
    return (
      <View
        className={styles.mine__mask}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => this.setState({ giftCardIsShow: false })}
      >
        <View className={styles.exchange_card_content} onClick={e => e.stopPropagation()}>
          <View className={styles.exchange_card_content__title}>礼品卡兑换</View>
          <Input className={styles.exchange_card_content__input} onInput={this.cardInput} />
          <View style={{ flex: 1 }} />
          <View className={styles.exchange_card_content__action}>
            <View
              className={styles.exchange_card_content__action__left}
              onClick={this.onCardCancel}
            >
              取消
            </View>
            <View
              className={styles.exchange_card_content__action__right}
              onClick={this.onCardConfirm}
            >
              确定
            </View>
          </View>
        </View>
      </View>
    )
  }

  renderSetClipSuccess = () => {
    return (
      <View className={styles.mine__mask}>
        <View className={styles.mine__mask__clipSuccess}>
          <View className={styles.mine__mask__clipSuccess__title}>复制成功</View>
          <View className={styles.mine__mask__clipSuccess__label}>打开微信复制搜索</View>
          <View className={styles.mine__mask__clipSuccess__successContent}>
            <Image src={CopySuccess} style='width:100%;height:100%;' />
          </View>
          <View className={styles.mine__mask__clipSuccess__action} onClick={this.onSuccessClick}>
            好的
          </View>
        </View>
      </View>
    )
  }

  renderCallShopView = () => {
    const { shopInfo } = this.props

    return (
      <View className={styles.mine__mask} onClick={this.onCallShopClose}>
        <View className={styles.mine__mask__content} onClick={e => e.stopPropagation()}>
          <View className={styles.mine__mask__content__header}>
            联系我们
            <Image
              src={closeIcon}
              className={styles.mine__mask__content__header__icon}
              onClick={this.onCallShopClose}
            />
          </View>
          {shopInfo.wxQrUrl && (
            <Image
              src={shopInfo.wxQrUrl}
              showMenuByLongpress
              className={styles.mine__mask__content__wxcode}
              onClick={this.onWxcodeClick}
            />
          )}
          {shopInfo.wxQrUrl && (
            <View className={styles.mine__mask__content__header__bg}>
              点击二维码后长按，添加店主微信
            </View>
          )}
          {(shopInfo.wxCode || shopInfo.phone) && (
            <View className={styles.mine__mask__content__box}>
              {shopInfo.wxCode && (
                <View className={styles.mine__mask__content__contact}>
                  <View className='aic'>
                    <Image className={styles.mine__mask__content__contact__icon} src={WechatIcon} />
                    <Text className={styles.contact_label}>{shopInfo.wxCode}</Text>
                  </View>
                  <View
                    className={styles.mine__mask__content__contact__actionView}
                    onClick={this.setClipboardData}
                  >
                    复制微信
                  </View>
                </View>
              )}
              {shopInfo.phone && (
                <View className={styles.mine__mask__content__contact}>
                  <View className='aic'>
                    <Image className={styles.mine__mask__content__contact__icon} src={PhoneIcon} />
                    <Text className='contact_label'>{shopInfo.phone}</Text>
                  </View>
                  <View
                    className={styles.mine__mask__content__contact__actionView}
                    onClick={this.callPhone}
                  >
                    拨打电话
                  </View>
                </View>
              )}
            </View>
          )}
          {!shopInfo.wxCode && !shopInfo.phone && (
            <View className={styles.no_data} style='background-color:#fff;flex:1;margin-top:0px'>
              档口还没有留下联系方式
            </View>
          )}
        </View>
      </View>
    )
  }

  render() {
    const {
      billNumArr,
      auditIsShow,
      callShopIsShow,
      clipSuccessIsShow,
      giftCardIsShow
    } = this.state
    const { phone, nickName, avatar, statusBarHeight, navigationHeight } = this.props

    return (
      <CustomNavigation containerClass={styles.container}>
        <Image src={bgImg} className={styles.bg} />
        <View className={styles.mine}>
          <View
            style={{
              marginTop: `${statusBarHeight}px`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: `${navigationHeight}px`,
              color: 'white'
            }}
          ></View>
          <View className={styles.mine__profile}>
            <View className={styles.mine__profile__card}>
              <Image
                className={styles.mine__profile__avatar}
                src={avatar}
                onClick={this.onUpdateWXInfo}
              />
              <View className={styles.mine__profile__card__title}>
                <View
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    fontSize: '15px',
                    color: '#222222',
                    fontWeight: 500
                  }}
                >
                  {nickName}
                </View>
                <View
                  className={classNames(styles.mine__basic__phone, {
                    [styles['mine__basic__phone--unbind']]: phone === ''
                  })}
                  onClick={this.onPhoneClick}
                >
                  {phone === '' ? (
                    <Text>绑定手机号</Text>
                  ) : (
                    <Block>
                      <Text className={styles.mine__basic__phone__text}>{phone}</Text>
                      {/* <Image src={editIcon} className={styles.mine__basic__phone__edit} /> */}
                    </Block>
                  )}
                </View>
              </View>
            </View>
          </View>
          <View className={styles.mine__bill}>
            <View className={styles.mine__bill__top}>
              <View style={{ fontSize: '15px' }} onClick={this.onOrderClick}>
                我的订单
              </View>
              <View
                onClick={() => {
                  this.onBillClick('')
                }}
                style={{ fontSize: '13px', color: '#999' }}
              >
                查看全部
              </View>
            </View>
            <View className={styles.mine__bill__bottom}>
              {this.bill.map((item, index) => {
                return (
                  <View
                    className={styles.mine__bill__bottom__item}
                    style={index === 2 ? { boxShadow: '1px 0px 1px #FAFAFA' } : {}}
                    key={item.key}
                    onClick={() => {
                      this.onBillClick(item.key)
                    }}
                  >
                    {index === 0 && billNumArr[index] !== 0 && (
                      <View className={styles.mine__bill__bottom__item__image__tag}>
                        {billNumArr[index]}
                      </View>
                    )}
                    <Image
                      className={styles.mine__bill__bottom__item__image}
                      src={item.icon}
                    ></Image>
                    <View style={{ fontSize: '12px' }}>{item.label}</View>
                  </View>
                )
              })}
            </View>
          </View>
          <View className={styles.mine__menu}>
            {MENU.map(item => (
              <View
                key={item.key}
                className={styles.mine__menu__item}
                data-key={item.key}
                onClick={this.onMenuClick}
              >
                <Text>{item.label}</Text>
                <Image src={RightIcon} className={styles.right_icon} />
              </View>
            ))}
          </View>
        </View>

        {auditIsShow && (
          <View className={styles.audit_view}>
            <Input className={styles.audit_view__input} onInput={this.onAuditInput} />
            <Button onClick={this.onAuditClick} className={styles.audit_view__btn}>
              登陆
            </Button>
          </View>
        )}

        {callShopIsShow && this.renderCallShopView()}
        {clipSuccessIsShow && this.renderSetClipSuccess()}
        {giftCardIsShow && this.renderExchangeView()}
      </CustomNavigation>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(Mine)