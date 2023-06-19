import Taro from '@tarojs/taro'
import React from 'react';
import { View, Image, Text, Block, Input, Button } from '@tarojs/components'
import { debounce } from 'lodash'
import classNames from 'classnames'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { connect } from 'react-redux'
import { getOrderListNum } from '@api/apiManage'
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
import navigatorSvc from '@services/navigator'
import myLog from '@utils/myLog'
import { compareVersion } from '@utils/utils'
import styles from './mine.module.scss'

interface State {
  billNumArr: Array<number> //
  auditIsShow: boolean
}

const mapStateToProps = ({ user, shop, systemInfo, image }: GlobalState) => ({
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
  mode: image.mode
})

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class Mine extends React.PureComponent<StateProps & DefaultDispatchProps, State> {
  // config: Config = {
  //   navigationStyle: 'custom'
  //   // navigationBarTitleText: '我的'
  // }

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
    { label: '线下订货单', icon: billIcon4, key: 'offlineBill' }
  ]

  versionClicked = 0

  orderClickCount = 0

  auditClickCount = 0

  auditValue: string = ''

  state = {
    billNumArr: [0, 0, 0],
    auditIsShow: false
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
    const currentVersion = Taro.getSystemInfoSync().SDKVersion || '1.1.0'

    const goUserInfo = compareVersion(currentVersion, '2.27.1') >= 0
    if (goUserInfo) {
      Taro.navigateTo({ url: '/subpackages/mine/pages/user_info/index' })
    } else {
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
  }

  onBillClick = (key: string) => {
    switch (key) {
      case 'noSend':
        navigatorSvc.navigateTo({
          url: '/subpackages/mine/pages/order_list/index?activeTabIndex=1'
        })
        break
      case 'hasSend':
        navigatorSvc.navigateTo({
          url: '/subpackages/mine/pages/order_list/index?activeTabIndex=2'
        })
        break
      case 'hasCancel':
        navigatorSvc.navigateTo({
          url: '/subpackages/mine/pages/order_list/index?activeTabIndex=3'
        })
        break
      case 'offlineBill':
        Taro.navigateTo({
          url: '/subpackages/mine/pages/order_ticket_list/index'
        })
        break
      default:
        // 全部订单
        navigatorSvc.navigateTo({
          url: '/subpackages/mine/pages/order_list/index?activeTabIndex=0'
        })
    }
  }

  onMenuClick = (index: number) => {
    switch (index) {
      case 0:
        navigatorSvc.navigateTo({ url: '/subpackages/mine/pages/shop_list/index' })
        break
      case 1:
        navigatorSvc.navigateTo({ url: '/subpackages/mine/pages/statement/index' })
        break
      case 2:
        const { firstShop } = this.props
        if (firstShop) {
          const query = `sn=${firstShop.sn}&epid=${firstShop.epid}&shopId=${
            firstShop.shopid
          }&shopName=${encodeURIComponent(firstShop.shopName)}`
          navigatorSvc.navigateTo({ url: `/subpackages/mine/pages/statistics/index?${query}` })
        } else {
          Taro.showToast({ icon: 'none', title: '暂无拿货店铺' })
        }
        break
      case 3:
        navigatorSvc.navigateTo({ url: '/subpackages/functional/pages/auth/index' })
        break
      case 4:
        navigatorSvc.navigateTo({ url: '/subpackages/mine/pages/setting/index' })
        break
      case 5:
        navigatorSvc.navigateTo({ url: '/subpackages/factory/pages/index/index' })
        break
    }
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

  render() {
    const { billNumArr, auditIsShow } = this.state
    const { phone, nickName, avatar, statusBarHeight, navigationHeight } = this.props

    return (
      <View className={styles.container}>
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
          <View className={styles.bottom}>
            <View className={styles.bottom__header} onClick={this.onAuditShowClick}>
              常用功能
            </View>
            <View className={styles.bottom__box}>
              {this.menu.map((item, idx) => {
                return (
                  <View
                    // style={{minWidth:idx===}}
                    className={styles.bottom__box__item}
                    key={`${item.label}_${idx}`}
                    onClick={() => {
                      this.onMenuClick(idx)
                    }}
                  >
                    <Image style={{ width: '32px', height: '32px' }} src={item.icon}></Image>
                    <View style={{ fontSize: '12px', color: '#222222' }}>{item.label}</View>
                  </View>
                )
              })}
            </View>
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
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(Mine)