import Taro from '@tarojs/taro'
import React from 'react'
import {
  fetchColorSizeGroup,
  fetchDownStreamOrderList,
  fetchDownStreamSpuList
} from '@api/factory_api_manager'
import { Image, ScrollView, Swiper, SwiperItem, View } from '@tarojs/components'
import { getTaroParams } from '@utils/utils'
import EmptyView from '@components/EmptyView'
import SearchbarView from '@components/SearchBarView/SearchbarView'
import Tabs from '@components/Tabs'
import { PAGE_SIZE } from '@constants/index'
import { FilterOption } from '@@types/base'
import classnames from 'classnames'
import { FSku, FSpu, OrderListItem } from '../../types'
import FilterView from '../../components/FilterView'
import GoodsSummary from './components/GoodsSummary'
import OrderCell from './components/OrderCell'
import codeEx from '../../images/code_example.png'

import styles from './index.module.scss'

const tabData = [
  {
    label: '商品',
    value: 1
  },
  {
    label: '订单',
    value: 2
  },
  {
    label: '配码',
    value: 3
  }
]

const colorSizeHeader = ['名称', '编码', '名称', '编码']

function DTO(skus: FSku[]) {
  return skus.reduce((result, sku) => {
    const target = result.find(s => s.colorId === sku.colorId)
    const newItem = [sku.size, sku.salesNum, sku.invNum, sku.availStockNum, sku.orderNum]
    if (target) {
      target.data.push(newItem)
    } else {
      result.push({ ...sku, data: [newItem] })
    }

    return result
  }, [] as (FSku & { data: (string | number)[][] })[])
}

type BaseItem = {
  code: string
  id: string
  name: string
  // optime: "06-05 09:21"
  // panel: "<div style='width:100px;height:17px;background-color:'></div>"
  // parentid: "中"
}

type State = {
  currentTabIndex: number
  goodsList: FSpu[]
  orderList: OrderListItem[]
  searchValue: string
  goodsListLoading: boolean
  orderListLoading: boolean
  isFilterVisible: boolean
  filterOptions: FilterOption[]
  colorList: string[]
  sizeList: string[]
}

export default class FactoryShop extends React.PureComponent<{}, State> {
  // config = {
  //   navigationBarTitleText: '下游档口'
  // }

  state = {
    currentTabIndex: 0,
    goodsList: [] as FSpu[],
    orderList: [] as OrderListItem[],
    goodsListLoading: false,
    orderListLoading: false,
    searchValue: '',
    isFilterVisible: false,
    filterOptions: [
      {
        typeValue: 17,
        type: 'range' as const,
        typeName: '上架日期',
        multipleSelect: false,
        items: [] as string[]
      }
    ],
    colorList: [] as string[],
    sizeList: [] as string[]
  }

  goodPageNo = 1

  orderPageNo = 1

  mpErpId: number

  componentDidMount() {
    const { mpErpId, shopName } = getTaroParams(Taro.getCurrentInstance?.())
    this.mpErpId = Number(mpErpId)
    Taro.setNavigationBarTitle({ title: decodeURIComponent(shopName) })
    this.fetchGoodsList()
    this.fetchOrderList()
    this.fetchColorSizeData()
  }

  onInputClear = (searchValue: string) => {
    this.setState({ searchValue }, () => {
      this.onSearch()
    })
  }

  onInput = (searchValue: string) => {
    this.setState({ searchValue })
  }

  onTabClick = (index: number) => {
    this.setState({ currentTabIndex: index })
  }

  onSearch = () => {
    this.refreshData()
  }

  refreshData = () => {
    this.setPageNo(1)
    this.fetchData()
  }

  fetchGoodsList = () => {
    // if (this.goodPageNo === 1) {
    // Taro.showLoading()
    // }
    this.setState({ goodsListLoading: true })
    const { searchValue, filterOptions } = this.state
    const [marketDateBegin, marketDateEnd] = filterOptions[0].items
    fetchDownStreamSpuList({
      mpErpId: this.mpErpId,
      pageNo: this.goodPageNo,
      jsonParam: { abilityCap: 7, keyWordsLike: searchValue, marketDateBegin, marketDateEnd }
    })
      .then(({ data }) => {
        this.setState(state => {
          const goodsList = data.rows.map(g => ({ ...g, skus: DTO(g.skus), rawSkus: g.skus }))
          return {
            goodsList: this.goodPageNo === 1 ? goodsList : [...state.goodsList, ...goodsList],
            goodsListLoading: false
          }
        })
      })
      .catch(error => {
        this.setState({ goodsListLoading: false })
      })
  }

  fetchOrderList = () => {
    this.setState({ orderListLoading: true })
    fetchDownStreamOrderList({ mpErpId: this.mpErpId, pageNo: this.orderPageNo })
      .then(({ data }) => {
        this.setState(state => ({
          orderList: this.orderPageNo === 1 ? data.rows : [...state.orderList, ...data.rows],
          orderListLoading: false
        }))
      })
      .catch(() => {
        this.setState({ orderListLoading: false })
      })
  }

  fetchColorSizeData = () => {
    fetchColorSizeGroup(this.mpErpId).then(({ data }) => {
      const colorList = [...colorSizeHeader]
      const sizeList = [...colorSizeHeader]
      data.colorList.forEach(color => {
        colorList.push(color.name, color.code)
      })
      data.sizeList.forEach(size => {
        sizeList.push(size.name, size.code)
      })
      this.setState({
        colorList,
        sizeList
      })
    })
  }

  setPageNo = (num?: number) => {
    const pageNoName = this.state.currentTabIndex === 0 ? 'goodPageNo' : 'orderPageNo'
    if (typeof num === 'number') {
      this[pageNoName] = num
    } else {
      this[pageNoName]++
    }
  }

  getCurrentList = () => {
    return this.state.currentTabIndex === 0 ? this.state.goodsList : this.state.orderList
  }

  fetchData = () => {
    if (this.state.currentTabIndex === 0) {
      this.fetchGoodsList()
    } else {
      this.fetchOrderList()
    }
  }

  onListReachBottom = () => {
    const pageNoName = this.state.currentTabIndex === 0 ? 'goodPageNo' : 'orderPageNo'
    if (this[pageNoName] * PAGE_SIZE === this.getCurrentList().length) {
      this.setPageNo()
      this.fetchData()
    }
  }

  onSwiperChange = e => {
    // console.log(e, 'ee')
    this.setState({ currentTabIndex: e.detail.current })
  }

  onOrderClick = (data: OrderListItem) => {
    Taro.navigateTo({
      url: `/subpackages/factory/pages/order_detail/index?mpErpId=${this.mpErpId}&billId=${data.id}`
    })
  }

  onPrintClick = (data: FSpu) => {
    Taro.navigateTo({
      url: `/subpackages/factory/pages/print/index?mpErpId=${this.mpErpId}`,
      success(res) {
        res.eventChannel.emit('print_spu', data)
      }
    })
  }

  showFilter = () => {
    this.setState({ isFilterVisible: true })
  }

  hideFilter = () => {
    this.setState({ isFilterVisible: false })
  }

  onFilterValueChanged = op => {
    this.setState({ filterOptions: op }, () => {
      // this.fetchGoodsList()
      this.refreshData()
    })
  }

  render() {
    const {
      currentTabIndex,
      goodsList,
      orderList,
      goodsListLoading,
      orderListLoading,
      isFilterVisible,
      filterOptions,
      colorList,
      sizeList
    } = this.state
    return (
      <View className={styles.container}>
        <View className={styles.top_sticky}>
          <Tabs data={tabData} tabItemClass={styles.tab_item} onTabItemClick={this.onTabClick} />
        </View>
        <Swiper current={currentTabIndex} onChange={this.onSwiperChange} className={styles.swiper}>
          <SwiperItem>
            <View
              style={{ padding: '12rpx 24rpx', backgroundColor: 'white' }}
              className='aic flex1'
            >
              <SearchbarView
                onInput={this.onInput}
                onClearSearchClick={this.onInputClear}
                onSearchClick={this.onSearch}
                placeholder='搜索款号'
                inputDisabled={currentTabIndex === 1}
              />
              <View className={styles.filter} onClick={this.showFilter}>
                筛选
              </View>
            </View>
            {goodsList.length > 0 || goodsListLoading ? (
              <ScrollView
                scrollY
                className={styles.goods_list}
                onScrollToLower={this.onListReachBottom}
                onRefresherRefresh={this.refreshData}
                refresherEnabled
                refresherTriggered={goodsListLoading}
              >
                {goodsList.map(gd => (
                  <GoodsSummary data={gd} key={gd.spuId} onPrintClick={this.onPrintClick} />
                ))}
              </ScrollView>
            ) : (
              <EmptyView buttonLabel='重新加载' onButtonClick={this.refreshData} />
            )}
          </SwiperItem>
          <SwiperItem>
            <View style={{ height: '100%' }}>
              {orderList.length > 0 || orderListLoading ? (
                <ScrollView
                  // className={styles.order_list}
                  scrollY
                  style={{ height: '100%' }}
                  onScrollToLower={this.onListReachBottom}
                  refresherTriggered={orderListLoading}
                  onRefresherRefresh={this.refreshData}
                  refresherEnabled
                >
                  {orderList.map(or => (
                    <OrderCell key={or.id} data={or} onOrderClick={this.onOrderClick} />
                  ))}
                </ScrollView>
              ) : (
                <EmptyView buttonLabel='重新加载' onButtonClick={this.refreshData} />
              )}
            </View>
          </SwiperItem>
          <SwiperItem className={styles.code_list}>
            <View style={{ textAlign: 'center' }}>
              <Image className={styles.code_ex} src={codeEx} />
            </View>
            <View className={styles.p}>
              <View className={styles.title}>颜色</View>
              <View className={styles.table}>
                {colorList.map((color, index) => (
                  <View className={classnames(styles.tab, { [styles['tab--header']]: index <= 3 })}>
                    {color}
                  </View>
                ))}
              </View>
            </View>
            <View className={styles.p}>
              <View className={styles.title}>尺码</View>
              <View className={styles.table}>
                {sizeList.map((size, index) => (
                  <View className={classnames(styles.tab, { [styles['tab--header']]: index <= 3 })}>
                    {size}
                  </View>
                ))}
              </View>
            </View>
          </SwiperItem>
        </Swiper>

        <FilterView
          isOpened={isFilterVisible}
          onClose={this.hideFilter}
          onValueChanged={this.onFilterValueChanged}
          configOptions={filterOptions}
        />
      </View>
    )
  }
}
