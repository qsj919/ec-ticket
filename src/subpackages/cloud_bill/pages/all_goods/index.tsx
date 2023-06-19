import React, { PureComponent } from 'react'
import Taro, { Config, eventCenter, NodesRef } from '@tarojs/taro'
import { connect } from 'react-redux'
import deleteImg from '@/images/delete.png'
import { Image, Block, Text, View } from '@tarojs/components'
import CustomNavigation from '@components/CustomNavigation'
import cn from 'classnames'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import navigatorSvc from '@services/navigator'
import images from '@config/images'
import Tabs from '@components/Tabs'
import { recordVideoPlay } from '@api/apiManage'
import messageFeedback from '@services/interactive'
import { ALL_GOODS_TAB_ITEM, ALL_GOODS_PAGE_SIZE, storage } from '@constants/index'
import {
  getDateLabel,
  getTargerPastDays,
  urlQueryParse,
  daysDistance,
  getOneDate,
  getVieoList,
  compareVersion,
  getTaroParams
} from '@utils/utils'
import { getSpuActivity } from '@api/goods_api_manager'
import { ISpu } from '@@types/GoodsType'
import { round } from 'number-precision'
import EImage from '@components/EImage'
import { inviteJoinCloudBill, enableVisitorIn } from '@api/shop_api_manager'
import { Shop, ICloudBill, CloudSource, ScanError } from '@@types/base'
import backCircle from '@/images/icon/angle_left_circle_64.png'
import closeIcon from '@/images/icon/close_gray_32.png'
import searchImg from '@/images/search_icon_white.png'
import DefaultGood from '@/images/default_good_pic.png'
import DefaultShop from '@/images/default_shop_logo_fang.png'
import DeleteIcon from '@/images/close_white_circle.png'
import ChatIcon from '@/images/chat.png'
import CopySuccess from '@@/assets/images/copy_success.png'
import shopBgIcon from '@/images/shop_bg.png'
import { getVideoBrowseHistory, setVideoBrowseHistory } from '@api/user_api_manager'
import HomeIcon from '@/images/home_icon.png'
import MineIcon from '@/images/tabbar/mine.png'
import LoginView from '@components/LoginView/LoginView'
import NavigationToMini from '../../components/NavigationToMini'
import AllContentView from '../../components/AllContentView/AllContentView'
import attentionGuidance from '../../images/allgoods_attention_guidance.png'
import './index.scss'
import ColorSizeModelView from '../goods_detail/components/ColorSizeModelView'
import VideoList from '../../components/VideoList'

import CarIcon from '../../images/tabbar/car.png'
import ParagraphIcon from '../../images/tabbar/paragraph.png'
import ParagraphRedIcon from '../../images/tabbar/paragraph_red.png'
import ReplenishmentIcon from '../../images/tabbar/replenishment.png'
import ReplenishmentRedIcon from '../../images/tabbar/replenishment_red.png'
import VideoIcon from '../../images/tabbar/video.png'
import VideoRedIcon from '../../images/tabbar/video_red.png'
import AngleRightIcon from '../../images/angle_right_black.png'
// import CallShopIcon from '../../images/call_shop_icon.png'
import ClaccIcon from '../../images/class_icon.png'
import NoticeIcon from '../../images/notice_icon.png'
import SwitchModelIcon from '../../images/switch_model_icon.png'
import PictureIcon from '../../images/picture_icon.png'
import GoodsHeaderBg from '../../images/goods_hot_header.png'
import WechatIcon from '../../images/wechat_icon_small.png'
import PhoneIcon from '../../images/phone_icon_small.png'
import GoodsInfoView from '../../components/Goods/GoodsInfoView'
import ProductList from '../../components/Goods/ProductList'
import SpecialIcon from '../../images/special_icon.png'
import SnappedUpImmediately from '../../images/snapped_up_immediately_bg.png'
// import ColorSizeModelView from '../goods_detail/components/ColorSizeModelView'
// import { ColorSizeModeFromType } from '../goods_detail/type'
// DefaultDispatchProps

type PageState = {
  // shopInfo: Shop | null
  type: ICloudBill
  activeTabIndex: number
  isFilterVisible: boolean
  isShopInfoVisible: boolean
  maskIsShow: boolean
  searchKey: string
  enableVisitor: boolean
  tabsActiveKey: string
  switchTabIndex: number
  sortType: string
  callShopIsShow: boolean
  clipSuccessIsShow: boolean
  classId: number
  filterName: string
  todayNewIconIsShow: boolean
  scrollTop: number
  firstGotoVideo: boolean // 第一次进入视频导航
  biughtPageNo: number
  goodsVideoListPageNo: number
  vodeosPageNo: number
  filterMode: boolean // 分类时按全部样子显示。。。
  specialList: Array<ISpu>
  description: string
  isNeedLogin: boolean
  isSticky: boolean
}

const mapStateToProps = ({
  shop,
  systemInfo,
  user,
  cloudBill,
  loading,
  goodsManage
}: GlobalState) => {
  const _shop = shop.list.find(s => s.id === cloudBill.mpErpId)
  return {
    windowWidth: systemInfo.windowWidth,
    screenHeight: systemInfo.screenHeight,
    navigationHeight: systemInfo.navigationHeight,
    statusBarHeight: systemInfo.statusBarHeight,
    platform: systemInfo.platform,
    goodsList: cloudBill.goodsList,
    hotGoodsListTop40: cloudBill.hotGoodsListTop40,
    videos: cloudBill.videos,
    boughtGoodsList: cloudBill.boughtGoodsList,
    goodsVideoList: cloudBill.goodsVideoList,
    goodsListTotal: cloudBill.goodsListTotal,
    isLoadingMore:
      loading.effects['cloudBill/fetchGoodsList'] &&
      loading.effects['cloudBill/fetchGoodsList'].loading &&
      cloudBill.pageNo > 1,
    isLoading:
      loading.effects['cloudBill/fetchGoodsList'] &&
      loading.effects['cloudBill/fetchGoodsList'].loading,
    shop: _shop || ({} as Shop),
    shopListLoaded: shop.shopListLoaded,
    sessionId: user.sessionId,
    logining: user.logining,
    mpUserId: user.mpUserId,
    colorSizeVisible: cloudBill.colorSizeVisible,
    pageNo: cloudBill.pageNo,
    mpErpId: cloudBill.mpErpId,
    shopInfo: goodsManage.shopInfo,
    showPrice: cloudBill.shopParams.spuShowPrice === '1',
    shopBlackUser: cloudBill.shopParams.shopBlackUser === '1',
    orderPay: cloudBill.shopParams.orderPay === '1',
    subscribe: user.subscribe,
    attentionGuidanceIsShow: cloudBill.attentionGuidanceIsShow,
    classList: cloudBill.classList,
    recentlyUpGoodDay: cloudBill.recentlyUpGoodDay,
    data: cloudBill.videoPageData,
    phone: user.phone,
    nickName: user.nickName,
    hotSaleFlag: goodsManage.hotSaleFlag
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

const MiniTarBarList = [
  {
    icon: ParagraphIcon,
    label: '看款',
    key: 'paragraph',
    selectedIcon: ParagraphRedIcon
  },
  {
    icon: ReplenishmentIcon,
    label: '补货',
    key: 'replenishment',
    selectedIcon: ReplenishmentRedIcon
  },
  {
    icon: VideoIcon,
    label: '视频',
    key: 'video',
    selectedIcon: VideoRedIcon
  },
  {
    icon: CarIcon,
    label: '进货车',
    key: 'car',
    selectedIcon: CarIcon
  }
]
const IndependentTabbarList = [
  {
    icon: ParagraphIcon,
    label: '看款',
    key: 'paragraph',
    selectedIcon: ParagraphRedIcon
  },
  {
    icon: VideoIcon,
    label: '视频',
    key: 'video',
    selectedIcon: VideoRedIcon
  },
  {
    icon: CarIcon,
    label: '进货车',
    key: 'car',
    selectedIcon: CarIcon
  },
  {
    icon: MineIcon,
    label: '我的',
    key: 'mine',
    selectedIcon: MineIcon
  }
]

const GOODS_TABS_MENU = [
  {
    label: '最新',
    value: 'lastDate'
  },
  {
    label: '最多',
    value: 'num'
  }
]

// @connect(mapStateToProps)
class Index extends PureComponent<StateProps & DefaultDispatchProps, PageState> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  // config: Config = {
  //   navigationBarTextStyle: 'white',
  //   // backgroundTextStyle: 'light',
  //   // navigationBarTitleText: '云单',
  //   navigationStyle: 'custom',
  //   window: {
  //     allowsBounceVertical: 'NO'
  //   }
  // }

  tabsView

  static defaultProps = {
    shop: {}
  }

  constructor(props) {
    super(props)
    const p = getTaroParams(Taro.getCurrentInstance?.())
    const { type = ICloudBill.all } = p
    const _type = Number(type)
    this.state = {
      isFilterVisible: false,
      // shopInfo: null,
      type: _type,
      activeTabIndex: 0,
      isShopInfoVisible: false,
      maskIsShow: false,
      searchKey: '',
      enableVisitor: true,
      tabsActiveKey: 'paragraph',
      switchTabIndex: 0,
      sortType: 'lastDate',
      callShopIsShow: false,
      clipSuccessIsShow: false,
      classId: -1,
      filterName: '',
      todayNewIconIsShow: true,
      scrollTop: 0,
      firstGotoVideo: true,
      biughtPageNo: 1,
      goodsVideoListPageNo: 1,
      vodeosPageNo: 1,
      filterMode: false,
      specialList: [] as ISpu[],
      description: '',
      isNeedLogin: false,
      isSticky: false
    }
  }

  emptyInfo = {
    label: '商家暂未开通在线看款下单',
    image: images.empty.eticket_invite_cloud
  }

  currentListOptions: {
    marketOptimeBegin?: string
    marketOptimeEnd?: string
    type: number
    classId?: number
  } = {
    type: ALL_GOODS_TAB_ITEM.ALL_GOODS
  }

  isFirstPage: boolean
  firstGoRep: boolean = true
  firstGoVideo: boolean = true

  initFromLoginView = false

  componentDidMount(): void {
    const { shop, mpErpId } = this.props
    this.isFirstPage = Taro.getCurrentPages().length === 1
    if (this.props.logining || !this.props.sessionId) {
      Taro.showLoading({ title: '登录中...', mask: true })
    }

    // if (this.props.sessionId && getTaroParams(Taro.getCurrentInstance?.()).mpErpId) {
    //   this.init()
    // }

    // this.getEnableVisitorIn()

    // 获取tabsview元素作为参照物
    Taro.createSelectorQuery()
      .select('#tabsview')
      .boundingClientRect((res: any )=> {
        this.tabsView = res
      })
      .exec()

    // if (getTaroParams(Taro.getCurrentInstance?.()).tab === 'goods') {
    //   // this.onTabClick(1, ALL_GOODS_TAB_DATA[1])
    //   // this.setState({ activeTabIndex: 1 })
    // } else if (
    //   Number(getTaroParams(Taro.getCurrentInstance?.()).type) === ICloudBill.replenishment ||
    //   (shop && shop.cloudBillFlag !== 1)
    // ) {
    //   this.onTabClick(4, ALL_GOODS_TAB_DATA[4])
    // }
    // if (!this.props.logining) {
    //   setTimeout(() => {
    //     this.setState({ maskIsShow: this.props.subscribe === '0' })
    //   }, 3000)
    // }

    eventCenter.on('on_detail_reach_bottom', this.onScrollToLower)
    eventCenter.on('on_goods_add_click', this.onGoodsAddClick)
  }

  getScanError = () => {
    const { shop, data } = this.props
    if (
      process.env.INDEPENDENT === 'independent' ||
      process.env.INDEPENDENT === 'foodindependent'
    ) {
      return data.scanError
    } else {
      return this.state.isNeedLogin && shop && shop.independentType === 1 ? data.scanError : 0
    }
  }

  shouldLogin = (scanError?: number, phone?: string) => {
    // 在非独立部署中，只有shop.indepentType === 1的情况，并且点击货品，才需要
    // 在独立部署中，则需要满足scanError条件 并且 无手机号
    const { data, shop } = this.props
    let _scanError = scanError || data.scanError
    let _phone = phone || this.props.phone
    if (scanError === 0) {
      _scanError = 0
    }
    if (
      process.env.INDEPENDENT === 'independent' ||
      process.env.INDEPENDENT === 'foodindependent'
    ) {
      return (
        _scanError === ScanError.NONE_USER ||
        _scanError === ScanError.NONE_NICKNAME ||
        _scanError === ScanError.NONE_PHONE ||
        _scanError === ScanError.NONE_NICKNAME_AND_PHONE ||
        (!_phone && !this.props.logining)
      )
    } else {
      //
      return this.state.isNeedLogin && shop && shop.independentType === 1
    }
  }

  onGoodsAddClick = () => {
    const { shop, data } = this.props
    if (shop && shop.independentType === 1) {
      if (
        data.scanError === ScanError.NONE_USER ||
        data.scanError === ScanError.NONE_NICKNAME ||
        data.scanError === ScanError.NONE_PHONE ||
        data.scanError === ScanError.NONE_NICKNAME_AND_PHONE
      ) {
        this.setState({
          isNeedLogin: true
        })
      }
    }
  }
  onPageScroll(e) {
    // this._onPageScroll(e)
    if (this.tabsView) {
      if (e.scrollTop >= this.tabsView.top - this.tabsView.height - 60) {
        this.setState({
          isSticky: true
        })
      } else {
        this.setState({
          isSticky: false
        })
      }
      if (e.scrollTop >= this.tabsView.top - this.tabsView.height - 30) {
        this.setState({
          scrollTop: 40
        })
      }
    }

    if (e.scrollTop <= 40) {
      this.setState({
        scrollTop: e.scrollTop
      })
    }
  }

  getEnableVisitorIn = () => {
    if (this.props.sessionId && !this.props.logining) {
      const { shop } = this.props
      let _mpErpId = this.getMpErpId()
      if (shop && shop.independentType === 1) {
        this.props.dispatch({
          type: 'cloudBill/fetchVideoPageDataByMpErpId',
          payload: {
            mpErpId: _mpErpId
          }
        })
      }

      if (_mpErpId > 0) {
        recordVideoPlay({ mpErpId: _mpErpId })
        enableVisitorIn({
          mpErpId: _mpErpId,
          mpUserId: this.props.mpUserId
        }).then(({ data, code }) => {
          if (data.val) {
            this.props.dispatch({
              type: 'cloudBill/init',
              payload: { mpErpId: Number(_mpErpId), cloudSource: CloudSource.PUBLIC }
            })
            this.fetchSpecialGoodsList()
            this.props.dispatch({
              type: 'cloudBill/fetchHotGoodsListTop40',
              payload: { mpErpId: _mpErpId }
            })
            this.props.dispatch({
              type: 'goodsManage/selelctShopProfileInformation',
              payload: {
                mpErpId: _mpErpId
              }
            })
            this.props.dispatch({ type: 'goodsManage/selectShopHotSale' })
          }
          getVideoBrowseHistory({ mpErpId: _mpErpId })
            .then(res => {
              const { data } = res || {}
              const { val } = data || {}
              this.setState({ firstGotoVideo: val })
            })
            .catch(error => {
              this.setState({ firstGotoVideo: true })
            })
          this.setState({
            enableVisitor: data.val
          })
        })
      }
    }
  }

  componentDidUpdate(prevProps: Readonly<StateProps>): void {
    const { shop, shopListLoaded } = this.props
    const prevShop = prevProps.shop
    if (shop && (!prevShop || shop.shopName !== prevShop.shopName)) {
      Taro.setNavigationBarTitle({ title: shop.shopName })
    }
    // if (!prevProps.sessionId && this.props.sessionId) {
    //   this.getEnableVisitorIn()
    // }
    const shouLoginBefore = this.shouldLogin(prevProps.data.scanError, prevProps.phone)
    const shouLoginNow = this.shouldLogin()
    const shouldInit = shouLoginBefore && !shouLoginNow
    if (this.props.sessionId && shopListLoaded && this.props.mpErpId === -1) {
      this.init()
      Taro.hideLoading()
    }
  }

  componentDidShow() {
    // 同时打开了门店A 、门店B的情况。
    const pageMpErpId = Number(this.getMpErpId())
    if (
      this.props.mpErpId !== -1 &&
      !Number.isNaN(pageMpErpId) &&
      this.props.mpErpId !== pageMpErpId
    ) {
      this.init()
    }
  }

  componentWillUnmount(): void {
    this.props.dispatch({ type: 'cloudBill/resetShopRelative' })
    eventCenter.off('on_detail_reach_bottom', this.onScrollToLower)
    eventCenter.off('on_goods_add_click', this.onGoodsAddClick)
  }

  getMpErpId = () => {
    let _mpErpId
    const { q, mpErpId, query } = getTaroParams(Taro.getCurrentInstance?.())

    if (this.props.mpErpId) {
      _mpErpId = this.props.mpErpId
    }

    if (q) {
      const { mpErpId } = urlQueryParse(decodeURIComponent(q))
      if (mpErpId) {
        _mpErpId = mpErpId
      }
    }
    if (mpErpId) {
      _mpErpId = mpErpId
    }

    if (query && query['mpErpId']) {
      _mpErpId = query['mpErpId']
    }

    return _mpErpId
  }

  // 从公众号通知进来需要初始化
  init = () => {
    // eslint-disable-next-line no-undef
    // const options = wx.getEnterOptionsSync()
    // const fromAppShare = options.scene == 1043
    if (this.shouldLogin() || !this.props.sessionId) return
    let _mpErpId = this.getMpErpId()
    if (_mpErpId > 0) {
      this.getEnableVisitorIn()

      const currentVersion = Taro.getSystemInfoSync().SDKVersion || '1.1.0'

      const goUserInfo = compareVersion(currentVersion, '2.27.1') >= 0

      if (goUserInfo && (this.props.nickName === '微信用户' || this.props.nickName === '')) {
        Taro.navigateTo({ url: '/subpackages/mine/pages/user_info/index?showTip=1' })
      }
      return
    }
  }

  onBackClick = () => {
    const pages = Taro.getCurrentPages()
    if (pages.length === 1) {
      Taro.switchTab({ url: '/pages/cloud_bill_tab/index' })
    } else {
      Taro.navigateBack()
    }
  }

  fetchList = (payload = {}) => {
    const { searchKey, sortType, tabsActiveKey } = this.state
    return this.props.dispatch({
      type: 'cloudBill/fetchGoodsList',
      payload: {
        ...this.currentListOptions,
        lastPrice: true,
        styleNameLike: searchKey.trim() === '' ? undefined : searchKey,
        orderBy: tabsActiveKey === 'replenishment' ? sortType : undefined,
        ...payload
      }
    })
  }

  fetchBoughGoodsList = (loadMore = false) => {
    this.setState(
      prevState => ({
        biughtPageNo: loadMore ? prevState.biughtPageNo + 1 : 1
      }),
      this.dispatchBoughtGoodList
    )
  }

  onTabClick = (index: number, data) => {
    // 清空搜索栏
    this.setState({ activeTabIndex: index })
    if (this.shouldLogin()) return
    Taro.eventCenter.trigger('CLEAR_SEARCH_TOKEN')
    let type = data.value
    if (type === ALL_GOODS_TAB_ITEM.SPECIAL) {
      if (!this.state.specialList.length) {
        this.fetchSpecialGoodsList()
      }
      return
    }
    let marketOptimeBegin, marketOptimeEnd
    if (type === ALL_GOODS_TAB_ITEM.NEW) {
      // 新品逻辑
      type = ALL_GOODS_TAB_ITEM.ALL
      const r = getTargerPastDays(30)
      marketOptimeBegin = r.startDate
      marketOptimeEnd = r.endDate
      this.setState({
        todayNewIconIsShow: false
      })
    }
    this.currentListOptions = {
      ...this.currentListOptions,
      type,
      marketOptimeBegin,
      marketOptimeEnd
    }
    const { shop } = this.props
    if (type === ALL_GOODS_TAB_ITEM.VIDEO) {
      // this.props.dispatch({ type: 'cloudBill/clearGoodsList' })
      return
    }
    this.props.dispatch({
      type: 'cloudBill/save',
      payload: {
        goodsList: []
      }
    })
    this.fetchList()
  }

  fetchSpecialGoodsList = () => {
    const _mpErpId = this.getMpErpId()
    if (_mpErpId) {
      const params = {
        pageSize: 300,
        pageNo: 1,
        type: 10,
        mpErpId: _mpErpId
      }
      getSpuActivity(params)
        .then(({ data }) => {
          this.setState({
            specialList: data.spuList,
            description: data.description
          })
        })
        .catch(() => {})
    }
  }

  onCartClick = () => {
    navigatorSvc.navigateTo({ url: '/subpackages/cloud_bill/pages/replenishment/index' })
  }

  onMineClick = () => {
    navigatorSvc.navigateTo({ url: '/subpackages/independent/pages/mine/index' })
  }

  onOrderClick = () => {
    const pages = Taro.getCurrentPages()
    const page = pages[pages.length - 2]
    if (page && page.route === 'subpackages/mine/pages/order_ticket_list/index') {
      Taro.navigateBack()
    } else {
      navigatorSvc.navigateTo({ url: '/subpackages/mine/pages/order_ticket_list/index' })
    }
  }

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.onScrollToLower()
  }

  onScrollToLower = () => {
    const { tabsActiveKey } = this.state
    if (tabsActiveKey === 'paragraph') {
      if (this.state.activeTabIndex === 0) {
        if (
          (this.props.goodsList && this.props.goodsList.length) <
          (ALL_GOODS_PAGE_SIZE - ALL_GOODS_PAGE_SIZE / 4) * this.props.pageNo
        )
          return
      } else {
        if (
          (this.props.goodsList && this.props.goodsList.length) <
          ALL_GOODS_PAGE_SIZE * this.props.pageNo
        )
          return
      }
      this.fetchList({ loadMore: true })
    }

    if (tabsActiveKey === 'replenishment') {
      if (
        (this.props.boughtGoodsList && this.props.boughtGoodsList.length) <
        ALL_GOODS_PAGE_SIZE * this.state.biughtPageNo
      )
        return
      this.fetchBoughGoodsList(true)
    }

    if (tabsActiveKey === 'video') {
      this.loadMoreVideosList()
    }
  }

  loadMoreVideosList = () => {
    if (this.props.videos.length >= this.state.vodeosPageNo * 20) {
      this.setState(
        prevState => {
          return {
            vodeosPageNo: prevState.vodeosPageNo + 1
          }
        },
        () => {
          this.props.dispatch({
            type: 'cloudBill/fetchShopVideos',
            payload: {
              pageNo: this.state.vodeosPageNo
            }
          })
        }
      )
    }
    if (this.props.goodsVideoList.length >= this.state.goodsVideoListPageNo * 20) {
      this.setState(
        prevState => {
          return {
            goodsVideoListPageNo: prevState.goodsVideoListPageNo + 1
          }
        },
        () => {
          this.props.dispatch({
            type: 'cloudBill/fetchVideoGoodsList',
            payload: {
              pageNo: this.state.goodsVideoListPageNo
            }
          })
        }
      )
    }
  }

  onInviteJoinCloudClick = () => {
    if (this.shouldLogin()) {
      this.setState({ isNeedLogin: true })
      return
    }
    messageFeedback.showToast('已为您提醒ta开通', 2000)
    inviteJoinCloudBill({ mpErpId: this.props.mpErpId })
  }

  onFilterClick = () => {
    if (!this.state.enableVisitor) return
    this.setState(state => ({
      isFilterVisible: !state.isFilterVisible
    }))
  }

  onShopInfoClick = () => {
    this.setState(state => ({ isShopInfoVisible: !state.isShopInfoVisible }))
  }

  onAttentionGuidanceClick() {
    Taro.navigateTo({ url: '/subpackages/functional/pages/pub_web/index' })
    this.onHideMask()
  }

  onHideMask() {
    this.setState({ maskIsShow: false })
    this.props.dispatch({ type: 'cloudBill/resetAttention' })
  }

  setPageScroll = value => {
    Taro.pageScrollTo({
      scrollTop: value,
      duration: 0
    })
  }

  onTabbarClick = e => {
    const { _idx, _key } = e.currentTarget.dataset
    if (_key !== this.state.tabsActiveKey) {
      const { activeTabIndex, firstGotoVideo, enableVisitor } = this.state
      const {
        videos,
        goodsVideoList,
        boughtGoodsList,
        goodsList,
        mpErpId,
        shopBlackUser
      } = this.props
      if (_key !== 'car' && _key !== 'mine') {
        this.setState(
          {
            tabsActiveKey: _key
          },
          () => {
            // 买过 补货逻辑
            if (_key === 'replenishment') {
              if (this.firstGoRep) {
                this.setPageScroll(0)
                this.firstGoRep = false
              }
              if (!boughtGoodsList.length) {
                this.dispatchBoughtGoodList()
              }
            }
            if (_key === 'paragraph') {
              if (!goodsList) {
                this.onTabClick(activeTabIndex, this.getTabsMenu()[activeTabIndex])
              }
            }
            if (_key === 'video') {
              if (this.firstGoVideo) {
                this.setPageScroll(0)
                this.firstGoVideo = false
              }
              // 第一次进入视频导航
              if (firstGotoVideo && enableVisitor && !shopBlackUser) {
                const list = getVieoList(videos, goodsVideoList)
                const { id } = list[0] || {}
                if (list && list.length > 0) {
                  Taro.navigateTo({
                    url: `/subpackages/cloud_bill/pages/single_shop_videos/index?videoId=${id}`
                  })
                }
                // 防止过早显示videoList
                setTimeout(() => {
                  this.setState({ firstGotoVideo: false })
                }, 500)
                setVideoBrowseHistory({ mpErpId, videoId: -1 }).catch(error => {
                  //
                })
              }
            }
          }
        )
      } else {
        if (_key === 'car') {
          this.onCartClick()
        } else {
          this.onMineClick()
        }
      }
    }
  }

  onSwitchTabClick = () => {
    this.setState(state => {
      return {
        switchTabIndex: state.switchTabIndex === 0 ? 1 : 0
      }
    })
  }

  dispatchBoughtGoodList = () => {
    this.props.dispatch({
      type: 'cloudBill/fetchBoughtGoodsList',
      payload: {
        pageNo: this.state.biughtPageNo,
        orderBy: this.state.sortType
      }
    })
  }

  onGoodsTabsClick = e => {
    this.setState(
      {
        sortType: e.currentTarget.dataset._value
      },
      this.dispatchBoughtGoodList
    )
  }

  onAddClick = e => {
    const { styleid } = e.currentTarget.dataset
    this.props.dispatch({
      type: 'cloudBill/showColorSizeInList',
      payload: { spuId: styleid }
    })
  }

  onCallShop = () => {
    this.setState({
      callShopIsShow: true
    })
    // Taro.navigateTo({
    //   url: '/subpackages/independent/pages/check_before_order/index'
    // })
  }

  onCallShopClose = () => {
    this.setState({
      callShopIsShow: false
    })
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

  callPhone = () => {
    if (this.props.shopInfo.phone) {
      Taro.makePhoneCall({
        phoneNumber: this.props.shopInfo.phone || ''
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

  onItemClick = item => {
    if (!this.state.enableVisitor) return
    this.props.dispatch({
      type: 'cloudBill/fetchGoodsDetail',
      payload: { spuId: item.styleId, goodsDtail: { ...item, skus: [] } }
    })
    navigatorSvc.navigateTo({
      url: `/subpackages/cloud_bill/pages/goods_detail/index?spuId=${item.id}`
    })
  }

  onSpecialItemClick = e => {
    if (this.state.enableVisitor) {
      const { _id } = e.currentTarget.dataset
      const data = this.state.specialList.find(item => item.styleId === Number(_id))
      this.onItemClick(data)
    }
  }

  onBuySpecialClick = e => {
    e.stopPropagation()
    const { _id } = e.currentTarget.dataset
    this.props.dispatch({
      type: 'cloudBill/showColorSizeInList',
      payload: { spuId: _id }
    })
  }

  onClassClearClick = () => {
    this.onClassItemClick({
      codeValue: this.state.classId,
      codeName: this.state.filterName
    })
  }

  onSearch = () => {
    if (!this.state.enableVisitor) return
    navigatorSvc.navigateTo({ url: '/subpackages/cloud_bill/pages/all_goods_search_view/index' })
  }

  onClassItemClick = item => {
    const { shop } = this.props
    const shopName = shop.shopName || ''
    Taro.navigateTo({
      url: `/subpackages/cloud_bill/pages/all_goods_category/index?codeValue=${item.codeValue}&shopName=${shopName}`
    })
    // let _classId
    // let filterName = ''
    // if (item.codeValue === this.state.classId) {
    //   _classId = -1
    //   filterName = ''
    // } else {
    //   _classId = item.codeValue
    //   filterName = item.codeName
    // }
    // this.setState(
    //   {
    //     classId: _classId,
    //     filterName,
    //     isFilterVisible: false
    //   },
    //   () => {
    //     this.currentListOptions = {
    //       ...this.currentListOptions,
    //       type: this.state.classId < 0 ? ALL_GOODS_TAB_ITEM.ALL_GOODS : ALL_GOODS_TAB_ITEM.ALL,
    //       classId: _classId < 0 ? undefined : _classId
    //     }
    //     this.fetchList({ marketOptimeBegin: undefined, marketOptimeEnd: undefined }).then(() => {
    //       this.setState({
    //         filterMode: _classId > 0
    //       })
    //     })
    //   }
    // )
  }
  getNewList = () => {
    const { goodsList = [] } = this.props
    let list = {}
    if (goodsList) {
      goodsList.forEach(item => {
        let _marketDate = (item.marketDate && item.marketDate.split(' ')[0]) || ''
        if (list.hasOwnProperty(_marketDate)) {
          list[_marketDate].push({ ...item })
        } else {
          list[_marketDate] = [{ ...item }]
        }
      })
    }
    return list
  }

  onImageModelClick = (date, _idx) => {
    if (!this.state.enableVisitor) return
    const list = this.getNewList()
    this.props.dispatch({
      type: 'cloudBill/save',
      payload: {
        toDayNewGoodsList: [...list[date]]
      }
    })
    Taro.navigateTo({
      url: `/subpackages/cloud_bill/pages/goods_detail/goods_detail_new?_idx=${_idx}&from=allGoods`
    })
  }

  getTabsMenu = () => {
    const { shopInfo } = this.props
    let menu = [
      { label: '全部', value: ALL_GOODS_TAB_ITEM.ALL_GOODS },
      { label: '上新', value: ALL_GOODS_TAB_ITEM.NEW },
      { label: shopInfo.activityNames[2], value: ALL_GOODS_TAB_ITEM.HOT }
    ]
    if (this.state.specialList.length) {
      menu.push({ label: shopInfo.activityNames[10], value: ALL_GOODS_TAB_ITEM.SPECIAL })
    }
    return menu
  }

  getTabbarList = () => {
    return process.env.INDEPENDENT === 'independent' ? IndependentTabbarList : MiniTarBarList
  }

  renderTabbarView = () => {
    const { tabsActiveKey } = this.state
    const { platform } = this.props
    const TarBarList = this.getTabbarList()
    return (
      <View
        className='all_goods__tabs'
        style={{
          height: platform === 'ios' ? 80 + 'px' : 50 + 'px'
        }}
      >
        {TarBarList.map((t, _idx) => (
          <View
            className='all_goods__tabs__item col aic'
            key={t.key}
            data-_idx={_idx}
            data-_key={t.key}
            onClick={this.onTabbarClick}
          >
            <Image
              src={t.key === tabsActiveKey ? t.selectedIcon : t.icon}
              className='all_goods__tabs__item__icon'
            />
            <Text
              style={{
                color: t.key === tabsActiveKey ? '#E62E4D' : '#222222'
              }}
            >
              {t.label}
            </Text>
          </View>
        ))}
      </View>
    )
  }

  renderGoodsDate = (dayCount, _date) => {
    const today = new Date()
    return (
      <Block>
        {dayCount === 0 ? '今日上新' : ''}
        {dayCount !== 0 ? (
          _date.getFullYear() === today.getFullYear() ? (
            <Text>{`${_date.getMonth() + 1}月${_date.getDate()}日`}</Text>
          ) : (
            <View>
              <View className='yearTitle'>{_date.getFullYear()}年</View>
              <View>{`${_date.getMonth() + 1}月${_date.getDate()}日`}</View>
            </View>
          )
        ) : (
          ''
        )}
      </Block>
    )
  }

  renderNewGoodsListModel = () => {
    const list = this.getNewList()
    const _keys = Object.keys(list)
    const { isLoading } = this.props
    return (
      <View>
        {_keys.length ? (
          <View className='new_goods_model_view'>
            {_keys.map(date => {
              let _date = new Date(date)
              let dayCount = daysDistance(date)
              return (
                <View key={date}>
                  <View className='new_goods_model_view__time aic'>
                    {this.renderGoodsDate(dayCount, _date)}
                  </View>
                  {this.renderHotGoodsList(list[date])}
                </View>
              )
            })}
          </View>
        ) : (
          !isLoading && <View className='no_data aic jcc'>店铺暂无上新货品</View>
        )}
      </View>
    )
  }

  renderSpecialGoods = () => {
    const { specialList = [], description, enableVisitor } = this.state
    const { showPrice } = this.props

    return (
      <View className='special_model_view'>
        <View className='special_model_view__header jcc aic'>
          <View className='special_model_view__header__content aic'>
            <Image src={NoticeIcon} className='icon_size' />
            <Text className='notice_label'>{description || '特价清仓商品，不退不换'}</Text>
          </View>
        </View>
        <View className='special_model_view__content col'>
          {specialList.map(item => (
            <View
              key={item.styleId}
              className='special_model_view__content__item aic'
              data-_id={item.styleId}
              onClick={this.onSpecialItemClick}
            >
              <View className='special_model_view__content__item__goodsImage'>
                {item.imgUrls ? (
                  <EImage mode='aspectFill' src={item.imgUrls} />
                ) : (
                  <EImage mode='aspectFill' src={item.imgUrl || DefaultGood} />
                )}
                {!enableVisitor && <View className='blur_special_goods'></View>}
              </View>
              {enableVisitor && (
                <View className='special_model_view__content__item__goodsInfo'>
                  <View className='special_model_view__content__item__goodsInfo__view aic'>
                    <Image src={SpecialIcon} className='special_icon' />
                    <Text className='special_goods_name'>{item.name}</Text>
                  </View>
                  <View className='special_model_view__content__item__goodsInfo__view'>
                    <Text className='special_goods_code'>{item.code}</Text>
                  </View>
                  {showPrice && (
                    <View className='special_model_view__content__item__goodsInfo__view aic'>
                      <View className='special_goods_price'>
                        <Text style='font-size:11px'>¥</Text>
                        {round(item.price, 3)}
                      </View>
                      <View className='special_goods_underline_price'>¥{item.originPrice}</View>
                    </View>
                  )}
                </View>
              )}
              {!enableVisitor && (
                <View className='special_model_view__content__item__goodsInfo'>
                  <View className='blur_goods_name'></View>
                  <View className='blur_goods_code'></View>
                  <View className='blur_goods_price'></View>
                </View>
              )}
              {enableVisitor && (
                <View
                  className='snapped_up_immediately'
                  data-_id={item.styleId}
                  onClick={this.onBuySpecialClick}
                >
                  <Image src={SnappedUpImmediately} style='width:100%;height:100%;' />
                  <Text className='snapped_up_immediately__label'>立即抢购</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    )
  }

  renderImageModelView = () => {
    const list = this.getNewList()
    const { enableVisitor } = this.state
    const _list = Object.keys(list)
    const { isLoading } = this.props
    return (
      <View className='image_model_view'>
        <View className='image_model_view__content'>
          {_list.length
            ? _list.map(date => {
                let _date = new Date(date)
                let dayCount = daysDistance(date)
                return (
                  <View key={date} className='image_model_view__content__item'>
                    <View className='image_model_view__content__item__left'>
                      {this.renderGoodsDate(dayCount, _date)}
                    </View>
                    <View className='image_model_view__content__item__right'>
                      {list[date].map((good, _idx) => (
                        <View
                          key={good.id}
                          className='image_model_view__content__item__right__item'
                          onClick={this.onImageModelClick.bind(this, date, _idx)}
                        >
                          {good.imgUrls ? (
                            <EImage mode='aspectFill' src={good.imgUrls} />
                          ) : (
                            <Image
                              style='width:100%;height:100%'
                              mode='aspectFill'
                              src={DefaultGood}
                            />
                          )}
                          {!enableVisitor && <View className='pic_blur_goods'></View>}
                        </View>
                      ))}
                    </View>
                  </View>
                )
              })
            : !isLoading && <View className='no_data aic jcc'>店铺暂无上新货品</View>}
        </View>
      </View>
    )
  }

  renderHotGoodsList = goodsList => {
    const { showPrice } = this.props
    const { enableVisitor } = this.state
    return (
      <View className='hot_goods__view'>
        {goodsList.map(good => (
          <View className='good_items_allGoods' key={good.id}>
            <View>
              <ProductList
                useLastPrice
                size='small'
                data={good}
                onItemClick={data => this.onItemClick(data)}
                showPrice={showPrice}
                from='allGoods'
                blur={!enableVisitor}
              />
            </View>
          </View>
        ))}
      </View>
    )
  }

  renderGoodsView = () => {
    const { activeTabIndex, switchTabIndex, enableVisitor, type, filterMode } = this.state
    const { goodsList, isLoadingMore, pageNo, showPrice, isLoading } = this.props
    const _hotGoods = goodsList.filter(good => good.hotFlag === 1)
    const _goodsList = this.props.hotSaleFlag === '1' ? goodsList.filter(g => g.hotFlag === 0) : []

    return (
      <View className='rightView'>
        {activeTabIndex === 1 && !filterMode && (
          <View className='category_wrap__content__new aic jcsb'>
            <View className='category_wrap__content__new__notice aic'>
              <Image src={NoticeIcon} className='icon_size' />
              <Text className='category_wrap__content__new__notice__content'>
                本店新款已上新，欢迎看款下单~
              </Text>
            </View>
            <View className='category_wrap__content__new__tabs' onClick={this.onSwitchTabClick}>
              <Image
                src={switchTabIndex === 0 ? SwitchModelIcon : PictureIcon}
                className='icon_size'
              />
              <Text style='margin-left: 8rpx;'>
                {switchTabIndex === 0 ? '商品模式' : '图片模式'}
              </Text>
            </View>
          </View>
        )}
        {activeTabIndex === 2 && !filterMode && (
          <Block>
            {_hotGoods.length && (
              <View className='category_wrap__content__hot'>
                <Image src={GoodsHeaderBg} className='category_wrap__content__hot__header' />
                <View className='category_wrap__content__hot__content'>
                  {_hotGoods.map(hotgood => (
                    <View
                      key={hotgood.id}
                      onClick={this.onItemClick.bind(this, hotgood)}
                      className='category_wrap__content__hot__content__item'
                    >
                      <View className='category_wrap__content__hot__content__item__goodsImage'>
                        {hotgood.imgUrls ? (
                          <EImage src={hotgood.imgUrls} mode='aspectFill' />
                        ) : (
                          <Image src={DefaultGood} style='width:100%;height:100%;' />
                        )}
                        <View className='category_wrap__content__hot__content__item__goodsImage__code aic jcc'>
                          {hotgood.code}
                        </View>
                        {!enableVisitor && <View className='pic_blur_goods' />}
                      </View>
                      <View style='position: relative;'>
                        <GoodsInfoView
                          blur={!enableVisitor}
                          data={hotgood}
                          from='allGoods'
                          showPrice={showPrice}
                          noShowCode
                          useLastPrice
                        />
                      </View>
                    </View>
                  ))}
                  {_hotGoods.length % 3 === 2 && (
                    <View className='category_wrap__content__hot__content__item' />
                  )}
                </View>
              </View>
            )}
            <View className='hot_goods__view' style={{ marginTop: _hotGoods.length ? '16px' : 0 }}>
              {this.renderHotGoodsList(_goodsList)}
            </View>
            {!_hotGoods.length && !_goodsList.length && !isLoading && (
              <View className='no_data aic jcc'>暂未找到爆款货品</View>
            )}
          </Block>
        )}
        {(activeTabIndex === 0 || filterMode) && (
          <AllContentView
            useLastPrice
            tabIndex={activeTabIndex}
            from='allGoods'
            effectsName='cloudBill/fetchGoodsList'
            dresStyleResultList={goodsList}
            loadMoreDataVisible={isLoadingMore}
            enableVisitorIn={enableVisitor}
            noMoreDataVisible={
              !isLoadingMore && (goodsList && goodsList.length) < pageNo * ALL_GOODS_PAGE_SIZE
            }
            onButtonClick={this.onInviteJoinCloudClick}
            listHeight='calc(100vh - 400rpx)'
            showPrice={showPrice}
            emptyInfo={
              this.shouldLogin()
                ? { label: '登录后查看全部商品', image: images.noData.no_goods_v2 }
                : undefined
            }
            buttonLabel={this.shouldLogin() ? '立即登录' : ''}
          />
        )}
        {activeTabIndex === 1 &&
          !filterMode &&
          (switchTabIndex === 0 ? this.renderImageModelView() : this.renderNewGoodsListModel())}
        {activeTabIndex === 3 && this.renderSpecialGoods()}
      </View>
    )
  }

  renderReplenishmentView = () => {
    const { sortType, enableVisitor } = this.state
    const { boughtGoodsList = [], isLoading, hotGoodsListTop40 = [], shopBlackUser } = this.props
    return (
      <View className='rightView'>
        {boughtGoodsList.length ? (
          <Block>
            <View className='rightView__replen_header aic jcsb'>
              <View className='rightView__replen_header__label'>本店历史拿货，一键补货</View>
              <View className='rightView__replen_header__orderTabs'>
                {GOODS_TABS_MENU.map(item => (
                  <View
                    key={item.value}
                    className='rightView__replen_header__orderTabs___item'
                    style={{
                      backgroundColor: `${sortType === item.value ? '#fff' : ''}`,
                      boxShadow: `${sortType === item.value ? '0 3px 7px rgba(0, 0, 0, 0.15)' : ''}`
                    }}
                    data-_value={item.value}
                    onClick={this.onGoodsTabsClick}
                  >
                    {item.label}
                  </View>
                ))}
              </View>
            </View>
            <View className='rightView__replen_content aic'>
              {boughtGoodsList.map(good => (
                <View key={good.id} className='rightView__replen_content__item aic'>
                  <View className='rightView__replen_content__item__headerImage'>
                    {good.imgUrls ? (
                      <EImage src={good.imgUrls} mode='aspectFill' />
                    ) : (
                      <Image src={DefaultGood} style='width:100%;height:100%;' />
                    )}
                    {!enableVisitor && <View className='pic_blur_goods' />}
                  </View>
                  <View className='rightView__replen_content__item__content'>
                    <View
                      className={cn('replen_goodsName', {
                        ['blur_goodsinfo']: !enableVisitor
                      })}
                    >
                      {good.name}
                    </View>
                    <View
                      className={cn('replen_goodsCode', {
                        ['blur_goodsinfo']: !enableVisitor
                      })}
                    >
                      {good.code}
                    </View>
                    {enableVisitor && (
                      <View className='aic'>
                        <View className='replen_goodsTime aic jcc'>
                          {getDateLabel(good.lastDate && good.lastDate.split(' ')[0])}
                        </View>
                        <View className='replen_goodsTime aic jcc'>{`累计${good.num ||
                          '0'}件`}</View>
                      </View>
                    )}
                  </View>
                  {!(good.flag === 1 || good.marketFlag === 0) && enableVisitor && !shopBlackUser && (
                    <View
                      data-styleid={good.styleId}
                      className='rightView__replen_content__item__action aic jcc'
                      onClick={this.onAddClick}
                    >
                      补货
                    </View>
                  )}
                </View>
              ))}
            </View>
          </Block>
        ) : (
          !isLoading && (
            <View className='aic col'>
              <View className='no_data aic jcc'>暂未找到拿货记录</View>
              {hotGoodsListTop40.length > 0 && <View className='no_data__title'>本店爆款推荐</View>}
              {this.renderHotGoodsList(hotGoodsListTop40)}
            </View>
          )
        )}
      </View>
    )
  }

  renderSetClipSuccess = () => {
    return (
      <View className='all_goods__mask'>
        <View className='all_goods__mask__clipSuccess'>
          <View className='all_goods__mask__clipSuccess__title'>复制成功</View>
          <View className='all_goods__mask__clipSuccess__label'>打开微信复制搜索</View>
          <View className='all_goods__mask__clipSuccess__successContent'>
            <Image src={CopySuccess} style='width:100%;height:100%;' />
          </View>
          <View
            className='all_goods__mask__clipSuccess__action aic jcc'
            onClick={this.onSuccessClick}
          >
            好的
          </View>
        </View>
      </View>
    )
  }

  renderCallShopView = () => {
    const { shopInfo } = this.props

    return (
      <View className='all_goods__mask' onClick={this.onCallShopClose}>
        <View className='all_goods__mask__content' onClick={e => e.stopPropagation()}>
          <View className='all_goods__mask__content__header aic jcc'>
            联系我们
            <Image
              src={closeIcon}
              className='all_goods__mask__content__header__icon'
              onClick={this.onCallShopClose}
            />
          </View>
          {shopInfo.wxQrUrl && (
            <Image
              src={shopInfo.wxQrUrl}
              showMenuByLongpress
              className='all_goods__mask__content__wxcode'
              onClick={this.onWxcodeClick}
            />
          )}
          {shopInfo.wxQrUrl && (
            <View className='all_goods__mask__content__bg'>点击二维码后长按，添加店主微信</View>
          )}
          {(shopInfo.wxCode || shopInfo.phone) && (
            <View className='all_goods__mask__content__box'>
              {shopInfo.wxCode && (
                <View className='all_goods__mask__content__contact aic jcsb'>
                  <View className='aic'>
                    <Image className='all_goods__mask__content__contact__icon' src={WechatIcon} />
                    <Text className='contact_label'>{shopInfo.wxCode}</Text>
                  </View>
                  <View
                    className='all_goods__mask__content__contact__actionView aic jcc'
                    onClick={this.setClipboardData}
                  >
                    复制微信
                  </View>
                </View>
              )}
              {shopInfo.phone && (
                <View className='all_goods__mask__content__contact aic jcsb'>
                  <View className='aic'>
                    <Image className='all_goods__mask__content__contact__icon' src={PhoneIcon} />
                    <Text className='contact_label'>{shopInfo.phone}</Text>
                  </View>
                  <View
                    className='all_goods__mask__content__contact__actionView aic jcc'
                    onClick={this.callPhone}
                  >
                    拨打电话
                  </View>
                </View>
              )}
            </View>
          )}
          {!shopInfo.wxCode && !shopInfo.phone && (
            <View className='no_data aic jcc' style='background-color:#fff;flex:1;margin-top:0px'>
              档口还没有留下联系方式
            </View>
          )}
        </View>
      </View>
    )
  }

  getEaseInOutValue = () => {
    const { scrollTop } = this.state
    if (scrollTop >= 40) {
      return [0, 40, 432]
    }
    if (scrollTop <= 0) {
      return [1, 0, 64]
    }
    return [(40 - scrollTop) / 40, scrollTop, scrollTop * 9.2 + 64]
  }

  render() {
    const values = this.getEaseInOutValue()
    const _mpErpId = this.getMpErpId()
    const {
      navigationHeight,
      statusBarHeight,
      colorSizeVisible,
      windowWidth,
      shop,
      shopInfo,
      attentionGuidanceIsShow,
      classList,
      screenHeight,
      goodsList,
      hotGoodsListTop40,
      recentlyUpGoodDay,
      shopBlackUser,
      boughtGoodsList,
      goodsListTotal,
      data
    } = this.props
    const _recentlyUpGoodDay = daysDistance(recentlyUpGoodDay)
    const {
      isFilterVisible,
      activeTabIndex,
      isShopInfoVisible,
      maskIsShow,
      enableVisitor,
      tabsActiveKey,
      callShopIsShow,
      clipSuccessIsShow,
      classId,
      filterName,
      type,
      todayNewIconIsShow,
      firstGotoVideo,
      scrollTop,
      filterMode,
      isNeedLogin,
      isSticky
    } = this.state
    const headerHeight = (132 * windowWidth) / 750
    const ALL_GOODS_TAB_DATA_NEW = this.getTabsMenu()

    const _classList = classList.filter(classItem => !classItem.hidden)
    console.log(data.scanError, 'data.scanError')
    console.log(this.getScanError(), 'getScanError')

    // needPhone={!this.props.logining && isNeedLogin}
    // mpErpId={_mpErpId}
    // scanError={isNeedLogin ? this.getScanError() : 0}
    // console.log(!this.props.logining, '!this.props.logining')
    // console.log(isNeedLogin, 'isNeedLogin')
    return (
      <Block>
        <View style={{ zIndex: 500 }}>
          <ColorSizeModelView
            key='all_goods'
            visible={colorSizeVisible}
            type='buttons'
            // onVisibleChanged={}
          />
        </View>
        <CustomNavigation
          // disableIphoneXPaddingBottom
          enableBack={process.env.INDEPENDENT !== 'independent'}
          onBackClick={this.onBackClick}
          isRenderOtherIcon={process.env.INDEPENDENT === 'independent'}
          backIcon={this.isFirstPage ? HomeIcon : backCircle}
          navigationClass='category_navigation'
        >
          <View
            style={{
              height:
                isShopInfoVisible || isFilterVisible || callShopIsShow || !goodsList.length
                  ? '100vh'
                  : '',
              overflow:
                isFilterVisible || callShopIsShow || isShopInfoVisible
                  ? 'hidden'
                  : !goodsList.length
                  ? !hotGoodsListTop40.length
                    ? 'hidden'
                    : ''
                  : ''
            }}
          >
            {maskIsShow && attentionGuidanceIsShow && (
              <View className='all_goods__mask'>
                <View className='all_goods__mask__view'>
                  <Image onClick={this.onHideMask} className='closeBtn' src={deleteImg} />
                  <View style='width:100%;height:50%'>
                    <Image style='width:100%;height:100%' src={attentionGuidance} />
                  </View>
                  <View className='all_goods__mask__view_btnView'>
                    <Text>关注公众号</Text>
                    <Text className='all_goods__mask__view_btnView_title'>下次看款不迷路</Text>
                    <View
                      className='all_goods__mask__view_btnView_btn'
                      onClick={this.onAttentionGuidanceClick}
                    >
                      立即关注
                    </View>
                  </View>
                </View>
              </View>
            )}
            <View className='all_goods__top'>
              <View
                style={{
                  height: `${navigationHeight + statusBarHeight}px`,
                  paddingTop: `${statusBarHeight + 4}px`
                }}
                className='all_goods__top__searchView'
              >
                <View
                  onClick={this.onSearch}
                  className='all_goods__top__searchView_search'
                  style={{
                    width: `${values[2] <= 64 ? 64 : values[2]}rpx`,
                    justifyContent: values[2] <= 64 ? 'center' : 'flex-start',
                    paddingLeft: values[2] > 100 ? '12rpx' : '0'
                  }}
                >
                  <Image src={searchImg} style='width: 20px;height:20px' />
                  {values[2] > 300 && (
                    <Text className='all_goods__top__searchView_search__label aic'>搜索商品</Text>
                  )}
                </View>

                <Image
                  src={
                    shopInfo.coverUrls
                      ? shopInfo.coverUrls.includes(',')
                        ? shopInfo.coverUrls.split(',')[0]
                        : shopInfo.coverUrls
                      : shopBgIcon
                  }
                  className={cn('bg_img', {
                    ['transition_ease_in_out']: tabsActiveKey === 'paragraph'
                  })}
                  mode='aspectFill'
                  style={{
                    height: `${statusBarHeight + navigationHeight + headerHeight - scrollTop / 2}px`
                  }}
                />
                <View
                  className='bg_img mask'
                  style={{
                    height: `${statusBarHeight + navigationHeight + headerHeight - scrollTop / 2}px`
                  }}
                ></View>
              </View>
            </View>
            <View
              className={cn('top_content', {
                ['transition_ease_in_out']: tabsActiveKey === 'paragraph'
              })}
              style={{
                top:
                  tabsActiveKey === 'paragraph'
                    ? `${statusBarHeight + navigationHeight + headerHeight - 50}px`
                    : `${statusBarHeight + navigationHeight + headerHeight - 30}px`,
                position: tabsActiveKey === 'paragraph' ? 'sticky' : 'sticky'
              }}
            >
              {shop && (
                <View className='top_content__shopInfo'>
                  <Image
                    src={shop.logoUrl ? shop.logoUrl : DefaultShop}
                    className={cn('top_content__shopInfo__headImage', {
                      ['transition_ease_in_out']: tabsActiveKey === 'paragraph'
                    })}
                    style={{
                      opacity: tabsActiveKey === 'paragraph' ? values[0] : 1,
                      transform: tabsActiveKey === 'paragraph' ? `translateY(${-values[1]}px)` : '0'
                    }}
                  />

                  <View
                    className={cn('top_content__shopInfo__shopName', {
                      ['transition_ease_in_out']: tabsActiveKey === 'paragraph'
                    })}
                    style={{
                      opacity: tabsActiveKey === 'paragraph' ? values[0] : 1,
                      transform: tabsActiveKey === 'paragraph' ? `translateY(${-values[1]}px)` : '0'
                    }}
                  >
                    <View
                      className='top_content__shopInfo__shopName__content'
                      onClick={this.onShopInfoClick}
                    >
                      {shop.shopName}
                    </View>
                    <Image style='width:16px;height:16px;' src={AngleRightIcon} />
                  </View>
                  <View
                    onClick={this.onCallShop}
                    className={cn('top_content__shopInfo__contact', {
                      ['transition_ease_in_out']: tabsActiveKey === 'paragraph'
                    })}
                    style={{
                      opacity: tabsActiveKey === 'paragraph' ? values[0] : 1,
                      transform: tabsActiveKey === 'paragraph' ? `translateY(${-values[1]}px)` : '0'
                    }}
                  >
                    <Image src={ChatIcon} style='width:20px;height:20px'></Image>
                    <Text style={{ fontSize: '11px', color: '#666666' }}>联系档口</Text>
                  </View>
                  <View
                    className='top_content__shopInfo__detail'
                    style={{
                      height: isShopInfoVisible ? '458rpx' : '0',
                      bottom: isShopInfoVisible ? '-458rpx' : '-30rpx'
                    }}
                  >
                    {shopInfo && (
                      <Block>
                        {shop && !shop.industries && (
                          <Block>
                            <View className='category_label'>主营类目</View>
                            <View className='category_content'>{shopInfo.style}</View>
                          </Block>
                        )}
                        <View className='category_address'>地址</View>
                        <View className='category_content'>{shopInfo.address}</View>
                        <Image
                          src={closeIcon}
                          className='close_icon'
                          onClick={() => this.setState({ isShopInfoVisible: false })}
                        />
                      </Block>
                    )}
                  </View>
                </View>
              )}
            </View>
            {tabsActiveKey === 'paragraph' && (
              <View
                id='tabsview'
                className='all_goods__tabsview jcsb'
                style={{
                  top: `${statusBarHeight + navigationHeight + headerHeight - 50}px`,
                  position: isShopInfoVisible ? 'relative' : 'sticky',
                  zIndex: isShopInfoVisible ? 0 : 130,
                  overflow: isFilterVisible ? '' : 'hidden',
                  backgroundColor: filterName ? '#F7F7F7' : '#fff',
                  borderRadius: isSticky ? '15px 15px 0 0' : '0'
                }}
              >
                {filterName ? (
                  <View className='all_goods__tabsview__filterView aic'>
                    <Text>已选</Text>
                    <View className='all_goods__tabsview__filterView__filterName'>
                      {filterName}
                    </View>
                    <Text>共找到{goodsListTotal || '0'}件</Text>
                    <View className='filtername_line'></View>
                    <View
                      className='aic'
                      style={{ padding: '5px' }}
                      onClick={this.onClassClearClick}
                    >
                      <Image src={DeleteIcon} className='filterName_delete_icon' />
                      <Text>清空</Text>
                    </View>
                  </View>
                ) : (
                  <Tabs
                    data={ALL_GOODS_TAB_DATA_NEW}
                    from='allGoods'
                    activeIndex={activeTabIndex}
                    underlineWidth={20}
                    underlineColor='#E62E4D'
                    textColor='#222'
                    activeColor='#222'
                    onTabItemClick={this.onTabClick}
                    activeFontSize='38rpx'
                  />
                )}

                <View className='class_icon_view' onClick={this.onFilterClick}>
                  <Image src={ClaccIcon} className='class_icon_view__icon' />
                  <Text style='font-size: 15px;'>分类</Text>
                </View>

                {isFilterVisible && (
                  <View className='classification_view'>
                    {_classList.map(item => {
                      return (
                        <View
                          onClick={() => {
                            this.onClassItemClick(item)
                          }}
                          key={item.codeValue}
                          className={cn('all_category_con_item', {
                            ['all_category_con_item_active']: item.codeValue === classId
                          })}
                        >
                          {item.codeName}
                        </View>
                      )
                    })}
                  </View>
                )}

                {todayNewIconIsShow && !filterMode && _recentlyUpGoodDay !== null && (
                  <View className='today_new_good aic jcc'>
                    {_recentlyUpGoodDay === 0
                      ? '今日上新'
                      : _recentlyUpGoodDay === 1
                      ? '昨天上新'
                      : `${_recentlyUpGoodDay}天前上新`}
                  </View>
                )}
              </View>
            )}
            <View className='category'>
              <View className='category_wrap'>
                <View
                  className='category_wrap__content'
                  style={{
                    minHeight: `${screenHeight - 245}px`
                  }}
                >
                  {tabsActiveKey === 'paragraph' && this.renderGoodsView()}
                  {tabsActiveKey === 'replenishment' && this.renderReplenishmentView()}
                  {tabsActiveKey === 'video' && enableVisitor && !firstGotoVideo && !shopBlackUser && (
                    <View className='rightView'>
                      <VideoList />
                    </View>
                  )}
                  {(isShopInfoVisible || isFilterVisible) && (
                    <View
                      className='category_wrap__content__mask'
                      onClick={() =>
                        this.setState({
                          isShopInfoVisible: false,
                          isFilterVisible: false
                        })
                      }
                    ></View>
                  )}
                </View>
              </View>
              {/* {((shop && shop.cloudBillFlag === 1 && activeTabIndex !== 0) || activeTabIndex === 4) &&
              isShopBind &&
              enableVisitor && (
                <Image className='all_goods__cart' src={cartIcon} onClick={this.onCartClick} />
              )}
            {activeTabIndex !== 0 && enableVisitor && (
              <Image className='all_goods__order' src={orderIcon} onClick={this.onOrderClick} />
            )} */}
            </View>

            {!enableVisitor && (
              <View className='enable_visitor_view'>
                <Text className='enable_visitor_view___title'>该商家设置了隐私模式</Text>
                <Text className='enable_visitor_view___title'>系统已通知商家为您审核</Text>
              </View>
            )}
            {this.renderTabbarView()}
            {callShopIsShow && this.renderCallShopView()}
            {clipSuccessIsShow && this.renderSetClipSuccess()}
            <NavigationToMini shop={shop} />
            <LoginView
              phone={this.props.phone}
              needPhone={!this.props.logining && isNeedLogin}
              mpErpId={_mpErpId}
              scanError={isNeedLogin ? this.getScanError() : 0}
              notStickyTop
              onSuccess={() => {
                if (!this.initFromLoginView) {
                  console.log('before init')
                  this.initFromLoginView = true
                  this.init()
                }
              }}
            />
          </View>
        </CustomNavigation>
      </Block>
    )
  }
}
export default connect(mapStateToProps)(Index)