import Taro, { Config } from '@tarojs/taro'
import React from 'react'
import { Image, View, Text, Button, ScrollView, Canvas, Block } from '@tarojs/components'
import { connect } from 'react-redux'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { urlQueryParse, getTaroParams } from '@utils/utils'
import messageFeedback from '@services/interactive'
import { EVENT_CENTER } from '@constants/index'
import EImage from '@components/EImage'
import myLog from '@utils/myLog'
import config from '@config/config'
import {
  monitorShopEvent,
  saveUserShopStaffLink,
  isFirstOpenNeedGuide,
  findShopStaffList
} from '@api/goods_api_manager'
import CustomNavigation from '@components/CustomNavigation'
import {
  createSelectorQuery,
  isWeapp,
  isWeb,
  setNavigationBarTitle
} from '@utils/cross_platform_api'
import { registerCheck } from '@api/live_api_manager'
import { safePostMeaasge } from '@utils/postMessage'
import HomeIcon from '@/images/home_icon.png'
import { openToBiz } from '@api/apiManage'
import events from '@constants/analyticEvents'
import trackSvc from '@services/track'
import LoginView from '@components/LoginView/LoginView'
import defaultShopLogo from '@/images/ticket_default_shop.png'
import VideoLive from '../../images/video_live.png'
import videoMenu from '../../images/menu_video.png'
import myClient from '../../images/my_client.png'
import orderIcon from '../../images/order_icon.png'
import goodsIcon from '../../images/goods_icon.png'
import settingIcon from '../../images/setting_icon.png'
import informCustomer from '../../images/inform_customer.png'
import manageShare from '../../images/manage_share.png'
import shareManage from '../../images/manage_share_bg.png'
import manageShareIcon from '../../images/manage_share_icon.png'
import shareDownload from '../../images/share_download.png'
import shareWechat from '../../images/share_weChat.png'
// import shareDefault from '../../images/share_default.png'
import manageCustomBg from '../../images/manage_custom_bg.png'
import rightCheckBoxYes from '../../images/right_checkbox_yes.png'
import AccessReport from '../../images/access_report.png'
import styles from './index.module.scss'
import ConfigurationBg from '../../images/configuration_bg.png'
import DanToIcon from '../../images/dantu_icon.png'
import ShopManageIcon from '../../images/shop_manage_icon.png'
import GoodsShareIcon from '../../images/goods_share_icon.png'
import { cloudOrderBillEvent } from '../../events'

const shareDefault = 'https://webdoc.hzecool.com/webCdn/fxz/cloud_mini_share.png'

const MENU_KEY = {
  goods: 'goods_manage',
  // goodsMarketRule: 'goods_market_rule',  原库存规则页面
  clinetManage: 'client_manage',
  myClient: 'my_clint',
  userManage: 'user_manage',
  storeProfile: 'store_profile',
  video: 'video',
  newProtection: 'new_protection',
  viewMyCloud: 'view_myCloud',
  goodsSetting: 'show_money',
  goodsEdit: 'goods_edit',
  informCustomer: 'automatic_notification',
  inviteCustomers: '',
  manageShare: 'manage_hare',
  accessReport: 'access_eport',
  orderBill: 'order_bill',
  share: 'share',
  shopManage: 'shop_manage',
  videoLive: 'video_live'
}

const BASICOPERATION = [
  {
    title: '基础操作',
    items: [
      {
        label: '商品',
        key: MENU_KEY.goods,
        icon: goodsIcon
      },
      {
        label: '订单',
        key: MENU_KEY.orderBill,
        icon: orderIcon
      },
      {
        label: '客户',
        key: MENU_KEY.myClient,
        icon: myClient
      },
      {
        label: '设置',
        key: MENU_KEY.goodsSetting,
        icon: settingIcon
      },
      {
        label: '店铺管理',
        key: MENU_KEY.shopManage,
        icon: ShopManageIcon
      },
      {
        label: '商品分享',
        key: MENU_KEY.share,
        icon: GoodsShareIcon
      }
      // {
      //   label: '视频号',
      //   key: MENU_KEY.videoLive,
      //   icon: VideoLive
      // }
    ]
  }
]

if (isWeb()) {
  BASICOPERATION[0].items.splice(5, 1)
}

const mapStateToProps = ({
  shop,
  systemInfo,
  user,
  loading,
  goodsManage,
  cloudBill
}: GlobalState) => {
  const _shop = shop.list.find(s => s.id === goodsManage.mpErpId)
  const isFetchingData =
    loading.effects['goodsManage/fetchGoodsList'] &&
    loading.effects['goodsManage/fetchGoodsList'].loading

  const bizShop = goodsManage.bizShops.find(s => s.bizShopId == goodsManage.shopId)
  const bizStatus = bizShop && bizShop.bizStatus ? bizShop.bizStatus : 1
  return {
    phone: user.phone,
    noAuth: user.noAuth,
    logining: user.logining,
    windowWidth: systemInfo.windowWidth,
    navigationHeight: systemInfo.navigationHeight,
    platform: systemInfo.platform,
    statusBarHeight: systemInfo.statusBarHeight,
    goodsList: goodsManage.goodsList,
    mpErpId: goodsManage.mpErpId,
    isLoadingMore: isFetchingData && goodsManage.pageNo > 1,
    isFetchingData,
    shop: _shop,
    sessionId: user.sessionId,
    erpQrCode: goodsManage.erpQrCode,
    shopName: goodsManage.shopName,
    staffInfo: goodsManage.staffInfo,
    shopLogoUrl: goodsManage.shopLogoUrl,
    myClientViewData: goodsManage.myClientViewData,
    isHotUnbound: goodsManage.isHotUnbound,
    shopList: goodsManage.shopList,
    stafflist: goodsManage.stafflist,
    autoAuditOrder: goodsManage.autoAuditOrder,
    todayViewerCount: goodsManage.todayViewerCount,
    todayBillCount: goodsManage.todayBillCount,
    marketSpuCount: goodsManage.marketSpuCount,
    bizStatus,
    shopId: goodsManage.shopId,
    buyShopNum: goodsManage.buyShopNum,
    confirmListLen: cloudBill.orderBillListBeConfirmed.length,
    shopVisitorAuth: goodsManage.shopVisitorAuth,
    independentType: goodsManage.independentType,
    cloudExpireInfo: goodsManage.cloudExpireInfo,
    mktToken: goodsManage.mktToken
  }
}

type staffListItem = {
  depname: string
  id: number
  name: string
  rolename: string
  mobile: string
}

type shopListItem = {
  shopName: string
  sn: number
  shopid: number
  epid: number
  id: number
}
interface State {
  maskIsShow: boolean
  shareIsShow: boolean
  switchShopIsShow: boolean
  shopListItem: shopListItem
  appName: string
  isNeedGuide: boolean
  disableAccess: boolean
  useIdentityIsShow: boolean
  curpageno: number
  stafflist: Array<staffListItem>
  staffItem: staffListItem
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class CloudBillManage extends React.Component<
  StateProps & DefaultDispatchProps,
  State
> {
  // config: Config = {
  //   navigationStyle: 'custom',
  //   navigationBarTitleText: isWeb() ? '云单商家后台' : ''
  // }

  dataFetched = false

  bgImgInfo = {
    height: 734,
    orientation: 'up',
    path: '',
    type: 'png',
    width: 550
  }

  qrCodeImgInfo = {
    height: 100,
    orientation: 'up',
    path: '',
    type: 'png',
    width: 100
  }

  canvasIns: HTMLCanvasElement | null = null

  bgImgLoad = false

  qrImgLoad = false

  // mktToken: string = ''

  MiniRefresh

  state = {
    maskIsShow: false,
    shareIsShow: false,
    switchShopIsShow: false,
    shopListItem: {} as shopListItem,
    appName: '', // 产品类型 fxz-超越版 slh-商陆花,
    isNeedGuide: false,
    disableAccess: false,
    useIdentityIsShow: false,
    curpageno: 1,
    stafflist: [] as staffListItem[],
    staffItem: {} as staffListItem
  }

  interval: NodeJS.Timeout

  componentDidMount() {
    if (this.props.logining) {
      Taro.showLoading({ title: '登录中...', mask: true })
    }
    this.init()

    cloudOrderBillEvent.addEventListener()

    if (process.env.TARO_ENV === 'h5') {
      require('minirefresh')
      require('minirefresh/dist/debug/minirefresh.css')
      const _this = this

      /* eslint-disable */
      this.MiniRefresh = new MiniRefresh({
        container: '#minif',
        down: {
          callback: function() {
            _this.refreshData()
          }
        },
        up: {
          callback: function() {
            // 注意，由于默认情况是开启满屏自动加载的，所以请求失败时，请务必endUpLoading(true)，防止无限请求
            _this.MiniRefresh.endUpLoading(true)
          }
        }
      })
    }
  }
  componentDidShow() {
    setNavigationBarTitle('云单商家后台')

    let pages = Taro.getCurrentPages()
    let currPage = pages[pages.length - 1] // 获取当前页面
    if (currPage && currPage.isAmktBack) {
      // 获取值
      currPage.isAmktBack = 0
      // window.location.reload()
      const { mktToken = '' } = getTaroParams(Taro.getCurrentInstance?.())
      mktToken && this.props.dispatch({ type: 'goodsManage/findBizShops', payload: { mktToken } })
      mktToken &&
        this.props.dispatch({
          type: 'goodsManage/getConnectorAcctTotalRecharge',
          payload: { mktToken }
        })
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  componentDidUpdate(prevProps: Readonly<StateProps & DefaultDispatchProps>) {
    if (!this.props.logining && prevProps.logining) {
      Taro.hideLoading()
    }

    this.init()
  }

  refreshData = async () => {
    try {
      let { sn, epid, shopId, mktToken = '' } = getTaroParams(Taro.getCurrentInstance?.())
      await this.props.dispatch({
        type: 'goodsManage/fetchAuthAndDocUrl',
        payload: { sn, epid, shopid: shopId }
      })
      await this.fetchConfirmedList()
      Promise.all([
        this.props.dispatch({ type: 'goodsManage/selestShopParamVisitorAuth' }),
        this.props.dispatch({ type: 'goodsManage/getShopViewData' }),
        this.props.dispatch({ type: 'goodsManage/selectShopStaffAuth' }),
        this.props.dispatch({ type: 'goodsManage/selectErpLinkUsers' }),
        this.props.dispatch({ type: 'goodsManage/selectShopManageData' }),
        this.props.dispatch({ type: 'goodsManage/selectShopParamAutoAuditOrder' })
      ])
        .then(() => {
          this.MiniRefresh.endDownLoading(true)
        })
        .catch(() => {
          this.MiniRefresh.endDownLoading(true)
        })
      mktToken && this.props.dispatch({ type: 'goodsManage/findBizShops', payload: { mktToken } })
      mktToken &&
        this.props.dispatch({
          type: 'goodsManage/getConnectorAcctTotalRecharge',
          payload: { mktToken }
        })
      this.fetchCanvasPreDataAndInitCanvas()
    } catch (e) {
      this.MiniRefresh.endDownLoading(true)
    }
  }

  init = async (shopListItem?) => {
    if (!this.props.phone && isWeapp()) return
    try {
      // 拿到手机号，开始请求
      if (this.props.sessionId && !this.dataFetched) {
        Taro.showLoading({ title: '请求数据中...', mask: true })
        this.dataFetched = true
        // rname 员工名字 rid 员工id roleName员工所属身份名字 仅h5
        let {
          q,
          sn,
          epid,
          shopId,
          msgId = 60,
          rname,
          rid,
          roleName,
          mktToken = '',
          appName,
          staffId,
          mobile
        } = getTaroParams(Taro.getCurrentInstance?.())

        this.props.dispatch({ type: 'goodsManage/save', payload: { mktToken } })
        if (isWeb()) {
          if ((rid || staffId) && rname && roleName) {
            rid = staffId ? decodeURIComponent(staffId) : decodeURIComponent(rid)
            rname = decodeURIComponent(rname)
            roleName = decodeURIComponent(roleName)

            this.props.dispatch({
              type: 'goodsManage/save',
              payload: {
                staffInfoH5: { id: rid, name: rname, roleName, flag: 1 },
                staffInfo: { id: rid, name: rname, rolename: roleName, flag: 1 }
              }
            })
          }
        }

        if (q) {
          const _q = decodeURIComponent(q)
          const query = urlQueryParse(_q)
          sn = query.sn
          epid = query.epid
          shopId = query.shopId
        }
        if (appName) {
          this.setState({ appName })
          this.props.dispatch({
            type: 'goodsManage/save',
            payload: {
              appName
            }
          })
        }

        if (shopListItem) {
          await this.props.dispatch({
            type: 'goodsManage/init',
            payload: {
              sn: shopListItem.sn,
              epid: shopListItem.epid,
              shopid: shopListItem.shopid,
              shopId: shopListItem.shopid
            }
          })
        } else {
          await this.props.dispatch({
            type: 'goodsManage/init',
            payload: { sn, epid, shopid: shopId, shopId }
          })
        }

        this.props.dispatch({ type: 'goodsManage/selectShopParamStaffViewClientPhone' })
        // this.props
        //   .dispatch({ type: 'goodsManage/selectShopStaffAuth' })
        //   .then(({ staff, mpErpId }) => {
        this.props.dispatch({ type: 'goodsManage/selectShopHotSale' })
        if (this.props.staffInfo.flag === 1) {
          isFirstOpenNeedGuide({ mpErpId: this.props.mpErpId })
            .then(async ({ code, data }) => {
              if (code === 0 && data.needGuide) {
                this.setState({
                  isNeedGuide: true
                })
                Taro.eventCenter.on('IS_NEED_GUIDE', () => {
                  this.setState({
                    isNeedGuide: false
                  })
                  this.props.dispatch({
                    type: 'goodsManage/fetchAuthAndDocUrl',
                    payload: { sn, epid, shopid: shopId }
                  })
                  mktToken &&
                    this.props.dispatch({
                      type: 'goodsManage/findBizShops',
                      payload: { mktToken }
                    })
                  mktToken &&
                    this.props.dispatch({
                      type: 'goodsManage/getConnectorAcctTotalRecharge',
                      payload: { mktToken }
                    })
                })
                Taro.hideLoading()
              } else {
                // 初始化成功
                if ((rid || staffId) && rname && roleName) {
                  rid = staffId ? decodeURIComponent(staffId) : decodeURIComponent(rid)
                  rname = decodeURIComponent(rname)
                  roleName = decodeURIComponent(roleName)

                  await saveUserShopStaffLink({
                    jsonParam: {
                      mpErpId: this.props.mpErpId
                    }
                  })
                  await this.props.dispatch({
                    type: 'goodsManage/fetchAuthAndDocUrl',
                    payload: { sn, epid, shopid: shopId }
                  })
                }
                Taro.hideLoading()
                monitorShopEvent({
                  mpErpId: this.props.mpErpId,
                  eventType: Number.isNaN(Number(msgId)) ? 60 : Number(msgId)
                })
                this.fetchConfirmedList()
                this.fetchStafflist(this.state.curpageno).then(res => {
                  this.setState({ stafflist: res.data.rows })
                })
                this.props.dispatch({ type: 'goodsManage/selestShopParamVisitorAuth' })
                this.props.dispatch({ type: 'goodsManage/getShopViewData' })
                this.props.dispatch({ type: 'goodsManage/selectErpLinkUsers' })
                this.props.dispatch({ type: 'goodsManage/selectShopManageData' })
                this.props.dispatch({ type: 'goodsManage/selectShopParamAutoAuditOrder' })
                mktToken &&
                  this.props.dispatch({
                    type: 'goodsManage/findBizShops',
                    payload: { mktToken }
                  })
                mktToken &&
                  this.props.dispatch({
                    type: 'goodsManage/getConnectorAcctTotalRecharge',
                    payload: { mktToken }
                  })
                this.fetchCanvasPreDataAndInitCanvas()
                this.MiniRefresh && this.MiniRefresh.endDownLoading(true)
              }
            })
            .catch(e => {
              this.MiniRefresh && this.MiniRefresh.endDownLoading(true)
              Taro.hideLoading()
            })
        } else {
          Taro.hideLoading()
          this.setState({
            disableAccess: true
          })
        }
        // })
        // .catch(error => {})

        // // 判断是否需要绑定
        // const { staffInfo, isHotUnbound } = this.props
        // if (staffInfo.flag === 0 && !isHotUnbound && isWeapp()) {
        //   this.setState({ maskIsShow: true, useIdentityIsShow: true })
        // }
      }
    } catch (e) {
      messageFeedback.showAlert(e.message, '', '返回首页', () => this.onHomeIconClick())
    }
  }

  fetchCanvasPreDataAndInitCanvas = () => {
    Promise.all([
      this.props.dispatch({ type: 'goodsManage/selelctShopProfileInformation' }),
      this.props.dispatch({ type: 'goodsManage/selectErpQrCodeUrl' })
    ]).then(() => {
      this.initShareCanvas()
    })
  }

  onMenuClick = e => {
    const { key } = e.currentTarget.dataset
    const { mpErpId, shop, bizStatus, staffInfo } = this.props
    switch (key) {
      case MENU_KEY.goods:
        Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/goods_manage/index' })
        break
      case MENU_KEY.userManage:
        Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/user_manage/index' })
        break
      case MENU_KEY.storeProfile:
        Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/store_profile/index' })
        break
      case MENU_KEY.video:
        Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/video_edit/index' })
        break
      case MENU_KEY.viewMyCloud:
        if (isWeb()) {
        } else {
          Taro.navigateTo({
            url: '/pages/cloud_bill_landpage/index?fromScreen=manage&mpErpId=' + mpErpId
          })
        }

        break
      case MENU_KEY.newProtection:
        Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/new_protection/index' })
        break
      case MENU_KEY.goodsEdit:
        Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/goods_edit_list/index' })
        break
      case MENU_KEY.goodsSetting:
        Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/goods_setting/index?type=normal' })
        break
      case MENU_KEY.myClient:
        this.goMyClient()
        break
      case MENU_KEY.informCustomer:
        if (bizStatus === 3) {
          messageFeedback.showAlert(
            '您的店铺已关闭，无法通知客户，请开启云单后再通知客户',
            '',
            '好的'
          )
        } else if (bizStatus === 2) {
          messageFeedback.showAlert('您的店云单已到期，无法通知客户', '', '好的')
        } else {
          Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/automatic_notification/index' })
        }
        break
      case MENU_KEY.manageShare:
        this.onShareClick()
        break
      case MENU_KEY.accessReport:
        Taro.navigateTo({
          url: '/subpackages/mine/pages/store_operation_data_report/index'
        })
        break
      case MENU_KEY.orderBill:
        this.goOrderBillScreen()
        break
      case MENU_KEY.shopManage:
        Taro.navigateTo({
          url: `/subpackages/manage/pages/shop_manage/index?mktToken=${this.props.mktToken}&rolename=${staffInfo.rolename}`
        })
        break
      case MENU_KEY.share:
        trackSvc.track(events.manageShareClick)
        Taro.navigateTo({
          url: '/subpackages/cloud_bill/pages/goods_share_index/index'
        })
        break
      case MENU_KEY.videoLive:
        const { mpErpId } = this.props
        registerCheck({
          mpErpId
        })
          .then(({ data }) => {
            if (data.sceneGroupList[0].status === 1) {
              Taro.navigateTo({
                url: '/subpackages/live/pages/live_goods_manage/index?mpErpId=' + this.props.mpErpId
              })
            } else {
              Taro.navigateTo({
                url: '/subpackages/live/pages/create_live/index?mpErpId=' + this.props.mpErpId
              })
            }
          })
          .catch(() => {})
        break
      default:
        messageFeedback.showToast('敬请期待')
        break
    }
  }

  onBizStatusClick = () => {
    if (this.props.bizStatus === 0) {
      this.onShopOpenClick()
    }
    if (
      this.props.bizStatus === 2 ||
      this.props.cloudExpireInfo.remindFlag > 0 ||
      this.props.cloudExpireInfo.overdueFlag === 1
    ) {
      this.goCloudBillAmktH5()
    }
  }

  goCloudBillGuideH5 = () => {
    Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/cloud_bill_guide_h5/index' })
  }

  goCloudBillAmktH5 = () => {
    const { shopId, mktToken } = this.props
    if (isWeapp()) {
      // messageFeedback.showAlert('请前往商陆花线上接单或应用市场内续费', '', '好的')
      Taro.navigateTo({
        url: `/subpackages/cloud_bill/pages/cloud_bill_renew_h5/index?shopId=${shopId}&mktToken=${mktToken}`
      })
    } else {
      let { shopId } = this.props
      Taro.navigateTo({
        url:
          '/subpackages/cloud_bill/pages/cloud_bill_amkt_h5/index?mktToken=' +
          this.props.mktToken +
          '&shopId=' +
          shopId
      })
    }
  }

  goMyClient = () => {
    Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/my_client/index' })
  }

  goGoodsManage = () => {
    Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/goods_manage/index' })
  }

  fetchConfirmedList = () => {
    this.props.dispatch({
      type: 'cloudBill/selectAuditBillList',
      payload: {
        mpErpId: this.props.mpErpId,
        auditFlag: 1,
        pageNo: 1
      }
    })
  }

  goOrderBillScreen = () => {
    Taro.navigateTo({
      url: '/subpackages/cloud_bill/pages/order_bill_screen/index'
    })
    // if (isWeapp()) {
    //   if (this.props.autoAuditOrder !== '1') {
    //     Taro.navigateTo({
    //       url: '/subpackages/cloud_bill/pages/order_bill_screen/index'
    //     })
    //   } else {
    //     messageFeedback.showAlert(
    //       '请前往商陆花—销售订货内处理云单订单（欠货模式请前往销售单内处理）'
    //     )
    //   }
    // } else {
    //   if (this.props.autoAuditOrder !== '1') {
    //     Taro.navigateTo({
    //       url: '/subpackages/cloud_bill/pages/order_bill_screen/index'
    //     })
    //   } else {
    //     safePostMeaasge(
    //       JSON.stringify({
    //         eventType: 'openSLHBill'
    //       })
    //     )
    //   }
    // }
  }

  onEditPictureClick = () => {
    Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/goods_edit_list/index' })
  }
  onInformClickShow = () => {
    Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/automatic_notification/index' })
  }

  Alert = (val, func?) => {
    messageFeedback.showAlert(val, '', '好的', () => {
      func && func()
    })
  }
  onCloseMask = () => {
    this.setState({ maskIsShow: false, shareIsShow: false, switchShopIsShow: false })
  }
  onSaveToAlbum = () => {
    // if (this.props.erpQrCode) {
    //   saveRemoteImgToAlbum(this.props.erpQrCode)
    // }
    this.generateShareImg()
  }
  onShareClick = () => {
    this.props.dispatch({ type: 'goodsManage/selectErpQrCodeUrl' })
    this.setState({ maskIsShow: true, shareIsShow: true })
  }

  onShareAppMessage() {
    const { shopName, mpErpId, shopLogoUrl } = this.props
    return {
      title: `[${shopName}]新款爆款都在这里，快点击去看款补货吧`,
      path: 'pages/cloud_bill_landpage/index?mpErpId=' + mpErpId,
      imageUrl: shopLogoUrl || shareDefault
    }
  }

  // 分享
  onOpenTypeClick = () => {
    const { appName } = this.state
    if (isWeb()) {
      const { shopName, mpErpId, independentType, shopLogoUrl } = this.props
      if (independentType === 0) {
        safePostMeaasge(
          JSON.stringify({
            eventType: 'shareWxMiniProgram',
            data: {
              title: `[${shopName}]新款爆款都在这里，快点击去看款补货吧`,
              path: 'pages/cloud_bill_landpage/index?mpErpId=' + mpErpId,
              thumImageUrl: shopLogoUrl || shareDefault,
              desc: '',
              [appName === 'slh' ? 'miniprogramType' : 'miniProgramType']:
                process.env.PRODUCT_ENVIRONMENT === 'product' ? 0 : 2,
              userName: config.appUserName
            }
          })
        )
      }
      if (independentType === 1) {
        safePostMeaasge(
          JSON.stringify({
            eventType: 'shareWxMiniProgram',
            data: {
              title: `[${shopName}]新款爆款都在这里，快点击去看款补货吧`,
              path: 'subpackages/cloud_bill/pages/all_goods/index?mpErpId=' + mpErpId,
              thumImageUrl: shopLogoUrl || shareDefault,
              desc: '',
              [appName === 'slh' ? 'miniprogramType' : 'miniProgramType']:
                process.env.PRODUCT_ENVIRONMENT === 'product' ? 0 : 2,
              userName: config.appUserName
            }
          })
        )
      }
      if (independentType === 2) {
      }
    }

    this.props.dispatch({
      type: 'goodsManage/insertMonitorShopEvent',
      payload: {
        eventType: 50,
        bizNum: 1
      }
    })
  }

  onGoStaffInfo = () => {
    if (isWeapp()) {
      const { isHotUnbound, staffInfo } = this.props
      if (staffInfo.flag === -1) {
        return
      }
      this.dataFetched = false
      Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/staff_detail/index' })
    }
  }

  onPlaceBind() {
    this.Alert('请绑定员工信息', () => {
      this.setState({ maskIsShow: true, useIdentityIsShow: true })
    })
  }

  onShopViewerClick = () => {
    const { appName } = this.state
    if (this.props.mpErpId) {
      if (isWeapp()) {
        Taro.navigateTo({
          url: '/pages/cloud_bill_landpage/index?fromScreen=manage&mpErpId=' + this.props.mpErpId
        })
      } else {
        safePostMeaasge(
          JSON.stringify({
            eventType: appName === 'slh' ? 'openWxMiniProgram' : 'launchMini',
            data: {
              path:
                'pages/cloud_bill_landpage/index?fromScreen=manage&mpErpId=' + this.props.mpErpId,
              [appName === 'slh' ? 'miniprogramType' : 'miniProgramType']:
                process.env.PRODUCT_ENVIRONMENT === 'product' ? 0 : 2,
              userName: config.appUserName
            }
          })
        )
      }
    }
  }

  onShopOpenClick = () => {
    const { shopId } = this.props
    openToBiz(shopId, this.props.mktToken)
      .then(res => {
        this.props.dispatch({
          type: 'goodsManage/findBizShops',
          payload: { mktToken: this.props.mktToken }
        })
        // this.init()
      })
      .catch(e => {
        myLog.log(`开启云单失败${e}`)
      })
  }

  onShopListItemClick = async item => {
    Taro.showLoading({ title: '请稍等...' })
    if (item.id !== this.props.mpErpId) {
      this.setState({
        shopListItem: item
      })
      this.onCloseStaffList()
      this.props.dispatch({ type: 'goodsManage/resetIsHotUnboundFalse' })
      await this.props.dispatch({
        type: 'goodsManage/init',
        payload: { sn: item.sn, epid: item.epid, shopid: item.shopid, shopId: item.shopid }
      })
      // this.props.dispatch({
      //   type: 'goodsManage/selectShopStaffList',
      //   payload: {
      //     curpageno: 1
      //   }
      // })
      this.props.dispatch({ type: 'goodsManage/selectShopManageData' })
      this.props.dispatch({ type: 'goodsManage/selectShopParamAutoAuditOrder' })
      this.props.dispatch({
        type: 'goodsManage/selectLastEnterShop'
      })
      // this.props.dispatch({ type: 'goodsManage/selectErpLinkUsers' })
    } else {
      messageFeedback.showToast('请选择其他门店')
    }
    Taro.hideLoading()
  }
  onSwitchShopClick = () => {
    this.setState({
      maskIsShow: true,
      switchShopIsShow: true
    })
  }

  onCloseStaffList = () => {
    this.setState({
      maskIsShow: false,
      switchShopIsShow: false,
      useIdentityIsShow: false
    })
  }

  onTopDataClick = (type: number) => {
    Taro.navigateTo({ url: `/subpackages/cloud_bill/pages/my_client/index?type=${type}` })
  }

  getImageInfo = () => {
    if (!this.props.erpQrCode) return Promise.reject('qrcode doesn"t find')
    return Promise.all([
      Taro.getImageInfo({ src: shareManage }),
      Taro.getImageInfo({ src: this.props.erpQrCode })
    ])
      .then(([res1, res2]) => {
        // h5中 res1,res2不包含path。
        this.bgImgInfo = {
          // @ts-ignore
          path:
            'https://webdoc.hzecool.com/webCdn/weapp/ec-ticket/subpackages/cloud_bill/images/8f95a60af664dc202b5c09c62c23dd2e.png',
          ...res1
        }
        this.qrCodeImgInfo = {
          // @ts-ignore
          path: this.props.erpQrCode,
          ...res2
        }
      })
      .catch(error => console.log(error, 'all'))
  }

  initShareCanvas = async () => {
    if (!this.bgImgInfo.path || !this.qrCodeImgInfo.path) {
      await this.getImageInfo()
    }

    this.drawCanvas()
  }

  drawCanvas = () => {
    const { shopName } = this.props
    createSelectorQuery()
      .select('#share')
      .node(res => {
        myLog.log('开始绘制二维码海报')
        // @ts-ignore
        this.canvasIns = res.node
        const { width: canvasWidth, height: canvasHeight, path } = this.bgImgInfo
        res.node.width = canvasWidth
        res.node.height = canvasHeight

        const ins = res.node.getContext('2d') as CanvasRenderingContext2D
        ins.clearRect(0, 0, canvasWidth, canvasHeight)
        ins.fillStyle = 'white'
        ins.fillRect(0, 0, canvasWidth, canvasHeight)

        const qrImg = res.node.createImage()

        // 填充背景图
        const bgImage = res.node.createImage()
        bgImage.src = path
        bgImage.onload = () => {
          myLog.log(`开始绘制背景: ${path}`)

          ins.drawImage(bgImage, 0, 0)
          // 店铺名
          ins.fillStyle = '#db6d69'
          ins.font = 'bold 35px/1 sans-serif'
          ins.textAlign = 'center'
          ins.textBaseline = 'middle'
          ins.fillText(shopName, canvasWidth / 2, 78, 360)
          this.bgImgLoad = true
          this.triggerShare()
          qrImg.src = this.qrCodeImgInfo.path
        }
        // 填充小程序码
        qrImg.onload = () => {
          myLog.log(`开始绘制小程序码: ${this.qrCodeImgInfo.path}`)
          ins.drawImage(qrImg, 80, 157, 390, 390)
          this.qrImgLoad = true
          this.triggerShare()
        }

        qrImg.onerror = () => {
          myLog.error(`小程序码加载失败: ${this.qrCodeImgInfo.path}`)
        }
      })
      .exec()
  }

  triggerShare = () => {
    Taro.eventCenter.trigger(EVENT_CENTER.CLOUD_BILL_SHARE)
  }

  generateShareImg = () => {
    Taro.showLoading({ title: '图片生成中...' })
    if (
      // h5测试环境因图片跨域问题 此处特殊处理
      (this.qrImgLoad || (process.env.PRODUCT_ENVIRONMENT !== 'product' && isWeb())) &&
      this.bgImgLoad
    ) {
      if (isWeb()) {
        const { appName } = this.state
        const base64Data = this.canvasIns!.toDataURL()
        Taro.hideLoading()
        safePostMeaasge(
          JSON.stringify({
            // 因商陆花中已有同名称方法，此处特殊处理
            eventType: appName === 'slh' ? 'saveImageBase64' : 'saveImage',
            data: base64Data
          })
        )
      } else {
        Taro.canvasToTempFilePath({
          // @ts-ignore
          canvas: this.canvasIns,
          x: 0,
          y: 0
        })
          .then(res => {
            Taro.saveImageToPhotosAlbum({ filePath: res.tempFilePath })
              .then(() => {
                Taro.hideLoading()
                messageFeedback.showToast('图片已保存到相册')
              })
              .catch(error => {
                Taro.hideLoading()
                myLog.error(`图片保存失败：${JSON.stringify(error)}`)
                messageFeedback.showToast('图片保存失败')
              })
          })
          .catch(error => {
            Taro.hideLoading()
            myLog.error(`图片保存失败：${JSON.stringify(error)}`)
            messageFeedback.showToast('图片保存失败')
          })
      }
    } else if (!this.canvasIns) {
      this.initShareCanvas()
      Taro.eventCenter.off(EVENT_CENTER.CLOUD_BILL_SHARE, this.generateShareImg)
      Taro.eventCenter.once(EVENT_CENTER.CLOUD_BILL_SHARE, this.generateShareImg)
    } else {
      Taro.eventCenter.off(EVENT_CENTER.CLOUD_BILL_SHARE, this.generateShareImg)
      Taro.eventCenter.once(EVENT_CENTER.CLOUD_BILL_SHARE, this.generateShareImg)
    }
  }

  onHomeIconClick = () => {
    Taro.switchTab({
      url: '/pages/cloud_bill_tab/index'
    })
  }

  goSetting = () => {
    Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/goods_setting/index?type=new' })
  }

  getMenu = () => {
    const { independentType } = this.props
    let _menu = [
      {
        label: '通知客户来看款',
        key: MENU_KEY.informCustomer,
        icon: informCustomer,
        btnText: '去通知'
      },
      {
        label: '分享商品、发朋友圈',
        key: MENU_KEY.manageShare,
        icon: manageShare,
        btnText: '去分享'
      },
      {
        label: '云单访问报表',
        key: MENU_KEY.accessReport,
        icon: AccessReport,
        btnText: '去查看'
      },
      {
        label: '视频介绍',
        key: MENU_KEY.video,
        icon: videoMenu,
        btnText: '去上传'
      }
    ]
    if (independentType === 2) {
      _menu.shift()
    }
    return _menu
  }

  refershInit() {
    this.dataFetched = false
    this.props.dispatch({ type: 'goodsManage/resetIsHotUnboundFalse' })
    this.onCloseStaffList()
    this.init()
  }

  renderDisableAccess = () => {
    return (
      <View className={styles.disable_view}>
        <View className={styles.disable_view__content}>您无权访问此店铺</View>
      </View>
    )
  }

  fetchStafflist(curpageno) {
    const { mpErpId } = this.props
    return findShopStaffList({ mpErpId, curpageno })
  }

  onSelectItemClick = async item => {
    this.setState({ staffItem: item })
    if (item.rolename.indexOf('总经理') === -1 && item.rolename.indexOf('店长') === -1) {
      const { mpErpId } = this.props
      saveUserShopStaffLink({
        jsonParam: {
          mpErpId,
          id: item.id,
          name: item.name,
          rolename: item.rolename
        }
      })
      this.refershInit()
    }
  }

  onStaffScroll = () => {
    const { curpageno, stafflist } = this.state
    if (stafflist.length >= curpageno * 20) {
      this.setState(
        prevState => {
          return {
            curpageno: prevState.curpageno + 1
          }
        },
        () => {
          this.fetchStafflist(curpageno).then(res => {
            this.setState(prevState => {
              return {
                stafflist: [...prevState.stafflist, ...res.data.rows]
              }
            })
          })
        }
      )
    }
  }

  onGetPhone = e => {
    if (e.detail.errMsg.includes('ok')) {
      this.onGetPhoneNumber(e.detail.code, e.detail.encryptedData, e.detail.iv)
    }
  }
  onGetPhoneNumber = async (code, encryptedData, iv) => {
    Taro.showLoading({ title: '请稍等...' })
    await this.props.dispatch({
      type: 'user/verifyPhone',
      payload: {
        code,
        encryptedData,
        iv,
        wechat: true
      }
    })
    await this.props.dispatch({ type: 'user/login' })
    const { mpErpId } = this.props
    const { staffItem } = this.state
    this.onCloseStaffList()
    if (this.props.phone === staffItem.mobile) {
      await saveUserShopStaffLink({
        jsonParam: {
          mpErpId,
          id: staffItem.id,
          name: staffItem.name,
          rolename: staffItem.rolename
        }
      })
      this.Alert('绑定成功！', () => {
        this.refershInit()
      })
    } else {
      this.Alert('手机号未匹配，请选择其他员工或在商陆花员工管理内维护此手机号', () => {
        this.setState({ useIdentityIsShow: true })
        this.props.dispatch({ type: 'goodsManage/resetIsHotUnboundTrue' })
      })
    }
  }

  getExpireText = () => {
    const { bizStatus, cloudExpireInfo } = this.props
    let text = ''
    if (bizStatus === 0) {
      text = '云单已关闭'
    }
    if (bizStatus === 2 || cloudExpireInfo.overdueFlag === 1) {
      text = '云单使用已到期'
    }

    if (cloudExpireInfo.remindFlag > 0) {
      if (cloudExpireInfo.overdueFlag === 1) {
        // text 不变 还是已到期
      } else {
        if (cloudExpireInfo.diffDays === 0) {
          text = '云单有效期不足1天'
        } else {
          text = `云单还有${cloudExpireInfo.diffDays}天到期`
        }
      }
    }
    return text
  }

  renderConfigurationView = () => {
    return (
      <View className={styles.configuration_mask}>
        <View className={styles.configuration_mask__content}>
          <Image
            src={ConfigurationBg}
            className={styles.configuration_mask__content___configurationBg}
          />
          <View className={styles.configuration_mask__content___label}>
            <Text className={styles.configuration_mask__content___label__welcome}>
              👏欢迎使用云单
            </Text>
            <View className={styles.configuration_mask__content___label__setting}>
              <View>为了更符合您的需求，请您</View>
              <View style='display: flex;'>
                对云单进行配置后<Text style='color:#222;font-weight:500;'>一键上架商品</Text>
              </View>
            </View>
          </View>
          <View className={styles.configuration_mask__content___action} onClick={this.goSetting}>
            去配置我的云单
          </View>
          {/* <Image src={DeleteIconPink} className={styles.delete_icon_pink} /> */}
        </View>
      </View>
    )
  }

  renderIdentityView = () => {
    const { stafflist } = this.state
    const { staffInfo } = this.props
    return (
      <View className={styles.manage_wrap_mask}>
        <ScrollView
          className={styles.manage_wrap_mask_identity}
          scrollY={!false}
          onScrollToLower={this.onStaffScroll}
        >
          <View className={styles.manage_wrap_mask_identity_title}>请选择您当前的员工身份</View>
          <View className={styles.manage_wrap_mask_identity_items}>
            {stafflist.map(item => (
              <View
                key={item.id}
                className={styles.manage_wrap_mask_identity_items_item}
                onClick={() => {
                  this.onSelectItemClick(item)
                }}
              >
                {item.rolename.indexOf('总经理') !== -1 || item.rolename.indexOf('店长') !== -1 ? (
                  <Button
                    className={styles.getPhone}
                    openType='getPhoneNumber'
                    onGetPhoneNumber={this.onGetPhone}
                  >
                    <Text className={styles.depname}>{item.name}</Text>
                    <View className={styles.identity}>{item.rolename}</View>
                  </Button>
                ) : (
                  <View style='display: flex;'>
                    <Text className={styles.depname}>{item.name}</Text>
                    <View className={styles.identity}>{item.rolename}</View>
                  </View>
                )}
                {staffInfo.name === item.name && (
                  <Image className={styles.rightCheckBoxYes} src={rightCheckBoxYes} />
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    )
  }

  render() {
    const {
      erpQrCode,
      shopName,
      statusBarHeight,
      navigationHeight,
      shopLogoUrl,
      shopList,
      mpErpId,
      todayViewerCount,
      todayBillCount,
      marketSpuCount,
      bizStatus,
      confirmListLen,
      goodsList,
      isFetchingData,
      myClientViewData: { waitAuditCount },
      shopVisitorAuth,
      independentType,
      staffInfo,
      cloudExpireInfo,
      phone,
      logining
    } = this.props
    const {
      maskIsShow,
      shareIsShow,
      switchShopIsShow,
      isNeedGuide,
      shopListItem,
      disableAccess,
      useIdentityIsShow
    } = this.state
    const MENU2 = this.getMenu()

    const expireLabel = this.getExpireText()

    const child = (
      <Block>
        <View>
          <View className={styles.customTop} style={{ top: `${navigationHeight}px` }}>
            <Image
              mode='aspectFill'
              className={styles.bg_img}
              src={manageCustomBg}
              style={{
                top: `-${navigationHeight + statusBarHeight}px`
              }}
            />
          </View>
          <View className={styles.manage_wrap}>
            <View className={styles.manage_wrap_help}>
              <View className={styles.manage_wrap_help_view}>
                <View style={{ display: 'flex', alignItems: 'center' }}>
                  <View className={styles.manage_wrap_help_view_label}>
                    <Text>线上接单神器</Text>
                    <Text onClick={this.goCloudBillGuideH5} className={styles.viwer_help}>
                      查看新手指南 &gt;
                    </Text>
                  </View>
                </View>
                {isWeapp() && (
                  <View className={styles.switchShop} onClick={this.onSwitchShopClick}>
                    切换门店
                  </View>
                )}
              </View>
              <View className={styles.shopInformation}>
                {(bizStatus !== 1 ||
                  cloudExpireInfo.remindFlag > 0 ||
                  cloudExpireInfo.overdueFlag === 1) && (
                  <View className={styles.shopInformation_statu} onClick={this.onBizStatusClick}>
                    <Text>{expireLabel}</Text>
                    <Text>
                      {bizStatus === 0 ? '立即开启' : ''}
                      {bizStatus === 2 ||
                      cloudExpireInfo.remindFlag > 0 ||
                      cloudExpireInfo.overdueFlag === 1
                        ? '续费'
                        : ''}
                    </Text>
                  </View>
                )}
                <View className={styles.shopInformation_view}>
                  <View className={styles.shopInformation_view_shop}>
                    <View
                      className={styles.shopInformation_view_shop_headImage}
                      onClick={this.onShopViewerClick}
                    >
                      <Image
                        className={styles.shopLogoUrl}
                        src={shopLogoUrl || defaultShopLogo}
                        mode='aspectFill'
                      />
                      <View className={styles.shop_viwer}>预览店铺</View>
                    </View>
                    <View className={styles.shopInformation_view_shop_name}>
                      <Text className={styles.shopName}>{shopName}</Text>
                      {/* {shopList && shopList.length > 1 && ( */}
                      {/* {isWeapp() && (
                        <View className={styles.switchShop} onClick={this.onSwitchShopClick}>
                          切换门店
                        </View>
                      )} */}
                      {isWeapp() && (
                        <View className={styles.shop_btns} onClick={this.onGoStaffInfo}>
                          {staffInfo.name && staffInfo.flag !== 0
                            ? `${staffInfo.rolename}/${staffInfo.name}`
                            : ''}
                          {staffInfo.flag === 0 ? '未授权 >' : ''}
                        </View>
                      )}
                    </View>
                    <View className={styles.shopInformation_view_shop_share}>
                      <View className={styles.shareBtnView} onClick={this.onShareClick}>
                        分享云单
                        <Image className={styles.shareIcon} src={manageShareIcon} />
                      </View>
                    </View>
                  </View>
                  <View className={styles.shopInformation_view_shopData}>
                    <View className={styles.dataView} onClick={this.goMyClient}>
                      <Text className={styles.dataView_count}>
                        {bizStatus === 2 ? '0' : todayViewerCount || '0'}
                      </Text>
                      <Text className={styles.dataView_label}>今日访客</Text>
                    </View>
                    <View className={styles.dataView} onClick={this.goGoodsManage}>
                      <Text className={styles.dataView_count}>
                        {bizStatus === 2 ? '0' : marketSpuCount || '0'}
                      </Text>
                      <Text className={styles.dataView_label}>线上商品</Text>
                    </View>
                    <View className={styles.dataView} onClick={this.goOrderBillScreen}>
                      <Text className={styles.dataView_count}>
                        {bizStatus === 2 ? '0' : todayBillCount || '0'}
                      </Text>
                      <Text className={styles.dataView_label}>今日订单</Text>
                    </View>
                  </View>
                </View>
              </View>
              {BASICOPERATION.map(menuItem => (
                <View className={styles.menu_group} key={menuItem.title}>
                  <View className={styles.menu_group__title}>{menuItem.title}</View>
                  <View className={styles.menu_group__menus}>
                    {menuItem.items.map(m => (
                      <View
                        className={styles.menu_group__menu}
                        key={m.key}
                        data-key={m.key}
                        onClick={this.onMenuClick}
                      >
                        <View className={styles.menu_group__menu__iconView}>
                          {confirmListLen > 0 && m.key === MENU_KEY.orderBill && (
                            <View className={styles.menu_group__menu__iconView___point}></View>
                          )}
                          <Image
                            className={styles.menu_group__menu__iconView___icon}
                            src={m.icon}
                          />
                          {m.key === MENU_KEY.goods &&
                            !isNeedGuide &&
                            !isFetchingData &&
                            goodsList.length === 0 &&
                            bizStatus === 1 && (
                              <View className={styles.go_goodsManage_icon}>去上架</View>
                            )}
                          {m.key === MENU_KEY.myClient &&
                            waitAuditCount > 0 &&
                            shopVisitorAuth === '1' && (
                              <View className={styles.menu_group__menu__iconView___point}></View>
                            )}
                        </View>
                        <View className={styles.menu_group__menu__label}>{m.label}</View>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
              <View className={styles.menu_group}>
                <View className={styles.menu_group__title}>运营策略</View>
                {MENU2.map(menu => (
                  <View key={menu.key} className={styles.menu_group__menu2}>
                    <View style={{ display: 'flex', alignItems: 'center' }}>
                      <Image src={menu.icon} className={styles.menu_group__menu2___icon} />
                      <Text>{menu.label}</Text>
                    </View>
                    <View
                      className={styles.menu_group__menu2___btnView}
                      onClick={this.onMenuClick}
                      data-key={menu.key}
                    >
                      {menu.btnText}
                    </View>
                  </View>
                ))}
              </View>
            </View>
            {maskIsShow && (
              <View className={styles.manage_wrap_mask} onClick={this.onCloseMask}>
                {shareIsShow && (
                  <View>
                    <View className={styles.manage_wrap_mask_share}>
                      <Image style={{ width: '100%', height: '100%' }} src={shareManage} />
                      <View className={styles.manage_wrap_mask_share_code}>
                        <EImage src={erpQrCode} />
                      </View>
                      <View className={styles.manage_wrap_mask_share_shopName}>
                        <Text
                          className={styles.manage_wrap_mask_share_shopName_text}
                          style={{ fontSize: shopName.length > 6 ? '22px' : '35px' }}
                        >
                          {shopName}
                        </Text>
                      </View>
                    </View>
                    <View className={styles.manage_wrap_mask_shareBtn}>
                      <View className={styles.manage_wrap_mask_shareBtn_items}>
                        <View
                          className={styles.manage_wrap_mask_shareBtn_items_item}
                          onClick={this.onSaveToAlbum}
                        >
                          <Image
                            className={styles.manage_wrap_mask_shareBtn_items_item_img}
                            src={shareDownload}
                          />
                          <Text>保存到相册</Text>
                        </View>
                        {independentType !== 2 && (
                          <View
                            className={styles.manage_wrap_mask_shareBtn_items_item}
                            onClick={this.onOpenTypeClick}
                          >
                            <Button
                              open-type='share'
                              className={styles.manage_wrap_mask_shareBtn_items_item_btn}
                            ></Button>
                            <Image
                              className={styles.manage_wrap_mask_shareBtn_items_item_img}
                              src={shareWechat}
                            />
                            <Text>分享给客户</Text>
                          </View>
                        )}
                      </View>
                      <View
                        className={styles.manage_wrap_mask_shareBtn_cencel}
                        onClick={this.onCloseMask}
                      >
                        <Text>取消</Text>
                      </View>
                    </View>
                  </View>
                )}

                {switchShopIsShow && (
                  <ScrollView className={styles.manage_wrap_mask_identity} scrollY={!false}>
                    <View className={styles.manage_wrap_mask_identity_title}>请选择门店</View>
                    <View className={styles.manage_wrap_mask_identity_items}>
                      {shopList.map(item => (
                        <View
                          key={item.id}
                          className={styles.manage_wrap_mask_identity_items_item}
                          onClick={() => {
                            this.onShopListItemClick(item)
                          }}
                        >
                          <View style='display: flex;'>
                            <Text className={styles.depname}>{item.shopName || '无'}</Text>
                            {item.id === mpErpId && (
                              <View className={styles.identity}>当前选择</View>
                            )}
                          </View>
                          {item.id === mpErpId && (
                            <Image className={styles.rightCheckBoxYes} src={rightCheckBoxYes} />
                          )}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </View>
            )}
            <Canvas type='2d' id='share' canvasId='share' className={styles.my} />
          </View>
          {isNeedGuide && this.renderConfigurationView()}
          {disableAccess && this.renderDisableAccess()}
          {isWeapp() && useIdentityIsShow && this.renderIdentityView()}

          <LoginView
            scanError={phone.length === 0 && !logining && isWeapp() ? 5 : 0}
            title='云单管理后台'
            tips='管理您的云单后台'
            buttonTip='验证手机号后开始管理'
            onSuccess={this.init}
          />
        </View>
      </Block>
    )
    return isWeapp() ? (
      <CustomNavigation
        enableBack
        stickyTop={false}
        navigationClass={styles.category_navigation}
        title='云单商家后台'
        titleTextClass={styles.title_text_class}
        backIcon={HomeIcon}
        onBackClick={this.onHomeIconClick}
      >
        {child}
      </CustomNavigation>
    ) : (
      <View id='minif' className='minirefresh-wrap'>
        <View className='minirefresh-scroll'>
          <View style={{ height: '100%' }}>
            <View className={styles.manage_outer_h5}></View>
            {child}
          </View>
        </View>
        {/* <View className={styles.manage_outer_h5} id='minif'></View> */}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(CloudBillManage)