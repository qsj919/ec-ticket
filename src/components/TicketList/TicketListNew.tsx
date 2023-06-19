import Taro from '@tarojs/taro'
import React, { Component } from 'react' 
import { View, Image, Text, Input, ScrollView } from '@tarojs/components'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { BaseItem, Shop, ICloudBill, CloudSource, CLOUD_BILL_FLAG } from '@@types/base'
import ShopListNew from '@components/ShopList/shopListNew'
import { connect } from 'react-redux'
import CloudNewList from '@/images/special/cloud_new_list.png'
import Tabs from '@components/Tabs'
import DatePicker from '@pages/component/dateComponent'
import caretDown from '@/images/caret_down_gray_32.png'
import cn from 'classnames'
import { formatDateForTicket, getTaroParams } from '@utils/utils'
import trackSvc from '@services/track'
import events from '@constants/analyticEvents'
import { getETicketList, getETicketStatic } from '@api/apiManage'
import dayjs from 'dayjs'
import defaultLogo from '@/images/default_shop.png'
import myLog from '@utils/myLog'
import images from '@config/images'
import { inviteJoinCloudBill } from '@api/shop_api_manager'
import messageFeedback from '@services/interactive'
import SearchbarView from '@components/SearchBarView/SearchbarView'
// import GoodsItem from './components/GoodsItem'
import TicketItemView from './components/TicketItemNew'

import styles from './TicketListNew.module.scss'

const TABS_MENU = [
  {
    label: '拿货小票',
    value: 0
  },
  {
    label: '拿货相册',
    value: 1
  }
]
const ORDER_TABS_MENU = [
  {
    label: '销售单',
    value: 0
  },
  {
    label: '订货单',
    value: 1
  }
]

const GOODS_TABS_MENU = [
  {
    label: '最新拿货',
    value: 2
  },
  {
    label: '最多拿货',
    value: 1
  }
]

type OwnProps = {
  ticketType: number
  shopId?: number | string
}

const mapStateToProps = ({ shop, user, cloudBill }: GlobalState) => {
  const _shopList = shop.list.sort((f, s) => f.showOrder - s.showOrder)
  return {
    shopList: _shopList,
    shopListLoaded: shop.shopListLoaded,
    sessionId: user.sessionId,
    goodsDetail: cloudBill.goodsDetail
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  currentShop: Shop
  activeTabIndex: number
  orderTabsIndex: number
  isPickerVisible: boolean
  startDate: string
  endDate: string
  searchModelClicked: boolean
  goodsSearchModeled: boolean
  checkShopIndex: number
  pageOffset: number
  goodsListPageOffset: number
  count: string
  goodsCount: string
  firstGetIntoShop: boolean
  ticketList: Array<{
    billid: string
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
  goodsDataList: Array<{
    code: string
    name: string
    fileOrgUrl: string
    saleNum: number
    styleId: string
    marketFlag: string
  }>
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
  type: string
  charttype: number
  sortType: number
  filterViewStickyed: boolean
}

// @connect<StateProps, OwnProps, DefaultDispatchProps>(mapStateToProps)
class TicketListNew extends Component<
  StateProps & DefaultDispatchProps & OwnProps,
  State
> {
  constructor(props) {
    super(props)
    const params = getTaroParams(Taro.getCurrentInstance?.())
    const _dayjs = dayjs()
    this.state = {
      currentShop: {} as Shop,
      activeTabIndex: 0,
      orderTabsIndex: 0,
      isPickerVisible: false,
      startDate: _dayjs.subtract(30, 'day').format('YYYY-MM-DD'),
      endDate: _dayjs.format('YYYY-MM-DD'),
      searchModelClicked: false,
      goodsSearchModeled: false,
      checkShopIndex: 0,
      count: '0',
      goodsCount: '0',
      ticketList: [],
      pageOffset: 0,
      goodsListPageOffset: 0,
      charttype: 1,
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
      type: (props.ticketType === 3 ? 2 : props.ticketType) || params.type || '1',
      goodsDataList: [],
      sortType: 2,
      firstGetIntoShop: true,
      filterViewStickyed: false
    }
  }

  goodsSearchValue: string = ''
  ticketSearchValue: string = ''

  componentDidMount() {
    if (this.props.sessionId && this.props.shopListLoaded) {
      this.initListData()
    }
    // const observe = Taro.getCurrentInstance().page.createIntersectionObserver()
    // observe.relativeTo('#scroll_view').observe('#shop_info', res => {
    //   this.setState({
    //     filterViewStickyed: res.intersectionRatio === 0
    //   })
    // })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.shopListLoaded !== this.props.shopListLoaded) {
      myLog.log('update')
      this.initListData()
    }
  }

  componentDidShow() {
    const { currentShop, checkShopIndex } = this.state
    const { sessionId, shopList } = this.props
    const _activeShop = shopList[checkShopIndex]
    if (_activeShop && currentShop.id !== _activeShop.id && sessionId) {
      this.setState({ checkShopIndex: 0 })
      this.onShopNameClick(shopList[0], 0)
    }
  }

  initListData = () => {
    const { shopList, shopId } = this.props
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
      // this.onShopNameClick(shopList[index], index)
      Taro.eventCenter.trigger('CHECK_SHOP', { currentTarget: { dataset: { _idx: index } } })
    }
  }

  onShopNameClick = (currentShop, index) => {
    const { startDate, endDate, type, charttype } = this.state
    const _dayjs = dayjs()
    const param = {
      epid: currentShop.epid,
      sn: currentShop.sn,
      shopid: currentShop.shopid,
      pageOffset: 0,
      prodate1: startDate,
      prodate2: endDate,
      type
    }
    const goodsParam = {
      epid: currentShop.epid,
      sn: currentShop.sn,
      shopid: currentShop.shopid,
      charttype,
      pageOffset: 0,
      search_count: 1
    }
    this.setState(prevState => ({
      currentShop,
      checkShopIndex: index,
      sortType: 2,
      firstGetIntoShop: true,
      startDate: _dayjs.subtract(30, 'day').format('YYYY-MM-DD'),
      endDate: _dayjs.format('YYYY-MM-DD'),
      params: {
        menuBtn: prevState.params.menuBtn,
        subscribe: prevState.params.subscribe,
        shopName: currentShop.shopName,
        sessionId: prevState.params.sessionId,
        shopid: currentShop.shopid,
        epid: currentShop.epid,
        pk: prevState.params.pk,
        sn: currentShop.sn
      }
    }))
    Taro.showLoading()
    this.getListData(param)
    this.getGoodsListDate(goodsParam)
  }

  onDateConfirm = (_p: { prodate1: string; prodate2: string }) => {
    const { params, type } = this.state
    const param = {
      ...params,
      prodate1: _p.prodate1,
      prodate2: _p.prodate2,
      pageOffset: 0,
      styleName: this.ticketSearchValue,
      type
    }
    this.getListData(param)
    this.setState({ startDate: _p.prodate1, endDate: _p.prodate2 })
    this.hideDatePicker()
  }

  onTabClick = index => {
    this.setState({
      activeTabIndex: index
    })
    this.ticketSearchValue = ''
    this.goodsSearchValue = ''
  }

  onOrderTabsClick = e => {
    const { checkShopIndex, currentShop } = this.state
    this.setState(
      {
        orderTabsIndex: e.currentTarget.dataset._idx,
        type: e.currentTarget.dataset._idx + 1
      },
      () => {
        this.onShopNameClick(currentShop, checkShopIndex)
      }
    )
  }

  onGoodsTabsClick = e => {
    const { charttype, currentShop } = this.state
    this.setState(
      {
        sortType: e.currentTarget.dataset._idx
      },
      () => {
        const goodsParam = {
          epid: currentShop.epid,
          sn: currentShop.sn,
          shopid: currentShop.shopid,
          charttype,
          pageOffset: 0,
          search_count: 1
        }
        this.getGoodsListDate(goodsParam)
      }
    )
  }

  hideDatePicker = () => {
    this.setState({ isPickerVisible: false })
  }

  onDateClick = () => {
    this.setState({
      isPickerVisible: true,
      firstGetIntoShop: false
    })
  }

  onSearchClick = () => {
    this.setState({
      searchModelClicked: true
    })
  }

  onTicketSearchClear = () => {
    this.ticketSearchValue = ''
    this.setState({
      searchModelClicked: false
    })
    this.onSearchConfirm()
  }

  onSearchConfirm = () => {
    trackSvc.track(events.ticketListSearch)
    const { params, startDate, endDate, type } = this.state
    const param = {
      ...params,
      prodate1: startDate,
      prodate2: endDate,
      pageOffset: 0,
      styleName: this.ticketSearchValue,
      type
    }
    this.getListData(param)
    this.setState({ pageOffset: 0 })
  }

  onSearchCancel = () => {
    this.setState({
      searchModelClicked: false
    })
  }

  onCheckDetailClick = item => {
    const { params, type } = this.state
    const { sessionId } = this.props
    const query = `pk=${item.billid}&sn=${item.sn}&epid=${item.epid}&sessionId=${sessionId}&shopId=${params.shopid}&type=${type}`
    Taro.navigateTo({ url: `/pages/eTicketDetail/landscapeModel?${query}` })
  }

  onCloudOrderClick = (type: ICloudBill = ICloudBill.all, source: string = 'list') => {
    const { currentShop } = this.state
    if (currentShop && currentShop.id) {
      const { id } = currentShop
      this.props.dispatch({
        type: 'cloudBill/init',
        payload: { mpErpId: id, cloudType: type, cloudSource: CloudSource.TICKET_LIST }
      })
      trackSvc.track(events.enterCloudBillClick, { source, cloud_type: type })
      Taro.navigateTo({ url: `/subpackages/cloud_bill/pages/all_goods/index?type=${type}` })
    }
  }

  // 未开通云单
  onNotiCloudOrderClick = () => {
    const { currentShop } = this.state
    if (currentShop && currentShop.id) {
      const { id } = currentShop
      messageFeedback.showToast('该商家未开通该服务，已为您提醒ta开通', 2000)
      trackSvc.track(events.inviteOpenCloudClick, { erpid: String(id) })
      inviteJoinCloudBill({ mpErpId: id })
    }
  }

  getGoodsListDate = params => {
    const { sortType } = this.state
    getETicketStatic({ sortType, ...params })
      .then(res => {
        if (params.pageOffset === 0) {
          this.setState({
            goodsDataList: res.data.dataList || [],
            goodsListPageOffset: params.pageOffset,
            goodsCount: res.data.count
          })
        } else {
          this.setState(prevState => ({
            goodsDataList: [...prevState.goodsDataList, ...res.data.dataList],
            goodsListPageOffset: params.pageOffset,
            goodsCount: res.data.count
          }))
        }
      })
      .catch(err => {
        this.setState({
          goodsDataList: [],
          goodsListPageOffset: 0,
          goodsCount: '0'
        })
      })
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
            count: res.data.count
          })
        } else {
          this.setState((prevState: State) => ({
            ticketList: [...prevState.ticketList, ...res.data.dataList],
            pageOffset: params.pageOffset,
            count: res.data.count
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

  onGoodsSearchClick = () => {
    this.setState({
      goodsSearchModeled: true
    })
  }

  onGoodsSearchClear = () => {
    this.goodsSearchValue = ''
    this.setState({
      goodsSearchModeled: false
    })
    this.onGoodsSearch()
  }
  onGoodsSearchCancel = () => {
    this.setState({
      goodsSearchModeled: false
    })
  }

  onSearchInput = (searchValue: string) => {
    this.ticketSearchValue = searchValue
    if (this.ticketSearchValue === '') {
      this.onSearchConfirm()
    }
  }
  onGoodsSearch = () => {
    const { currentShop, charttype } = this.state
    const param = {
      epid: currentShop.epid,
      sn: currentShop.sn,
      shopid: currentShop.shopid,
      charttype,
      styleName: this.goodsSearchValue,
      pageOffset: 0
    }
    this.getGoodsListDate(param)
  }

  onGoodsInput = (searchValue: string) => {
    this.goodsSearchValue = searchValue
    if (this.goodsSearchValue === '') {
      this.onGoodsSearch()
    }
  }

  onScrollToLower = () => {
    const {
      params,
      pageOffset,
      startDate,
      endDate,
      type,
      count,
      goodsListPageOffset,
      activeTabIndex,
      currentShop,
      charttype,
      goodsCount
    } = this.state
    if (activeTabIndex === 0) {
      let newPageOffset = pageOffset + 20
      if (newPageOffset > Number(count)) {
        return
      }
      const param = {
        ...params,
        prodate1: startDate,
        prodate2: endDate,
        pageOffset: newPageOffset,
        styleName: this.ticketSearchValue,
        type
      }
      this.getListData(param)
      this.setState({ pageOffset: newPageOffset })
    } else {
      let goodsNewPageOffset = goodsListPageOffset + 20
      if (goodsNewPageOffset > Number(goodsCount)) {
        return
      }
      const goodsParam = {
        epid: currentShop.epid,
        sn: currentShop.sn,
        shopid: currentShop.shopid,
        charttype,
        pageOffset: goodsNewPageOffset,
        styleName: this.goodsSearchValue
      }
      this.getGoodsListDate(goodsParam)
      this.setState({ pageOffset: goodsNewPageOffset })
    }
  }

  getQuery = () => {
    const { currentShop } = this.state
    return `logo=${currentShop.logoUrl}&shopName=${currentShop.shopName}&cloudBillFlag=${currentShop.cloudBillFlag}&epid=${currentShop.epid}&sn=${currentShop.sn}`
  }

  onActionClick = (type, styleId, marketFlag) => {
    const { currentShop } = this.state
    this.props.dispatch({
      type: 'replenishment/save',
      payload: {
        mpErpId: currentShop.id
      }
    })
    this.props.dispatch({
      type: 'cloudBill/save',
      payload: {
        mpErpId: currentShop.id,
        sn: currentShop.sn,
        epid: currentShop.epid,
        shopId: currentShop.shopid
      }
    })
    this.props.dispatch({
      type: 'cloudBill/fetchGoodsDetail',
      payload: {
        spuId: styleId,
        forDownloadImage: true
      }
    })
    const _marketFlag = marketFlag === 'true'
    if (type === 'download') {
      Taro.navigateTo({
        url: `/subpackages/functional/pages/download_image/index?${this.getQuery()}&mpErpId=${
          currentShop.id
        }`
      })
    } else if (type === 'replenishment') {
      if (currentShop.cloudBillFlag === CLOUD_BILL_FLAG.open && _marketFlag) {
        Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/goods_detail/index' })
      }
    } else if (type === 'goods') {
      if (currentShop.cloudBillFlag === CLOUD_BILL_FLAG.open && _marketFlag) {
        Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/goods_detail/index' })
      } else {
        Taro.navigateTo({
          url: `/subpackages/functional/pages/download_image/index?${this.getQuery()}&mpErpId=${
            currentShop.id
          }`
        })
      }
    }
  }

  render() {
    const { shopList } = this.props
    const {
      currentShop,
      activeTabIndex,
      orderTabsIndex,
      startDate,
      endDate,
      isPickerVisible,
      searchModelClicked,
      goodsSearchModeled,
      count,
      ticketList,
      goodsDataList,
      sortType,
      firstGetIntoShop,
      filterViewStickyed
    } = this.state
    const { ticketType } = this.props
    const _startDate = formatDateForTicket(startDate)
    const _endDate = formatDateForTicket(endDate)
    let dateTitle = `${_startDate === _endDate ? `${_startDate}日` : `${_startDate}至${_endDate}`}`
    const renderInvite =
      ticketType === 3 &&
      (currentShop.cloudBillFlag === CLOUD_BILL_FLAG.never ||
        currentShop.cloudBillFlag === CLOUD_BILL_FLAG.expire) &&
      currentShop.saasType === 1
    return (
      <View className={styles.ticket_list_wrap}>
        <ScrollView
          className={styles.TicketListNewContainer}
          scrollY
          onScrollToLower={this.onScrollToLower}
          scrollAnchoring
          lowerThreshold={500}
          // id='scroll_view'
        >
          <View
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <View className={styles.shop_list_new_shops}>
              <ShopListNew shopList={shopList} onShopNameClick={this.onShopNameClick} />
            </View>
            <View className={styles.shop_list_new_content}>
              <View className={styles.sticky_viewer_view}>
                <View className={styles.shopInformation}>
                  <View className={styles.shopInformation_shopInfo}>
                    <Image
                      src={currentShop.logoUrl ? currentShop.logoUrl : defaultLogo}
                      className={styles.shopInformation_shopInfo__shopLogo}
                    />
                    <Text className={styles.shopInformation_shopInfo__shopName}>
                      {currentShop.shopName}
                    </Text>
                  </View>
                  {currentShop.cloudBillFlag === CLOUD_BILL_FLAG.open ? (
                    <Image
                      onClick={() => this.onCloudOrderClick()}
                      src={CloudNewList}
                      className={styles.CloudNewList}
                    />
                  ) : (
                    !renderInvite &&
                    (currentShop.cloudBillFlag === CLOUD_BILL_FLAG.never ||
                      currentShop.cloudBillFlag === CLOUD_BILL_FLAG.expire) &&
                    currentShop.saasType === 1 && (
                      <View
                        className={styles.micro_mall}
                        onClick={() => this.onCloudOrderClick(ICloudBill.replenishment)}
                      >
                        去补货
                      </View>
                    )
                  )}
                </View>
                <View className={styles.sticky_viewer_mask}></View>
                <View className={styles.sticky_viewer}>
                  <View className={styles.tabs_viewer}>
                    <Tabs
                      data={TABS_MENU}
                      activeIndex={activeTabIndex}
                      tabsBackgroundImage='linear-gradient(to right, #FF788F , #E62E4D)'
                      textColor='#666'
                      activeColor='#222'
                      padding={10}
                      onTabItemClick={this.onTabClick}
                    />
                    {activeTabIndex === 0 && (
                      <View className={styles.tabs_viewer__orderTabs}>
                        {ORDER_TABS_MENU.map(item => (
                          <View
                            key={item.value}
                            className={styles.tabs_viewer__orderTabs___item}
                            style={{
                              backgroundColor: `${orderTabsIndex === item.value ? '#fff' : ''}`,
                              boxShadow: `${
                                orderTabsIndex === item.value ? '0 3px 7px rgba(0, 0, 0, 0.15)' : ''
                              }`
                            }}
                            data-_idx={item.value}
                            onClick={this.onOrderTabsClick}
                          >
                            {item.label}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  {activeTabIndex === 0 ? (
                    <View className={styles.order_list_filter}>
                      {!searchModelClicked && (
                        <View
                          className={styles.order_list_filter__orderCount}
                        >{`共${count}条单据`}</View>
                      )}
                      <View className={styles.order_list_filter__filterView}>
                        {!searchModelClicked && (
                          <View className={styles.date_picker_value} onClick={this.onDateClick}>
                            {firstGetIntoShop ? '筛选时间' : dateTitle}
                            <Image src={caretDown} className={styles.caretDown} />
                          </View>
                        )}
                        <View
                          className={styles.order_search__viewer}
                          style={{
                            width: `${searchModelClicked ? '280px' : '90px'}`,
                            transition: `${searchModelClicked ? 'width 0.4s ease-in-out' : ''}`
                          }}
                        >
                          <SearchbarView
                            onClearSearchClick={this.onTicketSearchClear}
                            placeholder='搜小票'
                            onSearchClick={this.onSearchConfirm}
                            onInput={this.onSearchInput}
                            backgroundColor='#F7F7F7'
                            onFocus={this.onSearchClick}
                          />
                        </View>
                      </View>
                      {searchModelClicked && (
                        <View className={styles.search_cancel} onClick={this.onSearchCancel}>
                          取消
                        </View>
                      )}
                    </View>
                  ) : (
                    <View className={styles.goods_search_container}>
                      {!goodsSearchModeled && (
                        <View className={styles.tabs_viewer__orderTabs}>
                          {GOODS_TABS_MENU.map(item => (
                            <View
                              key={item.value}
                              className={styles.tabs_viewer__orderTabs___item}
                              style={{
                                backgroundColor: `${sortType === item.value ? '#fff' : ''}`,
                                boxShadow: `${
                                  sortType === item.value ? '0 3px 7px rgba(0, 0, 0, 0.15)' : ''
                                }`
                              }}
                              data-_idx={item.value}
                              onClick={this.onGoodsTabsClick}
                            >
                              {item.label}
                            </View>
                          ))}
                        </View>
                      )}
                      <View
                        className={styles.order_search__viewer}
                        style={{
                          width: `${goodsSearchModeled ? '280px' : '90px'}`,
                          transition: `${goodsSearchModeled ? 'width 0.4s ease-in-out' : ''}`
                        }}
                      >
                        <SearchbarView
                          onClearSearchClick={this.onGoodsSearchClear}
                          placeholder='搜商品'
                          onSearchClick={this.onGoodsSearch}
                          onInput={this.onGoodsInput}
                          backgroundColor='#F7F7F7'
                          onFocus={this.onGoodsSearchClick}
                        />
                      </View>
                      {goodsSearchModeled && (
                        <View className={styles.search_cancel} onClick={this.onGoodsSearchCancel}>
                          取消
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
              {activeTabIndex === 0 ? (
                <View>
                  {ticketList.length > 0 ? (
                    <View className={styles.order_list_content}>
                      {ticketList.map(ticket => (
                        <TicketItemView
                          key={ticket.billid}
                          item={ticket}
                          onItemClick={this.onCheckDetailClick}
                        />
                      ))}
                    </View>
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
                  s
                </View>
              ) : (
                <View className={styles.goods_list_content}>
                  <View className={styles.goods_list_content__goodsList}>
                    {/* {goodsDataList.map(goods => (
                      <GoodsItem
                        key={goods.code}
                        goodsItem={goods}
                        actionClick={this.onActionClick}
                      />
                    ))} */}
                  </View>
                </View>
              )}
            </View>
          </View>
          {isPickerVisible && (
            <DatePicker
              tabs={false}
              dateStart={startDate}
              dateEnd={endDate}
              onDateSelCancel={this.hideDatePicker}
              onConfimDateClick={this.onDateConfirm}
            />
          )}
        </ScrollView>
      </View>
    )
  }
}
export default connect<StateProps, OwnProps, DefaultDispatchProps>(mapStateToProps)(TicketListNew)
