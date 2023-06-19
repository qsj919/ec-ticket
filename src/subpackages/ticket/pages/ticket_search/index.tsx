import Taro from '@tarojs/taro'
import React from 'react'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { connect } from 'react-redux'
import { ScrollView, View, Image } from '@tarojs/components'
import SearchbarView from '@components/SearchBarView/SearchbarView'
import Tabs from '@components/Tabs'
import GoodsAlbum from '@pages/eTicketList/components/GoodsAlbum'
import { getTaroParams } from '@utils/utils'
import { getUnionTicketList, getEsDresList } from '@api/apiManage'
import { transformBillToShopGroup } from '@pages/eTicketList/helper'
import { ShopBillListItem, EsDresGoods } from '@pages/eTicketList/types'
import TicketItemNew from '@components/TicketList/components/TicketItemNew'
import defaultLogo from '@/images/default_shop.png'
import trackSvc from '@services/track'
import { Shop } from '@@types/base'
import events from '@constants/analyticEvents'
import EmptyImage from '../../images/search_eempty_view.png'
import LoadingIcon from '../../images/search_loading.gif'

import './index.scss'

const mapStateToProps = ({ user, shop }: GlobalState) => {
  return { sessionId: user.sessionId, shopList: shop.list }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  activeIndex: number
  ticketList: Array<ShopBillListItem>
  goodsDataList: Array<EsDresGoods>
  ticketCount: number
  isLoading: boolean
}

const TABS_MENU = [
  {
    label: '小票'
  },
  {
    label: '商品'
  }
]

// @connect(mapStateToProps)
class TicketSearch extends React.Component<StateProps & DefaultDispatchProps, State> {
  // config: Taro.Config | undefined = {
  //   navigationBarTitleText: '搜索'
  // }

  constructor(props) {
    super(props)
    const { activeIndex } = getTaroParams(Taro.getCurrentInstance?.())
    this.state = {
      activeIndex: Number(activeIndex),
      ticketList: [],
      goodsDataList: [],
      ticketCount: 0,
      isLoading: false
    }
  }

  searchValue: string = ''
  goodsListPageNo: number = 1
  ticketListPageNo: number = 1
  searched: boolean = false

  onTabsClick = activeIndex => {
    if (activeIndex === 0) {
      trackSvc.track(events.ticketSearchTabClickTicket)
    } else if (activeIndex === 1) {
      trackSvc.track(events.ticketSearchTabClickGoods)
    }
    this.setState({ activeIndex }, () => {
      this.searchValue && this.onSearch()
    })
  }

  onSearchInput = (searchValue: string) => {
    this.searchValue = searchValue
    // if (this.searchValue === '') {
    //   this.onSearch()
    // }
  }

  onSearch = () => {
    const { activeIndex } = this.state
    const param = {
      searchKey: this.searchValue,
      pageNo: 1
    }
    if (activeIndex === 0) {
      // 搜小票
      this.fetchUnionTicketList()
    } else {
      // 搜货品
      this.getEsDresListData(param)
    }
    trackSvc.track(events.ticketSearchClick)
    this.searched = true
  }

  onClearSearch = () => {
    this.searchValue = ''
    this.goodsListPageNo = 1
    this.ticketListPageNo = 1
    this.setState({
      ticketList: [],
      goodsDataList: [],
      ticketCount: 0
    })
  }

  onCancelClick = () => {
    Taro.navigateBack()
  }

  fetchUnionTicketList = (loadMore = false) => {
    if (loadMore) {
      this.ticketListPageNo += 1
    } else {
      this.ticketListPageNo = 1
    }
    this.setState({
      isLoading: true
    })
    return getUnionTicketList({ pageNo: this.ticketListPageNo, searchKey: this.searchValue })
      .then(({ data }) => {
        this.setState(state => {
          let ticketCount = state.ticketCount
          if (this.ticketListPageNo === 1) {
            ticketCount = data.bills.length
          } else {
            ticketCount += data.bills.length
          }
          const list = transformBillToShopGroup(data.bills, loadMore ? state.ticketList : [])

          return {
            ticketList: list,
            ticketCount,
            isLoading: false
          }
        })
      })
      .catch(e => {
        console.log(e)
        this.setState({
          isLoading: false
        })
        if (loadMore) {
          this.ticketListPageNo--
        }
      })
  }

  getEsDresListData = params => {
    this.setState({
      isLoading: true
    })
    getEsDresList({
      ...params
    })
      .then(res => {
        if (params.pageNo === 1) {
          this.setState({
            goodsDataList: res.data.rows,
            isLoading: false
          })
        } else {
          this.setState(prevState => ({
            goodsDataList: [...prevState.goodsDataList, ...res.data.rows],
            isLoading: false
          }))
        }
      })
      .catch(e => {
        this.setState({
          isLoading: false
        })
        if (params.pageNo !== 1) {
          this.goodsListPageNo--
        }
      })
  }

  onCheckDetailClick = item => {
    const { sessionId } = this.props
    const query = `pk=${item.billId}&sn=${item.sn}&epid=${
      item.epid
    }&sessionId=${sessionId}&shopId=${item.shopId}&type=${1}`
    Taro.navigateTo({ url: `/pages/eTicketDetail/landscapeModel?${query}` })
  }

  getQuery = shop => {
    return `logo=${shop.logoUrl}&shopName=${shop.shopName}&cloudBillFlag=${shop.cloudBillFlag}&epid=${shop.epid}&sn=${shop.sn}&mpErpId=${shop.id}`
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

  onScrollToLower = () => {
    const { activeIndex, ticketCount } = this.state
    if (activeIndex === 0) {
      if (ticketCount >= this.ticketListPageNo * 20) {
        this.fetchUnionTicketList(true)
      }
    } else {
      if (this.state.goodsDataList.length >= this.goodsListPageNo * 20) {
        this.goodsListPageNo += 1
        const param = {
          pageNo: this.goodsListPageNo,
          searchKey: this.searchValue
        }
        this.getEsDresListData(param)
      }
    }
  }

  render() {
    const { activeIndex, ticketList, goodsDataList, isLoading } = this.state
    return (
      <View className='ticket_search_view'>
        <View className='ticket_search_view__header'>
          <View className='ticket_search_view__header___searchview'>
            <SearchbarView
              placeholder='输入批次号、商品名称、款号'
              backgroundColor='#fff'
              onSearchClick={this.onSearch}
              onInput={this.onSearchInput}
              onClearSearchClick={this.onClearSearch}
              focus
            />
            <View className='searchview_cancel' onClick={this.onSearch}>
              搜索
            </View>
          </View>
          <View className='ticket_search_view__header___tabsview'>
            <Tabs
              data={TABS_MENU}
              activeIndex={activeIndex}
              margin={300}
              underlineWidth={40}
              underlineHeight={6}
              tabsBackgroundImage='linear-gradient(to right, #FF788F, #E62E4D)'
              onTabItemClick={this.onTabsClick}
            />
          </View>
        </View>
        <ScrollView
          className='ticket_search_view__content'
          scrollY
          // scrollAnchoring
          lowerThreshold={500}
          onScrollToLower={this.onScrollToLower}
        >
          {activeIndex === 0 && (
            <View className='ticket_list_content'>
              {ticketList.map(shop => (
                <View key={shop.shopId}>
                  <View className='ticket_list_content__shop'>
                    <Image
                      className='ticket_list_content__avatar'
                      src={shop.shopLogo || defaultLogo}
                    />
                    {shop.shopName}
                  </View>
                  {shop.bills.map(b => (
                    <TicketItemNew
                      type={1}
                      key={b.billId}
                      item={b}
                      onItemClick={this.onCheckDetailClick}
                    />
                  ))}
                </View>
              ))}
            </View>
          )}
          {activeIndex === 1 && (
            <View className='ticket_list_content'>
              <GoodsAlbum
                onItemClick={this.goodsItemClick}
                emptyView={false}
                sortViewVisible
                goodsData={goodsDataList}
                onShopClick={this.onShopClick}
              />
            </View>
          )}
          {!isLoading &&
            this.searched &&
            ((activeIndex === 0 && ticketList.length === 0) ||
              (activeIndex === 1 && goodsDataList.length == 0)) && (
              <View className='empty_view'>
                <Image src={EmptyImage} className='empty_view_image' />
                <View className='empty_view_title'>没搜到结果</View>
                <View className='empty_view_label'>换个关键字再搜搜吧</View>
              </View>
            )}
        </ScrollView>
        {isLoading && <Image src={LoadingIcon} className='loading_icon' />}
      </View>
    )
  }
}
export default connect(mapStateToProps)(TicketSearch)