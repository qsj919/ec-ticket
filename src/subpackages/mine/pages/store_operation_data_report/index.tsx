import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import React from 'react'
import { View, Image } from '@tarojs/components'
import { connect } from 'react-redux'
import Tabs from '@components/Tabs'
import Taro, { SelectorQuery, NodesRef } from '@tarojs/taro'
import DatePicker from '@pages/component/dateComponent'
import noDataImg from '@/images/no_data.png'
import { getTargerPastDays } from '@utils/utils'
import {
  findShopDailyViewData,
  findShopSpuViewData,
  findShopSpuBuyData
} from '@api/goods_api_manager'
import { isWeapp, setNavigationBarTitle } from '@utils/cross_platform_api'
import debounce from 'lodash/debounce'
import DropDown from './components/DropDown'
import BrowseTrends from './components/BrowseTrends/BrowseTrends'
import GoodsList from './components/GoodsList/GoodsList'
import './index.scss'

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    mpErpId: goodsManage.mpErpId
  }
}
const tabsData = [
  {
    label: '浏览最多',
    value: 0
  },
  {
    label: '下单最多',
    value: 1
  }
]

type goodsItem = {
  eventNum: number
  style: {
    code: string
    coverUrl: string
    name: string
    id: number
  }
  userNum: number
}
interface State {
  activeTabIndex: number
  dropDownData: Array<{
    active: boolean
    label: string
    value: number
  }>
  broseTrendData: Array<{
    eventNum: number
    proDate: string
    userNum: number
  }>
  shopSpuViewData: Array<goodsItem>
  shopSpuBuyData: Array<goodsItem>
  shopSpuViewDataPageNo: number
  shopSpuBuyDataPageNo: number
  startDate: string
  endDate: string
  datePickerIsShow: boolean
  isTabsCeiling: boolean
}

type StateProps = ReturnType<typeof mapStateToProps>
// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class Index extends React.PureComponent<StateProps & DefaultDispatchProps, State> {
  // config = {
  //   navigationBarTitleText: '访问报表'
  // }
  state = {
    activeTabIndex: 0,
    isTabsCeiling: false,
    dropDownData: [
      {
        active: false,
        label: '今天',
        value: 0
      },
      {
        active: true,
        label: '最近7天',
        value: 7
      },
      {
        active: false,
        label: '最近15天',
        value: 15
      },
      {
        active: false,
        label: '最近30天',
        value: 30
      },
      {
        active: false,
        label: '自定义',
        value: -1
      }
    ],
    broseTrendData: [],
    shopSpuViewData: [],
    shopSpuBuyData: [],
    shopSpuViewDataPageNo: 1,
    shopSpuBuyDataPageNo: 1,
    startDate: getTargerPastDays(7).startDate,
    endDate: getTargerPastDays(7).endDate,
    datePickerIsShow: false
  }
  tabsTop: number
  init = async newDataFlag => {
    this.fetchShopDaiLyViewData()
    this.fetchShopSpuViewData(newDataFlag)
    this.fetchShopSpuBuyData(newDataFlag)
    Taro.nextTick(() => {
      this.getTabsTop()
    })
  }
  componentDidMount() {
    this.init(true)
  }

  componentDidShow() {
    setNavigationBarTitle('访问报表')
  }

  getTabsTop = () => {
    const query: SelectorQuery = Taro.createSelectorQuery()
    query
      .select('.store_opertion_tabs')
      .boundingClientRect((rect: any ) => {
        this.tabsTop = rect.top
      })
      .exec()
  }
  fetchShopDaiLyViewData = () => {
    const { mpErpId } = this.props
    const { startDate, endDate } = this.state
    findShopDailyViewData({
      mpErpId,
      startDate,
      endDate
    }).then(res => {
      this.setState({
        broseTrendData: res.data.rows
      })
    })
  }
  fetchShopSpuViewData = newDataFlag => {
    const { mpErpId } = this.props
    const { shopSpuViewDataPageNo, startDate, endDate } = this.state
    findShopSpuViewData({
      mpErpId,
      startDate,
      endDate,
      pageNo: shopSpuViewDataPageNo
    }).then(res => {
      this.setState(prevState => ({
        shopSpuViewData: newDataFlag
          ? res.data.rows
          : [...prevState.shopSpuViewData, ...res.data.rows]
      }))
    })
  }

  fetchShopSpuBuyData = newDataFlag => {
    const { mpErpId } = this.props
    const { shopSpuBuyDataPageNo, startDate, endDate } = this.state
    findShopSpuBuyData({
      mpErpId,
      startDate,
      endDate,
      pageNo: shopSpuBuyDataPageNo
    }).then(res => {
      this.setState(prevState => ({
        shopSpuBuyData: newDataFlag
          ? res.data.rows
          : [...prevState.shopSpuBuyData, ...res.data.rows]
      }))
    })
  }

  onTabClick = index => {
    this.setState({ activeTabIndex: index })
  }

  onDropDownClick = v => {
    if (v.value !== -1) {
      const { startDate, endDate } = getTargerPastDays(v.value)
      this.setState(
        prevState => {
          return {
            dropDownData: prevState.dropDownData.map(item => {
              return {
                ...item,
                active: item.value === v.value
              }
            }),
            startDate,
            endDate
          }
        },
        () => {
          this.init(true)
        }
      )
    } else {
      this.setState({ datePickerIsShow: true })
    }
  }

  hideDatePicker = () => {
    this.setState({
      datePickerIsShow: false
    })
  }

  onDateConfirm = (params: { prodate1: string; prodate2: string }) => {
    // this.setState(
    //   {
    //     startDate: params.prodate1,
    //     endDate: params.prodate2
    //   },
    //   () => {
    //     this.init(true)
    //   }
    // )
    this.setState(
      prevState => {
        return {
          dropDownData: prevState.dropDownData.map(item => {
            return {
              ...item,
              active: item.value === -1
            }
          }),
          startDate: params.prodate1,
          endDate: params.prodate2
        }
      },
      () => {
        this.init(true)
      }
    )
    this.hideDatePicker()
  }

  onPageScroll = e => {
    this.onTabsScrollEvent(e)
  }

  onTabsScrollEvent = e => {
    const { scrollTop } = e
    if (scrollTop < this.tabsTop) {
      this.setState({
        isTabsCeiling: false
      })
      return
    }
    const query: SelectorQuery = Taro.createSelectorQuery()
    query
      .select('.store_opertion_tabs')
      .boundingClientRect((rect: any ) => {
        if (rect.top < 0) {
          this.setState({
            isTabsCeiling: true
          })
          return
        }
      })
      .exec()
  }

  onReachBottom() {
    this.onScrollBottom()
  }

  onScrollBottom = () => {
    const {
      activeTabIndex,
      shopSpuViewDataPageNo,
      shopSpuBuyDataPageNo,
      shopSpuViewData,
      shopSpuBuyData
    } = this.state
    if (activeTabIndex === 0) {
      if (shopSpuViewData.length >= shopSpuViewDataPageNo * 20) {
        this.setState(
          prevState => ({ shopSpuViewDataPageNo: prevState.shopSpuViewDataPageNo + 1 }),
          () => {
            this.fetchShopSpuViewData(false)
          }
        )
      }
    } else {
      if (shopSpuBuyData.length >= shopSpuBuyDataPageNo * 20) {
        this.setState(
          prevState => ({ shopSpuBuyDataPageNo: prevState.shopSpuBuyDataPageNo + 1 }),
          () => {
            this.fetchShopSpuBuyData(false)
          }
        )
      }
    }
  }

  render() {
    const {
      activeTabIndex,
      dropDownData,
      broseTrendData,
      shopSpuViewData,
      shopSpuBuyData,
      startDate,
      endDate,
      datePickerIsShow,
      shopSpuViewDataPageNo,
      shopSpuBuyDataPageNo,
      isTabsCeiling
    } = this.state

    return (
      <View>
        <View className='store_opertion'>
          <View className='store_opertion_top'>
            <View className='store_opertion_top_title label'>云单访问数据</View>
            {!datePickerIsShow && (
              <View className='DropDown'>
                <DropDown data={dropDownData} onItemClick={this.onDropDownClick} />
              </View>
            )}
          </View>

          <View className='store_opertion_trendTable'>
            {broseTrendData.length ? (
              <BrowseTrends optionData={broseTrendData} isVisible={datePickerIsShow} />
            ) : (
              <View className='no_data'>
                <Image className='no_dataImg' src={noDataImg} />
                <View>暂无更多数据～</View>
              </View>
            )}
          </View>
          <View className='label'>商品访问</View>
        </View>
        <View className={`store_opertion_tabs ${isTabsCeiling ? 'tabsCeiling' : ''}`}>
          <Tabs
            data={tabsData}
            activeIndex={activeTabIndex}
            underlineColor='#E62E4D'
            textColor='#222'
            activeColor='#E62E4D'
            onTabItemClick={this.onTabClick}
            margin={220}
          />
        </View>
        <View className='store_opertion_data'>
          {activeTabIndex === 0 ? (
            <GoodsList
              onScrollBottom={this.onScrollBottom}
              data={shopSpuViewData}
              isLoadMoreData={shopSpuViewData.length >= shopSpuViewDataPageNo * 20}
              activeTabIndex={activeTabIndex}
            />
          ) : (
            <GoodsList
              onScrollBottom={this.onScrollBottom}
              data={shopSpuBuyData}
              isLoadMoreData={shopSpuBuyData.length >= shopSpuBuyDataPageNo * 20}
              activeTabIndex={activeTabIndex}
            />
          )}
        </View>
        {datePickerIsShow && (
          <DatePicker
            tabs={false}
            dateStart={startDate}
            dateEnd={endDate}
            onDateSelCancel={this.hideDatePicker}
            onConfimDateClick={this.onDateConfirm}
          />
        )}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(Index) 