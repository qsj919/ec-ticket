import Taro, { Config } from '@tarojs/taro'
import { Image, View, Input, Text, ScrollView } from '@tarojs/components'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import CustomNavigation from '@components/CustomNavigation'
import TicketHeaderBg from '@/images/ticket_header_bg.png'
import ShopListNew from '@components/ShopList/shopListNew'
import search from '@/images/search_black.png'
import Tabs from '@components/Tabs'
import { getUnionTicketList, getEsDresList } from '@api/apiManage'
import { Shop } from '@@types/base'
import TicketCell from '@components/TicketList/components/TicketCell'
import TicketDatePicker from '@components/TicketDatePicker'
import { PAGE_SIZE } from '@constants/index'
import CaretDownGray from '@/images/caret_down_gray_32.png'
import cn from 'classnames'
import trackSvc from '@services/track'
import { getTargerPastDays } from '@utils/utils'
import events from '@constants/analyticEvents'
import EmptyImage from '@/images/ticket_empty_image.png'
import GoodsAlbum from './components/GoodsAlbum'
// import GoodsStatistics from './components/GoodsStatistics'

import styles from './eTicketList.module.scss'
import { transformBillToDateGroup, updateDateGroupSumData } from './helper'
import { Bill, BillListItem, DateBillListItem, EsDresGoods } from './types'

interface State {
  activeIndex: number
  sortType: string
  goodsDataList: Array<EsDresGoods>
  ticketList: Array<DateBillListItem>
  ticketCount: number
  goodsListPageNo: number
  isDatePickerVisible: boolean
  dateStart: string
  dateEnd: string
  refresherTriggered: boolean
}

const mapStateToProps = ({ systemInfo, shop, user }: GlobalState) => {
  const _shopList = shop.list.sort((f, s) => f.showOrder - s.showOrder)
  return {
    shopList: _shopList.filter(item => item.independentType !== 2),
    statusBarHeight: systemInfo.statusBarHeight,
    navigationHeight: systemInfo.navigationHeight,
    gap: systemInfo.gap,
    isLogining: user.logining,
    sessionId: user.sessionId,
    productVersion: user.productVersion
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

const TABS_MENU = [
  {
    label: '全部小票'
  },
  {
    label: '拿货相册'
  }
  // {
  //   label: '拿货统计'
  // }
]

// @connect(mapStateToProps)
class eTicketList extends Component<StateProps & DefaultDispatchProps, State> {
  // config: Config = {
  //   navigationStyle: 'custom'
  //   // navigationBarTitleText: '电子小票',
  //   // navigationBarBackgroundColor: '#f7f7f7'
  // }

  pageNo = 1

  constructor(props) {
    super(props)
    const { startDate, endDate } = getTargerPastDays(90)
    this.state = {
      activeIndex: 0,
      sortType: 'latestProDate',
      goodsDataList: [],
      ticketList: [],
      ticketCount: -1,
      goodsListPageNo: 1,
      isDatePickerVisible: false,
      dateStart: startDate,
      dateEnd: endDate,
      refresherTriggered: false
    }
  }

  componentDidMount() {
    if (!this.props.isLogining && this.props.sessionId) {
      this.init()
    }

    if (this.props.productVersion === 'weChatAudit') {
      Taro.hideTabBar()
    }
  }

  init = () => {
    this.fetchUnionTicketList()
    // this.fetchGoodsListDate({
    //   orderBy: this.state.sortType,
    //   pageNo: 1
    // })
  }
  componentDidUpdate(prevProps) {
    if (!this.props.isLogining && !prevProps.sessionId && this.props.sessionId) {
      this.init()
    }
  }

  onShopNameClick = currentShop => {
    trackSvc.track(events.shopClick)
    Taro.navigateTo({
      url: `/subpackages/ticket/pages/ticket_home/index?id=${currentShop.id}&type=2`
    })
  }

  onRefresh = () => {
    if (this.state.activeIndex === 0) {
      this.fetchUnionTicketList()
    }
    if (this.state.activeIndex === 1) {
      this.fetchGoodsListDate({
        orderBy: this.state.sortType,
        pageNo: 1
      })
    }
    this.props.dispatch({ type: 'shop/fetchShopList' })
  }

  onScrollToLower = () => {
    if (this.state.activeIndex === 0) {
      if (this.pageNo * PAGE_SIZE > this.state.ticketCount) {
      } else {
        this.fetchUnionTicketList(true)
      }
    }
  }

  onParentScrollToLower = () => {
    if (this.state.activeIndex === 1) {
      if (this.state.goodsDataList.length >= this.state.goodsListPageNo * 20) {
        const goodsParam = {
          orderBy: this.state.sortType,
          pageNo: this.state.goodsListPageNo + 1
        }
        this.fetchGoodsListDate(goodsParam)
      }
    } else if (this.state.activeIndex === 0) {
      this.onScrollToLower()
    }
  }

  fetchUnionTicketList = (loadMore = false) => {
    if (loadMore) {
      this.pageNo += 1
    } else {
      this.pageNo = 1
    }
    if (this.pageNo === 1) {
      this.setState({ refresherTriggered: true })
    }
    return getUnionTicketList({
      pageNo: this.pageNo,
      prodateGte: this.state.dateStart,
      prodateLte: this.state.dateEnd
    })
      .then(({ data }) => {
        this.setState(state => {
          let ticketCount = state.ticketCount
          if (this.pageNo === 1) {
            ticketCount = data.bills.length
          } else {
            ticketCount += data.bills.length
          }
          const list = transformBillToDateGroup(
            data.bills,
            this.pageNo === 1 ? [] : state.ticketList
          )
          updateDateGroupSumData(list, data.monthData)

          return {
            ticketList: list,
            ticketCount,
            refresherTriggered: false
          }
        })
      })
      .catch(e => {
        this.setState({ refresherTriggered: false })
        if (loadMore) {
          this.pageNo--
        }
      })
  }
  onSearhViewClick = () => {
    trackSvc.track(events.eTicketListSearchClick)
    Taro.navigateTo({
      url: `/subpackages/ticket/pages/ticket_search/index?activeIndex=${this.state.activeIndex}`
    })
  }

  onTabsClick = activeIndex => {
    if (activeIndex === 0) {
      trackSvc.track(events.allTicketsClick)
    } else if (activeIndex === 1) {
      trackSvc.track(events.goodsAlbumTabClick)
    }
    this.setState({ activeIndex })
    if (activeIndex === 1 && this.state.goodsDataList.length === 0) {
      this.fetchGoodsListDate({
        orderBy: this.state.sortType,
        pageNo: 1
      })
    }
  }

  onSortTabClick = sortType => {
    this.setState(
      {
        sortType
      },
      () => {
        const goodsParam = {
          pageNo: 1
        }
        this.fetchGoodsListDate(goodsParam)
      }
    )
  }

  fetchGoodsListDate = params => {
    const { sortType } = this.state
    if (params.pageNo === 1) {
      this.setState({ refresherTriggered: true })
    }
    getEsDresList({
      ...params,
      orderBy: sortType
    })
      .then(res => {
        if (params.pageNo === 1) {
          this.setState({
            goodsDataList: res.data.rows,
            goodsListPageNo: params.pageNo,
            refresherTriggered: false
          })
        } else {
          this.setState(prevState => ({
            goodsDataList: [...prevState.goodsDataList, ...res.data.rows],
            goodsListPageNo: params.pageNo,
            refresherTriggered: false
          }))
        }
      })
      .catch(e => {
        Taro.hideLoading()
        if (params.pageNo !== 1) {
          this.setState(state => ({
            goodsListPageNo: state.goodsListPageNo - 1,
            refresherTriggered: false
          }))
        }
        if (params.pageNo === 1) {
          this.setState({ refresherTriggered: false })
        }
      })
  }

  onDatePickClick = () => {
    trackSvc.track(events.useDateClick)
    this.setState({ isDatePickerVisible: true })
  }

  onDateConfirm = (date: { startDate: string; endDate: string }) => {
    this.hidePicker()
    this.setState({ dateStart: date.startDate, dateEnd: date.endDate }, () => {
      this.fetchUnionTicketList()
    })
  }

  hidePicker = () => {
    this.setState({ isDatePickerVisible: false })
  }

  goodsItemClick = g => {
    const shop = this.props.shopList.find(
      s =>
        String(s.shopid) === String(g.shopId) &&
        String(s.epid) === String(g.epid) &&
        String(s.sn) === String(g.sn)
    ) as Shop

    this.props.dispatch({
      type: 'imageDownload/fetchImageUrlsFormatData',
      payload: {
        mpErpId: shop.id,
        styleIds: g.styleId,
        sourceData: [{ ...g, allImgUrlBig: g.allImgUrlBig || g.imgUrl, tenantSpuId: g.styleId }]
      }
    })

    trackSvc.track(events.goodsClick)
    Taro.navigateTo({
      url: `/subpackages/functional/pages/download_image/index?${this.getQuery(shop)}`
    })
  }

  onShopClick = g => {
    const shop = this.props.shopList.find(
      s =>
        String(s.shopid) === String(g.shopId) &&
        String(s.epid) === String(g.epid) &&
        String(s.sn) === String(g.sn)
    ) as Shop

    Taro.navigateTo({
      url: `/subpackages/ticket/pages/ticket_home/index?id=${shop.id}&type=2`
    })
  }

  getQuery = shop => {
    return `logo=${shop.logoUrl}&shopName=${shop.shopName}&cloudBillFlag=${shop.cloudBillFlag}&epid=${shop.epid}&sn=${shop.sn}&mpErpId=${shop.id}`
  }

  renderNavigation = () => {
    const { navigationHeight, statusBarHeight, gap } = this.props
    return (
      <View
        className={styles.navigation_view}
        style={{
          height: `${navigationHeight + statusBarHeight + gap}px`,
          paddingTop: `${statusBarHeight}px`
        }}
      >
        <View className={styles.search_view} onClick={this.onSearhViewClick}>
          <Image src={search} className={styles.search__icon} />
          <Text className={styles.search_view_placeholder}>搜索小票、商品</Text>
        </View>
        <Image className={styles.header_bg} src={TicketHeaderBg} />
      </View>
    )
  }

  render() {
    const { shopList, navigationHeight, statusBarHeight, gap } = this.props
    const {
      activeIndex,
      goodsDataList,
      ticketList,
      ticketCount,
      isDatePickerVisible,
      dateStart,
      dateEnd,
      refresherTriggered,
      sortType
    } = this.state
    return (
      <CustomNavigation enableBack={false} stickyTop containerClass={styles.custom_container}>
        {this.renderNavigation()}
        <ScrollView
          className={styles.scroll_view}
          scrollY
          style={{
            height: `calc(100% - ${navigationHeight + statusBarHeight + gap}px)`
          }}
          lowerThreshold={500}
          onScrollToLower={this.onParentScrollToLower}
          refresherEnabled
          refresherTriggered={refresherTriggered}
          onRefresherRefresh={this.onRefresh}
        >
          <View className={styles.shops_view}>
            <ShopListNew shopList={shopList} onShopNameClick={this.onShopNameClick} />
          </View>
          <View
            className={cn(styles.container, {
              [styles['fixed_container_height']]: activeIndex === 0
            })}
          >
            <View className={styles.container_tabs__view}>
              <Tabs
                data={TABS_MENU}
                onTabItemClick={this.onTabsClick}
                activeIndex={activeIndex}
                textColor='#666'
                activeColor='#222'
                margin={200}
                underlineWidth={40}
                underlineHeight={6}
                tabsBackgroundImage='linear-gradient(to right, #FF788F, #E62E4D)'
              />
            </View>
            <View className={styles.container__content}>
              {activeIndex === 0 && (
                <View className={styles.container__content__bills}>
                  {ticketList.map((c, idx) => (
                    <TicketCell
                      dateString={
                        dateStart + dateEnd === '' ? '选择时间' : `${dateStart} - ${dateEnd}`
                      }
                      index={idx}
                      key={c.key}
                      data={c}
                      onDatePickerClick={this.onDatePickClick}
                      intersectionTop={navigationHeight + statusBarHeight + gap}
                    />
                  ))}

                  {ticketCount <= 0 ? (
                    <View style={{ height: '100%' }}>
                      {ticketCount === 0 && (
                        <View className='bill_cell_new_header'>
                          <Text
                            className='bill_cell_new_header__title'
                            style={{ fontSize: '36rpx' }}
                          >{`${dateStart}至${dateEnd}`}</Text>
                          <Text className='bill_cell_new_header__sub'>
                            {`${0}家门店共${0}单  `}
                            <Text>¥</Text>
                            <Text className='bill_cell_new_header__sum'>0</Text>
                          </Text>

                          <View
                            className='bill_cell_new_header__date'
                            onClick={this.onDatePickClick}
                          >
                            选择时间
                            <Image
                              src={CaretDownGray}
                              className='bill_cell_new_header__date__icon'
                            />
                          </View>
                        </View>
                      )}
                      <View className={styles.empty_view}>
                        <Image src={EmptyImage} className={styles.empty_view_image} />
                        <View className={styles.empty_view_title}>没有发现小票足迹</View>
                        <View className={styles.empty_view_label}>
                          可点击顶部店铺头像查看店铺历史小票
                        </View>
                      </View>
                    </View>
                  ) : (
                    this.pageNo * PAGE_SIZE > ticketCount &&
                    ticketCount !== -1 && (
                      <View className={styles.container__content__no_more}>到底啦～</View>
                    )
                  )}
                </View>
              )}
              {activeIndex === 1 && (
                <GoodsAlbum
                  sortType={sortType}
                  goodsData={goodsDataList}
                  sortTabClick={this.onSortTabClick}
                  onItemClick={this.goodsItemClick}
                  onShopClick={this.onShopClick}
                />
              )}
              {/* {activeIndex === 2 && <GoodsStatistics />} */}
            </View>
          </View>
        </ScrollView>

        <TicketDatePicker
          visible={isDatePickerVisible}
          mask
          initDateStart={dateStart}
          initDateEnd={dateEnd}
          onConfirmClick={this.onDateConfirm}
          onCancelClick={this.hidePicker}
          tips='仅支持查询2021年8月后的数据'
          type='0'
        />
      </CustomNavigation>
    )
  }
}

export default connect(mapStateToProps)(eTicketList)
