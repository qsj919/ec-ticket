import Taro, {  Config } from '@tarojs/taro'
import React, {Component } from 'react'
import { getOrderList, purBillCancel, orderAddShoppingCart, launchOrderPay } from '@api/apiManage'
import { connect } from 'react-redux'
import { GlobalState } from '@@types/model_state'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import Tabs from '@components/Tabs'
import cloudEmpty from '@/images/cloud_bill_empty.png'
import messageFeedback from '@services/interactive'
import { FilterOption, PAY_STATUS } from '@@types/base'
import navigatorSvc from '@services/navigator'
import { getShopParamVal } from '@api/goods_api_manager'
import { getTaroParams } from '@utils/utils'
import dayjs from 'dayjs'

import FilterView from './components/FilterView/index'
// import FilterView from '../../subpackages/factory/components/FilterView/index'
import OrderItem from './components/OrderItem/index'
import './index.scss'

interface OrderItemType {
  billId: number
  logoUrl: string
  shopName: string
  flagName: string
  totalNum: string
  totalMoney: string
  proTime: string
  payStatus: number
  styleImg: string
}

interface State {
  orderList: Array<OrderItemType>
  orderLoading: Boolean
  pageNo: number
  activeTabIndex: number
  total: number
  isFilterVisible: boolean
  filterOptions: FilterOption[]
  orderPay: boolean
}

const mapStateToProps = ({ cloudBill }: GlobalState) => {
  return {
    mpErpId: cloudBill.mpErpId
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect(mapStateToProps)
class Index extends Component<StateProps, State> {
  // config = {
  //   navigationBarTitleText: '订单列表'
  // }
  constructor(props) {
    super(props)
    this.state = {
      orderList: [] as OrderItemType[],
      orderLoading: false,
      pageNo: 1,
      total: 0,
      activeTabIndex: 0,
      isFilterVisible: false,
      orderPay: false,
      filterOptions: [
        {
          typeValue: 17,
          type: 'range' as const,
          typeName: '日期',
          multipleSelect: false,
          items: [] as string[]
        },
        {
          typeValue: 17,
          type: 'input' as const,
          typeName: '档口名称',
          multipleSelect: false,
          items: [] as string[]
        }
      ]
    }
  }
  componentDidMount() {
    const { activeTabIndex } = getTaroParams(Taro.getCurrentInstance?.())
    if (activeTabIndex) {
      this.setState({ activeTabIndex: Number(activeTabIndex) })
    }
    this.setState({ orderLoading: true })
    if (this.props.mpErpId) {
      getShopParamVal({
        code: 'order_pay',
        mpErpId: this.props.mpErpId
      }).then(({ data }) => {
        this.setState({
          orderPay: data.val === '1'
        })
      })
    }
  }
  componentDidShow() {
    let pages = Taro.getCurrentPages()
    let currPage = pages[pages.length - 1] // 获取当前页面
    if (currPage.__data__ && currPage.__data__.cancelBillFlag) {
      // 获取值
      this.onRefresh()
      currPage.setData({
        cancelBillFlag: 0
      })
    }
  }
  onTabClick = (index: number) => {
    this.setState({ activeTabIndex: index }, () => {
      this.onRefresh()
    })
  }
  onRefresh() {
    this.setState({ orderLoading: true, pageNo: 1, total: 0, orderList: [] }, () => {
      this.getOrderList()
    })
  }
  onNewScrollEnd = () => {
    if (this.state.orderList.length < this.state.total) {
      this.setState(
        prevState => {
          return {
            pageNo: prevState.pageNo + 1
          }
        },
        () => {
          this.getOrderList()
        }
      )
    }
  }
  getOrderList() {
    const { activeTabIndex, pageNo, filterOptions } = this.state
    let params: {
      type: number
      pageNo: number
      payStatus?: number
    } = {
      type: 0,
      pageNo
    }

    if (
      process.env.INDEPENDENT === 'independent' ||
      process.env.INDEPENDENT === 'foodindependent'
    ) {
      if (activeTabIndex === 1) {
        params.type = 4
      } else if (activeTabIndex === 2) {
        params.type = 2 //未发
      } else if (activeTabIndex === 3) {
        params.type = 3 //已发
      } else if (activeTabIndex === 4) {
        params.type = 1 //已取消
      } else if (activeTabIndex === 5) {
        params.type = 5 //已取消
      }
    } else {
      if (activeTabIndex === 1) {
        params.type = 2
      } else if (activeTabIndex === 2) {
        params.type = 3 //未发
      } else if (activeTabIndex === 3) {
        params.type = 1 //已发
      }
    }
    const proTimeArr = filterOptions[0].items
    proTimeArr[0] && (params.proTimeStart = proTimeArr[0])
    // 结束日期需加一天 因服务端查的是时间点 如两个相同日期就查不出数据
    proTimeArr[1] &&
      (params.proTimeEnd = dayjs(proTimeArr[1])
        .add(1, 'days')
        .format('YYYY-MM-DD'))

    const searchKeyArr = filterOptions[1].items
    searchKeyArr[0] && (params.searchKey = searchKeyArr[0])

    getOrderList(params)
      .then(res => {
        Taro.hideLoading()
        if (pageNo === 1) {
          this.setState({
            orderList: res.data.rows,
            pageNo: pageNo,
            total: res.data.total,
            orderLoading: false
          })
        } else {
          this.setState(prevState => ({
            orderList: [...prevState.orderList, ...res.data.rows],
            pageNo: pageNo,
            total: res.data.total,
            orderLoading: false
          }))
        }
      })
      .catch(err => {
        Taro.hideLoading()
        this.setState({ pageNo: 1, total: 0, orderList: [], orderLoading: false })
        console.log('err :', err)
      })
  }
  onCheckDetailClick = item => {
    const { activeTabIndex } = this.state
    const { billId } = item
    let type = 0
    if (activeTabIndex === 1) {
      type = 2
    } else if (activeTabIndex === 2) {
      type = 3
    } else if (activeTabIndex === 3) {
      type = 1
    }
    const { orderPay } = this.state
    const query = `billId=${billId}&type=${type}&mpErpId=${item.mpErpId}&orderPay=${orderPay}`
    navigatorSvc.navigateTo({
      url: `/subpackages/mine/pages/order_list/order_list_detail/index?${query}`
    })
  }

  // 再订一单
  addShoppingCart = billId => {
    orderAddShoppingCart(billId)
      .then(res => {
        Taro.hideLoading()
        messageFeedback.showAlertWithCancel('商品已加入进货车,是否前往进货车？', '', () => {
          if (
            process.env.INDEPENDENT === 'independent' ||
            process.env.INDEPENDENT === 'foodindependent'
          ) {
            Taro.navigateTo({
              url: '/subpackages/cloud_bill/pages/replenishment/index'
            })
          } else {
            Taro.switchTab({
              url: '/pages/stock_bar/index'
            })
          }
        })
      })
      .catch(err => {
        console.log('err :', err)
      })
  }

  // 作废订单
  orderCancel = billId => {
    messageFeedback.showAlertWithCancel(`确认取消订单？取消后订单将作废`, '', () => {
      purBillCancel(billId)
        .then(res => {
          Taro.hideLoading()
          this.onRefresh()
        })
        .catch(err => {
          console.log('err :', err)
        })
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
      this.onRefresh()
    })
  }

  onPayClick = (billId, mpErpId) => {
    let _this = this
    Taro.showLoading({ title: '请稍等...' })
    launchOrderPay({
      mpErpId,
      billId
    })
      .then(({ data }) => {
        // eslint-disable-next-line
        wx.requestPayment({
          timeStamp: data.timeStamp,
          nonceStr: data.nonceStr,
          package: data.package,
          signType: data.signType,
          paySign: data.paySign,
          success(res) {
            Taro.hideLoading()
            _this.onRefresh()
          },
          fail(res) {
            Taro.hideLoading()
          }
        })
      })
      .catch(e => {
        Taro.hideLoading()
        return
      })
  }

  render() {
    const {
      orderList,
      activeTabIndex,
      orderLoading,
      total,
      isFilterVisible,
      filterOptions,
      orderPay
    } = this.state
    let _tabs = [{ label: '全部' }, { label: '未发货' }, { label: '已发货' }, { label: '已取消' }]
    if (
      process.env.INDEPENDENT === 'independent' ||
      process.env.INDEPENDENT === 'foodindependent'
    ) {
      _tabs = [
        { label: '全部' },
        { label: '待支付' },
        { label: '未发货' },
        { label: '已发货' },
        { label: '已取消' },
        { label: '售后' }
      ]
    }
    return (
      <View className='orderWrapper'>
        <View className='header'>
          <Tabs data={_tabs} activeIndex={activeTabIndex} onTabItemClick={this.onTabClick} />
          {process.env.INDEPENDENT !== 'independent' && (
            <View className='header__btn' onClick={this.showFilterView}>
              筛选
            </View>
          )}
        </View>
        <ScrollView
          className='orderWrapper__list'
          scrollY
          onRefresherRefresh={this.onRefresh}
          refresherEnabled
          // onScroll={this.onScroll}
          onScrollToLower={this.onNewScrollEnd}
          refresherTriggered={orderLoading}
          // scrollTop={this.newGoodsListScrollTop}
        >
          {orderList.map((orderItem, index) => {
            return (
              <OrderItem
                item={orderItem}
                index={index}
                onItemClick={this.onCheckDetailClick}
                key={index}
                addShoppingCart={this.addShoppingCart}
                orderCancel={this.orderCancel}
                onPayPropsClick={this.onPayClick}
                orderPay={orderPay}
              />
            )
          })}
          {orderList.length > 0 && orderList.length >= total && !orderLoading && (
            <View className='bottom_tip'>已经到底啦~</View>
          )}
          {orderList.length === 0 && !orderLoading && (
            <View className='empty'>
              <Image src={cloudEmpty} className='empty_img' />
              <Text>暂无数据</Text>
            </View>
          )}
        </ScrollView>

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
export default connect(mapStateToProps)(Index)