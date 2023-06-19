import Taro, { Config } from '@tarojs/taro'
import React from 'react'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { connect } from 'react-redux'
import { View, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import Tabs from '@components/Tabs'
import SearchbarView from '@components/SearchBarView/SearchbarView'
import { setNavigationBarTitle } from '@utils/cross_platform_api'
import { debounce } from 'lodash'
import { getOrderList } from '@api/apiManage'
import { OrderBillItem } from '@@types/GoodsType'
import { FilterOption } from '@@types/base'
import OrderBillList from './components/OrderBill/OrderBillList'
import styles from './index.module.scss'
import { NATIVE_EVENTS } from '../../events'
import FilterView from '../../components/FilterView/index'

interface State {
  activeTabIndex: number
  confrimedPageNo: number
  confirmPageNo: number
  voidedPageNo: number
  refundPageNo: number
  confirmedRefreshing: boolean
  confirmRefreshing: boolean
  voidedRefreshing: boolean
  refundRefreshing: boolean
  isFilterVisible: boolean
  filterOptions: FilterOption[]
}

const mapStateToProps = ({ cloudBill, goodsManage, loading, shop }: GlobalState) => {
  return {
    independentType: goodsManage.independentType,
    orderBillListBeConfirmed: cloudBill.orderBillListBeConfirmed,
    orderBillListBeConfirm: cloudBill.orderBillListBeConfirm,
    orderBillListVoided: cloudBill.orderBillListVoided,
    orderBillListRefund: cloudBill.orderBillListRefund,
    mpErpId: goodsManage.mpErpId,
    fetchConfirmedLoading:
      loading.effects['cloudBill/selectAuditBillList'] &&
      loading.effects['cloudBill/selectAuditBillList'].loading
  }
}
type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class Index extends React.PureComponent<StateProps & DefaultDispatchProps, State> {
  state = {
    activeTabIndex: 0,
    confrimedPageNo: 1,
    confirmPageNo: 1,
    voidedPageNo: 1,
    refundPageNo: 1,
    confirmedRefreshing: false,
    confirmRefreshing: false,
    voidedRefreshing: false,
    refundRefreshing: false,
    isFilterVisible: false,
    filterOptions: [
      {
        typeValue: 17,
        type: 'input' as const,
        typeName: '批次',
        multipleSelect: false,
        items: [] as string[]
      }
    ]
  }

  // config: Config = {
  //   navigationBarTitleText: '云单订单'
  // }

  searchKey: string = ''

  componentDidMount() {
    this.init()
    Taro.eventCenter.on('ORDER_ACTION', this.onOrderAction)
    Taro.eventCenter.on(NATIVE_EVENTS.GO_CLOUD_ORDER_Bill, this.onGetRefreshMessage)
  }

  componentWillUnmount() {
    // this.props.dispatch({
    //   type: 'cloudBill/clearOrderBillList'
    // })

    Taro.eventCenter.off(NATIVE_EVENTS.GO_CLOUD_ORDER_Bill)
  }

  onGetRefreshMessage = () => {
    this.setState({ activeTabIndex: 0 })
    this.fetchConfirmedList()
  }

  componentDidShow() {
    setNavigationBarTitle('云单订单')
  }

  onOrderAction = ({ type }) => {
    this.onOrderBillRefersh({
      currentTarget: {
        dataset: {
          key: 'confirmed'
        }
      }
    })
    this.onOrderBillRefersh({
      currentTarget: {
        dataset: {
          key: type
        }
      }
    })
  }
  init = async () => {
    Taro.showLoading({ title: '请稍等...' })
    this.fetchConfirmedList()
    this.fetchConfirmList()
    this.fetchRefundList()
    this.fetchVoidedList()
    Taro.hideLoading()
  }
  fetchConfirmedList = () => {
    const { confrimedPageNo } = this.state
    this.props
      .dispatch({
        type: 'cloudBill/selectAuditBillList',
        payload: {
          mpErpId: this.props.mpErpId,
          auditFlag: 1,
          pageNo: confrimedPageNo,
          searchKey: this.searchKey
        }
      })
      .then(() => {
        this.setState({ confirmedRefreshing: false })
      })
      .catch(() => {
        this.setState({ confirmedRefreshing: false })
      })
  }

  fetchConfirmList = () => {
    const { confirmPageNo, filterOptions } = this.state
    this.props
      .dispatch({
        type: 'cloudBill/selectAuditBillList',
        payload: {
          mpErpId: this.props.mpErpId,
          auditFlag: 2,
          pageNo: confirmPageNo,
          searchKey: this.searchKey,
          slhBillNo: filterOptions[0].items[0]
        }
      })
      .then(() => {
        this.setState({ confirmRefreshing: false })
      })
      .catch(() => {
        this.setState({ confirmRefreshing: false })
      })
  }

  fetchRefundList = () => {
    const { refundPageNo, filterOptions } = this.state
    // console.log(filterOptions, 'filterOptions-->');

    this.props
      .dispatch({
        type: 'cloudBill/selectAuditBillList',
        payload: {
          mpErpId: this.props.mpErpId,
          type: 5,
          pageNo: refundPageNo,
          searchKey: this.searchKey,
          slhBillNo: filterOptions[0].items[0]
        }
      })
      .then(() => {
        this.setState({ refundRefreshing: false })
      })
      .catch(() => {
        this.setState({ refundRefreshing: false })
      })
  }

  fetchVoidedList = () => {
    const { voidedPageNo, filterOptions } = this.state
    this.props
      .dispatch({
        type: 'cloudBill/selectAuditBillList',
        payload: {
          mpErpId: this.props.mpErpId,
          auditFlag: 3,
          pageNo: voidedPageNo,
          searchKey: this.searchKey,
          slhBillNo: filterOptions[0].items[0]
        }
      })
      .then(() => {
        this.setState({ voidedRefreshing: false })
      })
      .catch(() => {
        this.setState({ voidedRefreshing: false })
      })
  }

  showFilterView = () => {
    this.setState({ isFilterVisible: true })
  }

  hideFilterView = () => {
    this.setState({ isFilterVisible: false })
  }

  onFilterValueChanged = op => {
    this.setState({ filterOptions: op }, () => {
      this.onSearch()
    })
  }

  onTabClick = (index: number) => {
    this.setState({ activeTabIndex: index }, () => {
      this.onSearch()
    })
  }

  onSwiperChange = ({ detail }) => {
    this.setState({ activeTabIndex: detail.current })
  }

  onInput = e => {
    this.searchKey = e
  }

  onClearSearch = () => {
    this.searchKey = ''
    this.onSearch()
  }

  onSearch = () => {
    const { activeTabIndex } = this.state
    let key = ''
    if (activeTabIndex === 0) {
      key = 'confirmed'
    }
    if (activeTabIndex === 1) {
      key = 'confirm'
    }
    if (activeTabIndex === 2) {
      key = 'voided'
    }
    if (activeTabIndex === 3) {
      key = 'refund'
    }
    this.onOrderBillRefersh({
      currentTarget: {
        dataset: {
          key
        }
      }
    })
  }

  _onBeConfirmedScrollEnd = debounce(() => {
    if (this.props.orderBillListBeConfirmed.length >= this.state.confrimedPageNo * 20) {
      this.setState(
        prevState => ({
          confrimedPageNo: prevState.confrimedPageNo + 1
        }),
        () => {
          this.fetchConfirmedList()
        }
      )
    }
  }, 100)
  onBeConfirmedScrollEnd = () => {
    this._onBeConfirmedScrollEnd()
  }
  onOrderBillRefersh = e => {
    const { key } = e.currentTarget.dataset
    if (key === 'confirmed') {
      this.setState({ confirmedRefreshing: true })
      if (this.state.confrimedPageNo === 1) {
        this.fetchConfirmedList()
      } else {
        this.setState(
          {
            confrimedPageNo: 1
          },
          () => {
            this.fetchConfirmedList()
          }
        )
      }
    }
    if (key === 'confirm') {
      this.setState({ confirmRefreshing: true })

      if (this.state.confirmPageNo === 1) {
        this.fetchConfirmList()
      } else {
        this.setState(
          {
            confirmPageNo: 1
          },
          () => {
            this.fetchConfirmList()
          }
        )
      }
    }
    if (key === 'voided') {
      this.setState({ voidedRefreshing: true })

      if (this.state.voidedPageNo === 1) {
        this.fetchVoidedList()
      } else {
        this.setState(
          {
            voidedPageNo: 1
          },
          () => {
            this.fetchVoidedList()
          }
        )
      }
    }
    if (key === 'refund') {
      this.setState({ refundRefreshing: true })

      if (this.state.refundPageNo === 1) {
        this.fetchRefundList()
      } else {
        this.setState(
          {
            refundPageNo: 1
          },
          () => {
            this.fetchRefundList()
          }
        )
      }
    }
  }

  _onBeConfirmScrollEnd = debounce(() => {
    console.log('onBeConfirmScrollEnd222')

    if (this.props.orderBillListBeConfirm.length >= this.state.confirmPageNo * 20) {
      this.setState(
        prevState => ({
          confirmPageNo: prevState.confirmPageNo + 1
        }),
        () => {
          this.fetchConfirmList()
        }
      )
    }
  }, 100)

  onBeConfirmScrollEnd = async () => {
    console.log('onBeConfirmScrollEnd')
    this._onBeConfirmScrollEnd()
  }

  _onVoidedScrollEnd = debounce(() => {
    if (this.props.orderBillListVoided.length >= this.state.voidedPageNo * 20) {
      this.setState(
        prevState => ({
          voidedPageNo: prevState.voidedPageNo + 1
        }),
        () => {
          this.fetchVoidedList()
        }
      )
    }
  }, 100)

  _onRefundScrollEnd = debounce(() => {
    if (this.props.orderBillListRefund.length >= this.state.refundPageNo * 20) {
      this.setState(
        prevState => ({
          refundPageNo: prevState.refundPageNo + 1
        }),
        () => {
          this.fetchRefundList()
        }
      )
    }
  }, 100)

  onVoidedScrollEnd = () => {
    this._onVoidedScrollEnd()
  }

  onRefundEnd = () => {
    this._onRefundScrollEnd()
  }

  onOrderBillClick = (billId, userRemark, afterSaleTypes) => {
    Taro.showLoading({ title: '查询数据中...' })
    this.props
      .dispatch({
        type: 'cloudBill/selectAuditBillDetail',
        payload: {
          billId
        }
      })
      .then(() => {
        Taro.hideLoading()
        Taro.navigateTo({
          url: `/subpackages/cloud_bill/pages/order_bill_screen/order_bill_detail?billId=${billId}&userRemark=${userRemark}&afterSaleTypes=${afterSaleTypes}`
        })
      })
  }

  render() {
    const {
      activeTabIndex,
      confirmedRefreshing,
      confirmRefreshing,
      voidedRefreshing,
      refundRefreshing,
      isFilterVisible,
      filterOptions
    } = this.state
    const {
      orderBillListBeConfirmed,
      orderBillListBeConfirm,
      orderBillListVoided,
      orderBillListRefund,
      fetchConfirmedLoading
    } = this.props
    let _tabs = [{ label: '待确认' }, { label: '已确认' }, { label: '已作废' }]
    if (this.props.independentType !== 0) {
      _tabs.push({ label: '售后处理' })
    }
    return (
      <View className={styles.order_list_container}>
        <View className={styles.sticky_view}>
          <View className={styles.tabs_view}>
            <Tabs
              data={_tabs}
              activeIndex={activeTabIndex}
              onTabItemClick={this.onTabClick}
              activeColor='#FF5050'
              underlineColor='#FF5050'
              textColor='#666'
              margin={70}
            />
          </View>
          <View className={styles.search_container}>
            <SearchbarView
              onInput={this.onInput}
              onClearSearchClick={this.onClearSearch}
              placeholder='搜索客户名称'
              backgroundColor='#fbfbfb'
              onSearchClick={this.onSearch}
              searchToken={this.searchKey}
            />
            {activeTabIndex !== 0 && (
              <View className={styles.select} onClick={this.showFilterView}>
                筛选
              </View>
            )}
          </View>
          {activeTabIndex === 1 && (
            <View className={styles.order_label}>已确认的订单请前往商陆花内处理发货</View>
          )}
        </View>
        <View className={styles.main}>
          <Swiper
            current={activeTabIndex}
            onChange={this.onSwiperChange}
            className={styles.swiper_list}
          >
            <SwiperItem className={styles.swiper_list__wrapper}>
              <ScrollView
                className={styles.orders}
                scrollY
                lowerThreshold={500}
                showScrollbar={false}
                refresherEnabled
                data-key='confirmed'
                refresherTriggered={confirmedRefreshing}
                onScrollToLower={this.onBeConfirmedScrollEnd}
                onRefresherRefresh={this.onOrderBillRefersh}
              >
                <OrderBillList
                  showPayStatus
                  onItemClick={this.onOrderBillClick}
                  data={orderBillListBeConfirmed}
                />
              </ScrollView>
            </SwiperItem>
            <SwiperItem className={styles.swiper_list__wrapper}>
              <ScrollView
                className={styles.has_label}
                scrollY
                lowerThreshold={500}
                showScrollbar={false}
                refresherEnabled
                data-key='confirm'
                refresherTriggered={confirmRefreshing}
                onScrollToLower={this.onBeConfirmScrollEnd}
                onRefresherRefresh={this.onOrderBillRefersh}
              >
                <OrderBillList
                  showPayStatus
                  data={orderBillListBeConfirm}
                  onItemClick={this.onOrderBillClick}
                />
              </ScrollView>
            </SwiperItem>
            <SwiperItem className={styles.swiper_list__wrapper}>
              <ScrollView
                className={styles.orders}
                scrollY
                lowerThreshold={500}
                showScrollbar={false}
                refresherEnabled
                data-key='voided'
                refresherTriggered={voidedRefreshing}
                onScrollToLower={this.onVoidedScrollEnd}
                onRefresherRefresh={this.onOrderBillRefersh}
              >
                <OrderBillList data={orderBillListVoided} onItemClick={this.onOrderBillClick} />
              </ScrollView>
            </SwiperItem>
            <SwiperItem className={styles.swiper_list__wrapper}>
              <ScrollView
                className={styles.orders}
                scrollY
                lowerThreshold={500}
                showScrollbar={false}
                refresherEnabled
                data-key='refund'
                refresherTriggered={refundRefreshing}
                onScrollToLower={this.onRefundEnd}
                onRefresherRefresh={this.onOrderBillRefersh}
              >
                <OrderBillList data={orderBillListRefund} onItemClick={this.onOrderBillClick} />
              </ScrollView>
            </SwiperItem>
          </Swiper>
        </View>
        <FilterView
          isOpened={isFilterVisible}
          onClose={this.hideFilterView}
          onValueChanged={this.onFilterValueChanged}
          configOptions={filterOptions}
        />
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(Index)