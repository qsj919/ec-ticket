/*
 * @Author: HuKai
 * @Date: 2019-08-24 09:55:09
 * @Last Modified by: Miao Yunliang
 */
// eslint-disable-next-line
import React, { Component, ComponentType } from 'react'
import Taro, { NodesRef } from '@tarojs/taro'
import { View, Image, ScrollView, Text, Input } from '@tarojs/components'
import { AtInput } from 'taro-ui'
import tips from '@/images/tips.png'
import calendar from '@/images/calendar.png'
import noDataImg from '@/images/no_data.png'
import search from '@/images/search.png'
import hideArrow from '@/images/hide_arrow.png'
import { GlobalState } from '@@types/model_state'
import FollowGuide from '@pages/eTicketDetail/components/FollowGuide'
import { connect } from 'react-redux'
import config from '@config/config'
import { trackStatementAndTicketListWithCookie } from '@services/cookie_track'
import trackSvc from '@services/track'
import { BaseItem, CloudSource, CLOUD_BILL_FLAG, ICloudBill, Shop } from '@@types/base'
import DateQuickSelect from '@components/DateQuickSelect'
import throttle from 'lodash/throttle'
import navigatorSvc from '@services/navigator'
import { inviteJoinCloudBill } from '@api/shop_api_manager'
import messageFeedback from '@services/interactive'
import images from '@config/images'
// import * as Sentry from 'sentry-miniapp'
import myLog from '@utils/myLog'
import events from '@constants/analyticEvents'
import { getOneDate, getTaroParams} from '@utils/utils'
import { getETicketList } from '@api/apiManage'
import ShopListComponent from '@components/ShopList/shopList'
import cloudBtnIcon from '@/images/cloud_new.gif'
import TicketItemView from './components/TicketItem'
import styles from './index.module.scss'

const tabList = [{ title: '拿货单' }, { title: '订货单' }]

const mapStateToProps = ({ user, shop }: GlobalState) => ({
  sessionId: user.sessionId,
  shopList: shop.list,
  shopListLoaded: shop.shopListLoaded,
  subscribe: user.subscribe,
  phone: user.phone
})

interface Props {
  ticketType: number
  shopId?: number | string
}

type StateProps = ReturnType<typeof mapStateToProps>

type StateType = {
  showNoData: boolean
  listCurrent: number
  listAnimation: any
  // shopList: Array<{
  //   shopName: string
  //   logoUrl: string
  //   flag: number
  // }>
  checkShopIndex: number
  showDateModal: boolean
  date: string
  start: string
  end: string
  searchValue: string
  ticketList: Array<{
    billno: string
    prodate: string
    totalmoney: string
    totalnum: string
    dwname: string
    seller: string
    mainid: number
    imgUrls: string
    logisNo: string
    sn: string
    epid: string
    diffDeliverNum: string
    orderSource: string // '8' 云单
    sendFlagVal: string // 发货状态 0未发，1部分，2全部
  }>
  pageOffset: number
  params: {
    menuBtn: string
    shopName: string
    sessionId: string
    subscribe: string
    shopid: string
    epid: string
    pk: string
    sn: string
  }
  count: string
  type: string
  scrollIndex: number
  showShopList: boolean
  statistics: {
    balanceTotal: string
    modelClass: string
    scoreTotal: string
    totalmoney: string
    totalnum: string
  }
  activeShop: Shop
  shopSearchKey: string
  shopSearchMode: boolean
  // isFollowGuideVisible: boolean
}

// @connect(mapStateToProps)
class TicketListComp extends Component<StateProps & Props, StateType> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config = {
    navigationBarTitleText: '电子小票'
  }

  scale: number = 1

  scrollTopValues: number[] = []

  constructor(props) {
    super(props)
    const params = getTaroParams(Taro.getCurrentInstance?.())
    // params.shopName = decodeURIComponent(params.shopName)
    this.state = {
      showNoData: false,
      date: '',
      start: '',
      end: '',
      showDateModal: false,
      searchValue: '',
      listCurrent: 0,
      listAnimation: null,
      // shopList: [],
      checkShopIndex: 0,
      ticketList: [],
      pageOffset: 0,
      params: {
        menuBtn: params.menuBtn,
        shopName: params.shopName,
        sessionId: params.sessionId,
        subscribe: params.subscribe,
        shopid: params.shopId,
        epid: params.epid,
        pk: params.pk,
        sn: params.sn
      },
      count: '0',
      type: (props.ticketType === 3 ? 2 : props.ticketType) || params.type || '1',
      scrollIndex: 0,
      showShopList: true,
      statistics: {
        balanceTotal: '',
        modelClass: '',
        scoreTotal: '',
        totalmoney: '',
        totalnum: ''
      },
      activeShop: {} as Shop,
      shopSearchKey: '',
      shopSearchMode: false
    }
  }
  UNSAFE_componentWillMount() {
    const { params } = this.state
    const { sessionId } = this.props
    const todayDate = getOneDate()
    const oneYear = 1000 * 60 * 60 * 24 * 15
    const lastMonth = getOneDate(new Date(todayDate.replace(/-/g, '/')).getTime() - oneYear)
    this.setState({
      date: lastMonth + ' 至 ' + todayDate,
      start: lastMonth,
      end: todayDate
    })
  }

  componentDidMount() {
    const { windowWidth } = Taro.getSystemInfoSync()
    this.scale = windowWidth / 750

    myLog.log(`didmount;session=${this.props.sessionId};loaded=${this.props.shopListLoaded}`)
    if (this.props.sessionId && this.props.shopListLoaded) {
      this.initListData()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.shopListLoaded !== this.props.shopListLoaded) {
      myLog.log('update')
      this.initListData()
    }
  }

  componentDidShow() {
    const { activeShop, checkShopIndex } = this.state
    const { sessionId } = this.props
    const _shopList = this.getFilteredShopList()
    // 在其他页面可能会有取关操作，如果取关的店铺是当前店铺，则重置当前店铺并刷新数据
    const _activeShop = _shopList[checkShopIndex]
    if (_activeShop && activeShop.id !== _activeShop.id && sessionId) {
      this.setState({ checkShopIndex: 0 })
      this.onShopNameClick(_shopList[0], 0)
    }
  }

  initListData = () => {
    const { shopList, shopId } = this.props
    const { params } = this.state
    if (shopList.length > 0) {
      let index = 0
      for (let i = 0; i < shopList.length; i++) {
        const item = shopList[i]
        if (String(item.shopid) === String(shopId)) {
          index = i
          break
        }
      }
      this.setState({ checkShopIndex: index })
      this.onShopNameClick(shopList[index], index)
    }
  }

  getListData = params => {
    const { sessionId } = this.props
    params = { ...params, sessionId }
    if (this.props.ticketType === 3) {
      params = { ...params, orderSource: '8' }
    }
    if (!params.sn || !params.epid) return
    getETicketList(params)
      .then(res => {
        Taro.hideLoading()
        if (params.pageOffset === 0) {
          this.setState({
            ticketList: res.data.dataList,
            pageOffset: params.pageOffset,
            count: res.data.count,
            statistics: res.data.sumrow
          })
        } else {
          this.setState((prevState: StateType) => ({
            ticketList: [...prevState.ticketList, ...res.data.dataList],
            pageOffset: params.pageOffset,
            count: res.data.count,
            statistics: res.data.sumrow
          }))
        }
      })
      .catch(err => {
        Taro.hideLoading()
        this.setState({
          count: '0',
          ticketList: []
        })
        console.log('err :', err)
      })
  }

  onTipsClick = () => {
    const { shopList, subscribe } = this.props
    let type = 'normal'
    if (shopList.length > 0 && subscribe !== '1') {
      type = 'phone'
    } else if (shopList.length === 0 && subscribe === '0') {
      type = 'public'
    }
    trackSvc.track(events.showWxQrCodeInHome, { type })
    // this.setState({ isFollowGuideVisible: true })
    // navigatorSvc.navigateTo({url:'/subpackages/cloud_bill/pages/manage/index'})
  }

  hideFollowGuide = () => {
    // this.setState({ isFollowGuideVisible: false })
  }

  onTabListClick = (value, flag) => {
    const { params, start, end, searchValue } = this.state
    const { sessionId } = this.props
    const query = Taro.createSelectorQuery().in(Taro.getCurrentInstance().page as any)
    query
      .select('#tab-list-cover')
      .boundingClientRect((rect: any) => {
        const step = rect.width / tabList.length
        const animation = this.createAnimation(value, step)

        const param = {
          ...params,
          sessionId,
          prodate1: start,
          prodate2: end,
          pageOffset: 0,
          type: value + 1,
          styleName: searchValue
        }
        this.setState(
          {
            listCurrent: value,
            listAnimation: animation,
            pageOffset: 0,
            type: value + 1 + '',
            ticketList: []
          },
          () => {
            if (flag) {
              return
            }
            this.getListData(param)
          }
        )
      })
      .exec()
  }

  onMicroMallClick = () => {
    const { activeShop } = this.state
    trackSvc.track(events.navigateToMicroMall, {
      source: 'list',
      tenantid: String(activeShop.mallTenantId)
    })
    Taro.navigateToMiniProgram({
      appId: activeShop.mallWxApppId as string,
      path: `pages/index/index?page=shop&tenantId=${activeShop.mallTenantId}`
    })
  }

  onCloudOrderClick = (type: ICloudBill = ICloudBill.all, source: string = 'list') => {
    const { activeShop } = this.state
    if (activeShop && activeShop.id) {
      const { id } = activeShop
      this.props.dispatch({
        type: 'cloudBill/init',
        payload: { mpErpId: id, cloudType: type, cloudSource: CloudSource.TICKET_LIST }
      })
      trackSvc.track(events.enterCloudBillClick, { source, cloud_type: type })
      navigatorSvc.navigateTo({ url: `/subpackages/cloud_bill/pages/all_goods/index?type=${type}` })
      // navigatorSvc.navigateTo({ url: `/pages/cloud_bill_landpage/index?mpErpId=${id}` })
    }
  }

  // 未开通云单
  onNotiCloudOrderClick = () => {
    const { activeShop } = this.state
    if (activeShop && activeShop.id) {
      const { id } = activeShop
      messageFeedback.showToast('该商家未开通该服务，已为您提醒ta开通', 2000)
      trackSvc.track(events.inviteOpenCloudClick, { erpid: String(id) })
      inviteJoinCloudBill({ mpErpId: id })
    }
  }

  createAnimation = (value, step) => {
    const space = value * step
    return Taro.createAnimation({
      duration: 450,
      timingFunction: 'ease-out',
      transformOrigin: '0 0'
    })
      .translateX(space)
      .step()
      .export()
  }

  onScrollToUpper = () => {
    const { params, pageOffset, start, end, searchValue, type } = this.state
    if (pageOffset === 0) {
      return
    }
    const param = {
      ...params,
      prodate1: start,
      prodate2: end,
      pageOffset: 0,
      styleName: searchValue,
      type
    }
    this.getListData(param)
    this.setState({ pageOffset: 0 })
  }

  onScrollToLower = () => {
    const { params, pageOffset, start, end, searchValue, type, count } = this.state
    let newPageOffset = pageOffset + 20
    if (newPageOffset > Number(count)) {
      return
    }
    const param = {
      ...params,
      prodate1: start,
      prodate2: end,
      pageOffset: newPageOffset,
      styleName: searchValue,
      type
    }
    this.getListData(param)
    this.setState({ pageOffset: newPageOffset })
  }

  onScroll = e => {
    const { target } = e
    const { scrollIndex } = this.state
    let currentIndex = 0
    for (let i = 0; i < this.scrollTopValues.length - 1; i++) {
      const current = this.scrollTopValues[i] * this.scale
      const next = this.scrollTopValues[i + 1] * this.scale
      if (
        (target.scrollTop > current && target.scrollTop < next) ||
        (target.scrollTop > next && i === this.scrollTopValues.length - 2)
      ) {
        currentIndex = i
        break
      }
    }
    if (currentIndex !== scrollIndex) {
      this.setState({ scrollIndex: currentIndex })
    }
  }

  onCheckDetailClick = item => {
    const { params, type } = this.state
    const { sessionId } = this.props
    const query = `pk=${item.billid}&sn=${item.sn}&epid=${item.epid}&sessionId=${sessionId}&shopId=${params.shopid}&type=${type}`
    navigatorSvc.navigateTo({ url: `/pages/eTicketDetail/landscapeModel?${query}` })
  }

  onShopNameClick = (item, index) => {
    const { params, start, end, searchValue, type } = this.state
    // const { sessionId } = this.props
    const param = {
      // sessionId,
      epid: item.epid,
      sn: item.sn,
      shopid: item.shopid,
      pageOffset: 0,
      prodate1: start,
      prodate2: end,
      styleName: searchValue,
      type
    }
    this.setState({
      activeShop: item,
      checkShopIndex: index,
      ticketList: [],
      params: {
        menuBtn: params.menuBtn,
        subscribe: params.subscribe,
        shopName: item.shopName,
        sessionId: params.sessionId,
        shopid: item.shopid,
        epid: item.epid,
        pk: params.pk,
        sn: item.sn
      },
      shopSearchMode: false
    })
    Taro.showLoading({ mask: true, title: '' })
    this.getListData(param)
  }

  onDateSelectorClick = () => {
    this.setState({ showDateModal: true })
  }

  onDateSelCancel = () => {
    this.setState({ showDateModal: false })
  }

  onConfimDateClick = (prodate1, prodate2) => {
    const { params, searchValue, type } = this.state
    let date = `${prodate1} 至 ${prodate2}`
    const param = {
      ...params,
      prodate1: prodate1,
      prodate2: prodate2,
      pageOffset: 0,
      styleName: searchValue,
      type
    }
    this.getListData(param)
    this.setState({
      date,
      start: prodate1,
      end: prodate2,
      showDateModal: false
    })
  }

  onSearchChange = value => {
    this.setState({ searchValue: value })
  }

  onSearchClick = () => {
    trackSvc.track(events.ticketListSearch)
    const { params, start, end, searchValue, type } = this.state
    const param = {
      ...params,
      prodate1: start,
      prodate2: end,
      pageOffset: 0,
      styleName: searchValue,
      type
    }
    this.getListData(param)
    this.setState({ pageOffset: 0 })
  }

  onHideArrowClick = () => {
    this.setState((prevState: StateType) => ({
      showShopList: !prevState.showShopList
    }))
  }

  onDateTabClick = (i: number, data: BaseItem, prodate1: string, prodate2: string) => {
    trackSvc.track(events.listDateTabClick, { days: data.value })
    const { params, searchValue, type } = this.state
    let date = `${prodate1} 至 ${prodate2}`
    const param = {
      ...params,
      prodate1: prodate1,
      prodate2: prodate2,
      pageOffset: 0,
      styleName: searchValue,
      type
    }
    this.getListData(param)
    this.setState({
      date,
      start: prodate1,
      end: prodate2,
      showDateModal: false
    })
  }

  onShopSearchFocus = () => {
    this.setState({ shopSearchMode: true })
  }

  onCancelShopSearch = () => {
    this.setState({ shopSearchMode: false, shopSearchKey: '' })
  }

  onShopSearchInput = throttle(e => {
    this.setState({ shopSearchKey: e.detail.value })
  }, 200)

  getFilteredShopList = () => {
    const { shopList } = this.props
    const { shopSearchKey } = this.state
    return shopList.filter(shop => {
      if (shopSearchKey) {
        return shop.shopName.includes(shopSearchKey)
      }
      return true
    })
  }

  render() {
    let {
      showNoData,
      checkShopIndex,
      showDateModal,
      date,
      start,
      end,
      type,
      searchValue,
      ticketList,
      count,
      params,
      showShopList,
      listCurrent,
      listAnimation,
      statistics,
      activeShop,
      shopSearchMode
    } = this.state
    const { subscribe, shopList, ticketType } = this.props
    const _shopList = this.getFilteredShopList()
    // let label = '如有数据缺失，请联系批发商'
    // if (shopList.length > 0 && subscribe !== '1') {
    //   label = '点击开启小票自动推送'
    // }
    // if (shopList.length === 0 && subscribe === '0') {
    //   label = '小票没数据？点我查看！'
    // }
    // const activeShop = shopList[checkShopIndex]
    // top为中间值，为了计算每个小票的绝对定位
    // isLastTicketContaineImage为上一张小票是否包含图片 用来计算当前小票的高度
    let top = 20
    let isLastTicketContaineImage = true
    const renderInvite =
      ticketType === 3 &&
      (activeShop.cloudBillFlag === CLOUD_BILL_FLAG.never ||
        activeShop.cloudBillFlag === CLOUD_BILL_FLAG.expire) &&
      activeShop.saasType === 1
    return (
      <View style={{ height: '100%' }}>
        {!showNoData && (
          <View className={styles.ticketWrapper} id='ticket-wrapper'>
            {/* <View className={styles.tips} onClick={this.onTipsClick}>
              {label}
            </View> */}
            <View className={styles.top}>
              <DateQuickSelect
                // onDateClick={this.onDateClick}
                onTabClick={this.onDateTabClick}
                onDateConfirm={this.onConfimDateClick}
              />
            </View>
            <View className={styles.eTicketBody}>
              <View
                className={styles.shopList}
                style={shopSearchMode ? { width: '100%' } : showShopList ? {} : { width: 0 }}
              >
                <View className={styles.shopList__search}>
                  <Image src={search} className={styles.shopList__search__icon} />
                  <Input
                    className={styles.shopList__search__input}
                    value={this.state.shopSearchKey}
                    onFocus={this.onShopSearchFocus}
                    onInput={this.onShopSearchInput}
                    placeholder='搜索'
                  />
                  {shopSearchMode && (
                    <Text
                      className={styles.shopList__search__cancel}
                      onClick={this.onCancelShopSearch}
                    >
                      取消
                    </Text>
                  )}
                </View>
                <ScrollView
                  // style={shopSearchMode ? { backgroundColor: 'white' } : {}}
                  scrollY
                  scrollWithAnimation
                  className={styles.shopScrollView}
                >
                  {_shopList.map((shopItem, index) => {
                    return (
                      <ShopListComponent
                        index={index}
                        shopItem={shopItem}
                        checkShopIndex={shopSearchMode ? -1 : checkShopIndex}
                        key={index}
                        onShopNameClick={this.onShopNameClick}
                        activeColor={listCurrent === 0 ? '#F2503D' : '#FF9933'}
                      />
                    )
                  })}
                </ScrollView>
              </View>
              {!shopSearchMode && (
                <View
                  className={styles.hideShopList}
                  onClick={this.onHideArrowClick}
                  style={showShopList ? {} : { left: 0 }}
                >
                  <Image
                    src={hideArrow}
                    className={styles.hideArrowImg}
                    style={showShopList ? {} : { transform: 'rotateY(180deg)' }}
                  />
                </View>
              )}
              <View
                className={styles.ticketList}
                style={{ display: shopSearchMode ? 'none' : 'block' }}
              >
                <View className={styles.search}>
                  <View className={styles.searchLeft}>
                    <Image src={search} className={styles.img} />
                    <AtInput
                      name=''
                      title=''
                      clear
                      className='flex1 bg'
                      border={false}
                      placeholder='请输入款号/名称'
                      value={searchValue}
                      onChange={this.onSearchChange}
                      onConfirm={this.onSearchClick}
                    />
                  </View>
                  <View onClick={this.onSearchClick} className={styles.searchRight}>
                    搜索
                  </View>
                </View>
                <View className={styles.count}>
                  {/* <Image src={left} className={styles.telLeft} /> */}
                  <View>共{count}条单据</View>
                  {activeShop.cloudBillFlag === CLOUD_BILL_FLAG.open ? (
                    <Image
                      src={cloudBtnIcon}
                      onClick={() => this.onCloudOrderClick()}
                      className={styles.cloud_bill_btn}
                    />
                  ) : (
                    !renderInvite &&
                    (activeShop.cloudBillFlag === CLOUD_BILL_FLAG.never ||
                      activeShop.cloudBillFlag === CLOUD_BILL_FLAG.expire) &&
                    activeShop.saasType === 1 && (
                      <View
                        className={styles.micro_mall}
                        onClick={() => this.onCloudOrderClick(ICloudBill.replenishment)}
                      >
                        去补货
                      </View>
                    )
                  )}

                  {/* <Image src={right} className={styles.telRight} /> */}
                </View>
                {ticketList.length > 0 ? (
                  <ScrollView
                    className={styles.scrollView}
                    scrollY
                    scrollWithAnimation
                    onScrollToUpper={this.onScrollToUpper}
                    onScrollToLower={this.onScrollToLower}
                    onScroll={this.onScroll}
                    style={showShopList ? {} : { width: '100%' }}
                  >
                    {ticketList.map((ticketItem, index) => {
                      let styleTop =
                        index > 0 ? top + 178 + (isLastTicketContaineImage ? 50 : 0) : top
                      top = styleTop
                      this.scrollTopValues[index] = top
                      isLastTicketContaineImage =
                        typeof ticketItem.imgUrls === 'string' && ticketItem.imgUrls !== ''
                      return (
                        <TicketItemView
                          item={ticketItem}
                          index={index}
                          scrollIndex={this.state.scrollIndex}
                          shopName={params.shopName}
                          onItemClick={this.onCheckDetailClick}
                          key={ticketItem.billno}
                          top={styleTop}
                        />
                      )
                    })}
                  </ScrollView>
                ) : (
                  <View>
                    {renderInvite ? (
                      <View className={styles.invite_cloud}>
                        <Image
                          src={images.empty.eticket_invite_cloud}
                          className={styles.invite_cloud__img}
                        />
                        <Text className={styles.invite_cloud__text}>商家暂未开通在线下单</Text>
                        <View
                          className={styles.invite_cloud__btn}
                          onClick={this.onNotiCloudOrderClick}
                        >
                          邀请开通
                        </View>
                        <View
                          className={styles.invite_cloud__go_replenish}
                          onClick={() => this.onCloudOrderClick(ICloudBill.replenishment, 'tab')}
                        >
                          前往补货
                        </View>
                      </View>
                    ) : (
                      <View className={styles.noData}>暂无数据</View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
        {showNoData && (
          <View className={styles.noDataPage}>
            <Image src={noDataImg} className={styles.img} />
            <View>暂无数据</View>
          </View>
        )}
      </View>
    )
  }
}

export default connect(mapStateToProps)(TicketListComp) as ComponentType<Props>
