/*
 * @Author: HuKai
 * @Date: 2019-08-27 08:54:39
 * @Last Modified by: Miao Yunliang
 */
// eslint-disable-next-line
// import QRCode from 'qrcode'
import Taro, { pxTransform, NodesRef } from '@tarojs/taro'
import React, { Component, ComponentType } from 'react'
import { connect } from 'react-redux'
import { View, Text, Image, Canvas, Button, Block } from '@tarojs/components'
import deepCopy from 'deep-copy'
import NP from 'number-precision'
import classNames from 'classnames'
import drawQrcode from 'weapp-qrcode'
// import QRCode from 'qrcode'
import replenishment from '@/images/replenishment.png'
import defaultShopLogo from '@/images/default_shop.png'
import defaultLogo2 from '@/images/default_goods.png'
import ecool from '@/images/ecool.png'
import left from '@/images/left.png'
import right from '@/images/right.png'
import BackLeftIcon from '@/images/angle_left_black_60.png'
import toggleIcon from '@/images/icon/toggle.png'
import downloadIcon from '@/images/icon/download_icon.png'
// import mallLogo from '@/images/slh_mall_logo.png'
import deprecated from '@/images/deprecated.png'
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
import angleRightIcon from '@/images/angle_right_gray_40.png'
import colorfulBg from '@/images/special/colorful_bg.png'
import { inviteJoinCloudBill, enableVisitorIn } from '@api/shop_api_manager'
import homePng from '@/images/home_red.png'
import CustomNavigation from '@components/CustomNavigation'
import { getTaroParams } from '@utils/utils'
import { modalHelper } from '../../utils/helper'
import { getOneDate, getDateTime, urlQueryParse, objectParseToUrlQuery } from '../../utils/utils'
import { getGoodsDetail, getETicketDetail } from '../../api/apiManage'
import styles from './landscapeModel.module.scss'

/* eslint-disable */
import {
  mainType,
  goodsItemType,
  fieldConfigType,
  sameCodeObjArrType,
  detsType,
  RawDetsType,
  VerifyDet,
  NotDeliverDet,
  GlobalUserParams
} from './typeConfig'
// import Notification from '@components/Notification'

import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
// import { NOTIFICATION } from '@constants/notification'
import trackSvc from '@services/track'
import { t } from '@models/language'
import navigatorSvc from '@services/navigator'
import VideoPlayer from '@components/VideoPlayer'
import playIcon from '@/images/icon/play_140.png'
import messageFeedback from '@services/interactive'
import { ALL_GOODS_TAB_ITEM, isWeb, storage } from '@constants/index'
import myLog from '@utils/myLog'
import config from '@config/config'
import DetailInfoViewFromShare from './components/DetailInfoViewFromShare'
import { getVerifyArray, getNotDeliverDets, isTempBill, getAccountInfo } from './helper'
import dict from '@constants/dict'
import EmptyView from '@components/EmptyView'
import events from '@constants/analyticEvents'
import DarkModeDetector from '@components/DarkModeDetector'
import { ISku, ISpu } from '@@types/GoodsType'
import { getTotal } from '@utils/dva_helper/map_state_to_props'
import { CloudSource, CLOUD_BILL_FLAG, ICloudBill, Sku } from '@@types/base'
import images from '@config/images'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { SlideDirection } from '@components/SlideContainer/type'
import followGuideBg from '@/images/detail_follow_guide.png'
import followGuideBtn from '@/images/detail_follow_btn.png'
import EImage from '@components/EImage'
import Tabs from '@components/Tabs'
import DefaultGood from '@/images/default_good_pic.png'
import { getShopGoodsList } from '@api/goods_api_manager'
import newTicketGuidePng from '@/images/special/new_ticket_guide.png'

type StateType = {
  showTip: boolean
  params: {
    shopName: string
    sessionId: string
    mpUserId: string
    shopId: string
    epid: string
    pk: string
    sn: string
    type: string
  }
  newStyle: string
  repeatPush: string
  showTopBtn: string
  source: string
  privateFlag: string
  showGuideModal: boolean
  showGoodsDetail: boolean
  modalHeight: number
  main: mainType
  dets: Array<detsType>
  rawDets: Array<RawDetsType>
  sameCodeObjArr: sameCodeObjArrType
  fieldConfig: fieldConfigType
  goodsItem: goodsItemType
  ticket: string
  qrUrl: string
  shopFlag: boolean
  ticketList: Array<{
    billno: string
    prodate: string
    totalmoney: string
    totalnum: string
    dwname: string
    seller: string
    mainid: number
    billid: string
  }>
  denyFlag: number
  isVideoVisible: boolean
  videoSrc: string
  videoPoster: string
  imgs: string[]
  bindError: number
  saasType: string
  isImagesMoreThanOne: boolean
  // isMicroMall: boolean
  allowReplenish: boolean
  fromShare: boolean
  isScrolling: boolean
  config: GlobalUserParams
  fromAppShare: boolean
  verifys: VerifyDet[]
  notDeliverDets: NotDeliverDet[]
  isFollowGuideVisible: boolean
  isFollowGuideClicked: boolean
  isDisableFollowGuide: boolean
  isPhoneGetterVisible: boolean
  activityId?: number
  userActivityState: number
  isActivityDisabled: boolean
  cloudBillFlag: CLOUD_BILL_FLAG
  dropAnimation: boolean
  dropPosition: {
    top: string
    right: string
  }
  isPublicGuideVisible: boolean
  isNewTicketGuideVisible: boolean
  isDetailOtherInfoVisible: boolean
  downloadImages: RawDetsType[]
  cloudGoodsListNew: ISpu[]
  cloudGoodsListHot: ISpu[]
  cloudGoodsListTabIndex: number
  goodsNewCount: number
  tabData: { label: string; value: number }[]
  enableVisitor: boolean
}
interface TicketDetailPage {
  state: StateType
  props: StateProps & DefaultDispatchProps
}

const NOTIFICATION_HEIGHT = 160

type StateProps = ReturnType<typeof mapStateToProps>

const mapStateToProps = ({ user, replenishment, systemInfo, shop }: GlobalState) => ({
  showPhoneEntry:
    user.grayFunc.mobileVerify === 1 && user.id !== -1 && !user.phone && user.subscribe === '1',
  noAuth: user.noAuth,
  subscribe: user.subscribe,
  userId: user.id,
  sessionId: user.sessionId,
  newStyleFromProps: user.userParams.mp_ticket_bill_new_style,
  bigFontSize: user.userParams.mp_ticket_bill_use_big_font === '1',
  isLogining: user.logining,
  bindPhoneFail: user.bindPhoneFail,
  phone: user.phone,
  ...getTotal(replenishment.spus),
  statusBarHeight: systemInfo.statusBarHeight,
  gap: systemInfo.gap,
  shopList: shop.list,
  mpUserId: user.mpUserId
})
class TicketDetailPage extends Component {
  windowHeight: number
  historyTicketTop: number = 999 // 底部历史小票的顶部距离页面顶部距离
  isBrowseTicketList = false // 是否划到了历史小票，并上传埋点
  isScrollTicketList = false // 滚动了小票
  trackStatemen = false
  trackPhone = false
  mpErpId: string
  microMallData: { appId: string; shopId: string }
  scale: number = 1
  isFollowGuideReported: boolean = false
  isCloudGuideShowed = false //
  cartDataFetched = false
  billDataFetched = false
  billDataFetching = false
  config = {
    // navigationBarTitleText: '小票详情'
    navigationStyle: 'custom' as const
  }
  constructor(props) {
    super(props)
    let params = getTaroParams(Taro.getCurrentInstance?.())
    if (params.q) {
      const q = decodeURIComponent(params.q)
      const query = urlQueryParse(q)
      params = { ...params, ...query }
    }
    const options = wx.getEnterOptionsSync()
    const fromAppShare = options.scene == 1036
    this.state = {
      isNewTicketGuideVisible: false,
      dropPosition: { top: '0px', right: '0px' },
      dropAnimation: false,
      repeatPush: '0',
      showTip: false,
      params: {
        shopName: '',
        sessionId: params.sessionId,
        mpUserId: params.mpUserId,
        shopId: '',
        epid: params.epid,
        pk: params.pk || params.billid,
        sn: params.sn,
        type: params.type || '1' // 2订货 1拿货
      },
      privateFlag: params.private || '0', // 短信链接跳转到小程序会带这个参数，1为私密，仅显示有限信息
      fromShare: params.subscribe === '0',
      showTopBtn: params.showTopBtn || 'false',
      source: params.source,
      showGuideModal: false,
      showGoodsDetail: false,
      modalHeight: 0,
      main: {
        coupMoney: 0,
        verifySum: 0,
        ownerId: 0,
        compId: 0,
        shopLogoUrl: '',
        billNo: '',
        ownerName: '',
        compName: '',
        compAddr: '',
        compPhone: '',
        proDate: '',
        rem: '',
        cash: 0,
        lastBalance: 0,
        balance: 0,
        totalMoney: 0,
        backMoney: 0,
        backNum: 0,
        accountNo: '',
        accountName: '',
        shareDate: '',
        remit: 0,
        remitName: '',
        card: 0,
        cardName: '',
        weiXinPay: 0,
        aliPay: 0,
        storedValueCost: 0,
        debt: 0,
        agency: 0,
        billQRCodeContent: '',
        shopAddr: '',
        shopAddrs: [],
        shopPhone: '',
        shopMobile: '',
        invalidFlag: '0',
        mobilePay: 0,
        totalNum: 0,
        logisNo: '',
        providerId: '',
        compScore: 0,
        billScore: 0,
        actMoney: 0,
        needShowOldPrice: false,
        orderSource: 1,
        deliverDtoList: [],
        spec1Name: '颜色',
        spec2Name: '尺码'
      },
      dets: [],
      rawDets: [],
      sameCodeObjArr: [],
      fieldConfig: {
        showImage: '',
        showLastBalance: '',
        showLastTimeBalance: '',
        showSecondSale: '',
        showSerialNumber: '',
        showThisBalance: '',
        tempbillShowAmount: '',
        tempbillShowNum: ''
      },
      goodsItem: {
        imgUrl: '',
        code: '',
        name: '',
        price: '',
        color: '',
        size: '',
        num: '',
        totalSmall: '',
        proDate: '',
        saleNum: '',
        saleSum: '',
        backNum: '',
        backSum: '',
        showRepFlag: false,
        list: []
      },
      ticket: '',
      qrUrl: '',
      shopFlag: false,
      ticketList: [],
      denyFlag: 0,
      isVideoVisible: false,
      videoSrc: '',
      videoPoster: '',
      imgs: [],
      bindError: 0,
      saasType: '',
      isImagesMoreThanOne: false,
      // isMicroMall: false,
      allowReplenish: false,
      isScrolling: false,
      config: {
        printClientScore: '0',
        salesPrintMatName: '1',
        salesPrintDetRem: '1',
        shareBillShowDiscount: '1',
        printDiffDeliverNum: '1',
        ignoreColorSize: '0'
      },
      newStyle: '0', // 对电子小票来说是新样式，对应老小票的样式
      fromAppShare,
      verifys: [],
      notDeliverDets: [],
      isFollowGuideVisible: false,
      isFollowGuideClicked: false,
      isDisableFollowGuide: false,
      isPhoneGetterVisible: false,
      activityId: undefined,
      userActivityState: 0,
      isActivityDisabled: false,
      cloudBillFlag: 0,
      isPublicGuideVisible: false,
      isDetailOtherInfoVisible: false,
      downloadImages: [],
      goodsNewCount: 0,
      cloudGoodsListNew: [] as ISpu[],
      cloudGoodsListHot: [] as ISpu[],
      cloudGoodsListTabIndex: 0,
      tabData: [],
      enableVisitor: false
    }
  }

  isFirstPage: boolean

  onPageScroll() {
    this.onScrollEnd()
    if (this.state.isScrolling) return
    this.setState({ isScrolling: true })
  }

  onScrollEnd = debounce(() => {
    this.setState({ isScrolling: false })
  }, 600)

  componentWillMount() {
    const { windowHeight } = Taro.getSystemInfoSync()
    this.windowHeight = windowHeight
    myLog.log(objectParseToUrlQuery(getTaroParams(Taro.getCurrentInstance?.())))
    this.props.dispatch({ type: 'replenishment/save', payload: { spus: [] } })
  }

  componentDidMount() {
    this.isFirstPage = Taro.getCurrentPages().length === 1
    const { windowWidth } = Taro.getSystemInfoSync()
    this.scale = windowWidth / 750
    this.initCaputreScreenEvent()
    this.initPageData().then(() => {
      if (getTaroParams(Taro.getCurrentInstance?.()).downloadImage === '1') {
        this.onDownloadClick()
      }
    })
    Taro.getStorage({ key: storage.USER_PARAMS }).then(res => {
      this.props.dispatch({ type: 'user/save', payload: { userParams: res.data } })
    })
    Taro.getStorage({ key: storage.DISABLE_FOLLOW_GUIDE_NOTIFICATION }).then(res => {
      this.setState({ isDisableFollowGuide: res.data })
    })
    Taro.getStorage({ key: storage.DISABLE_ACTIVITY_NOTIFICATION_1 }).then(res => {
      this.setState({ isActivityDisabled: res.data })
    })

    if (this.isFirstPage) {
      Taro.getStorage({ key: storage.DIS_NEW_TICKET_GUIDE })
        .then(res => {
          this.setState({ isNewTicketGuideVisible: !res.data })
        })
        .catch(() => {
          this.setState({ isNewTicketGuideVisible: true })
        })
    }
    Taro.eventCenter.on('logisNoChange', this.initPageData)

    // 根据单据类型设置title
    const { type = '1' } = this.state.params
    if (type === '1') {
      Taro.setNavigationBarTitle({ title: '销售单详情' })
    } else if (type === '2') {
      Taro.setNavigationBarTitle({ title: '订货单详情' })
    }

    // 从短信跳转
    if (this.state.source === '5' && this.state.privateFlag !== '1' && getTaroParams(Taro.getCurrentInstance?.()).dwId) {
      this.setState({ isPublicGuideVisible: true })
    }
  }

  componentDidUpdate(prevProps: Readonly<StateProps>) {
    // 进货单数据
    if (
      this.props.sessionId &&
      this.state.cloudBillFlag !== CLOUD_BILL_FLAG.close &&
      this.mpErpId &&
      this.props.subscribe === '1' &&
      !this.cartDataFetched
    ) {
      this.fetchCartData()
    }

    // 同步本地数据
    if (prevProps.newStyleFromProps !== this.props.newStyleFromProps) {
      this.setState({ newStyle: this.props.newStyleFromProps })
    }

    //
    if (!prevProps.bindPhoneFail && this.props.bindPhoneFail) {
      messageFeedback.showToast('未找到关联店铺')
    }

    if (
      !this.props.sessionId &&
      this.props.sessionId &&
      this.state.cloudGoodsListNew.length === 0 &&
      this.state.cloudGoodsListHot.length === 0
    ) {
      this.fetchCloudGoods()
    }
  }

  componentWillUnmount() {
    Taro.eventCenter.off('logisNoChange')
    wx.offUserCaptureScreen(this.setClipboardData)
  }

  onShareAppMessage() {
    const { userId } = this.props
    const { params, main } = this.state
    const { type } = params
    const query = `pk=${params.pk}&sn=${params.sn}&epid=${params.epid}&shopId=${
      params.shopId
    }&shopName=${params.shopName}&subscribe=${0}&type=${params.type}&mpUserId=${userId}`
    return {
      title: `${main.compName || params.shopName}的${type === '1' ? '拿货' : '订货'}单 批次号:${
        main.billNo
      }`,
      path: `/pages/eTicketDetail/landscapeModel?${query}`
    }
  }

  initPageData = async () => {
    const { subscribe, sessionId } = this.props
    const {
      params: { pk, sn, epid, type, mpUserId },
      source
    } = this.state
    const params = {
      type,
      pk,
      sn,
      epid,
      sessionId,
      source,
      subscribe
    }
    this.billDataFetching = true
    try {
      const { code } = await Taro.login()
      Object.assign(params, { code })
      const res = await getETicketDetail(params)
      const cloudBillFlag = res.data.cloudBillFlag
      const activityId = res.data.activityId
      const userActivityState = res.data.userActivityState || 0
      const denyFlag = res.data.denyFlag
      const saasType = res.data.saasType
      const main = res.data.main
      const notDeliverDets = res.data.orderNotDeliverDets
      const verifys = res.data.verifys
      // 根据rowId排序
      const dets: Array<any> = res.data.dets.sort(
        (spuA, spuB) => (spuA.rowId || 0) - (spuB.rowId || 0)
      )
      const rawDets = dets.map(item => ({ ...item }))
      const sizeGroups = res.data.sizeGroups
      const sizeGroupsMap = res.data.sizeGroupsMap
      const bindErrorType = res.data.bindErrorType || 0
      const repeatPush = res.data.repeatPush || '1'
      // const isMicroMall = res.data.mallTenantId > 0 || false
      const allowReplenish = res.data.allowReplenish === 1
      const newStyle = sessionId ? res.data.newStyle || '0' : this.state.newStyle

      const options = wx.getEnterOptionsSync()
      const fromAppShare = options.scene == 1036
      const fromPublic = options.scene === 1043
      const fromMini = options.scene === 1008 || options.scene === 1007

      this.mpErpId = res.data.mpErpId
      if (this.props.sessionId) {
        this.fetchCloudGoods(cloudBillFlag)
      }
      if (this.props.sessionId && !fromAppShare) {
        enableVisitorIn({
          mpErpId: this.mpErpId,
          mpUserId: this.props.mpUserId
        }).then(({ data, code }) => {
          this.setState({
            enableVisitor: data.val
          })
        })
      }
      this.microMallData = {
        appId: res.data.mallWxApppId,
        shopId: res.data.mallTenantId
      }

      trackSvc.track(events.ticketDetail, { saas_type: String(saasType), type })

      let ticketSource = 'normal'
      if (fromAppShare) {
        ticketSource = 'app_share'
      } else if (fromPublic) {
        ticketSource = 'public'
      } else if (fromMini) {
        ticketSource = 'mini_share'
      }
      // 小票来源4种  小程序分享 / app分享 / 公众号推送 / 其他页面
      const {
        params: { sn, epid, pk }
      } = this.state
      trackSvc.trackToBigData({
        sn,
        epid,
        shop: main.shopId,
        billId: pk,
        data: [{ key: 'enter_ticket', value: 1 }],
        tag: { ticket_source: ticketSource }
      })
      if (denyFlag === 1) {
        return navigatorSvc.redirectTo({
          url: `/subpackages/functional/pages/fail/no_ticket?saasType=${saasType}`
        })
      }
      let fieldConfig = {}
      // 通过获取参数，配置页面上展示的内容，没有配置默认展示所有
      if (res.data.shareConfig.fieldConfig) {
        fieldConfig = JSON.parse(res.data.shareConfig.fieldConfig)
      } else {
        fieldConfig = {
          showImage: '1',
          showLastBalance: '1',
          showLastTimeBalance: '1',
          showSecondSale: '1',
          showSerialNumber: '1',
          showThisBalance: '1',
          tempbillShowAmount: '1',
          tempbillShowNum: '1'
        }
      }
      const arr: any = []

      const temp: number[] = []
      const spus: RawDetsType[] = dets.reduce((prev, cur) => {
        if (!temp.includes(cur.tenantSpuId)) {
          temp.push(cur.tenantSpuId)
          prev.push(cur)
        }
        return prev
      }, [])
      const isImagesMoreThanOne = spus.some(item => {
        return item.allImgUrlBig && item.allImgUrlBig.split(',').length > 0
      })
      isImagesMoreThanOne &&
        this.props.dispatch({ type: 'imageDownload/save', payload: { sourceData: spus } })
      // 对货品分类，同样code的货品放到一个数组中，生成一个新数组
      while (dets.length > 0) {
        let showRepFlag = false
        const sameCodeArr: any = []
        for (let i = dets.length - 1; i >= 0; i--) {
          const item = dets[i]
          if (item.code === dets[0].code && item.realPrice === dets[0].realPrice) {
            if (item.repFlag) {
              showRepFlag = true
            }
            sameCodeArr.unshift(item)
            dets.splice(i, 1)
          }
        }
        sameCodeArr[0]['showRepFlag'] = showRepFlag
        arr.push(sameCodeArr)
      }
      main.proDate = getOneDate(main.proDate)
      main['shareDate'] = getDateTime()
      const detsArr: any = []

      // 循环生成同code商品的总手数跟数量
      const sameCodeObjArr: any = []

      // 对同code中相同颜合并处理
      arr.forEach(arrItem => {
        const discount =
          arrItem[0].discount ||
          (arrItem[0].price === 0
            ? 1
            : NP.round(NP.divide(arrItem[0].realPrice, arrItem[0].price), 2))
        const obj = {
          unit: arrItem[0].unit || '',
          code: arrItem[0].code,
          name: arrItem[0].name,
          imgUrl: arrItem[0].imgUrl,
          allImgUrlBig: arrItem[0].allImgUrlBig,
          price: arrItem[0].price,
          realPrice: arrItem[0].realPrice,
          stdprice1: arrItem[0].stdprice1,
          flag: arrItem[0].flag,
          tenantSpuId: arrItem[0].tenantSpuId,
          repFlag: arrItem[0].repFlag,
          showRepFlag: arrItem[0].showRepFlag,
          discount
        }
        // 同色的总数跟总手数
        let sumNum = 0
        let sumGroup = 0
        for (let i = 0; i < arrItem.length; i++) {
          const ele = arrItem[i]
          sumNum += Number(ele.num)
          sumGroup += Number(ele.groupNum)
          if (ele.repFlag) {
            obj.repFlag = ele.repFlag
          }
        }
        obj['sumNum'] = sumNum
        obj['sumGroup'] = sumGroup
        sameCodeObjArr.push(obj)

        const sameColorArr: any = []
        let sizeMapObj: any = {}
        let sizeMapGroupObj: any = {}
        const tmpSizeMapObj: any = {}

        // 获取sizeGroups
        if (sizeGroupsMap) {
          let temSizeGroupId = 0
          const temSizeGroupArr: any = []
          for (let i = 0; i < arrItem.length; i++) {
            const ele = arrItem[i]
            if (!sizeGroupsMap[ele.sizeGroupId]) {
              // 如果没有对应sizeGroupId的sizeGroupsMap，就要手动添加
              temSizeGroupId = ele.sizeGroupId
              if (typeof tmpSizeMapObj[ele.sizeId] === 'undefined') {
                temSizeGroupArr.push({ name: ele.size, id: ele.sizeId })
                tmpSizeMapObj[ele.sizeId] = ele.size
              }
            } else {
              sizeMapGroupObj[ele.sizeGroupId] = sizeGroupsMap[ele.sizeGroupId]
            }
          }
          if (temSizeGroupArr.length > 0) {
            sizeMapGroupObj[temSizeGroupId] = temSizeGroupArr
            // 把货品中的尺码手动添加到新的尺码集合中
            sizeMapObj = { ...sizeMapObj, ...tmpSizeMapObj }
          }
        }
        // 把所有尺码都合并到一起，以及没有在尺码组返回的尺码
        for (let i = 0; i < arrItem.length; i++) {
          const ele = arrItem[i]
          for (let j = 0; j < sizeGroups.length; j++) {
            const item = sizeGroups[j]
            if (ele.sizeGroupId === item.sizeGroupId) {
              sizeMapObj = { ...sizeMapObj, ...item.sizeMap }
              break
            }
          }
        }
        // 对要合并的数组循环
        while (arrItem.length > 0) {
          let sizeNumMap = {}
          try {
            if (typeof arrItem[0].sizeNumMap === 'string') {
              sizeNumMap = JSON.parse(arrItem[0].sizeNumMap)
            }
          } catch (e) {
            // ignore
          }

          const imgUrls = arrItem[0].imgUrls
            ? arrItem[0].imgUrls
            : [arrItem[0].imgUrl || defaultLogo2]
          const tempArrItem = {
            code: arrItem[0].code,
            unit: arrItem[0].unit || '',
            colorId: arrItem[0].colorId,
            color: arrItem[0].color,
            name: arrItem[0].name,
            flag: arrItem[0].flag,
            imgUrl: arrItem[0].imgUrl,
            imgUrls,
            allImgUrlBig: arrItem[0].allImgUrlBig,
            sizeGroupId: arrItem[0].sizeGroupId,
            sizeNumMap,
            repFlag: arrItem[0].repFlag,
            showRepFlag: arrItem[0].showRepFlag,
            price: arrItem[0].price,
            realPrice: arrItem[0].realPrice,
            stdprice1: arrItem[0].stdprice1,
            tenantSpuId: arrItem[0].tenantSpuId,
            sizeNumArr: [],
            sizeMapGroupObj: deepCopy(sizeMapGroupObj),
            sizeMap: deepCopy(sizeMapObj),
            sumArr: [],
            sizeMapArr: [],
            totalNum: 0, // 总数
            totalDiffDeliverNum: 0, // 欠货总数
            videoUrl: arrItem[0].videoUrl,
            coverUrl: arrItem[0].coverUrl
          }
          // 生成合计数据
          const sumArr: any = []
          let sizeMapArr: any = []
          for (const key in tempArrItem.sizeMapGroupObj) {
            if (tempArrItem.sizeMapGroupObj.hasOwnProperty(key)) {
              const item = tempArrItem.sizeMapGroupObj[key]
              sizeMapArr = [...sizeMapArr, ...item]
            }
          }
          for (const key in tempArrItem.sizeMap) {
            if (tempArrItem.sizeMap.hasOwnProperty(key)) {
              let num = 0
              for (let j = 0; j < arrItem.length; j++) {
                const item = arrItem[j]
                if (key === item.sizeId) {
                  num += item.num
                }
              }
              sumArr.push({
                name: key,
                value: num
              })
            }
          }
          tempArrItem.sumArr = deepCopy(sumArr)
          tempArrItem.sizeMapArr = deepCopy(sizeMapArr)
          // 把数据综合到一个arr
          for (let i = arrItem.length - 1; i >= 0; i--) {
            if (tempArrItem.colorId === arrItem[i].colorId) {
              const key = tempArrItem.sizeMap[arrItem[i].sizeId]
              // sizeNumMap以数组的形式分别记录拿货/退货数/欠货数
              const isPlus = arrItem[i].num > 0 // 是否进货
              let deliverNum = arrItem[i].diffDeliverNum || 0
              if (arrItem[i].deliverFinishFlag === 2) {
                deliverNum = -1 * deliverNum
              }
              if (tempArrItem.sizeNumMap[key]) {
                const index = isPlus ? 0 : 1
                tempArrItem.sizeNumMap[key][index] += arrItem[i].num
                tempArrItem.sizeNumMap[key][2] += deliverNum
              } else {
                const result = isPlus ? [arrItem[i].num, 0] : [0, arrItem[i].num]
                tempArrItem.sizeNumMap[key] = [...result, deliverNum]
              }
              tempArrItem.totalNum += arrItem[i].num
              tempArrItem.totalDiffDeliverNum += arrItem[i].num || 0
              if (arrItem[i].repFlag === 1) {
                tempArrItem.repFlag = arrItem[i].repFlag
              }
              arrItem.splice(i, 1)
            }
          }
          // 将记录的拿货退货欠货数取出来拼装成 2(欠1)/-1 的形式
          // 欠货如果是负数代表终结，显示缺xx件
          Object.getOwnPropertyNames(tempArrItem.sizeNumMap).forEach(key => {
            const [addNum, minsNum, diffNum] = tempArrItem.sizeNumMap[key]
            let addString = addNum
            if (diffNum != 0 && res.data.param.printDiffDeliverNum === '1') {
              addString = `${addNum}(${diffNum > 0 ? '欠' : '缺'}${Math.abs(diffNum)})`
            }
            if (addNum === 0 || minsNum === 0) {
              tempArrItem.sizeNumMap[key] = addString || minsNum
            } else {
              tempArrItem.sizeNumMap[key] = `${addString}/${minsNum}`
            }
          })
          sameColorArr.push(tempArrItem)
        }
        let sameCodeSizeObj: any = {}
        sameColorArr.forEach(item => {
          sameCodeSizeObj = { ...sameCodeSizeObj, ...item.sizeNumMap }
          // 同颜色列表的数据
          item.sizeNumArr = []
          if (item.sizeMapArr.length > 0) {
            for (let i = 0; i < item.sizeMapArr.length; i++) {
              const sizeMapArrItem = item.sizeMapArr[i]
              const obj = {
                name: sizeMapArrItem.name,
                value: item.sizeNumMap[sizeMapArrItem.name] || '-',
                id: sizeMapArrItem.id
              }
              item.sizeNumArr.push(obj)
            }
          } else {
            for (const key in item.sizeMap) {
              if (item.sizeMap.hasOwnProperty(key)) {
                const name = item.sizeMap[key]
                const obj = {
                  name,
                  value: item.sizeNumMap[name] || '-',
                  id: key
                }
                item.sizeNumArr.push(obj)
              }
            }
          }
          const sizeGroup = (sizeGroups || []).find(v => v.sizeGroupId === item.sizeGroupId)
          if (sizeGroup && sizeGroup.sizes && sizeGroup.sizes.length) {
            item.sizeNumArr = item.sizeNumArr.sort((a, b) => {
              return sizeGroup.sizes.indexOf(a.name) - sizeGroup.sizes.indexOf(b.name)
            })
          }
        })
        const sameColorTempItem = sameColorArr[sameColorArr.length - 1]
        // 生成列表表头
        const tableListHeader: any = []
        for (let i = 0; i < sameColorTempItem.sizeNumArr.length; i++) {
          const sizeNumArrItem = sameColorTempItem.sizeNumArr[i]
          Object.getOwnPropertyNames(sameCodeSizeObj).forEach(key => {
            if (key == sizeNumArrItem.name) tableListHeader.push(sizeNumArrItem)
          })
        }
        sameColorArr[sameColorArr.length - 1]['tableListHeader'] = tableListHeader
        // 通过表头过滤每种颜色不需要的尺码
        for (let i = 0; i < sameColorArr.length; i++) {
          const sameColorItem = sameColorArr[i]
          const newSizeNumArr: any = []
          for (let j = 0; j < tableListHeader.length; j++) {
            const tableListItem = tableListHeader[j]
            for (let k = 0; k < sameColorItem.sizeNumArr.length; k++) {
              const sizeNumItem = sameColorItem.sizeNumArr[k]
              if (tableListItem.name === sizeNumItem.name) {
                newSizeNumArr.push(sizeNumItem)
              }
            }
          }
          sameColorItem.sizeNumArr = newSizeNumArr
        }
        detsArr.push(sameColorArr)
      })
      params['shopId'] = main.shopId
      params['shopName'] = main.printHead || main.shopName

      if (String(main.invalidFlag) === '1') {
        modalHelper.open()
      }
      this.setState({
        cloudBillFlag,
        userActivityState,
        activityId,
        main,
        params,
        dets: detsArr,
        sameCodeObjArr: sameCodeObjArr,
        fieldConfig,
        bindError: bindErrorType,
        repeatPush,
        saasType,
        isImagesMoreThanOne,
        // isMicroMall,
        allowReplenish,
        config: {
          shareBillShowDiscount: '1', // 取不到值，默认展示
          ...res.data.param
        },
        rawDets,
        newStyle,
        verifys,
        notDeliverDets,
        downloadImages: spus
      })
      this.billDataFetched = true
      this.billDataFetching = false
      let billQRCodeContentParam = `t=${res.data.type || 1}=&sn=${res.data.sn}&epid=${
        res.data.epid
      }&billid=${res.data.billid}&type=${res.data.type || 1}&src=${res.data.type || 1}`
      const billUrl = `${config.detailQrUrlPrefix}?${billQRCodeContentParam}`

      drawQrcode({
        width: 450,
        height: 450,
        canvasId: 'qrurl',
        _this: Taro.getCurrentInstance()?.page || {},
        text: billUrl,
        correctLevel: 1,
        callback: () => {
          setTimeout(() => {
            Taro.canvasToTempFilePath({
              canvasId: 'qrurl',
              width: 450,
              height: 450,
              success: res => {
                this.setState({ qrUrl: res.tempFilePath })
              }
            })
          }, 350)
        }
      })
    } catch (e) {
      this.billDataFetching = false
    }
  }

  // 监听截屏事件，复制口令到剪切板
  initCaputreScreenEvent = () => {
    Taro.onUserCaptureScreen(this.onUserCaptureScreen)
  }

  onUserCaptureScreen = () => {
    this.setClipboardData()
    trackSvc.track(events.screenCapture)
  }

  setClipboardData = () => {
    const {
      params: { pk, sn, epid, type }
    } = this.state
    Taro.setClipboardData({ data: `et?sn=${sn}&epid=${epid}&billid=${pk}&type=${type}?et` })
  }

  onJumpShopClick = () => {
    this.setClipboardData()
    trackSvc.track(events.jumpToShopDiary)
    messageFeedback.showAlert('口令复制成功，现在打开笑铺日记就可以入库啦～')
  }

  fetchCartData = () => {
    this.cartDataFetched = true
    this.props.dispatch({ type: 'cloudBill/save', payload: { mpErpId: this.mpErpId } })
    this.props.dispatch({ type: 'replenishment/fetchCartGoodsList' })
    this.props.dispatch({ type: 'cloudBill/fetchSizeOrder' })
  }

  // onTopRightBtnClick = () => {
  //   Taro.switchTab({ url: '/pages/eTicketList/index' })
  // }

  goCloudBillPage = (type: ICloudBill = ICloudBill.all) => {
    this.props.dispatch({
      type: 'cloudBill/init',
      payload: { mpErpId: this.mpErpId, cloudType: type, cloudSource: CloudSource.TICKET_DETAIL }
    })
    Taro.navigateTo({ url: `/subpackages/cloud_bill/pages/all_goods/index?type=${type}` })
  }

  onGetUserInfo = e => {
    if (this.props.sessionId) return
    if (this.props.isLogining) {
      messageFeedback.showToast('登录中，请稍后')
    }
    const { iv, encryptedData } = e.detail
    if (iv && encryptedData) {
      Taro.showLoading({ title: '登录中...' })
      return this.props.dispatch({ type: 'user/login' }).then(() => {
        Taro.hideLoading()
      })
    } else {
      messageFeedback.showToast('请先登录')
    }
  }

  onGetUserInfoInGuide = async e => {
    await this.onGetUserInfo(e)
    this.showPhoneGetter()
  }

  onGetPhoneNumber = e => {
    trackSvc.track(events.getPhoneNumberInTicketDetail)
    if (e.detail.errMsg.includes('ok')) {
      Taro.showLoading()
      const { encryptedData, iv, code } = e.detail
      this.props.dispatch({
        type: 'user/verifyPhone',
        payload: { encryptedData, iv, wechat: true, code }
      })
    }
  }

  showPhoneGetter = () => {
    this.setState({ isPhoneGetterVisible: true })
  }

  hidePhoneGetter = () => {
    this.setState({ isPhoneGetterVisible: false })
  }

  onToggleStyleClick = () => {
    if (!this.props.sessionId) return
    this.setState((state: StateType) => ({ newStyle: state.newStyle === '1' ? '0' : '1' }))
    this.requestToggleStyle()
  }

  // 切换样式
  // 请求服务端数据并在本地缓存
  // 本地缓存的目的是
  requestToggleStyle = debounce(() => {
    const { newStyle } = this.state
    this.props.dispatch({
      type: 'user/updateUserParams',
      payload: { code: dict.mp_ticket_bill_new_style, value: newStyle }
    })
  }, 500)

  onShopClick = () => {
    const idx = this.props.shopList.findIndex(sp => sp.id === Number(this.mpErpId))
    if (idx > -1) {
      Taro.navigateTo({
        url: `/subpackages/ticket/pages/ticket_home/index?id=${this.mpErpId}&type=2`
      })
    }
  }

  onGuideClick = () => {
    this.setState({ isPublicGuideVisible: false })
    Taro.navigateTo({ url: '/subpackages/functional/pages/pub_web/index' })
  }

  onCheckBill = (id: string) => {
    const { sourceBillId } = getTaroParams(Taro.getCurrentInstance?.())
    const { params } = this.state
    if (sourceBillId === id) {
      return Taro.navigateBack()
    }
    const type = String(params.type) === '1' ? 2 : 1
    const query = `pk=${id}&sn=${params.sn}&epid=${params.epid}&shopId=${params.shopId}&&type=${type}&sourceBillId=${params.pk}`
    navigatorSvc.navigateTo({ url: `/pages/eTicketDetail/landscapeModel?${query}` })
  }

  onReplenishClick = throttle((e, item) => {
    // 加入补货单
    this.addGoodsToCart(item)
    // 动画逻辑
    const touch = e.touches[0]
    const { clientX, clientY } = touch
    if (this.state.dropAnimation) return
    const width = this.scale * 750
    this.setState(
      {
        dropAnimation: true,
        dropPosition: { top: clientY + 'px', right: width - clientX + 'px' }
      },
      () => {
        this.setState({
          dropPosition: { top: 'calc(90% - 80rpx)', right: width - clientX - 20 + 'px' }
        })
      }
    )
  }, 300)

  fetchCloudGoods = (cloudBillFlag?: CLOUD_BILL_FLAG) => {
    const { cloudBillFlag: _cloudBillFlag } = this.state
    let flag = typeof cloudBillFlag !== 'undefined' ? cloudBillFlag : _cloudBillFlag
    if (flag === CLOUD_BILL_FLAG.open) {
      Promise.all([
        getShopGoodsList({
          pageNo: 1,
          pageSize: 6,
          jsonParam: { mpErpId: this.mpErpId, type: ALL_GOODS_TAB_ITEM.ALL }
        }),
        getShopGoodsList({
          pageNo: 1,
          pageSize: 6,
          jsonParam: { mpErpId: this.mpErpId, type: ALL_GOODS_TAB_ITEM.HOT }
        })
      ]).then(([{ data: data1 }, { data: data2 }]) => {
        const tabData: { label: string; value: number }[] = []
        if (data1.rows.length > 0) {
          tabData.push({ label: '新款上架', value: ALL_GOODS_TAB_ITEM.ALL })
        }
        if (data2.rows.length > 0) {
          tabData.push({ label: '爆款推荐', value: ALL_GOODS_TAB_ITEM.HOT })
        }

        this.setState({
          cloudGoodsListNew: data1.rows,
          goodsNewCount: data1.count,
          tabData,
          cloudGoodsListHot: data2.rows
        })
      })
    }
  }

  addGoodsToCart = item => {
    const { code, name, imgUrl } = item[0]
    const skus: ISku[] = []
    item.forEach(colorItem => {
      colorItem.sizeNumArr.forEach(sizeItem => {
        skus.push({
          colorId: colorItem.colorId,
          colorName: colorItem.color,
          styleName: name,
          styleCode: code,
          styleId: colorItem.tenantSpuId,
          price: colorItem.price,
          sizeName: sizeItem.name,
          sizeId: sizeItem.id,
          num: sizeItem.value > 0 ? sizeItem.value : 1
        })
      })
    })
    this.props.dispatch({
      type: 'replenishment/addToCart',
      payload: { goodsDetail: { code, name, imgUrl, skus } }
    })
  }

  onDropTransitionEnd = () => {
    this.setState({ dropAnimation: false })
  }

  goIndex = () => {
    navigatorSvc.navigateTo({ url: '/pages/index/index' })
  }

  getQuery = () => {
    const { params, main, cloudBillFlag } = this.state
    const { subscribe } = this.props
    const query = `mpErpId=${this.mpErpId}&cloudBillFlag=${cloudBillFlag}&logo=${encodeURIComponent(
      main.shopLogoUrl
    )}&pk=${params.pk}&sn=${params.sn}&epid=${params.epid}&shopId=${
      params.shopId
    }&shopName=${encodeURIComponent(params.shopName)}&subscribe=${subscribe}&type=${params.type}`
    return query
  }

  onGoodsPicClick = item => {
    if (item[0].allImgUrlBig) {
      const imgUrlBigArr = item[0].allImgUrlBig.split(',')
      Taro.previewImage({ urls: imgUrlBigArr })
    } else {
      Taro.showToast({
        title: '没有图片',
        icon: 'none',
        duration: 2000
      })
    }
  }

  onGoodsVideoClick = item => {
    const imgs = item.allImgUrlBig && item.allImgUrlBig.split(',')
    this.setState({
      isVideoVisible: true,
      videoSrc: item.videoUrl,
      videoPoster: item.coverUrl,
      imgs
    })
  }

  hideVideo = () => {
    this.setState({ isVideoVisible: false })
  }

  onGoodsDetailClick = item => {
    const { params, main, fieldConfig, privateFlag } = this.state
    if (item[0].flag === 2) {
      return
    }
    const notShowMoney =
      (isTempBill(main) && fieldConfig.tempbillShowAmount !== '1') || privateFlag === '1'
    if (notShowMoney) return
    const { subscribe } = this.props
    if (params.type === '2' || subscribe !== '1') return
    const query = Taro.createSelectorQuery().in(Taro.getCurrentInstance()?.page as any)
    query
      .select('#landscape-wrapper')
      .boundingClientRect((rect: any) => {
        this.setState({ modalHeight: rect.height })
      })
      .exec()
    const param = {
      type: params.type,
      sn: params.sn,
      epid: params.epid,
      styleid: item[0].tenantSpuId,
      dwId: main.compId,
      shopId: params.shopId
    }
    Taro.showLoading({ title: '加载中...' })
    getGoodsDetail(param)
      .then(res => {
        const main = res.data.main
        main['proDate'] = getOneDate(main.prodate)
        const detailItem = { ...item[0], ...main }
        this.setState({ goodsItem: detailItem, showGoodsDetail: true })
        Taro.hideLoading()
      })
      .catch(err => {
        Taro.hideLoading()
        console.log(err)
      })
  }

  onCloseClick = () => {
    this.setState({ showGoodsDetail: false })
  }

  onExpressClick = () => {
    const { main, params } = this.state
    if (main.logisNo) {
      const query = `number=${main.logisNo}&providerId=${main.providerId}&pk=${params.pk}&sn=${params.sn}&epid=${params.epid}&from=detail`
      navigatorSvc.navigateTo({
        url: `/subpackages/packages_detail/pages/express_track/index?${query}`
      })
    }
  }

  // onCartClick = () => {
  //   navigatorSvc.navigateTo({
  //     url: `/subpackages/cloud_bill/pages/replenishment/index?from=ticketDetail&mpErpId=${this.mpErpId}`
  //   })
  // }

  onDownloadClick = () => {
    if (this.state.fieldConfig.showImage !== '1') {
      return messageFeedback.showToast('商家未开启图片展示,无法下载')
    }
    if (this.state.isImagesMoreThanOne) {
      const { downloadImages } = this.state
      this.props.dispatch({ type: 'imageDownload/save', payload: { sourceData: downloadImages } })
      const query = this.getQuery()
      navigatorSvc.navigateTo({
        url: `/subpackages/functional/pages/download_image/index?${query}`
      })
    } else {
      messageFeedback.showToast('无可用图片')
    }
  }

  // onNotificationClick = () => {
  //   this.setState({ isFollowGuideVisible: true, isFollowGuideClicked: true })
  //   trackSvc.track(events.followGuideClick)
  // }

  // onNotificationBtnClick = () => {
  //   this.setState({ isFollowGuideClicked: true, isDisableFollowGuide: true })
  //   trackSvc.track(events.disableFollowGuide)
  //   Taro.setStorage({ key: storage.DISABLE_FOLLOW_GUIDE_NOTIFICATION, data: true })
  // }

  // hideFollowGuide = () => {
  //   this.setState({ isFollowGuideVisible: false })
  // }

  // voidFunc = () => {}

  // onActivityClick = () => {
  //   let url = `/subpackages/functional/pages/activity/index?activityId=${this.state.activityId}`
  //   // if (this.state.userActivityState === 2) {
  //   //   url = `/subpackages/functional/pages/prize_record/index?activityId=${this.state.activityId}`
  //   // }
  //   navigatorSvc.navigateTo({
  //     url
  //   })
  // }

  onNotNotifyActAnyMoreClick = () => {
    this.setState({ isActivityDisabled: true })
    Taro.setStorage({ key: storage.DISABLE_ACTIVITY_NOTIFICATION_1, data: true })
  }

  canGoCloudBill = () => {
    const { cloudBillFlag, fromShare, saasType } = this.state

    const { subscribe } = this.props
    const isFunctionAvailablePre = !fromShare && Number(saasType) === 1
    const goCloudBill = isFunctionAvailablePre && subscribe === '1'
    // 首先判断用户是否能用云单
    // 再判断商家的云单开通状态
    if (goCloudBill) {
      if (cloudBillFlag > CLOUD_BILL_FLAG.close) {
        return ICloudBill.all
      } else if (cloudBillFlag === CLOUD_BILL_FLAG.never) {
        return ICloudBill.replenishment
      } else {
        return ICloudBill.close
      }
    }

    return ICloudBill.noPermission
  }
  onOpenTost() {
    Taro.showToast({ title: '已为您提醒ta开通', icon: 'none', duration: 2000 })
    if (this.mpErpId) {
      inviteJoinCloudBill({ mpErpId: this.mpErpId })
    }
  }

  allTicketClick = () => {
    trackSvc.track(events.landAllTicketClick)
    const { type = '1' } = this.state.params
    if (type === '1') {
      Taro.switchTab({ url: '/pages/eTicketList/index' })
    } else {
      Taro.navigateTo({
        url: '/subpackages/mine/pages/order_ticket_list/index?from=landPage'
      })
    }
  }
  // renderActivityNotification = () => {
  //   const {
  //     main: { compName }
  //   } = this.state
  //   const name = compName || ''
  //   let nameP = name.length > 3 || name.length === 0 ? '恭喜' : name
  //   const title = '点我免费抽大奖！'
  //   const content = `${nameP}，你被好运砸中啦！`

  //   return (
  //     <Notification
  //       {...NOTIFICATION.ACTIVITY}
  //       title={title}
  //       content={content}
  //       buttonStyle={{ background: 'white' }}
  //       onClick={this.onActivityClick}
  //       onBtnClick={this.onNotNotifyActAnyMoreClick}
  //       onGetPhoneNumber={this.onGetPhoneNumber}
  //       onGetUserInfo={this.onGetUserInfoInGuide}
  //     />
  //   )
  // }

  // renderNotification = () => {
  //   return (
  //     <Notification
  //       {...NOTIFICATION.BIND_PHONE}
  //       onClick={this.onNotificationClick}
  //       onBtnClick={this.voidFunc}
  //       buttonType={this.props.sessionId ? 'getPhoneNumber' : 'getUserInfo'}
  //       onGetPhoneNumber={this.onGetPhoneNumber}
  //       onGetUserInfo={this.onGetUserInfoInGuide}
  //     />
  //   )
  // }

  // renderFollowNotification = () => {
  //   return (
  //     <Notification
  //       {...NOTIFICATION.FOLLOW}
  //       onClick={this.onNotificationClick}
  //       onBtnClick={this.onNotificationBtnClick}
  //       buttonStyle={{ color: 'white', background: 'transparent' }}
  //     />
  //   )
  // }

  renderDetsInHeadSize = () => {
    const { dets, main, fieldConfig, sameCodeObjArr, config, privateFlag } = this.state
    const notShowMoney =
      (isTempBill(main) && fieldConfig.tempbillShowAmount !== '1') || privateFlag === '1'
    const notShowNum = isTempBill(main) && fieldConfig.tempbillShowNum !== '1'

    const cloudBillStatus = this.canGoCloudBill()
    return (
      <View className={styles.listForm}>
        {dets.map((item, index) => (
          <View key={index} className={styles.listItem}>
            <View className={styles.listTop}>
              {fieldConfig.showImage === '1' && (
                <View>
                  {!!item[0].videoUrl ? (
                    <View
                      style={{ position: 'relative' }}
                      onClick={this.onGoodsVideoClick.bind(this, item[0])}
                    >
                      <Image
                        mode='aspectFill'
                        className={styles.itemImgCover}
                        src={item[0].coverUrl ? item[0].coverUrl : defaultLogo2}
                      />
                      <Image className={styles.play_btn} src={playIcon} />
                    </View>
                  ) : (
                    <View
                      className={styles.itemImgCover}
                      onClick={this.onGoodsPicClick.bind(this, item)}
                    >
                      <EImage
                        lazyLoad
                        mode='aspectFill'
                        src={item[0].imgUrls.length ? item[0].imgUrls : [DefaultGood]}
                      />
                    </View>
                  )}
                </View>
              )}
              <View className={styles.listTopRight}>
                {privateFlag !== '1' && cloudBillStatus > ICloudBill.close && (
                  <View
                    className={styles.replenish_btn}
                    onClick={e => this.onReplenishClick(e, item)}
                  >
                    <View className={styles.replenish_btn__h}></View>
                    <View className={styles.replenish_btn__v}></View>
                  </View>
                )}
                <View
                  className={styles.goodsInfo}
                  onClick={this.onGoodsDetailClick.bind(this, item)}
                >
                  <View className={styles.goodsInfoTop}>
                    <View className={styles.goodsTopLeft}>
                      {fieldConfig.showSecondSale === '1' && item[0].showRepFlag && (
                        <Image className={styles.iconCover} src={replenishment} />
                      )}
                      <View className={styles.goodsCode}>
                        <Text selectable>{item[0].code}</Text>
                      </View>
                    </View>
                    {!notShowMoney && !notShowNum && (
                      <View className={styles.goodsTopRight}>
                        ￥
                        <View className={styles.itemTotalPrice}>
                          {NP.times(sameCodeObjArr[index].sumNum, sameCodeObjArr[index].realPrice)}
                        </View>
                        {sameCodeObjArr[index].discount < 1 &&
                          config.shareBillShowDiscount !== '0' && (
                            <View className={styles.orgPrice}>
                              ¥
                              <Text>
                                {NP.times(
                                  sameCodeObjArr[index].sumNum,
                                  sameCodeObjArr[index].price
                                )}
                              </Text>
                            </View>
                          )}
                      </View>
                    )}
                  </View>
                  {config.salesPrintMatName === '1' && (
                    <Text selectable className={styles.goodsName}>
                      {item[0].name}
                    </Text>
                  )}
                  <View className={styles.goodsPrice}>
                    <Text className={styles.priceNum}>
                      {/* 价格 */}
                      <Text>
                        {`${notShowMoney || notShowNum ? '' : `${item[0].price}元`}`}
                        {!notShowMoney &&
                          main.needShowOldPrice &&
                          item[0].stdprice1 > item[0].price && (
                            <Text className={styles['line_t']}>{`(¥${item[0].stdprice1})`}</Text>
                          )}
                      </Text>
                      {/* 件数 */}
                      <Text>
                        {`${notShowNum ? '' : ` × ${sameCodeObjArr[index].sumNum}${item[0].unit}`}`}
                      </Text>
                      {/* 折扣 */}
                      <Text>{`${
                        sameCodeObjArr[index].discount < 1 && config.shareBillShowDiscount !== '0'
                          ? ' × ' + sameCodeObjArr[index].discount
                          : ''
                      }`}</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {item[0].flag !== 2 && (
              <View className={styles.listTable}>
                <View className={styles.tableHeader}>
                  <View className={styles.tableHeaderCellFirst} />
                  {item[item.length - 1].sizeNumArr.map((sizeNumItem, index) => (
                    <View className={styles.tableHeaderCell} key={index}>
                      {sizeNumItem.name}
                    </View>
                  ))}
                </View>
                {item.map((ele, index) => (
                  <View className={styles.tableRow} key={index}>
                    <View className={styles.tableCellFirst}>{ele.color}</View>
                    {ele.sizeNumArr.map((eleSizeNumItem, index) => (
                      <View className={styles.tableCell} key={index}>
                        {notShowNum ? '*' : eleSizeNumItem.value}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    )
  }

  // 平铺展示所有sku数据
  renderDetsInSkus = () => {
    const { rawDets, fieldConfig, config, main } = this.state
    const notShowMoney = isTempBill(main) && fieldConfig.tempbillShowAmount !== '1'
    const notShowNum = isTempBill(main) && fieldConfig.tempbillShowNum !== '1'
    const { spec1Name = '颜色', spec2Name = '尺码' } = main
    const initArray = [
      ['序号'],
      ['款号'],
      ['名称'],
      [spec1Name],
      [spec2Name],
      ['数量'],
      ['单价'],
      ['小计'],
      ['备注']
    ]
    const detsArray = rawDets.reduce((prev, cur, index) => {
      prev[0].push(String(index + 1))
      prev[1].push(cur.code)
      prev[2].push(cur.name)
      prev[3].push(cur.color)
      prev[4].push(cur.size)
      let num = String(cur.num)
      if (cur.diffDeliverNum > 0 && config.printDiffDeliverNum === '1') {
        const prefixWord = cur.deliverFinishFlag === 2 ? '缺' : '欠'
        num = `${num}(${prefixWord}${cur.diffDeliverNum})`
      }
      prev[5].push(num)
      let priceItem = String(cur.realPrice)
      // 划线价处理
      if (main.needShowOldPrice && cur.stdprice1 > cur.realPrice) {
        // @ts-ignore
        priceItem = {
          value: String(cur.realPrice),
          extra: `(${String(cur.stdprice1)})`
        }
      }
      prev[6].push(priceItem)
      prev[7].push(String(NP.times(cur.num, cur.realPrice)))
      prev[8].push(cur.remark)

      return prev
    }, initArray)

    let deleteCount = 0

    // 不显示序号
    if (fieldConfig.showSerialNumber !== '1') {
      detsArray.splice(0, 1)
      deleteCount++
    }

    // 不显示名称
    if (config.salesPrintMatName !== '1') {
      detsArray.splice(2 - deleteCount, 1)
      deleteCount++
    }

    // 不显示颜色尺码
    if (config.ignoreColorSize === '1') {
      detsArray.splice(3 - deleteCount, 2)
      deleteCount += 2
    }

    // 不显示数量
    if (notShowNum) {
      detsArray.splice(5 - deleteCount, 1)
      deleteCount++
    }

    // 不显示金额
    if (notShowMoney) {
      detsArray.splice(6 - deleteCount)
      deleteCount++
    }

    // 不显示小记
    if (notShowNum || notShowMoney) {
      detsArray.splice(7 - deleteCount)
      deleteCount++
    }

    // 不显示备注
    if (config.salesPrintDetRem !== '1') {
      detsArray.splice(detsArray.length - 1)
    }

    // 过滤无备注的情况
    if (
      detsArray[detsArray.length - 1].every((rem, index) => {
        if (index === 0) return rem === '备注'
        return rem === '' || rem === undefined
      })
    ) {
      detsArray.splice(detsArray.length - 1)
    }

    return (
      rawDets.length > 0 && (
        <View className={styles.list_new_style}>
          {/* 头部 */}
          {detsArray.map((col, cIndex) => (
            <View
              key={cIndex}
              className={styles.list_new_style__col}
              // style={{ minWidth: `${(1 / detsArray.length) * 100}%` }}
            >
              {col.map((item, _idx) => (
                <View key={_idx} className={styles.list_new_style__col__item}>
                  <Text selectable>
                    {item && item.value ? (
                      <Text>
                        {item.value}
                        <Text className={styles.line_t}>{item.extra}</Text>
                      </Text>
                    ) : (
                      item
                    )}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )
    )
  }

  renderVerifyDets = () => {
    const { verifys } = this.state
    const { verifys: _verifys, sum } = getVerifyArray(verifys)
    return (
      <Block>
        {verifys.length > 0 && (
          <View>
            <View className={styles.list_new_style_title}>核销信息</View>
            <View className={styles.list_new_style_c}>
              <View
                className={classNames(styles.list_new_style, styles['list_new_style--verify'])}
                style={{ display: 'flex' }}
              >
                {/* 头部 */}
                {_verifys.map((col, cIndex) => (
                  <View
                    key={cIndex}
                    className={styles.list_new_style__col}
                    // style={{ minWidth: `${(1 / _verifys.length) * 100}%` }}
                  >
                    {col.map((item, _idx) => (
                      <View key={_idx} className={styles.list_new_style__col__item}>
                        <Text selectable>{item}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>

              <View className={styles.list_new_style__sum}>
                {`合计：欠款：${Math.abs(sum.debt)}  抵扣：${sum.pay}`}
              </View>
            </View>
          </View>
        )}
      </Block>
    )
  }

  renderNotDeliverDets = () => {
    const { notDeliverDets, fieldConfig, config } = this.state
    const _dets = getNotDeliverDets(notDeliverDets, fieldConfig, config)
    return (
      <Block>
        {notDeliverDets.length > 0 && (
          <View>
            <View className={styles.list_new_style_title}>未发明细</View>
            <View className={styles.list_new_style}>
              {/* 头部 */}
              {_dets.map((col, cIndex) => (
                <View
                  key={cIndex}
                  className={styles.list_new_style__col}
                  // style={{ minWidth: `${(1 / _dets.length) * 100}%` }}
                >
                  {col.map((item, _idx) => (
                    <View key={_idx} className={styles.list_new_style__col__item}>
                      <Text selectable>{item}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}
      </Block>
    )
  }

  renderDetails = () => {
    const {
      main,
      config,
      params,
      fieldConfig,
      qrUrl,
      saasType,
      isVideoVisible,
      verifys,
      isDetailOtherInfoVisible
    } = this.state
    const { bigFontSize } = this.props
    const isBothSaleAndBackGoods = main.backNum !== 0 && main.totalNum + main.backNum !== 0
    const renderScore = typeof main.compScore !== 'undefined' && config.printClientScore === '1'
    const isTempBill = String(main.invalidFlag) === '9' // 挂单
    const notShowMoney = isTempBill && fieldConfig.tempbillShowAmount !== '1'
    const notShowNum = isTempBill && fieldConfig.tempbillShowNum !== '1'
    const notRenderMoneyInfo =
      params.type === '2' &&
      String(main.cash) === '0' &&
      String(main.remit) === '0' &&
      String(main.card) === '0' &&
      String(main.weiXinPay) === '0' &&
      (String(main.mobilePay) === '0' || String(main.mobilePay) === 'undefined') &&
      String(main.aliPay) === '0' &&
      String(main.storedValueCost) === '0' &&
      String(main.debt) === '0' &&
      String(main.agency) === '0'
    // const phone = main.shopPhone || main.shopMobile
    // let phoneString = main.shopPhone || main.shopMobile
    // if (main.shopPhone && main.shopMobile) {
    //   phoneString = `${main.shopPhone} / ${main.shopMobile}`
    // }
    const diffString =
      config.printDiffDeliverNum === '1' && main.diffDeliverNum && main.diffDeliverNum > 0
        ? `(欠${main.diffDeliverNum}件)`
        : ''
    const moneyString = notShowMoney
      ? ''
      : `${main.totalMoney + main.backMoney + main.actMoney}${t('rmb')}`
    const numString = notShowNum ? '' : `${main.totalNum + main.backNum}${t('unit')}${diffString}`

    const accounts = getAccountInfo(main)
    return (
      <View>
        <View className={styles.listBot}>
          {/* {isBothSaleAndBackGoods ? ( */}
          <Block>
            {isBothSaleAndBackGoods && (
              <Block>
                <View className={styles.total}>
                  <View>销数/退数</View>
                  <View className={styles.totalBot}>
                    {notShowNum ? '**' : `${numString}/-${main.backNum}${t('unit')}`}
                  </View>
                </View>
                {
                  <View className={styles.total}>
                    <View>销额/退额</View>
                    <View className={styles.totalBot}>
                      {notShowMoney
                        ? '**'
                        : `${main.totalMoney + main.backMoney}${t('rmb')}/-${main.backMoney}${t(
                            'rmb'
                          )}`}
                    </View>
                  </View>
                }
              </Block>
            )}
            <View className={styles.total}>
              <View>总数</View>
              <View className={styles.totalBot}>
                {notShowNum ? '**' : `${main.totalNum}${t('unit')}`}
              </View>
            </View>
            {Number(main.actMoney) !== 0 && (
              <View className={styles.total}>
                <View>活动优惠</View>
                <View className={styles.totalBot}>{`-${main.actMoney}${t('rmb')}`}</View>
              </View>
            )}
            {!isNaN(Number(main.coupMoney)) && Number(main.coupMoney) !== 0 && (
              <View className={styles.total}>
                <View>优惠券</View>
                <View className={styles.totalBot}>{`-${main.coupMoney}${t('rmb')}`}</View>
              </View>
            )}
            <View className={styles.total}>
              <View>总额</View>
              <View className={styles.totalBot}>
                {notShowMoney ? '**' : `${main.totalMoney}${t('rmb')}`}
              </View>
            </View>
          </Block>
          {/* {!isDetailOtherInfoVisible && (
            <View
              className={styles.more_tip}
              onClick={() => this.setState({ isDetailOtherInfoVisible: true })}
            >
              显示更多信息
            </View>
          )} */}
        </View>

        {/* {isDetailOtherInfoVisible && ( */}
        <Block>
          {!notRenderMoneyInfo && !notShowMoney && (
            <View className={styles.moneyInfo}>
              {String(main.cash) !== '0' && (
                <View className={styles.moneyItem}>
                  {t('cash')}
                  <Text className={styles.money}>
                    {main.cash}
                    {t('rmb')}
                  </Text>
                </View>
              )}
              {String(main.remit) !== '0' && (
                <View className={styles.moneyItem}>
                  {t('remit')}
                  <Text className={styles.money}>
                    {main.remit}
                    {t('rmb')}
                  </Text>
                </View>
              )}
              {String(main.card) !== '0' && (
                <View className={styles.moneyItem}>
                  {t('card')}
                  <Text className={styles.money}>
                    {main.card}
                    {t('rmb')}
                  </Text>
                </View>
              )}
              {String(main.weiXinPay) !== '0' && (
                <View className={styles.moneyItem}>
                  {t('weiXinPay')}
                  <Text className={styles.money}>
                    {main.weiXinPay}
                    {t('rmb')}
                  </Text>
                </View>
              )}
              {String(main.mobilePay) !== '0' && String(main.mobilePay) !== 'undefined' && (
                <View className={styles.moneyItem}>
                  {t('mobilePay')}
                  <Text className={styles.money}>
                    {main.mobilePay}
                    {t('rmb')}
                  </Text>
                </View>
              )}
              {String(main.aliPay) !== '0' && (
                <View className={styles.moneyItem}>
                  {t('aliPay')}
                  <Text className={styles.money}>
                    {main.aliPay}
                    {t('rmb')}
                  </Text>
                </View>
              )}
              {String(main.storedValueCost) !== '0' && (
                <View className={styles.moneyItem}>
                  {t('storedValueCost')}
                  <Text className={styles.money}>
                    {main.storedValueCost}
                    {t('rmb')}
                  </Text>
                </View>
              )}
              {String(main.debt) !== '0' && (
                <View className={styles.moneyItem}>
                  {t('debt')}
                  <Text className={styles.money}>
                    {main.debt}
                    {t('rmb')}
                  </Text>
                </View>
              )}
              {String(main.agency) !== '0' && (
                <View className={styles.moneyItem}>
                  {t('agency')}
                  <Text className={styles.money}>
                    {main.agency}
                    {t('rmb')}
                  </Text>
                </View>
              )}
              {params.type === '1' && (
                <Block>
                  {verifys.length > 0 && (
                    <View className={styles.moneyItem}>
                      本次核销
                      <Text className={styles.money}>
                        {Math.abs(main.verifySum)}
                        {t('rmb')}
                      </Text>
                    </View>
                  )}
                  {/* 本单余额 / 欠款 */}
                  {!isTempBill && fieldConfig.showThisBalance === '1' && (
                    <View className={styles.moneyItem}>
                      {main.balance >= 0 ? t('balancePlus') : t('balanceMinus')}
                      <Text className={styles.money}>
                        {Math.abs(main.balance)}
                        {t('rmb')}
                      </Text>
                    </View>
                  )}
                  {/* 上次余额 / 欠款 */}
                  {!isTempBill && fieldConfig.showLastTimeBalance === '1' && (
                    <View className={styles.moneyItem}>
                      {main.lastBalance - main.balance + main.verifySum >= 0
                        ? t('lastTimeBalancePlus')
                        : t('lastTimeBalanceMinus')}
                      <Text className={styles.money}>
                        {/* 一代的储值支付 不是一种支付方式 是欠款，而对二代来说不会产生欠款 */}
                        {Math.abs(
                          NP.minus(
                            main.lastBalance || 0,
                            -main.verifySum || 0,
                            Number(saasType) !== 1 && main.storedValueCost !== 0
                              ? main.balance - main.storedValueCost
                              : main.balance
                          )
                        )}
                        {t('rmb')}
                      </Text>
                    </View>
                  )}
                  {/* 累计余额 / 欠款 */}
                  {!isTempBill && fieldConfig.showLastBalance === '1' && (
                    <View className={styles.moneyItem}>
                      {main.lastBalance >= 0 ? t('lastBalancePlus') : t('lastBalanceMinus')}
                      <Text className={styles.money}>
                        {Math.abs(main.lastBalance)}
                        {t('rmb')}
                      </Text>
                    </View>
                  )}
                  {renderScore && (
                    <View className={styles.moneyItem}>
                      本单积分
                      <Text className={styles.money}>{main.billScore}</Text>
                    </View>
                  )}
                  {renderScore && (
                    <View className={styles.moneyItem}>
                      累计积分
                      <Text className={styles.money}>{main.compScore}</Text>
                    </View>
                  )}
                </Block>
              )}
            </View>
          )}

          {this.renderNotDeliverDets()}
          <View className={styles.detailInfo}>
            {main.shopAddrs ? (
              main.shopAddrs.map((addr, addrIndex) => (
                <View className={styles.detailItem}>
                  <View>{t('address') + (addrIndex > 0 ? addrIndex : '')}</View>
                  <Text selectable className={styles.detail}>
                    {addr}
                  </Text>
                </View>
              ))
            ) : (
              <View className={styles.detailItem}>
                <View>{t('address')}</View>
                <Text selectable className={styles.detail}>
                  {main.shopAddr}
                </Text>
              </View>
            )}
            <View className={styles.detailItem}>
              <View>{t('contactNumber')}</View>
              <View style={{ overflowX: 'scroll', flex: 1, textAlign: 'end' }}>
                {!!main.shopPhone && (
                  <Text
                    selectable
                    className={classNames(styles.detail, styles['detail--clickable'])}
                    onClick={() => Taro.makePhoneCall({ phoneNumber: main.shopPhone })}
                  >
                    {`${main.shopPhone}`}
                  </Text>
                )}
                {!!main.shopMobile && (
                  <Text
                    selectable
                    className={classNames(styles.detail, styles['detail--clickable'])}
                    onClick={() => Taro.makePhoneCall({ phoneNumber: main.shopMobile })}
                  >
                    {`${main.shopMobile}`}
                  </Text>
                )}
              </View>
            </View>
            {accounts.map(ac => (
              <View className={styles.detailItem}>
                <View>{ac.label}</View>
                <View className={styles.detail_2_row}>
                  <Text selectable className={styles.detail}>
                    {ac.accountName}
                  </Text>
                  <Text selectable className={styles.detail}>
                    {ac.accountNo}
                  </Text>
                </View>
              </View>
            ))}

            {!isTempBill && (
              <View className={styles.detailItem}>
                <View>{t('rem')}</View>
                <Text selectable className={styles.detail}>
                  {main.rem}
                </Text>
              </View>
            )}
            {/* printFooter */}
            {!!main.createdDate && (
              <View className={styles.detailItem}>
                <View>开单时间</View>
                <Text selectable className={styles.detail}>
                  {main.createdDate}
                </Text>
              </View>
            )}
            <View className={styles.detailItem}>
              <View>{main.printFooter}</View>
            </View>
            {/* {isDetailOtherInfoVisible && (
                <View
                  className={styles.more_tip}
                  onClick={() => this.setState({ isDetailOtherInfoVisible: false })}
                >
                  收起
                </View>
              )} */}
          </View>
        </Block>
        {/* )} */}
      </View>
    )
  }

  renderDownloadImages = () => {
    const { downloadImages, fieldConfig, isImagesMoreThanOne } = this.state
    return (
      fieldConfig.showImage === '1' &&
      isImagesMoreThanOne && (
        <View className={styles.download_images} onClick={this.onDownloadClick}>
          <View className={styles.download_images__header}>
            <View className={styles.download_images__label}>本单拿货商品相册</View>
            <View className={styles.download_images__btn}>
              <Image className={styles.download_images__btn__icon} src={downloadIcon} />
              去下载图片
            </View>
          </View>
          <View className={styles.download_images__items}>
            {downloadImages
              .filter(_img => _img.allImgUrlBig)
              .slice(0, 4)
              .map(img => (
                <View className={styles.download_images__item}>
                  <View className={styles.download_images__item__img_wrapper}>
                    <Image
                      className={styles.download_images__item__img}
                      src={img.imgUrl || defaultLogo2}
                    />
                    <View className={styles.download_images__item__count}>{`${
                      img.allImgUrlBig.split(',').length
                    }张`}</View>
                  </View>
                  <View className={styles.download_images__item__label}>{img.name}</View>
                </View>
              ))}
          </View>
        </View>
      )
    )
  }

  renderCloudBillGoods = () => {
    const {
      params,
      main,
      cloudGoodsListHot,
      cloudGoodsListNew,
      cloudGoodsListTabIndex,
      goodsNewCount,
      tabData,
      enableVisitor
    } = this.state
    const renderHot = cloudGoodsListHot.length > 0
    const renderNew = cloudGoodsListNew.length > 0
    const renderNothing = !renderHot && !renderNew
    const currentItem = tabData[cloudGoodsListTabIndex]
    let list: ISpu[] = []
    if (currentItem) {
      if (currentItem.value === ALL_GOODS_TAB_ITEM.ALL) {
        list = cloudGoodsListNew
      } else {
        list = cloudGoodsListHot
      }
    }
    return renderNothing ? null : (
      <View
        className={styles.cloud_bill_goods}
        style={{ background: `url('${colorfulBg}') no-repeat top/100%,#f7f7f7` }}
      >
        <View className={styles.cloud_bill_goods__title}>本店已开通云单，可在线看款补货</View>
        <View className={styles.cloud_bill_goods__list}>
          <View
            className={styles.cloud_bill_goods__list__header}
            onClick={() => this.goCloudBillPage()}
          >
            <Image
              src={main.shopLogoUrl || defaultShopLogo}
              className={styles.cloud_bill_goods__list__header__logo}
            />
            <View className={styles.cloud_bill_goods__list__header__label}>{params.shopName}</View>
            <View className={styles.cloud_bill_goods__list__header__right}>
              进店
              <Image
                src={angleRightIcon}
                className={styles.cloud_bill_goods__list__header__angle}
              />
            </View>
          </View>
          <View className={styles.cloud_bill_goods__list__content}>
            <View className={styles.cloud_bill_goods__list__content__header}>
              <View className='aic'>
                <Tabs
                  data={tabData}
                  onTabItemClick={index => this.setState({ cloudGoodsListTabIndex: index })}
                />
                {renderHot && (
                  <View
                    style={{ position: 'relative', left: '-20px', lineHeight: '88rpx' }}
                  >{`🔥`}</View>
                )}
              </View>

              <View className={styles.new}>
                <View className={styles.new__flag}>NEW</View>
                {`近期上新${goodsNewCount}款`}
              </View>
            </View>
            <View
              className={styles.cloud_bill_goods__list__content__main}
              onClick={() => this.goCloudBillPage()}
            >
              {list.slice(0, 6).map(good => (
                <View className={styles.cloud_bill_goods__list__content__goods}>
                  <View className={styles.cloud_bill_goods__list__content__goods_img_wrapper}>
                    <Image
                      className={styles.cloud_bill_goods__list__content__goods_img}
                      src={good.imgUrl || defaultLogo2}
                    />
                  </View>

                  <View className={styles.cloud_bill_goods__list__content__goods_label}>
                    {good.name}
                  </View>
                </View>
              ))}
            </View>
            <View
              className={styles.cloud_bill_goods__list__content__all_btn}
              onClick={() => this.goCloudBillPage()}
            >
              查看所有商品
            </View>
          </View>
        </View>
      </View>
    )
  }

  renderQRcode = () => {
    const { params, qrUrl, saasType, isVideoVisible, main } = this.state
    const isTempBill = String(main.invalidFlag) === '9'
    return (
      (Number(saasType) === 1 || params.type === '1') &&
      !isTempBill && (
        <View className={styles.qrCodeImage}>
          <View className={styles.qrCodeLeft}>
            {/* <Image className={styles.qrCodeCover} src={qrUrl} /> */}
            {isWeb ? (
              <Image className={styles.qrCodeCover} src={qrUrl} />
            ) : (
              !isVideoVisible && (
                <Block>
                  <Image
                    src={qrUrl}
                    className={styles.qrCodeCover}
                    // @ts-ignore
                    showMenuByLongpress
                    onClick={() => Taro.previewImage({ urls: [qrUrl] })}
                  />
                </Block>
              )
            )}
          </View>
          <Image className={styles.qrCodeRight} src={images.e_ticket.ticket_detail_qr_code_right} />
        </View>
      )
    )
  }

  renderBackView = () => {
    const { statusBarHeight, gap } = this.props
    const {
      params: { type = '1' }
    } = this.state
    return (
      <View
        className={styles.back_view}
        style={`top: ${statusBarHeight + gap}px`}
        onClick={this.allTicketClick}
      >
        <Image src={BackLeftIcon} className={styles.BackLeftIcon} />
        <Text>{type === '1' ? '全部小票' : '全部订货单'}</Text>
      </View>
    )
  }

  renderNewTicketGuide = () => {
    const { isNewTicketGuideVisible } = this.state
    return (
      isNewTicketGuideVisible && (
        <View className={styles.new_ticket_guide}>
          <View className={styles.new_ticket_guide__main}>
            <View className={styles.new_ticket_guide__angle} />
            <View className={styles.new_ticket_guide__header}>
              <Text>全新小票来啦～像朋友圈一样看小票</Text>
              <View className={styles.new_ticket_guide__header__subtitle}>
                点击左上角“全部小票”去看所有拿货小票
              </View>
            </View>
            <View className={styles.new_ticket_guide__content}>
              <Image src={newTicketGuidePng} className={styles.new_ticket_guide__content__img} />
            </View>
            <View className={styles.new_ticket_guide__bottom}>
              <View
                className={styles.new_ticket_guide__bottom__button}
                onClick={e => {
                  Taro.setStorage({ key: storage.DIS_NEW_TICKET_GUIDE, data: true })
                  this.setState({ isNewTicketGuideVisible: false })
                }}
              >
                我记住了，去试试
              </View>
            </View>
          </View>
        </View>
      )
    )
  }

  render() {
    let { subscribe, noAuth, sessionId, bigFontSize, totalNumWithoutChecked } = this.props
    const {
      showGoodsDetail,
      main,
      params,
      fieldConfig,
      goodsItem,
      qrUrl,
      isVideoVisible,
      videoSrc,
      videoPoster,
      imgs,
      bindError,
      saasType,
      // isMicroMall,
      fromShare,
      isScrolling,
      config,
      newStyle,
      fromAppShare,
      verifys,
      isFollowGuideClicked,
      isDisableFollowGuide,
      activityId,
      userActivityState,
      cloudBillFlag,
      dropAnimation,
      dropPosition,
      isPublicGuideVisible,
      privateFlag,
      enableVisitor
    } = this.state
    const showErrorTip = bindError > 0 && bindError !== 2
    const showActivity = !!activityId && userActivityState > 0
    const showPhoneGuide = false && subscribe !== '1' && this.props.phone === '' && !showActivity
    let showFollowGuide =
      false &&
      !showPhoneGuide && // 显示了手机号引导就不展示公众号
      !isDisableFollowGuide &&
      fromAppShare &&
      !isFollowGuideClicked &&
      (noAuth || (sessionId && subscribe !== '1'))
    let offsetTop = 0
    if (showErrorTip) {
      offsetTop = 88
    }

    if (showActivity || showPhoneGuide || showFollowGuide) {
      offsetTop += NOTIFICATION_HEIGHT
    }

    const isFunctionAvailablePre = !fromShare
    const goCloudBill = sessionId && !fromShare && Number(saasType) === 1 && subscribe === '1'
    const cloudBillStatus = this.canGoCloudBill()
    const isFunctionAvailable =
      isFunctionAvailablePre && this.props.sessionId && params.type === '1'
    const qrCanvasStyle: React.CSSProperties = {
      position: 'absolute',
      width: '500px',
      height: '500px',
      left: '-9999px'
    }

    let cartNumString = totalNumWithoutChecked > 99 ? '(99+)' : `(${totalNumWithoutChecked})`
    if (totalNumWithoutChecked === 0) {
      cartNumString = ''
    }
    const showCompAddr = typeof main.compAddr === 'string' && main.compAddr !== ''
    const showCompPhone = typeof main.compPhone === 'string' && main.compPhone !== ''
    // 同时包含销售和退货
    return (
      <CustomNavigation
        enableBack={!this.isFirstPage}
        stickyTop={false}
        disableIphoneXPaddingBottom
        title='小票详情'
      >
        {this.isFirstPage && this.renderBackView()}
        {/* {this.renderNewTicketGuide()} */}
        <View className={styles.landscapeWrapper} id='landscape-wrapper'>
          {privateFlag === '1' ? (
            <View>
              {main.logisNo && main.logisNo !== '' && (
                <View className={styles.express_info} onClick={this.onExpressClick}>
                  <View>
                    快递单号：<Text className={styles.express_info__logis_no}>{main.logisNo}</Text>
                  </View>
                  <View className={styles.express_info__highlight}>查看详情</View>
                </View>
              )}
              {this.renderDetsInHeadSize()}
            </View>
          ) : String(main.invalidFlag) !== '1' ? (
            <Block>
              {/* error = 3 为未绑定手机号 */}
              {showErrorTip && (
                <View className={styles.tip}>手机号与店铺维护的不一致,无法查看该店铺其他小票</View>
              )}
              {/* 下载图片按钮 */}
              {isFunctionAvailable && (
                <View
                  className={classNames(styles.download_btn, {
                    [styles['download_btn--hide']]: isScrolling
                  })}
                  onClick={this.onDownloadClick}
                >
                  <Image className={styles.icon} src={downloadIcon} />
                  <Text>下载图片</Text>
                </View>
              )}

              <View
                className={classNames(styles.jump_btn, {
                  [styles['jump_btn--hide']]: isScrolling
                })}
                onClick={this.onJumpShopClick}
              >
                <Text>笑铺日记入库</Text>
              </View>

              <View className={styles.ticketTop} style={{ marginTop: pxTransform(offsetTop) }}>
                <View className={styles.topLeft} onClick={this.onShopClick}>
                  <View className={styles.topLeft__logo}>
                    <Image
                      className={styles.shopLogoUrl}
                      src={main.shopLogoUrl ? main.shopLogoUrl : defaultShopLogo}
                    />
                    {/* {isMicroMall && <Image src={mallLogo} className={styles.mall_logo} />} */}
                  </View>
                  <View className={styles.shopTitle}>{params.shopName}</View>
                </View>
                {/* 销售单 */}
                <View className={classNames(styles.topRight, styles[`topRight--${params.type}`])}>
                  <Button
                    className={styles.toggle_btn__main}
                    onClick={this.onToggleStyleClick}
                    openType={this.props.sessionId ? undefined : 'getUserInfo'}
                    onGetUserInfo={this.onGetUserInfo}
                  >
                    切换样式
                    <Image className={styles.toggle_btn__icon} src={toggleIcon} />
                  </Button>
                  {/* <View className={styles.saveQrCode} onClick={this.onTopRightBtnClick}>
                    全部小票
                  </View> */}
                  {Number(cloudBillFlag) === CLOUD_BILL_FLAG.open && (
                    <View
                      className={styles.header_goshop__view}
                      onClick={() => {
                        this.props.dispatch({
                          type: 'cloudBill/init',
                          payload: {
                            mpErpId: Number(this.mpErpId)
                          }
                        })
                        Taro.navigateTo({ url: `/subpackages/cloud_bill/pages/all_goods/index` })
                      }}
                    >
                      <Image className={styles.header_goshop__view__icon} src={homePng} />
                      进店
                    </View>
                  )}
                </View>
              </View>
              <View className={styles.baseInfo}>
                <View className={styles.baseInfoItem}>
                  <View className={styles.itemTitle}>{t('batch')}</View>
                  <View className={styles.itemBot}>{main.billNo ? main.billNo : '-'}</View>
                </View>
                <View className={styles.baseInfoItem}>
                  <View className={styles.itemTitle}>{t('client')}</View>
                  <View
                    className={classNames(styles.itemBot, styles['itemBot--highlight'], {
                      [styles['itemBot--big']]: bigFontSize
                    })}
                  >
                    {/* bigFontSize */}
                    {main.compName ? main.compName : '-'}
                  </View>
                </View>
                <View className={styles.baseInfoItem}>
                  <View className={styles.itemTitle}>{t('clerk')}</View>
                  <View className={styles.itemBot}>{main.ownerName ? main.ownerName : '-'}</View>
                </View>
                <View className={styles.baseInfoDate}>
                  <View className={styles.itemTitle}>{t('date')}</View>
                  <View className={styles.itemBot}>{main.proDate ? main.proDate : '-'}</View>
                </View>
              </View>
              {fromAppShare && (showCompAddr || showCompPhone) && (
                <View className={styles.comp_info}>
                  <View className={styles.comp_info__angle}></View>
                  {showCompAddr && <Text selectable>{`${main.compAddr}`}</Text>}
                  {showCompPhone && <Text selectable>{`${main.compPhone}`}</Text>}
                </View>
              )}
              {cloudBillFlag !== CLOUD_BILL_FLAG.close &&
                Number(main.orderSource) === 8 &&
                main.deliverDtoList.length > 0 && (
                  <View className={styles.cloud_info}>
                    <View className={styles.cloud_info__header}>
                      <View className={styles.cloud_info__header__flag}>云单</View>
                      {`点击批次号可查看对应${params.type === '1' ? '订货单' : '销售单'}`}
                    </View>
                    <View className={styles.cloud_info__list}>
                      <Text>批次号：</Text>
                      {main.deliverDtoList.map(d => (
                        <View
                          className={styles.cloud_info__item}
                          key={d.billId}
                          onClick={() => this.onCheckBill(d.billId)}
                        >
                          {`#${d.billNo}`}
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              {main.logisNo && main.logisNo !== '' && (
                <View className={styles.express_info} onClick={this.onExpressClick}>
                  <View>
                    快递单号：<Text className={styles.express_info__logis_no}>{main.logisNo}</Text>
                  </View>
                  <View className={styles.express_info__highlight}>查看详情</View>
                </View>
              )}
              {newStyle === '1' ? this.renderDetsInSkus() : this.renderDetsInHeadSize()}
              {!fromAppShare && this.renderVerifyDets()}
              {/* 汇总信息 */}
              {fromAppShare ? (
                <DetailInfoViewFromShare
                  config={config}
                  main={main}
                  fieldConfig={fieldConfig}
                  saasType={Number(saasType)}
                  qrUrl={qrUrl}
                  type={params.type}
                  renderNotDeliver={this.renderNotDeliverDets()}
                  renderVerifyDets={this.renderVerifyDets()}
                  verifys={verifys}
                  useBigFont={bigFontSize}
                />
              ) : (
                <Block>
                  {this.renderDetails()}
                  {this.renderDownloadImages()}
                  {this.renderQRcode()}
                  {enableVisitor && this.renderCloudBillGoods()}
                </Block>
              )}
              {/* <Block>
                {this.renderDetails()}
                {this.renderDownloadImages()}
                {this.renderQRcode()}
                {this.renderCloudBillGoods()}
              </Block> */}
              <View className={styles.companyInfo}>
                <Image src={ecool} className={styles.companyLogo} />
                <View className={styles.companyTel}>
                  <Image src={left} className={styles.telLeft} />
                  <View>400 677 0909</View>
                  <Image src={right} className={styles.telRight} />
                </View>
              </View>
            </Block>
          ) : (
            <EmptyView
              style={{ height: '100vh' }}
              emptyInfo={{ label: '单据已作废', image: deprecated }}
              onButtonClick={this.goIndex}
              buttonLabel='查看所有小票'
              needShowButton
            ></EmptyView>
          )}

          {showGoodsDetail && (
            <View className={styles.modal}>
              {/* <View className={styles.modal} style={`height: ${modalHeight}px`} /> */}
              <View className={styles.closeIcon} onClick={this.onCloseClick}>
                <View className='at-icon at-icon-close-circle' />
              </View>
              <View className={styles.goodsDetail}>
                <View className={styles.goodsDetailTitle}>{t('goodsDetail')}</View>
                <View className={styles.goodsDetailInfo}>
                  {fieldConfig.showImage === '1' && (
                    <Image
                      mode='aspectFill'
                      className={styles.imgCover}
                      src={goodsItem.imgUrl ? goodsItem.imgUrl : defaultLogo2}
                    />
                  )}
                  <View className={styles.modalDetail}>
                    <View>
                      <View className={styles.modalGoodsName}>
                        {config.salesPrintMatName === '1' && (
                          <Text selectable>{goodsItem.name}</Text>
                        )}
                      </View>
                      <View className={styles.code}>
                        <Text selectable>{goodsItem.code}</Text>
                      </View>
                    </View>
                    <View>
                      {t('firstTime')}
                      <Text> {goodsItem.proDate}</Text>
                    </View>
                  </View>
                </View>
                <View className={styles.separateLine} />
                <View className={styles.modalGoodsInfo}>
                  <View className={styles.modalInfoItem}>
                    <View className={styles.modalItemTitle}>{goodsItem.saleNum}</View>
                    <View>{t('saleNum')}</View>
                    <View className={styles.modalItemTitleBot}>{goodsItem.backNum}</View>
                    <View>{t('backNum')}</View>
                  </View>
                  <View className={styles.modalInfoItem}>
                    <View className={styles.modalItemTitle}>{goodsItem.saleSum}</View>
                    <View>{t('saleSum')}</View>
                    <View className={styles.modalItemTitleBot}>{goodsItem.backSum}</View>
                    <View>{t('backSum')}</View>
                  </View>
                </View>
              </View>
            </View>
          )}
          {dropAnimation && (
            <View
              onTransitionEnd={this.onDropTransitionEnd}
              className={styles.drop}
              style={{ ...dropPosition }}
            ></View>
          )}
          {isVideoVisible && (
            <VideoPlayer
              src={videoSrc}
              onRequestClose={this.hideVideo}
              poster={videoPoster}
              imgs={imgs}
            />
          )}
          <Canvas style={qrCanvasStyle} id='qrurl' canvasId='qrurl'></Canvas>

          <DarkModeDetector />

          <SlideContainer
            visible={isPublicGuideVisible}
            direction={SlideDirection.Center}
            maxHeight={100}
            containerClass='bg_trans'
          >
            <View className={styles.guide_container} onClick={this.onGuideClick}>
              <Image src={followGuideBg} className={styles.guide} />
              <Image src={followGuideBtn} className={styles.guide__btn} />
            </View>
          </SlideContainer>
        </View>
      </CustomNavigation>
    )
  }
}

export default connect(mapStateToProps)(TicketDetailPage) as ComponentType
