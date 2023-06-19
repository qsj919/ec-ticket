import Taro, { ENV_TYPE } from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import dva from '@utils/dva'
import {
  registerCheck,
  spuApiInvoke,
  deliveryAfterSaleApiInvoke,
  orderApiFinish,
  editMerchantAddr
} from '@api/live_api_manager'
import cn from 'classnames'
import { AtActivityIndicator } from 'taro-ui'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import { setCommonParams } from '@utils/request'
import { getTaroParams } from '@utils/utils'
import CustomNavigation from '@components/CustomNavigation'
import MiniAppQrCodeCard from '../../components/MiniAppQrCodeCard'
import Logo from '../../images/logo.png'
import LogoBg from '../../images/logo_bg.png'
import PublishGoodsIcon from '../../images/goods_icon.png'
import CreateOrderIcon from '../../images/create_order_icon.png'
import DealOrderIcon from '../../images/deal_order_icon.png'
import BindWechatIcon from '../../images/wx_code_icon.png'
import SuccessIcon from '../../images/success_icon.png'
import addrIcon from '../../images/addr.png'

import './index.scss'

type ACCESSINFO = {
  deploy_wxa_finished: number
  ec_after_sale_finished: number
  ec_after_sale_success: number
  ec_order_finished: number
  ec_order_success: number
  open_product_task_finished: number
  send_delivery_finished: number
  send_delivery_success: number
  spu_audit_finished: number
  spu_audit_success: number
  test_api_finished: number

  deployWxaFinished: number
  ecAfterSaleFinished: number
  ecAfterSaleSuccess: number
  ecOrderFinished: number
  ecOrderSuccess: number
  openProductTaskFinished: number
  sendDeliveryFinished: number
  sendDeliverySuccess: number
  spuAuditFinished: number
  spuAuditSuccess: number
  testApiFinished: number

  returnAddressComplete: number
}

interface State {
  accessInfo: ACCESSINFO
  loading: boolean
  appQrCodeCardVisible: boolean
}

// 验证上一级任务是否完成
const TaskKeys = {
  address: {
    prev: null,
    verify: [
      ['returnAddressComplete']
    ]
  },
  spuAudit: {
    prev: 'address',
    verify: [
      ['spu_audit_finished', 'spuAuditFinished'],
      ['spu_audit_success','spuAuditSuccess']
    ]
  },
  order: {
    prev: 'spuAudit',
    verify: [
      ['ec_order_finished','ecOrderFinished'],
      ['ec_order_success','ecOrderSuccess']
    ]
  },
  afterSale: {
    prev: 'order',
    verify: [
      ['ec_after_sale_finished','ecAfterSaleFinished'],
      ['ec_after_sale_success','ecAfterSaleSuccess']
    ]
  },
}
type ITaskKeys = typeof TaskKeys
const verifyPrevTask = (key: keyof ITaskKeys, accessInfo: ACCESSINFO): boolean => {
  if(!TaskKeys[key]) return false
  const prevTaskKey = TaskKeys[key].prev 
  // prev为空，没有上一项任务
  if(!prevTaskKey) return true

  const curVerifyKeys = TaskKeys[prevTaskKey].verify
  let value = true
  for(let i = 0; i < curVerifyKeys.length; i++) {
    let curChildValue = false
    for(let j = 0; j < curVerifyKeys[i].length; j++) {
      // 子项内部判断 ||
      if (accessInfo[curVerifyKeys[i][j]]) {
        curChildValue = true
      }
    }
    // 子项之间判断 && 
    if (curChildValue === false) {
       return false
    }
  }
  return value
}
const mapStateToProp = ({ user, goodsManage }: GlobalState) => {
  return {
    sessionId: user.sessionId,
    mpErpId: goodsManage.mpErpId
  }
}

type StateProps = ReturnType<typeof mapStateToProp>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProp)
class CreateLive extends React.Component<StateProps & DefaultDispatchProps, State> {
  // config: Taro.Config = {
  //   navigationStyle: 'custom'
  // }

  state = {
    accessInfo: {} as ACCESSINFO,
    loading: false,
    appQrCodeCardVisible: false
  }

  componentDidShow() {
    if (this.props.sessionId) {
      this.init()
    } else {
      this.refreshLoginInit()
    }
  }

  refreshLoginInit = () => {
    // eslint-disable-next-line
    const options = wx.getEnterOptionsSync()
    if (options.scene === 1038) {
      Taro.showLoading({ title: '请稍等...' })
      dva
        .getDispatch()({
          type: 'user/login'
        })
        .then(() => {
          orderApiFinish({
            mpErpId: getTaroParams(Taro.getCurrentInstance?.()).mpErpId
          })
            .then(({ data }) => {
              Taro.hideLoading()
              this.setState({
                accessInfo: {
                  ...data.accessInfo,
                  returnAddressComplete: data.returnAddressComplete
                }
              })
            })
            .catch(() => {
              Taro.hideLoading()
            })
        })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.sessionId !== this.props.sessionId) {
      this.refreshLoginInit()
    }
  }

  init = () => {
    const { mpErpId } = getTaroParams(Taro.getCurrentInstance?.())
    registerCheck({
      mpErpId
    }).then(({ data }) => {
      this.setState({
        accessInfo: {
          ...data.accessInfo,
          returnAddressComplete: data.returnAddressComplete
        }
      })
    })
  }

  onPublishGoods = () => {
    if (
      (this.state.accessInfo.spu_audit_finished === 1 ||
        this.state.accessInfo.spuAuditFinished === 1) &&
      (this.state.accessInfo.spu_audit_success === 1 || this.state.accessInfo.spuAuditSuccess === 1)
    ) {
      return
    }

    if(!verifyPrevTask('spuAudit', this.state.accessInfo)) {
      return Taro.showToast({title:"请先完成上一个任务", icon: 'none'})
    }

    Taro.showLoading({
      title: '请稍等...'
    })
    spuApiInvoke({
      mpErpId: getTaroParams(Taro.getCurrentInstance?.()).mpErpId
    })
      .then(({ data }) => {
        this.setState((state) => {
          return {
            accessInfo: {
              ...data.accessInfo,
              returnAddressComplete: state.accessInfo.returnAddressComplete
            },
          }
        })
        Taro.hideLoading()
      })
      .catch(() => {
        Taro.hideLoading()
      })
  }

  onCreateOrder = () => {
    if (
      this.state.accessInfo.ec_order_finished === 1 &&
      this.state.accessInfo.ec_order_success === 1
    ) {
      return
    }

    if(!verifyPrevTask('order', this.state.accessInfo)) {
      return Taro.showToast({title:"请先完成上一个任务", icon: 'none'})
    }

    if(Taro.getEnv() === ENV_TYPE.WEB) {
      // web 显示小程序二维码
      this.setState({ appQrCodeCardVisible: true })
    } else {
      Taro.navigateToMiniProgram({
        appId: dva.getState().goodsManage.independentAppId,
        path: '/subpackages/independent/pages/check_before_order/index',
        envVersion: 'trial',
        success: () => {
          setCommonParams({ sessionId: '' })
          this.props.dispatch({
            type: 'user/save',
            payload: {
              sessionId: ''
            }
          })
        }
      })
    }
  }

  onOrderClick = () => {
    if (
      (this.state.accessInfo.ec_after_sale_finished === 1 ||
        this.state.accessInfo.ecAfterSaleFinished === 1) &&
      (this.state.accessInfo.ec_after_sale_success === 1 ||
        this.state.accessInfo.ecAfterSaleSuccess === 1) &&
      !this.state.loading
    ) {
      return
    }

    if(!verifyPrevTask('afterSale', this.state.accessInfo)) {
      return Taro.showToast({title:"请先完成上一个任务", icon: 'none'})
    }
  
    this.setState({
      loading: true
    })
    deliveryAfterSaleApiInvoke({
      mpErpId: getTaroParams(Taro.getCurrentInstance?.()).mpErpId
    })
      .then(({ data }) => {
        Taro.hideLoading()
        this.setState((state) => {
          return {
            accessInfo: {
              ...data.accessInfo,
              returnAddressComplete: state.accessInfo.returnAddressComplete
            },
            loading: false
          }
        })
        this.init()
      })
      .catch(() => {
        this.setState({
          loading: false
        })
        Taro.hideLoading()
      })
  }

  gotoEditAddr = () => {
    if(this.state.accessInfo.returnAddressComplete === 1) return

    if(Taro.getEnv() === ENV_TYPE.WEB) {
      Taro.navigateTo({
        url: `/subpackages/live/pages/perfect_address/index?mpErpId=${getTaroParams(Taro.getCurrentInstance?.()).mpErpId}&sessionId=${this.props.sessionId}`
      })
    } else {
      Taro.chooseAddress({
        success: e => {
          const params = {
            receiver_name: e.userName,
            detailed_address: e.detailInfo,
            tel_number: e.telNumber,
            country: '中国',
            province: e.provinceName,
            city: e.cityName,
            town: e.countyName
          }
          editMerchantAddr({ mpErpId: getTaroParams(Taro.getCurrentInstance?.()).mpErpId, jsonParam: params })
        },
        complete: () => {
          this.init()
        }
      })
    }
  }

  onGoLiveGoodsManage = () => {
    Taro.navigateTo({
      url: '/subpackages/live/pages/live_goods_manage/index?mpErpId=' + this.props.mpErpId
    })
  }
  
  hideAppQrCodeCard = () => {
    this.setState({ appQrCodeCardVisible: false })
  }

  render() {
    const { navigationHeight, statusBarHeight } = dva.getState().systemInfo
    const { accessInfo, loading, appQrCodeCardVisible } = this.state
    return (
      <CustomNavigation enableBack>
        <View className='create_live__wrapper col aic'>
          <Image className='logo_bg' src={LogoBg} />
          <View
            className='create_live__wrapper__navigation'
            style={{
              height: `${navigationHeight + statusBarHeight}px`
            }}
          />
          <View className='create_live__wrapper__title aic jcc'>
            <Image src={Logo} className='logo' />
            <Text>视频号直播</Text>
          </View>
          <View className='create_live__wrapper__content col aic'>
            <View className='create_live__wrapper__content__title'>
              请完成以下任务后开启视频号带货功能
            </View>
            <View className='create_live__wrapper__content__item aic jcsb'>
              <View className='aic'>
                <Image className='icon' src={addrIcon} />
                <Text className='label'>完善商家地址</Text>
              </View>
              <View 
                className={cn('action_confirm aic jcc', {
                  ['success_bc']: accessInfo.returnAddressComplete === 1
                })} 
                onClick={this.gotoEditAddr}
              >
                {accessInfo.returnAddressComplete === 1 ? (
                    <Image src={SuccessIcon} className='success_icon' />
                ) : (
                  '完成'
                )}
              </View>
            </View>
            <View className='create_live__wrapper__content__item aic jcsb'>
              <View className='aic'>
                <Image className='icon' src={PublishGoodsIcon} />
                <Text className='label'>发布商品</Text>
              </View>
              <View
                className={cn('action_confirm aic jcc', {
                  ['success_bc']:
                    (accessInfo.spu_audit_finished === 1 || accessInfo.spuAuditFinished === 1) &&
                    (accessInfo.spu_audit_success === 1 || accessInfo.spuAuditSuccess === 1)
                })}
                onClick={this.onPublishGoods}
              >
                {(accessInfo.spu_audit_finished === 1 || accessInfo.spuAuditFinished === 1) &&
                (accessInfo.spu_audit_success === 1 || accessInfo.spuAuditSuccess === 1) ? (
                  <Image src={SuccessIcon} className='success_icon' />
                ) : (
                  '完成'
                )}
              </View>
            </View>
            <View className='create_live__wrapper__content__item aic jcsb'>
              <View className='aic'>
                <Image className='icon' src={CreateOrderIcon} />
                <Text className='label'>生成一笔订单</Text>
                <MiniAppQrCodeCard 
                  mpErpId={getTaroParams(Taro.getCurrentInstance?.()).mpErpId} 
                  visible={appQrCodeCardVisible} 
                  closeVisible={this.hideAppQrCodeCard}
                />
              </View>
              <View
                className={cn('action_confirm aic jcc', {
                  ['success_bc']:
                    (accessInfo.ec_order_finished === 1 || accessInfo.ecOrderFinished === 1) &&
                    (accessInfo.ec_order_success === 1 || accessInfo.ecOrderSuccess === 1)
                })}
                onClick={this.onCreateOrder}
              >
                {(accessInfo.ec_order_finished === 1 || accessInfo.ecOrderFinished === 1) &&
                (accessInfo.ec_order_success === 1 || accessInfo.ecOrderSuccess === 1) ? (
                  <Image src={SuccessIcon} className='success_icon' />
                ) : (
                  '完成'
                )}
              </View>
            </View>
            <View className='create_live__wrapper__content__item aic jcsb'>
              <View className='aic'>
                <Image className='icon' src={DealOrderIcon} />
                <Text className='label'>处理订单</Text>
              </View>
              <View
                className={cn('action_confirm aic jcc', {
                  ['action_confirm__padding']: loading,
                  ['success_bc']:
                    ((accessInfo.ec_after_sale_finished === 1 ||
                      accessInfo.ecAfterSaleFinished === 1) &&
                      (accessInfo.ec_after_sale_success === 1 ||
                        accessInfo.ecAfterSaleSuccess === 1)) ||
                    loading
                })}
                onClick={this.onOrderClick}
              >
                {loading ? (
                  <View className='aic'>
                    <AtActivityIndicator color='#FA9D3B' />
                    <Text className='at_last_text_view'>处理中...</Text>
                  </View>
                ) : (
                  <View>
                    {(accessInfo.ec_after_sale_finished === 1 ||
                      accessInfo.ecAfterSaleFinished === 1) &&
                    (accessInfo.ec_after_sale_success === 1 ||
                      accessInfo.ecAfterSaleSuccess === 1) ? (
                      <Image src={SuccessIcon} className='success_icon' />
                    ) : (
                      '完成'
                    )}
                  </View>
                )}
              </View>
            </View>

            <View className='create_live__wrapper__content__item aic jcsb'>
              <View className='aic'>
                <Image className='icon' src={BindWechatIcon} />
                <Text className='label'>绑定主播微信至视频号</Text>
              </View>
              <View
                className='action_show_help aic jcc'
                onClick={() =>
                  Taro.navigateTo({
                    url: '/subpackages/live/pages/live_guide/index?mpErpId=' + this.props.mpErpId
                  })
                }
              >
                查看教程
              </View>
            </View>
            <View className='areate_live_action aic jcc' onClick={this.onGoLiveGoodsManage}>
              开启直播
            </View>
          </View>
        </View>
      </CustomNavigation>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProp)(CreateLive)