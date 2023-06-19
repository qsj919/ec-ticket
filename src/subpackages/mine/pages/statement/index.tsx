/**
 * @Author: Miao Yunliang
 * @Date: 2019-11-11 14:48:27
 * @Desc: 对账单
 */
import Taro, { pxTransform } from '@tarojs/taro'
import React from 'react'
import { View, Image, ScrollView, Text, Input } from '@tarojs/components'
import { connect } from 'react-redux'
import caretDown from '@/images/caret_down_gray_32.png'
import Tabs from '@components/Tabs'
import dayjs from 'dayjs'
import classNames from 'classnames'
import { ActiveItem, BaseItem } from '@@types/base'
import noData from '@/images/no_data.png'
import i18next from 'i18next'
import {
  getStatementCommon,
  getStatementByDetail,
  getStatementByReceipt,
  renameShopName,
  cancelAttention,
  feedbackWithDing
} from '@api/apiManage'
import { 
  getTargerPastDays, 
  formatDateWithWeekDay,
  getTaroParams 
} from '@utils/utils'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import hideArrow from '@/images/hide_arrow.png'
import search from '@/images/search.png'
import messageFeedback from '@services/interactive'
import { trackStatementAndTicketListWithCookie } from '@services/cookie_track'
import navigatorSvc from '@services/navigator'
import DateQuickSelect from '@components/DateQuickSelect'
import { modalHelper } from '@utils/helper'
import trackSvc from '@services/track'
import { t } from '@models/language'
import throttle from 'lodash/throttle'
import ShopListItem from '@components/ShopList/shopList'
import events, { StatementSource } from '@constants/analyticEvents'
import Header from './components/Header'
import styles from './index.module.scss'
import IntroModal from './components/IntroModal'

import DropDown from './components/DropDown'
import Receipt from './components/Receipt'
import DetailCell from './components/DetailCell'
import { skusToSpus } from './helper/skus_to_spus'
import InputModal from '../../components/InputModal'

import { getActiveShop, shopFilteredList } from './selector'
import Feedback from './components/Feedback'

const mapStateToProps = (state: GlobalState) => {
  return {
    shopList: shopFilteredList(state),
    shopListLoaded: state.shop.shopListLoaded,
    activeShopIndex: state.statement.activeShopIndex,
    activeShop: getActiveShop(state),
    sessionId: state.user.sessionId,
    shopSearchKey: state.statement.shopSearchKey
  }
}

export interface ReceiptData {
  billno: string //批次号
  totalsum: number //	销售金额
  totalnum: number //	总数量
  cash: number //	现金支付
  card: number //	刷卡支付
  remit: number //	汇款支付
  agency: number //	代收
  alipay: number //	支付宝支付
  weixinpay: number //	微信支付
  paysum: number //  支付总额
  billId: number
  finpaytype: number // 21正常单据 22 调整单（不显示在列表中） 51 充值单
  prodate: string
  mainType: number // 单据类型
}

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  // isShopSelectModalVisible: boolean
  isDateSelectModalVisible: boolean
  isDescriptionModalVisible: boolean
  startDate: string
  endDate: string
  dropDownData: ActiveItem[]
  activeTabIndex: number
  activeDateTabIndex: number
  currentDate: string
  commonData: {
    beginsum: number //	期初欠款
    endsum: number //	期末欠款
    sendsum: number //	销售金额
    paysum: number //	支付金额
    adjustsum: number //	调整金额
    backsum: number //	退款金额
  }
  receiptListData: Array<{ date: string; data: ReceiptData[] }>
  detailListData: ReturnType<typeof skusToSpus>
  // shopId: string
  shopName: string
  isShopListVisible: boolean
  isRenameModalVisible: boolean
  isFeedbackVisible: boolean
  // shopSearchKey: string
  shopSearchMode: boolean
}

const tabData = [
  { value: 1, label: t('statement:receipt') },
  { value: 2, label: t('statement:detail') }
]

const dateTabData = [
  { value: 7, label: '7天' },
  { value: 15, label: '15天' },
  { value: 30, label: '30天' },
  { value: 90, label: '90天' }
]

function formatDate(date: string) {
  return date.slice(5)
}

const HEADER_HEIGHT_WITHOUT_ADJUST_SUM = 280 + 220 // 除tab的头部高度
const RECEIPT_HEIGHT = 140 // 单据高度
const RECEIPT_TITLE_HEIGHT = 80 // 单据日期标题高度

// @connect(mapStateToProps)
class Statement extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationBarTitleText: '对账单'
  // }

  defaultReceiptDropDownData: ActiveItem[] = [
    { value: 0, label: t('statement:allReceipt'), active: true },
    { value: 1, label: t('statement:unpaidReceipt'), active: false },
    // { value: 2, label: t('statement:paiedReceipt'), active: false },
    { value: 3, label: '退单', active: false }
  ]

  defaultDetailDropDownData: ActiveItem[] = [
    { value: 0, label: t('statement:allDetail'), active: true },
    { value: 1, label: t('statement:buy'), active: false },
    { value: 2, label: t('statement:refund'), active: false }
  ]

  headerHeight = 0

  isAllListDataLoaded = false

  receiptTops: number[] = []

  scrollTop = 0

  scale = 0.5

  constructor(props) {
    super(props)
    const { params } = Taro.getCurrentInstance?.() as any
    this.state = {
      // isShopSelectModalVisible: false,
      isDateSelectModalVisible: false,
      isDescriptionModalVisible: false,
      startDate: dayjs()
        .subtract(15, 'day')
        .format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD'),
      dropDownData: this.defaultReceiptDropDownData,
      activeTabIndex: 0,
      activeDateTabIndex: 1,
      currentDate: '',
      commonData: {
        beginsum: 0, //	期初欠款
        endsum: 0, //	期末欠款
        sendsum: 0, //	销售金额
        paysum: 0, //	支付金额
        adjustsum: 0, //	调整金额
        backsum: 0 //	退款金额
      },
      receiptListData: [],
      detailListData: [],
      // shopId: params.shopId ? decodeURIComponent(params.shopId) : '',
      shopName: params.shopName ? decodeURIComponent(params.shopName) : '',
      isShopListVisible: true,
      isRenameModalVisible: false,
      isFeedbackVisible: false,
      // shopSearchKey: '',
      shopSearchMode: false
    }
  }

  componentDidMount() {
    this.uploadTrackEvent()
    const { windowWidth } = Taro.getSystemInfoSync()
    this.scale = windowWidth / 750
    this.headerHeight = this.scale * HEADER_HEIGHT_WITHOUT_ADJUST_SUM
    if (this.props.shopListLoaded) {
      this.initShopInfo()
      if (this.props.activeShopIndex === 0) {
        this.fetchData()
      }
    }

    trackStatementAndTicketListWithCookie('statement_enter')
  }

  componentDidUpdate(prevProps: Readonly<StateProps>) {
    // todo 反模式 临时方案 后期用dva重构
    if (!prevProps.activeShop && this.props.activeShop) {
      this.fetchData()
    }

    if (
      prevProps.activeShop &&
      this.props.activeShop &&
      prevProps.activeShop.id !== this.props.activeShop.id
    ) {
      this.fetchData()
    }
    if (!prevProps.shopListLoaded && this.props.shopListLoaded) {
      // this.fetchData()
      this.initShopInfo()
    }
  }

  onPageScroll(e) {
    const { scrollTop } = e
    const {
      receiptListData,
      activeTabIndex,
      commonData: { adjustsum }
    } = this.state
    // const extraHeight = adjustsum === 0 ? 0 : 120 * this.scale
    if (activeTabIndex === 1) return
    this.scrollTop = scrollTop
    for (let i = 0; i < this.receiptTops.length - 1; i++) {
      const current = this.receiptTops[i]
      const next = this.receiptTops[i + 1]
      if (
        scrollTop < current ||
        (scrollTop > current && scrollTop < next) ||
        (scrollTop > next && i === this.receiptTops.length - 2)
      ) {
        let date = receiptListData[i].date
        if (scrollTop > next && i === this.receiptTops.length - 2) {
          date = receiptListData[i + 1].date
        }
        if (date !== this.state.currentDate) {
          this.setState({ currentDate: date })
        }
        break
      }
    }
  }

  uploadTrackEvent = () => {
    const { params } = Taro.getCurrentInstance?.() as any
    let eventParam
    switch (params.statementSource) {
      case '1':
        eventParam = StatementSource.details
        break
      case '2':
        eventParam = StatementSource.notification
        break
      default:
        eventParam = StatementSource.public
    }
    trackSvc.track(events.statement, eventParam)
  }

  initShopInfo = () => {
    const { shopId } = getTaroParams(Taro.getCurrentInstance?.())
    this.props.dispatch({ type: 'statement/initShop', payload: { shopId } })
  }

  getCommonParams = () => {
    // 处理二代 处理无参数。
    const { shopId, sn, epid } = getTaroParams(Taro.getCurrentInstance?.())
    const { sessionId } = this.props
    const { startDate, endDate } = this.state
    const { activeShop } = this.props
    let _shopId = Number(shopId),
      _sn = Number(sn),
      _epid = Number(epid)
    // debugger
    if (activeShop) {
      // 二代暂时不支持小票
      // todo 二代门店，从详情页进来，未做处理
      // if (activeShop.saasType === 2) {
      //   throw new Error('该店铺暂不支持查看对账单')
      // }
      _shopId = activeShop.shopid
      _sn = activeShop.sn
      _epid = activeShop.epid
    }
    if (!_epid) {
      throw new Error('未关联店铺')
      // this.props.dispatch({ type: 'shop/fetchShopList', payload: { sessionId } })
    }
    const params: {
      sessionId: string
      sn: number
      epid: number
      shopId: number
      startDate: string
      endDate: string
      dwId?: string
    } = {
      sessionId,
      sn: _sn,
      epid: _epid,
      shopId: _shopId,
      startDate,
      endDate
    }
    return params
  }

  fetchData = () => {
    this.fetchCommonData()
    this.fetchListData()
  }

  // 顶部基础信息
  fetchCommonData = () => {
    try {
      const params = this.getCommonParams()
      if (!params.epid) return
      getStatementCommon(params).then(res => {
        this.setState({ commonData: res.data })
      })
    } catch (e) {
      // navigatorSvc.redirectTo({ url: '/pages/index/index' })
      Taro.showToast({ title: e.message, icon: 'none' })
    }
  }

  // 按单据
  fetchReceiptData = () => {
    try {
      const params = this.getCommonParams()
      if (!params.epid) return
      const { dropDownData } = this.state
      const activeDropDown = dropDownData.find(item => item.active)
      const searchType = activeDropDown ? activeDropDown.value : 0
      getStatementByReceipt({ ...params, searchType }).then(res => {
        const billList = res.data.lstSalesByBill || []
        const receiptListData = billList.reduce((prev, cur: ReceiptData) => {
          const lastItem = prev[prev.length - 1]
          if (lastItem && lastItem.date && lastItem.date === formatDateWithWeekDay(cur.prodate)) {
            lastItem.data.push(cur)
          } else {
            prev.push({
              date: formatDateWithWeekDay(cur.prodate),
              data: [{ ...cur }]
            })
          }
          return prev
        }, [] as Array<{ date: string; data: ReceiptData[] }>)
        const currentDate = receiptListData[0] ? receiptListData[0].date : ''
        this.setState({ receiptListData, currentDate }, this.calculateListDatePosition)
      })
    } catch (e) {
      // navigatorSvc.redirectTo({ url: '/pages/index/index' })
      Taro.showToast({ title: e.message, icon: 'none' })
    }
  }

  // 按明细
  fetchDetailsData = () => {
    try {
      const params = this.getCommonParams()
      if (!params.epid) return
      getStatementByDetail(params).then(res => {
        const { dropDownData } = this.state
        const { lstBackByDetail = [], lstSalesByDetail = [] } = res.data
        const activeDropDown = dropDownData.find(item => item.active)
        const listType = activeDropDown ? activeDropDown.value : 0
        let detailListData
        if (listType === 0) {
          detailListData = [...skusToSpus(lstSalesByDetail), ...skusToSpus(lstBackByDetail)]
        } else if (listType === 1) {
          detailListData = [...skusToSpus(lstSalesByDetail)]
        } else {
          detailListData = [...skusToSpus(lstBackByDetail)]
        }
        this.setState({
          detailListData
        })
      })
    } catch (e) {
      // navigatorSvc.redirectTo({ url: '/pages/index/index' })
      Taro.showToast({ title: e.message, icon: 'none' })
    }
  }

  fetchListData = () => {
    const { activeTabIndex } = this.state
    if (activeTabIndex === 0) {
      this.fetchReceiptData()
    } else {
      this.fetchDetailsData()
    }
  }

  // getActiveShop = () => {
  //   const { shopList } = this.props
  //   const { activeShopIndex } = this.state
  //   const activeShop = shopList[activeShopIndex]
  //   return activeShop
  // }

  calculateListDatePosition = () => {
    let base = this.headerHeight
    const tops = this.state.receiptListData.reduce((prev, cur) => {
      const height = (cur.data.length * RECEIPT_HEIGHT + RECEIPT_TITLE_HEIGHT) * this.scale // 日期加列表的总高度
      const result = [...prev, base]
      base += height
      return result
    }, [])

    this.receiptTops = tops
  }

  // 店铺相关
  onStarClick = () => {
    if (this.props.activeShop.mineErp === 0) {
      return messageFeedback.showToast('你没有权限操作该店铺')
    }
    // const { sessionId } = this.getCommonParams()
    this.props.dispatch({
      type: 'statement/toggleStarShop'
    })
  }

  showRenameModal = () => {
    this.setState({ isRenameModalVisible: true })
  }

  hideRenameModal = () => {
    this.setState({ isRenameModalVisible: false })
  }

  onEditClick = () => {
    if (this.props.activeShop.mineErp === 0) {
      return messageFeedback.showToast('你没有权限操作该店铺')
    }
    this.showRenameModal()
  }

  onUnfollowClick = () => {
    if (this.props.activeShop.mineErp === 0) {
      return messageFeedback.showToast('你没有权限操作该店铺')
    }
    const { activeShop } = this.props
    Taro.showModal({
      title: t('unfollowModalTitle'),
      content: t('unfollowModalContent'),
      confirmText: t('confirm'),
      cancelText: t('cancel')
    }).then(res => {
      if (res.confirm) {
        const param = {
          flag: 1,
          sn: activeShop.sn,
          epid: activeShop.epid,
          shopid: activeShop.shopid
        }
        cancelAttention(param)
          .then(() => {
            this.props.dispatch({ type: 'statement/afterUnfollowShop' })
            // MtaH5.clickStat(events.unbind)
            // const query = `pk=${params.pk}&sn=${params.sn}&epid=${params.epid}&sessionId=${params.sessionId}&subscribe=${params.subscribe}&menuBtn=1`
            // navigatorSvc.navigateTo({ url: `/pages/eTicketList/index?${query}` })
          })
          .catch(err => console.log(err))
      }
    })
  }

  onSaveShopName = (name: string) => {
    const { sessionId } = this.getCommonParams()
    const { activeShop } = this.props
    if (activeShop) {
      renameShopName({
        shopName: name,
        mpErpId: activeShop.id
      }).then(() => {
        this.props.dispatch({
          type: 'shop/fetchShopList'
        })
      })
    }
  }

  // showShopSelector = () => {
  //   this.setState({ isShopSelectModalVisible: true })
  // }

  // hideShopSelector = () => {
  //   this.setState({ isShopSelectModalVisible: false })
  // }

  onShopCellClick = (data, i: number) => {
    this.state.shopSearchMode && this.setState({ shopSearchMode: false })
    this.props.dispatch({
      type: 'statement/save',
      payload: { activeShopIndex: i }
    })
  }

  // 日期选择相关

  onDateTabClick = (i: number, data: BaseItem) => {
    const { startDate, endDate } = getTargerPastDays(data.value)
    this.setState({ startDate, endDate, activeDateTabIndex: i }, this.fetchData)
  }

  onDateClick = () => {
    this.setState({ isDateSelectModalVisible: true })
  }

  hideDatePicker = () => {
    this.setState({ isDateSelectModalVisible: false })
  }

  onConfirmDate = (s: string, e: string) => {
    this.hideDatePicker()
    this.setState({ startDate: s, endDate: e }, this.fetchData)
  }

  // 说明浮层

  onQuestionClick = () => {
    this.setState({ isDescriptionModalVisible: true })
  }

  hideDescModal = () => {
    this.setState({ isDescriptionModalVisible: false })
  }

  // tab & 筛选
  onTabClick = (i: number) => {
    const { activeTabIndex } = this.state
    if (activeTabIndex === i) return
    if (i === 0) {
      this.defaultDetailDropDownData = this.state.dropDownData
      this.setState({ dropDownData: this.defaultReceiptDropDownData })
    } else {
      this.defaultReceiptDropDownData = this.state.dropDownData
      this.setState({ dropDownData: this.defaultDetailDropDownData })
    }

    this.setState({ activeTabIndex: i }, this.fetchListData)
  }

  onDropDownMenuItemClick = (item: ActiveItem) => {
    this.setState(
      state => ({
        dropDownData: state.dropDownData.map(sItem => ({
          ...sItem,
          active: item.value === sItem.value
        }))
      }),
      this.fetchListData
    )
  }

  // 反馈
  showFeedback = () => {
    this.setState({ isFeedbackVisible: true })
  }

  hideFeedback = () => {
    this.setState({ isFeedbackVisible: false })
  }

  onFeedback = (content: string) => {
    if (content.trim() === '') {
      messageFeedback.showToast('请输入内容')
      return
    }
    feedbackWithDing(content).then(() => {
      this.hideFeedback()
      messageFeedback.showToast('反馈成功')
    })
  }

  onReceiptClick = (billid: number) => {
    const params = this.getCommonParams()
    const $params = getTaroParams(Taro.getCurrentInstance?.())
    const query = `pk=${billid}&sn=${params.sn}&epid=${params.epid}&sessionId=${params.sessionId}&shopId=${params.shopId}&shopName=${$params.shopName}&type=1`
    navigatorSvc.navigateTo({ url: `/pages/eTicketDetail/landscapeModel?${query}` })
  }

  toggleViewType = () => {
    this.setState(prevState => ({
      isShopListVisible: !prevState.isShopListVisible
    }))
  }

  onShopSearchFocus = () => {
    this.setState({ shopSearchMode: true })
  }

  onCancelShopSearch = () => {
    this.setState({ shopSearchMode: false })
    this.props.dispatch({ type: 'statement/save', payload: { shopSearchKey: '' } })
  }

  onShopSearchInput = throttle(e => {
    this.props.dispatch({ type: 'statement/save', payload: { shopSearchKey: e.detail.value } })
  }, 200)

  render() {
    const {
      isDateSelectModalVisible,
      isDescriptionModalVisible,
      startDate,
      endDate,
      dropDownData,
      currentDate,
      activeTabIndex,
      commonData,
      receiptListData,
      detailListData,
      activeDateTabIndex,
      isShopListVisible,
      isRenameModalVisible,
      isFeedbackVisible,
      shopSearchMode
    } = this.state
    const { activeShop, activeShopIndex, shopSearchKey, shopList } = this.props
    // const _shopList = this.getFilteredShopList()
    const listData = activeTabIndex === 0 ? receiptListData : detailListData
    const isNoData = listData.length === 0
    const _shopName = (activeShop && activeShop.shopName) || this.state.shopName
    // const shopLogo = (activeShop && activeShop.logoUrl) || defaultShopLogo
    return (
      <View className={styles.statement_container}>
        {/* 日期选择 */}
        <View className={styles.header}>
          <DateQuickSelect
            activeTabIndex={activeDateTabIndex}
            onDateClick={this.onDateClick}
            onTabClick={this.onDateTabClick}
            onDateConfirm={this.onConfirmDate}
          />
        </View>

        {/* 内容区 */}
        <View className={styles.content}>
          {/* 左边店铺列表 */}
          <View
            className={classNames(styles['content__left'], {
              [styles['content__left--hide']]: !isShopListVisible,
              [styles['content__left--full']]: shopSearchMode
            })}
          >
            <View
              className={classNames(styles.content__left__search, {
                // [styles['content__left__search--full']]: shopSearchMode
              })}
            >
              <Image src={search} className={styles.content__left__search__icon} />
              <Input
                className={styles.content__left__search__input}
                value={shopSearchKey}
                onFocus={this.onShopSearchFocus}
                onInput={this.onShopSearchInput}
                placeholder='搜索'
              />
              {shopSearchMode && (
                <Text
                  className={styles.content__left__search__cancel}
                  onClick={this.onCancelShopSearch}
                >
                  取消
                </Text>
              )}
            </View>
            <ScrollView className={styles['content__left__shop_list']} scrollY>
              {shopList.map((item, index) => (
                <ShopListItem
                  key={item.id}
                  size='small'
                  shopItem={item}
                  onShopNameClick={this.onShopCellClick}
                  index={index}
                  checkShopIndex={shopSearchMode ? -1 : activeShopIndex}
                />
              ))}
            </ScrollView>
          </View>

          {!shopSearchMode && (
            <View
              className={classNames(styles.hideShopList, {
                [styles['hideShopList--hide']]: !isShopListVisible
              })}
              onClick={this.toggleViewType}
            >
              <Image
                src={hideArrow}
                className={styles.hideArrowImg}
                style={isShopListVisible ? {} : { transform: `rotateY(180deg)` }}
              />
            </View>
          )}
          {/* 右边主内容 */}
          <View
            className={classNames(styles['content__right'], {
              [styles['content__right--hide']]: shopSearchMode
            })}
          >
            {/* 头部其他信息 */}
            <Header
              onQuestionClick={this.onQuestionClick}
              data={commonData}
              shopName={_shopName}
              onStarClick={this.onStarClick}
              star={activeShop && activeShop.showOrder === 1}
              onEditClick={this.onEditClick}
              onUnfollowClick={this.onUnfollowClick}
            />
            {/* tab & 筛选  & 时间*/}
            <View>
              <View className={styles.sticky_part}>
                <View id='tab_container'>
                  <Tabs data={tabData} onTabItemClick={this.onTabClick} />
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: pxTransform(40)
                    }}
                  >
                    <DropDown data={dropDownData} onItemClick={this.onDropDownMenuItemClick} />
                  </View>
                </View>
                {activeTabIndex === 0 && !isNoData && (
                  <View className={styles.list__date}>{currentDate}</View>
                )}
              </View>

              {/* 列表 */}
              {isNoData ? (
                <View className={styles.no_data_wrapper}>
                  <Image src={noData} className={styles.no_data} />
                  <View>暂无数据～</View>
                </View>
              ) : (
                <View className={styles.list}>
                  {activeTabIndex === 0
                    ? receiptListData.map((item, index) => (
                        <View key={item.date}>
                          {index > 0 && (
                            <View className={classNames(styles.list__date, 'list_date')}>
                              {item.date}
                            </View>
                          )}
                          <View>
                            {item.data.map(recepit => (
                              <Receipt
                                data={recepit}
                                key={recepit.billno}
                                onReceiptClick={this.onReceiptClick}
                              />
                            ))}
                          </View>
                        </View>
                      ))
                    : detailListData.map(item => <DetailCell key={item.imgThumbUrl} {...item} />)}
                </View>
              )}
            </View>
          </View>
        </View>
        {/* {isDateSelectModalVisible && (
          <DatePicker
            tabs={false}
            dateStart={startDate}
            dateEnd={endDate}
            onDateSelCancel={this.hideDatePicker}
            onConfimDateClick={this.onConfirmDate}
            bottom='50px'
          />
        )} */}
        {/* 反馈 */}
        {/* <View className={styles.feedback} onClick={this.showFeedback}>
          <Text>纠错</Text>
          <Text>反馈</Text>
        </View>
        <Feedback
          visible={isFeedbackVisible}
          onRequestClose={this.hideFeedback}
          onBtnClick={this.onFeedback}
        /> */}
        {/* <ShopSelector
          data={shopList}
          onShopCellClick={this.onShopCellClick}
          visible={isShopSelectModalVisible}
          onRequestClose={this.hideShopSelector}
        /> */}
        <IntroModal visible={isDescriptionModalVisible} onRequestClose={this.hideDescModal} />
        {/* 不用条件渲染来做的话，input无法聚焦 */}
        {isRenameModalVisible && (
          <InputModal
            rules={[{ maxLength: 20, msg: '长度应小于20个字符' }]}
            visible={isRenameModalVisible}
            title='修改店名'
            onConfirm={this.onSaveShopName}
            onRequestClose={this.hideRenameModal}
            defaultInput={_shopName}
          />
        )}
      </View>
    )
  }
}
export default connect(mapStateToProps)(Statement)