import Taro, { Config } from '@tarojs/taro'
import React, { Component } from 'react'
import { Image, View, Input } from '@tarojs/components'
import TicketList from '@components/TicketList/TicketListNew'
import images from '@config/images'
import { connect } from 'react-redux'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import CustomNavigation from '@components/CustomNavigation'
import TicketHeaderBg from '@/images/ticket_header_bg.png'
import { getTaroParams } from '@utils/utils'
import styles from './index.module.scss'
interface State {
  shopId: string
  isCloudGuideVisible: boolean
  activeTabIndex: number
  // searchModelClicked: boolean
  // searchValue: string
}

const mapStateToProps = ({ shop, systemInfo, cloudBill }: GlobalState) => ({
  shopListLoaded: shop.shopListLoaded,
  statusBarHeight: systemInfo.statusBarHeight,
  navigationHeight: systemInfo.navigationHeight,
  isFromOrder: cloudBill.isFromOrder,
  gap: systemInfo.gap
})

type StateProps = ReturnType<typeof mapStateToProps>

// @connect(mapStateToProps)
class Index extends Component<StateProps & DefaultDispatchProps, State> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationStyle: 'custom'
    // navigationBarTitleText: '电子小票',
    // navigationBarBackgroundColor: '#f7f7f7'
  }

  constructor(props) {
    super(props)
    const { shopId, cloudGuide } = getTaroParams(Taro.getCurrentInstance?.())
    this.state = {
      shopId,
      isCloudGuideVisible: false,
      activeTabIndex: 0
      // searchModelClicked: false,
      // searchValue: ''
    }
  }

  componentDidMount() {
    this.showGuide()
    const { activeIndex } = getTaroParams(Taro.getCurrentInstance?.())
    console.log(activeIndex)

    if (activeIndex) {
      this.setState({ activeTabIndex: Number(activeIndex) })
    }
  }
  resetActiveTabIndex = () => {
    this.setState({ activeTabIndex: 1 }, () => {
      this.props.dispatch({
        type: 'cloudBill/resetIsFromOrderFalse'
      })
    })
  }

  componentDidUpdate(prevProps: Readonly<StateProps>) {
    if (!prevProps.shopListLoaded) {
      this.showGuide()
    }
    if (this.props.isFromOrder && !prevProps.isFromOrder) {
      this.resetActiveTabIndex()
    }
  }

  showGuide = () => {
    if (this.props.shopListLoaded) {
      const { cloudGuide } = getTaroParams(Taro.getCurrentInstance?.())
      if (cloudGuide === '1') {
        this.setState({ isCloudGuideVisible: true })
      }
    }
    if (this.props.isFromOrder) {
      this.resetActiveTabIndex()
    }
  }

  onHideGuideClick = () => {
    this.setState({ isCloudGuideVisible: false })
  }

  // onGetUserInfo = e => {
  //   const { iv, encryptedData } = e.detail
  //   if (iv && encryptedData) {
  //     Taro.showLoading({ title: '登录中...' })
  //     return this.props.dispatch({ type: 'user/login' }).then(() => {
  //       Taro.hideLoading()
  //     })
  //   }
  // }
  // onManageClick = () => {
  //   // 配合服务端权限逻辑是否展示管理入口
  // }

  // onTabClick = index => {
  //   this.setState({
  //     activeTabIndex: index
  //   })
  // }

  // onSearchClick = () => {
  //   this.setState({
  //     searchModelClicked: true
  //   })
  // }

  // onSearchBlur = () => {}

  // onSearchCancel = () => {
  //   this.setState({
  //     searchModelClicked: false
  //   })
  // }

  // onSearchChange = e => {
  //   this.setState({ searchValue: e.detail.value })
  // }

  // renderSearchView = () => {
  //   const { gap, statusBarHeight } = this.props
  //   const { searchModelClicked, searchValue } = this.state
  //   return (
  //     <View
  //       className={styles.order_search__viewer}
  //       style={{
  //         width: `${searchModelClicked ? '180px' : '80px'}`,
  //         top: `${statusBarHeight + gap}px`
  //       }}
  //     >
  //       <Image src={search} className={styles.searchImage} />
  //       <Input
  //         className={styles.search_input}
  //         value={searchValue}
  //         placeholder='搜小票'
  //         onInput={this.onSearchChange}
  //         onClick={this.onSearchClick}
  //         onBlur={this.onSearchBlur}
  //       />
  //       {searchModelClicked && (
  //         <View className={styles.search_cancel} onClick={this.onSearchCancel}>
  //           取消
  //         </View>
  //       )}
  //     </View>
  //   )
  // }
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
        <View className={styles.navigation_text}>电子小票</View>
        <Image className={styles.header_bg} src={TicketHeaderBg} />
      </View>
    )
  }

  render() {
    const { shopId, isCloudGuideVisible, activeTabIndex } = this.state
    return (
      <CustomNavigation enableBack={false} stickyTop>
        {this.renderNavigation()}
        <View style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          <View style={{ flex: 1, overflow: 'auto' }}>
            {activeTabIndex === 0 ? (
              <TicketList key='eTicket' ticketType={1} shopId={shopId} />
            ) : (
              <TicketList key='oTicket' ticketType={2} shopId={shopId} />
            )}
            {isCloudGuideVisible && (
              <View className={styles.modal}>
                <Image className={styles.guide__main} src={images.e_ticket.cloud_guide_list} />
                <Image
                  className={styles.guide__finger}
                  src={images.e_ticket.cloud_guide_list_finger}
                />
                <View className={styles.guide__btn} onClick={this.onHideGuideClick}>
                  我知道了
                </View>
              </View>
            )}
          </View>
        </View>
      </CustomNavigation>
    )
  }
}

export default connect(mapStateToProps)(Index)
