import Taro, { Config, eventCenter } from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import deleteImg from '@/images/delete.png'
import { Image, Block, Text, View, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import CustomNavigation from '@components/CustomNavigation'
import cn from 'classnames'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import navigatorSvc from '@services/navigator'
import images from '@config/images'
import Tabs from '@components/Tabs'
import { recordVideoPlay } from '@api/apiManage'
import messageFeedback from '@services/interactive'
import { ALL_GOODS_TAB_ITEM, ALL_GOODS_PAGE_SIZE } from '@constants/index'
import { urlQueryParse, getVieoList, getTaroParams } from '@utils/utils'
import { inviteJoinCloudBill, enableVisitorIn } from '@api/shop_api_manager'
import { Shop, ICloudBill, CloudSource, ScanError } from '@@types/base'
import searchImg from '@/images/search_black.png'
import shopBgIcon from '@/images/shop_bg.png'
import hotIcon from '@/images/icon/hot.png'
import { getVideoBrowseHistory, setVideoBrowseHistory } from '@api/user_api_manager'
import MineIcon from '@/images/tabbar/mine.png'
import ArrowRightIcon from '@/images/angle_right_gray_40.png'
import { getSpuActivity } from '@api/goods_api_manager'
import LoginView from '@components/LoginView/LoginView'
import { ISku, ISpu } from '@@types/GoodsType'
import NavigationToMini from '../../components/NavigationToMini'
import AllContentView from '../../components/AllContentView/AllContentView'
import attentionGuidance from '../../images/allgoods_attention_guidance.png'
import './index.scss'
import ColorSizeModelView from '../goods_detail/components/ColorSizeModelView'
import VideoList from '../../components/VideoList'

import ShopHome from '../../images/tabbar/shop_home.png'
import ShopHomeRed from '../../images/tabbar/shop_home_red.png'
import ClassificationIcon from '../../images/tabbar/classification_icon.png'
import CarIcon from '../../images/tabbar/car.png'
import ParagraphRedIcon from '../../images/tabbar/paragraph_red.png'
import VideoIcon from '../../images/tabbar/video.png'
import VideoRedIcon from '../../images/tabbar/video_red.png'
import ClaccIcon from '../../images/class_icon.png'

type PageState = {
  // shopInfo: Shop | null
  activeTabIndex: number
  isFilterVisible: boolean
  isShopInfoVisible: boolean
  maskIsShow: boolean
  searchKey: string
  enableVisitor: boolean
  tabsActiveKey: string
  switchTabIndex: number
  sortType: string
  firstGotoVideo: boolean // 第一次进入视频导航
  biughtPageNo: number
  filterMode: boolean // 分类时按全部样子显示。。。
  isNeedLogin: boolean
  coverImage: string
  swiperCurrent: number
  shopInfoLoading: boolean
  specialList: Array<ISpu>
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
    hotSettingGoodsList: cloudBill.hotSettingGoodsList,
    hotSettingGoodsFinished: cloudBill.hotSettingGoodsListFinished
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

const FoodIndependentTabbarList = [
  {
    icon: ShopHome,
    label: '首页',
    key: 'paragraph',
    selectedIcon: ShopHomeRed
  },
  {
    icon: ClassificationIcon,
    label: '分类',
    key: 'classification',
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

// @connect(mapStateToProps)
class Index extends PureComponent<StateProps & DefaultDispatchProps, PageState> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTextStyle: 'white',
    // backgroundTextStyle: 'light',
    // navigationBarTitleText: '云单',
    navigationStyle: 'custom',
    window: {
      allowsBounceVertical: 'NO'
    }
  }

  tabsView

  static defaultProps = {
    shop: {}
  }

  constructor(props) {
    super(props)
    const p = getTaroParams(Taro.getCurrentInstance?.())
    this.state = {
      isFilterVisible: false,
      // shopInfo: null,
      activeTabIndex: 0,
      isShopInfoVisible: false,
      maskIsShow: false,
      searchKey: '',
      enableVisitor: true,
      tabsActiveKey: 'paragraph',
      switchTabIndex: 0,
      sortType: 'lastDate',
      firstGotoVideo: true,
      biughtPageNo: 1,
      filterMode: false,
      isNeedLogin: false,
      coverImage: '',
      swiperCurrent: 0,
      shopInfoLoading: true,
      specialList: [] as ISpu[]
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

  componentDidMount(): void {
    this.isFirstPage = Taro.getCurrentPages().length === 1
    if (this.props.logining || !this.props.sessionId) {
      Taro.showLoading({ title: '登录中...', mask: true })
    }

    if (this.props.sessionId && getTaroParams(Taro.getCurrentInstance?.()).mpErpId) {
      this.init()
    }

    this.getEnableVisitorIn()

    // 获取tabsview元素作为参照物
    Taro.createSelectorQuery()
      .select('#tabsview')
      .boundingClientRect(res => {
        this.tabsView = res
      })
      .exec()

    eventCenter.on('on_detail_reach_bottom', this.onScrollToLower)
    eventCenter.on('on_goods_add_click', this.onGoodsAddClick)
  }

  onShareAppMessage() {
    return {
      title: `${this.props.shop.shopName || '食品商店'}`,
      path: `subpackages/cloud_bill/pages/food_all_goods/index?mpErpId=${this.props.mpErpId}`,
      imageUrl: images.food.share_bg
    }
  }

  onShareTimeline() {
    return {
      title: `${this.props.shop.shopName || '食品商店'}`,
      query: `subpackages/cloud_bill/pages/food_all_goods/index?mpErpId=${this.props.mpErpId}`,
      imageUrl: images.food.share_bg
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
            this.fetchSpecialGoodsList()
            this.fetchHotSettingGood()
            this.props
              .dispatch({
                type: 'goodsManage/selelctShopProfileInformation',
                payload: {
                  mpErpId: _mpErpId
                }
              })
              .then(data => {
                this.setState({
                  coverImage: data.bannerUrls
                    ? data.bannerUrls.includes(',')
                      ? data.bannerUrls.split(',')[0]
                      : ''
                    : images.food.banners[0],
                  shopInfoLoading: false
                })
              })
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
    if (!prevProps.sessionId && this.props.sessionId) {
      this.getEnableVisitorIn()
    }
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
    let _mpErpId = this.getMpErpId()
    if (_mpErpId > 0) {
      this.props.dispatch({
        type: 'cloudBill/init',
        payload: { mpErpId: Number(_mpErpId), cloudSource: CloudSource.PUBLIC }
      })
      return
    }
  }

  fetchList = (payload = {}) => {
    const { searchKey, sortType, tabsActiveKey } = this.state
    return this.props.dispatch({
      type: 'cloudBill/fetchGoodsList',
      payload: {
        ...this.currentListOptions,
        styleNameLike: searchKey.trim() === '' ? undefined : searchKey,
        orderBy: tabsActiveKey === 'replenishment' ? sortType : undefined,
        ...payload
      }
    })
  }

  fetchHotSettingGood = (loadMore?) => {
    const { dispatch, hotSettingGoodsFinished } = this.props
    if (hotSettingGoodsFinished && loadMore) {
      return
    }
    let _mpErpId = this.getMpErpId()
    dispatch({ type: 'cloudBill/fetchHotBySetting', payload: { mpErpId: _mpErpId, loadMore } })
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
            specialList: data.spuList
          })
        })
        .catch(() => {})
    }
  }

  onCartClick = () => {
    navigatorSvc.navigateTo({ url: '/subpackages/cloud_bill/pages/replenishment/index' })
  }

  goClassification = () => {
    const { shop } = this.props
    const shopName = shop.shopName || ''
    Taro.navigateTo({
      url: `/subpackages/cloud_bill/pages/all_goods_category/index?codeValue=''&shopName=${shopName}`
    })
  }

  onMineClick = () => {
    navigatorSvc.navigateTo({ url: '/subpackages/independent/pages/food_mine/index' })
  }

  /**
   * 页面上拉触底事件的处理函数
   */
  // onReachBottom() {
  //   this.onScrollToLower()
  // }

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
  }

  onInviteJoinCloudClick = () => {
    messageFeedback.showToast('已为您提醒ta开通', 2000)
    inviteJoinCloudBill({ mpErpId: this.props.mpErpId })
  }

  onAttentionGuidanceClick() {
    Taro.navigateTo({ url: '/subpackages/functional/pages/pub_web/index' })
    this.onHideMask()
  }

  onHideMask() {
    this.setState({ maskIsShow: false })
    this.props.dispatch({ type: 'cloudBill/resetAttention' })
  }

  onTabbarClick = e => {
    const { _key } = e.currentTarget.dataset
    if (_key !== this.state.tabsActiveKey) {
      const { firstGotoVideo, enableVisitor } = this.state
      const { videos, goodsVideoList, mpErpId, shopBlackUser } = this.props
      if (_key !== 'car' && _key !== 'mine' && _key !== 'classification') {
        this.setState(
          {
            tabsActiveKey: _key
          },
          () => {
            if (_key === 'video') {
              if (this.firstGoVideo) {
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
        } else if (_key === 'mine') {
          this.onMineClick()
        } else {
          this.goClassification()
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

  onSearch = () => {
    navigatorSvc.navigateTo({ url: '/subpackages/cloud_bill/pages/all_goods_search_view/index' })
  }

  onClassItemClick = (index: number, item) => {
    this.currentListOptions = {
      ...this.currentListOptions,
      type: item.value < 0 ? ALL_GOODS_TAB_ITEM.ALL_GOODS : ALL_GOODS_TAB_ITEM.ALL,
      classId: item.value < 0 ? undefined : item.value
    }
    this.fetchList({ marketOptimeBegin: undefined, marketOptimeEnd: undefined }).then(() => {
      this.setState({
        filterMode: item.value > 0
      })
    })
  }

  onSwiperChange = e => {
    const { shopInfo } = this.props
    const _list = shopInfo.bannerUrls
      ? shopInfo.bannerUrls.includes(',')
        ? shopInfo.bannerUrls.split(',')
        : []
      : images.food.banners
    this.setState({
      coverImage: _list[e.detail.current],
      swiperCurrent: e.detail.current
    })
  }

  renderTabbarView = () => {
    const { tabsActiveKey } = this.state
    const { platform } = this.props
    return (
      <View
        className='all_goods__tabs'
        style={{
          height: platform === 'ios' ? 80 + 'px' : 50 + 'px'
        }}
      >
        {FoodIndependentTabbarList.map((t, _idx) => (
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

  toGoodDetail = (item: ISpu) => {
    this.props.dispatch({
      type: 'cloudBill/fetchGoodsDetail',
      payload: { spuId: item.styleId, goodsDtail: { ...item, skus: [] } }
    })
    navigatorSvc.navigateTo({
      url: `/subpackages/cloud_bill/pages/goods_detail/index?spuId=${item.id}`
    })
  }

  getMaxDiscountPriceRange(skus: ISku[]) {
    let maxDiscountDiff
    let maxDiscountPrice = {
      price: undefined as number | undefined,
      origin: undefined as number | undefined,
      sizeName: undefined as string | undefined
    }

    skus.forEach(s => {
      if (s.originPrice !== undefined && s.price !== undefined) {
        if (maxDiscountDiff === undefined) {
          maxDiscountDiff = s.originPrice - s.price
          maxDiscountPrice.origin = s.originPrice
          maxDiscountPrice.price = s.price
          maxDiscountPrice.sizeName = s.sizeName
        } else {
          if (maxDiscountDiff < s.originPrice - s.price) {
            maxDiscountDiff = s.originPrice - s.price
            maxDiscountPrice = {
              origin: s.originPrice,
              price: s.price,
              sizeName: s.sizeName
            }
          }
        }
      }
    })
    return maxDiscountPrice
  }

  toCategory = codeValue => {
    const { shop } = this.props
    const shopName = shop.shopName || ''
    Taro.navigateTo({
      url: `/subpackages/cloud_bill/pages/all_goods_category/index?codeValue=${codeValue}&shopName=${shopName}`
    })
  }

  renderHotGoods = () => {
    const { dispatch, hotSettingGoodsList, shopInfo } = this.props
    return (
      <View className='hot_good'>
        <View className='hot_good__header' onClick={() => this.toCategory(-2)}>
          <View>
            {shopInfo.activityNames[2]}
            <Image className='hot_good__header__icon' src={hotIcon}></Image>
          </View>
          <Image className='hot_good__header__arrow' src={ArrowRightIcon}></Image>
        </View>
        <ScrollView
          scrollX
          lowerThreshold={100}
          onScrollToLower={() => this.fetchHotSettingGood(true)}
        >
          <View className='hot_good__main'>
            {hotSettingGoodsList.map((good, index) => {
              const { imgUrl, id, name, price, styleId } = good
              return (
                <View
                  className='hot_good__main__item'
                  key={id}
                  onClick={() => this.toGoodDetail(good)}
                >
                  <Image
                    className='hot_good__main__item__img'
                    mode='aspectFill'
                    src={imgUrl || ParagraphRedIcon}
                  ></Image>
                  <View className='hot_good__main__item__title'>{name}</View>
                  {index < 2 && <View className='hot_good__main__item__tag'>热门</View>}
                  <View className='hot_good__main__item__bottom'>
                    <View className='hot_good__main__item__price'>
                      <Text className='hot_good__main__item__unit'>￥</Text>
                      {price}
                    </View>
                    <View
                      className='replenish_btn_wrapper'
                      onClick={e => {
                        e.stopPropagation()
                        dispatch({
                          type: 'cloudBill/showColorSizeInList',
                          payload: { spuId: styleId }
                        })
                      }}
                    >
                      <View className='replenish_btn'>
                        <View className='replenish_btn__h'></View>
                        <View className='replenish_btn__v'></View>
                      </View>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        </ScrollView>
      </View>
    )
  }

  renderSpecialGoods = () => {
    const { specialList = [] } = this.state
    const { dispatch, shopInfo } = this.props
    return (
      <View className='special_good'>
        <View className='special_good__header' onClick={() => this.toCategory(-3)}>
          {shopInfo.activityNames[10]}
          <Image className='special_good__header__arrow' src={ArrowRightIcon}></Image>
        </View>
        <ScrollView scrollX>
          <View className='special_good__main'>
            {specialList.map((good, index) => {
              const { imgUrl, id, name, styleId } = good
              let price = good.price
              let originPrice = good.originPrice
              let sizeName
              if (Array.isArray(good.skus) && good.skus.length > 0) {
                const p = this.getMaxDiscountPriceRange(good.skus)
                price = p.price ? String(p.price!) : good.price
                originPrice = p.origin ? p.origin : good.originPrice
                sizeName = p.sizeName
              }
              return (
                <View
                  className='special_good__main__item'
                  key={id}
                  onClick={() => this.toGoodDetail(good)}
                >
                  <Image
                    className='special_good__main__item__img'
                    mode='aspectFill'
                    src={imgUrl || ParagraphRedIcon}
                  ></Image>
                  <View className='special_good__main__item__info'>
                    <View>
                      <View className='special_good__main__item__title'>{name}</View>
                      <View className='special_good__main__item__tag'>
                        {shopInfo.activityNames[10]}
                      </View>
                    </View>
                    <View className='special_good__main__item__prices'>
                      <View className='special_good__main__item__price'>
                        <Text className='special_good__main__item__unit'>￥</Text>
                        {price}
                        {sizeName ? (
                          <Text className='special_good__main__item__unit'>/{sizeName}</Text>
                        ) : null}
                      </View>
                      {originPrice ? (
                        <View className='special_good__main__item__line__price'>
                          <Text className='special_good__main__item__unit'>￥</Text>
                          {originPrice}
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <View
                    className='special_good__main__item__btn'
                    onClick={e => {
                      e.stopPropagation()
                      dispatch({
                        type: 'cloudBill/showColorSizeInList',
                        payload: { spuId: styleId }
                      })
                    }}
                  >
                    选购
                  </View>
                </View>
              )
            })}
          </View>
        </ScrollView>
      </View>
    )
  }

  renderGoodsView = () => {
    const { activeTabIndex, enableVisitor, filterMode, specialList } = this.state
    const { goodsList, isLoadingMore, pageNo, showPrice } = this.props

    const specialListSpuIds = specialList.map(spu => spu.styleId)
    const noSpecialList = goodsList.filter(spu => !specialListSpuIds.includes(spu.styleId))
    return (
      <View className='rightView'>
        {(activeTabIndex === 0 || filterMode) && (
          <AllContentView
            tabIndex={activeTabIndex}
            from='allGoods'
            effectsName='cloudBill/fetchGoodsList'
            dresStyleResultList={noSpecialList}
            loadMoreDataVisible={isLoadingMore}
            enableVisitorIn={enableVisitor}
            noMoreDataVisible={
              !isLoadingMore &&
              (noSpecialList && noSpecialList.length) < pageNo * ALL_GOODS_PAGE_SIZE
            }
            onButtonClick={this.onInviteJoinCloudClick}
            listHeight='calc(100vh - 400rpx)'
            showPrice={showPrice}
          />
        )}
      </View>
    )
  }

  render() {
    const _mpErpId = this.getMpErpId()
    const {
      navigationHeight,
      statusBarHeight,
      colorSizeVisible,
      shop,
      shopInfo,
      attentionGuidanceIsShow,
      classList,
      screenHeight,
      shopBlackUser,
      data,
      hotSettingGoodsList
    } = this.props
    const {
      isFilterVisible,
      isShopInfoVisible,
      maskIsShow,
      enableVisitor,
      tabsActiveKey,
      firstGotoVideo,
      isNeedLogin,
      coverImage,
      swiperCurrent,
      shopInfoLoading,
      specialList
    } = this.state

    const _classList = classList.filter(classItem => !classItem.hidden)
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
          enableBack
          isRenderOtherIcon
          containerClass='category_navigation'
        >
          <View className='col' style={{ height: '100%' }}>
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
                    width: `512rpx`,
                    justifyContent: 'flex-start',
                    paddingLeft: '12rpx'
                  }}
                >
                  <Image src={searchImg} style='width: 20px;height:20px' />
                  <Text className='all_goods__top__searchView_search__label aic'>搜索商品</Text>
                </View>

                {!shopInfoLoading && (
                  <Image
                    src={coverImage || shopBgIcon}
                    className={cn('bg_img', {
                      ['transition_ease_in_out']: tabsActiveKey === 'paragraph'
                    })}
                    mode='aspectFill'
                    style={{
                      height: '386rpx'
                    }}
                  />
                )}
              </View>
            </View>
            <ScrollView
              className='scorll_content'
              scrollY
              style={{
                height: `${screenHeight - navigationHeight - statusBarHeight - 50}px`
              }}
              lowerThreshold={300}
              onScrollToLower={this.onScrollToLower}
            >
              <View>
                <View
                  className={cn('top_content', {
                    ['transition_ease_in_out']: tabsActiveKey === 'paragraph'
                  })}
                >
                  {!shopInfoLoading && (
                    <Swiper
                      onChange={this.onSwiperChange}
                      className='top_content__swiper'
                      autoplay
                      circular
                      interval={3000}
                    >
                      {(shopInfo.bannerUrls
                        ? shopInfo.bannerUrls.split(',')
                        : images.food.banners
                      ).map((item, _idx) => (
                        <SwiperItem
                          key={_idx}
                          style={{ width: '100%', height: '100%', top: '0', position: 'absolute' }}
                        >
                          <Image
                            mode='aspectFill'
                            style={{ width: '100%', height: '100%' }}
                            src={item}
                          />
                        </SwiperItem>
                      ))}
                    </Swiper>
                  )}
                  {shopInfo.bannerUrls && (
                    <View className='aic count_view'>
                      <View>{swiperCurrent + 1}</View>
                      <View>/</View>
                      <View>
                        {shopInfo.bannerUrls ? shopInfo.bannerUrls.split(',').length : '0'}
                      </View>
                    </View>
                  )}
                </View>
                {process.env.INDEPENDENT === 'foodindependent' &&
                  hotSettingGoodsList.length > 0 &&
                  this.renderHotGoods()}
                {process.env.INDEPENDENT === 'foodindependent' &&
                  specialList.length > 0 &&
                  this.renderSpecialGoods()}
                {tabsActiveKey === 'paragraph' && (
                  <View className='classification_view jcsb'>
                    <View className='classification_view__left'>
                      <Tabs
                        from={undefined}
                        padding={0}
                        underlineWidth={20}
                        data={[
                          { label: '全部', value: -1 },
                          ...(_classList &&
                            _classList.map(item => ({
                              label: item.codeName,
                              value: item.codeValue
                            })))
                        ]}
                        onTabItemClick={this.onClassItemClick}
                      />
                    </View>
                    <View className='class_icon_view' onClick={this.goClassification}>
                      <Image src={ClaccIcon} className='class_icon_view__icon' />
                      <Text style='font-size: 15px;'>分类</Text>
                    </View>
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
                      {tabsActiveKey === 'video' &&
                        enableVisitor &&
                        !firstGotoVideo &&
                        !shopBlackUser && (
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
                </View>
              </View>
            </ScrollView>

            {!enableVisitor && (
              <View className='enable_visitor_view'>
                <Text className='enable_visitor_view___title'>该商家设置了隐私模式</Text>
                <Text className='enable_visitor_view___title'>系统已通知商家为您审核</Text>
              </View>
            )}
            {this.renderTabbarView()}
            <NavigationToMini shop={shop} />
            <LoginView
              mpErpId={_mpErpId}
              scanError={
                isNeedLogin ? (shop ? (shop.independentType === 1 ? data.scanError : 0) : 0) : 0
              }
              notStickyTop
            />
          </View>
        </CustomNavigation>
      </Block>
    )
  }
}
export default connect(mapStateToProps)(Index)