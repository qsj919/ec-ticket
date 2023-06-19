import Taro from '@tarojs/taro'
import React from 'react'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { connect } from 'react-redux'
import { View, Image, ScrollView, Text, Input } from '@tarojs/components'
import CustomNavigation from '@components/CustomNavigation'
import BackIcon from '@/images/arrow_right_white.png'
import GoShopIcon from '@/images/shop_new_icon.png'
import Tabs from '@components/Tabs'
import SearchbarView from '@components/SearchBarView/SearchbarView'
import TicketDatePicker from '@components/TicketDatePicker'
import CaretDownGray from '@/images/caret_down_gray_32.png'
import { getETicketList, getETicketStatic } from '@api/apiManage'
import defaultLogo from '@/images/default_shop.png'
import { Shop, CLOUD_BILL_FLAG, ICloudBill, CloudSource } from '@@types/base'
import { Bill } from '@pages/eTicketList/types'
import TicketItemNew from '@components/TicketList/components/TicketItemNew'
import numberUtils from '@utils/num'
import { getTaroParams } from '@utils/utils'
import { fetchShopBuyInfo } from '@api/shop_api_manager'
import cn from 'classnames'
import trackSvc from '@services/track'
import events from '@constants/analyticEvents'
import GoodsItem from './components/GoodsItem'
import EmptyImage from '../../images/search_eempty_view.png'

import './index.scss'

const mapStateToProps = ({ shop, user }: GlobalState) => {
  return {
    shopList: shop.list,
    sessionId: user.sessionId
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  activeIndex: number
  sortType: number
  searchInputed: boolean
  datePickerIsShow: boolean
  pageOffset: number
  goodsListPageOffset: number
  count: string
  goodsCount: string
  startDate: string
  endDate: string
  ticketList: Array<Bill>
  goodsDataList: Array<{
    code: string
    name: string
    fileOrgUrl: string
    saleNum: number
    styleId: string
    marketFlag: string
  }>
  buyNum: number
}

const TABS_MENU = [
  {
    label: '拿货小票'
  },
  {
    label: '拿货相册'
  }
]
const GOODS_TABS_MENU = [
  {
    label: '最新',
    value: 2
  },
  {
    label: '最多',
    value: 1
  }
]

// @connect(mapStateToProps)
class TicketHome extends React.Component<StateProps & DefaultDispatchProps, State> {
  // config?: Taro.Config | undefined = {
  //   // navigationBarTitleText: '电子小票'
  //   navigationStyle: 'custom'
  // }

  constructor(props) {
    super(props)
    this.state = {
      activeIndex: 0,
      sortType: 2,
      searchInputed: false,
      datePickerIsShow: false,
      ticketList: [],
      goodsDataList: [],
      pageOffset: 0,
      goodsListPageOffset: 0,
      count: '0',
      goodsCount: '0',
      startDate: '',
      endDate: '',
      buyNum: 0
    }
  }

  shop: Shop = {
    logoUrl: '',
    shopName: ''
  } as Shop

  goodsSearchValue: string = ''
  ticketSearchValue: string = ''

  componentDidMount() {
    const { id, type, sn, epid, shopid } = getTaroParams(Taro.getCurrentInstance?.())
    /**
     * type 1  使用 sn shopid epid 三参数查找门店
     * type 2  使用 mpErpId 单参数查找门店
     */
    if (type === '1') {
      this.shop = this.props.shopList.find(
        s => String(s.sn) === sn && String(s.epid) === epid && String(s.shopid) === shopid
      ) as Shop
    } else {
      this.shop = this.props.shopList.find(s => String(s.id) === id) as Shop
    }
    this.init()
  }

  init = () => {
    const { startDate, endDate } = this.state
    const param = {
      epid: this.shop.epid,
      sn: this.shop.sn,
      shopid: this.shop.shopid,
      pageOffset: 0,
      prodate1: startDate,
      prodate2: endDate
    }
    const goodsParam = {
      epid: this.shop.epid,
      sn: this.shop.sn,
      shopid: this.shop.shopid,
      pageOffset: 0
    }
    this.getListData(param)
    this.getGoodsListDate(goodsParam)
    this.getShopBuyInfo()
  }

  getShopBuyInfo = async () => {
    if (this.shop.id) {
      const { data } = await fetchShopBuyInfo(this.shop.id)
      this.setState({ buyNum: data.buyNum || 0 })
    }
  }

  onTabsClick = activeIndex => {
    this.ticketSearchValue = ''
    this.goodsSearchValue = ''
    if (activeIndex === 0) {
      trackSvc.track(events.ticketHomeTabClickTicket)
    } else if (activeIndex === 1) {
      trackSvc.track(events.ticketHomeTabClickGoods)
    }
    this.setState({ activeIndex })
  }

  onGoodsTabsClick = e => {
    this.setState(
      {
        sortType: e.currentTarget.dataset._value
      },
      () => {
        const goodsParam = {
          epid: this.shop.epid,
          sn: this.shop.sn,
          shopid: this.shop.shopid,
          pageOffset: 0
        }
        this.getGoodsListDate(goodsParam)
      }
    )
  }

  onSearchInput = (searchValue: string) => {
    const { activeIndex } = this.state
    if (activeIndex === 0) {
      this.ticketSearchValue = searchValue
      if (this.ticketSearchValue === '') {
        this.onSearch()
      }
    } else {
      this.goodsSearchValue = searchValue
      if (this.goodsSearchValue === '') {
        this.onSearch()
      }
    }
  }

  onSearch = () => {
    const { activeIndex, startDate, endDate } = this.state
    if (activeIndex === 0) {
      const ticketParam = {
        epid: this.shop.epid,
        sn: this.shop.sn,
        shopid: this.shop.shopid,
        prodate1: startDate,
        prodate2: endDate,
        pageOffset: 0,
        styleName: this.ticketSearchValue
      }
      this.getListData(ticketParam)
    } else {
      const param = {
        epid: this.shop.epid,
        sn: this.shop.sn,
        shopid: this.shop.shopid,
        styleName: this.goodsSearchValue,
        pageOffset: 0
      }
      this.getGoodsListDate(param)
    }
  }

  onClearSearch = () => {
    this.ticketSearchValue = ''
    this.goodsSearchValue = ''
    this.onSearch()
    this.setState({ searchInputed: false })
  }

  onSearchBlur = () => {
    this.setState({ searchInputed: false })
  }

  onSearchFocus = () => {
    this.setState({ searchInputed: true })
  }

  onActionClick = (type, data) => {
    this.props.dispatch({
      type: 'replenishment/save',
      payload: {
        mpErpId: this.shop.id
      }
    })
    this.props.dispatch({
      type: 'cloudBill/save',
      payload: {
        mpErpId: this.shop.id,
        sn: this.shop.sn,
        epid: this.shop.epid,
        shopId: this.shop.shopid
      }
    })

    const _marketFlag = data.marketFlag === 'true'
    if (type === 'download') {
      this.props.dispatch({
        type: 'imageDownload/fetchImageUrlsFormatData',
        payload: {
          mpErpId: this.shop.id,
          styleIds: data.styleId,
          sourceData: [{ ...data }]
        }
      })
      trackSvc.track(events.ticketHomeGoodsDownloadClick)
      Taro.navigateTo({
        url: `/subpackages/functional/pages/download_image/index?${this.getQuery()}&mpErpId=${
          this.shop.id
        }`
      })
    } else if (type === 'replenishment') {
      trackSvc.track(events.ticketHomeGoodsRepClick)
      if (this.shop.cloudBillFlag === CLOUD_BILL_FLAG.open && _marketFlag) {
        this.props.dispatch({
          type: 'cloudBill/fetchGoodsDetail',
          payload: { spuId: data.styleId }
        })
        Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/goods_detail/index' })
      }
    } else if (type === 'goods') {
      this.props.dispatch({
        type: 'imageDownload/fetchImageUrlsFormatData',
        payload: {
          mpErpId: this.shop.id,
          styleIds: data.styleId,
          sourceData: [{ ...data }]
        }
      })
      trackSvc.track(events.ticketHomeGoodsDownloadClick)
      Taro.navigateTo({
        url: `/subpackages/functional/pages/download_image/index?${this.getQuery()}&mpErpId=${
          this.shop.id
        }`
      })
    }
  }

  getQuery = () => {
    return `logo=${this.shop.logoUrl}&shopName=${this.shop.shopName}&cloudBillFlag=${this.shop.cloudBillFlag}&epid=${this.shop.epid}&sn=${this.shop.sn}`
  }

  dateCancelClick = date => {
    this.setState({
      datePickerIsShow: false
    })
  }

  dateConfirmClick = date => {
    const { startDate, endDate } = date
    this.setState({
      datePickerIsShow: false,
      startDate,
      endDate
    })
    const param = {
      epid: this.shop.epid,
      sn: this.shop.sn,
      shopid: this.shop.shopid,
      pageOffset: 0,
      prodate1: startDate,
      prodate2: endDate
    }
    this.getListData(param)
  }

  onDateUseClick = () => {
    this.setState({
      datePickerIsShow: true
    })
  }

  getListData = params => {
    params = {
      ...params,
      type: '1',
      prodate1: params.prodate1 || undefined,
      prodate2: params.prodate2 || undefined
    }
    if (!params.sn || !params.epid) return
    getETicketList(params)
      .then(res => {
        Taro.hideLoading()
        if (params.pageOffset === 0) {
          this.setState({
            ticketList: this.updateBillsType(res.data.dataList) || [],
            pageOffset: params.pageOffset,
            count: res.data.count
          })
        } else {
          this.setState((prevState: State) => {
            //
            if (prevState.ticketList.length + res.data.dataList.length > params.pageOffset + 20) {
              return {}
            }
            return {
              ticketList: [...prevState.ticketList, ...this.updateBillsType(res.data.dataList)],
              pageOffset: params.pageOffset,
              count: res.data.count
            }
          })
        }
      })
      .catch(err => {
        Taro.hideLoading()
        this.setState({
          count: '0',
          ticketList: [],
          pageOffset: 0
        })
        console.log('err :', err)
      })
  }

  getGoodsListDate = params => {
    const { sortType } = this.state
    getETicketStatic({
      search_count: 1,
      charttype: 1,
      sortType,
      ...params,
      prodate1: params.prodate1 || undefined,
      prodate2: params.prodate2 || undefined
    })
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

  updateBillsType = dataList => {
    return dataList.map(b => ({
      billId: b.billid,
      billNo: b.billno,
      shopId: b.shopid,
      totalNum: b.totalnum,
      totalMoney: b.totalmoney,
      imgUrls: b.imgUrls && b.imgUrls.split(','),
      sn: b.sn,
      epid: b.epid,
      proDate: b.prodate,
      dwname: b.dwname
    }))
  }

  onScrollLower = () => {
    const {
      activeIndex,
      pageOffset,
      count,
      startDate,
      endDate,
      goodsCount,
      goodsListPageOffset
    } = this.state
    if (activeIndex === 0) {
      let newPageOffset = pageOffset + 20
      if (newPageOffset > Number(count)) {
        return
      }
      const param = {
        epid: this.shop.epid,
        sn: this.shop.sn,
        shopid: this.shop.shopid,
        prodate1: startDate,
        prodate2: endDate,
        pageOffset: newPageOffset,
        styleName: this.ticketSearchValue
      }
      this.getListData(param)
    } else {
      let goodsNewPageOffset = goodsListPageOffset + 20
      if (goodsNewPageOffset > Number(goodsCount)) {
        return
      }
      const goodsParam = {
        epid: this.shop.epid,
        sn: this.shop.sn,
        shopid: this.shop.shopid,
        pageOffset: goodsNewPageOffset,
        styleName: this.goodsSearchValue
      }
      this.getGoodsListDate(goodsParam)
    }
  }

  onCheckDetailClick = item => {
    const { sessionId } = this.props
    const query = `pk=${item.billId}&sn=${item.sn}&epid=${
      item.epid
    }&sessionId=${sessionId}&shopId=${item.shopId}&type=${1}`
    Taro.navigateTo({ url: `/pages/eTicketDetail/landscapeModel?${query}` })
  }

  onCloudOrderClick = (type: ICloudBill = ICloudBill.all) => {
    if (this.shop.id) {
      this.props.dispatch({
        type: 'cloudBill/init',
        payload: { mpErpId: this.shop.id, cloudType: type, cloudSource: CloudSource.TICKET_LIST }
      })
      Taro.navigateTo({
        url: `/subpackages/cloud_bill/pages/all_goods/index?type=${type}&mpErpId=${this.shop.id}`
      })
    }
  }

  renderNavigation = () => {
    const { logoUrl, shopName, cloudBillFlag } = this.shop
    const { activeIndex, buyNum } = this.state
    return (
      <View className='navigation_view'>
        {/* <View className='navigation_view__title'>电子小票</View> */}
        <View className='navigation_view__shopinfo'>
          <View style='display: flex;align-items: center;'>
            <View className='shop_logo'>
              {logoUrl ? (
                <Image
                  src={logoUrl || defaultLogo}
                  mode='aspectFill'
                  style='width:100%;height:100%;border-radius: 50%;'
                />
              ) : (
                <View className={cn('shop_logo_noImage', 'noLogoView')}>
                  <View
                    className={cn('noLogoText', {
                      text_center: shopName.length <= 3
                    })}
                    style={{
                      fontSize: `26rpx`
                    }}
                  >
                    <Text
                      style={{
                        fontSize: `${shopName.length <= 3 && '32rpx'}`
                      }}
                    >
                      {shopName}
                    </Text>
                  </View>
                </View>
              )}
            </View>
            <View className='shop_information'>
              <View className='shopinfo_shopName'>{shopName}</View>
              <View className='shopinfo_goodsCount'>
                累计拿货：{numberUtils.toFixed(buyNum, 3)}
              </View>
            </View>
          </View>
        </View>
        <View className='tabs_view'>
          <Tabs
            data={TABS_MENU}
            margin={60}
            activeIndex={activeIndex}
            underlineWidth={120}
            underlineHeight={5}
            activeColor='#fff'
            underlineColor='#fff'
            onTabItemClick={this.onTabsClick}
            activeFontSize='32rpx'
          />
          {cloudBillFlag === CLOUD_BILL_FLAG.open && (
            <Image
              src={GoShopIcon}
              className='go_shop_icon'
              onClick={() => this.onCloudOrderClick()}
            />
          )}
        </View>
      </View>
    )
  }

  render() {
    const {
      activeIndex,
      sortType,
      searchInputed,
      datePickerIsShow,
      count,
      goodsDataList,
      ticketList,
      startDate,
      endDate
    } = this.state
    return (
      <CustomNavigation
        title='电子小票'
        backIcon={BackIcon}
        containerClass='navigation_containerClass'
      >
        {this.renderNavigation()}
        <ScrollView
          className='ticket_home_content'
          scrollY
          lowerThreshold={500}
          onScrollToLower={this.onScrollLower}
        >
          <View className='sticky_view'>
            <View className='sort_search_view'>
              {!searchInputed && activeIndex === 1 && (
                <View className='sort_search_view__orderTabs'>
                  {GOODS_TABS_MENU.map(item => (
                    <View
                      key={item.value}
                      className='sort_search_view__orderTabs___item'
                      style={{
                        backgroundColor: `${sortType === item.value ? '#fff' : ''}`,
                        boxShadow: `${
                          sortType === item.value ? '0 3px 7px rgba(0, 0, 0, 0.15)' : ''
                        }`
                      }}
                      data-_value={item.value}
                      onClick={this.onGoodsTabsClick}
                    >
                      {item.label}
                    </View>
                  ))}
                </View>
              )}
              <View
                className='sort_search_view__searchView'
                style={{
                  width: `${searchInputed || activeIndex === 0 ? '100%' : '180rpx'}`
                }}
              >
                {activeIndex === 0 ? (
                  <SearchbarView
                    placeholder='输入款号、款号名称'
                    backgroundColor='#F7F7F7'
                    onSearchClick={this.onSearch}
                    onInput={this.onSearchInput}
                    onClearSearchClick={this.onClearSearch}
                    onFocus={this.onSearchFocus}
                    onBlur={this.onSearchBlur}
                  />
                ) : (
                  <SearchbarView
                    placeholder='搜商品'
                    backgroundColor='#F7F7F7'
                    onSearchClick={this.onSearch}
                    onInput={this.onSearchInput}
                    onClearSearchClick={this.onClearSearch}
                    onFocus={this.onSearchFocus}
                    onBlur={this.onSearchBlur}
                  />
                )}
              </View>
            </View>
            {activeIndex === 0 && (
              <View className='date_picker_view'>
                <Text className='ticket_count'>共{count}条单据</Text>
                <View className='date_action-view' onClick={this.onDateUseClick}>
                  {startDate + endDate === '' ? '选择时间' : `${startDate} - ${endDate}`}
                  <Image src={CaretDownGray} className='caret_down_gray' />
                </View>
              </View>
            )}
          </View>

          <View className='ticket_home_content__list'>
            {activeIndex === 0 ? (
              ticketList.map(b => (
                <TicketItemNew
                  type={3}
                  item={b}
                  key={b.billNo}
                  onItemClick={this.onCheckDetailClick}
                />
              ))
            ) : (
              <View className='ticket_home_content__list__goodsList'>
                {goodsDataList.map(goods => (
                  <GoodsItem key={goods.code} goodsItem={goods} actionClick={this.onActionClick} />
                ))}
              </View>
            )}
            {((activeIndex === 0 && ticketList.length === 0) ||
              (activeIndex === 1 && goodsDataList.length == 0)) && (
              <View className='empty_view'>
                <Image src={EmptyImage} className='empty_view_image' />
                <View className='empty_view_title'>没搜到结果</View>
                <View className='empty_view_label'>换个关键字再搜搜吧</View>
              </View>
            )}
          </View>
        </ScrollView>
        <TicketDatePicker
          visible={datePickerIsShow}
          mask
          initDateStart=''
          onCancelClick={this.dateCancelClick}
          onConfirmClick={this.dateConfirmClick}
          type='1'
        />
      </CustomNavigation>
    )
  }
}
export default connect(mapStateToProps)(TicketHome)