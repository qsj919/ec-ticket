import Taro from '@tarojs/taro'
import React from 'react'
import { connect } from 'react-redux'
import { View, Text, ScrollView, Block, Image } from '@tarojs/components'
import SearchbarView from '@components/SearchBarView/SearchbarView'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { getOneDate, getTaroParams } from '@utils/utils'
import { setNavigationBarTitle } from '@utils/cross_platform_api'
import MyClientItem from '@@/subpackages/cloud_bill/components/MyClientItem/MyClientItem'
import angleRightIcon from '@/images/angle_right_gray_40.png'
import './index.scss'

export interface ClientItem {
  dwId?: number
  dwName?: string
  logo?: string
  mpUserId?: number
  nickName?: string
  shopBlackUser?: string
  viewDate?: string
  viewTime?: string

  phone?: string
  address?: string
  goodTime?: string
  remark?: string
}
interface State {
  pageNo: number
  topDataTabIndex: number
  screenTabsIndex: number
  isFilterVisible: boolean
  rightListPageNo: number
  todayTime: string
  searchKey: string
}

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    myClientViewData: goodsManage.myClientViewData,
    usersListValues: goodsManage.viewDataViewers,
    userTypeList: goodsManage.userList,
    mpErpId: goodsManage.mpErpId,
    myClientList: goodsManage.myClientList,
    clientAuditTotal: goodsManage.myClientViewData.waitAuditCount,
    shopVisitorAuth: goodsManage.shopVisitorAuth
  }
}

type StateProps = ReturnType<typeof mapStateToProps>
// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class myClient extends React.Component<StateProps & DefaultDispatchProps, State> {
  // config = {
  //   navigationBarTitleText: '我的客户'
  // }
  state = {
    pageNo: 1,
    rightListPageNo: 1,
    topDataTabIndex: Number(getTaroParams(Taro.getCurrentInstance?.()).type) || 0,
    screenTabsIndex: 0,
    isFilterVisible: false,
    todayTime: getOneDate(),
    searchKey: ''
  }
  init = async () => {
    this.props.dispatch({ type: 'goodsManage/selectShopParamStaffViewClientPhone' })
    this.props.dispatch({ type: 'goodsManage/selectShopLinkUsers' })
    this.props.dispatch({ type: 'goodsManage/getShopViewData' })
    this.props.dispatch({
      type: 'goodsManage/selectUserType',
      payload: {
        mpErpId: this.props.mpErpId
      }
    })
    this.requestList()
  }
  componentDidMount() {
    this.init()

    this.props.dispatch({
      type: 'goodsManage/selectShopWaitAuditUsers',
      payload: {
        pageNo: 1,
        jsonParam: {
          mpErpId: this.props.mpErpId
        }
      }
    })
    this.props.dispatch({
      type: 'goodsManage/selestShopParamVisitorAuth'
    })
  }

  componentDidShow() {
    setNavigationBarTitle('我的客户')
  }
  requestRightList = () => {
    const { rightListPageNo, searchKey } = this.state
    this.props.dispatch({
      type: 'goodsManage/selectShopLinkUsers',
      payload: {
        pageNo: rightListPageNo,
        searchKey
      }
    })
  }

  onSearch = () => {
    if (this.state.rightListPageNo === 1) {
      this.requestRightList()
    } else {
      this.setState({ rightListPageNo: 1 }, () => {
        this.requestRightList()
      })
    }
  }
  requestList = async () => {
    const { pageNo } = this.state
    this.props.dispatch({
      type: 'goodsManage/selectShopViewers',
      payload: { pageNo }
    })
  }
  getIsMoreData = () => {
    const { usersListValues } = this.props
    const { pageNo } = this.state
    return usersListValues.length >= pageNo * 20
  }
  getRightIsMoreData = () => {
    const { myClientList } = this.props
    const { rightListPageNo } = this.state
    return myClientList.length >= rightListPageNo * 20
  }
  getViewersList = () => {
    const { usersListValues } = this.props
    let list = {}
    usersListValues.forEach(item => {
      if (list.hasOwnProperty(item.viewDate)) {
        list[item.viewDate].push({ ...item })
      } else {
        list[item.viewDate] = [{ ...item }]
      }
    })
    return list
  }

  _reachBottom = () => {
    const { topDataTabIndex } = this.state
    if (topDataTabIndex === 0) {
      if (this.getIsMoreData()) {
        this.setState(
          prevState => {
            let pageNo = prevState.pageNo + 1
            return {
              pageNo
            }
          },
          () => {
            this.requestList()
          }
        )
      }
    } else {
      if (this.getRightIsMoreData()) {
        this.setState(
          prevState => {
            return {
              rightListPageNo: prevState.rightListPageNo + 1
            }
          },
          () => {
            this.requestRightList()
          }
        )
      }
    }
  }
  onBlockClick = async item => {
    Taro.showLoading()
    await this.props.dispatch({
      type: 'goodsManage/updataUserJurisdiction',
      payload: {
        mpUserId: item.mpUserId,
        code: 'shop_black_user',
        val: item.shopBlackUser === '0' ? '1' : '0'
      }
    })
    Taro.hideLoading()
  }

  onItemClick = item => {
    Taro.navigateTo({
      url: `/subpackages/cloud_bill/pages/my_client_detail/index?mpUserId=${item.mpUserId}&viewDate=${item.viewDate}&listType=${this.state.topDataTabIndex}`
    })
  }

  onTopItemClick = i => {
    this.setState({ topDataTabIndex: i }, () => {
      Taro.pageScrollTo({ scrollTop: 0 })
    })
  }

  onInput = (searchKey: string) => {
    this.setState({ searchKey })
  }

  onClearInput = (searchKey: string) => {
    this.setState({ searchKey, rightListPageNo: 1 }, () => {
      this.requestRightList()
    })
  }

  getTopData = () => {
    const { myClientViewData } = this.props
    return [
      {
        label: '今日访客',
        value: myClientViewData.todayCount,
        id: '001'
      },
      {
        label: '全部客户',
        value: myClientViewData.totalCount,
        id: '002'
      }
    ]
  }

  getScreenTabs = () => {
    return ['全部', '访问时间', '浏览商品']
  }

  onScreenTabsClick = i => {
    this.setState({ screenTabsIndex: i })
  }

  onFilterClick = () => {
    this.setState({ isFilterVisible: true })
  }

  onFilterCencelClick = () => {
    this.setState({ isFilterVisible: false })
  }

  onAuditClientClick = () => {
    Taro.navigateTo({
      url: '/subpackages/cloud_bill/pages/audit_client/index'
    })
  }

  render() {
    const { topDataTabIndex, screenTabsIndex, isFilterVisible, todayTime } = this.state
    const { userTypeList, myClientList, clientAuditTotal, shopVisitorAuth } = this.props
    const list = this.getViewersList()
    return (
      <View className='my_client_wrap'>
        {shopVisitorAuth === '1' && (
          <View className='my_client_wrap_visitor'>
            <View className='my_client_wrap_visitor__content' onClick={this.onAuditClientClick}>
              <View className='my_client_wrap_visitor__content__left'>
                <Text className='content_title'>待审核客户</Text>
                <Text className='content_label'>客户正在申请访问您的云单</Text>
              </View>
              <View className='my_client_wrap_visitor__content__right'>
                <Text>{clientAuditTotal || ''}</Text>
                <Image src={angleRightIcon} className='angle_right' />
              </View>
            </View>
          </View>
        )}
        <View className='my_client_wrap_topData'>
          {this.getTopData().map((item, i) => (
            <View
              className={`my_client_wrap_topData_item ${
                topDataTabIndex === i ? 'topDataTabsY' : ''
              }`}
              key={item.id}
              onClick={() => {
                this.onTopItemClick(i)
              }}
            >
              <Text className='my_client_wrap_topData_item_num'>{item.value}</Text>
              <Text className='my_client_wrap_topData_item_title'>{item.label}</Text>
            </View>
          ))}
        </View>
        {topDataTabIndex === 0 ? (
          <ScrollView
            className='centerScrollView'
            scrollY
            onScrollToLower={this._reachBottom}
            lowerThreshold={500}
          >
            {Object.keys(list).map(key => (
              <View key={key}>
                <View className='my_client_wrap_today'>{key === todayTime ? '今天' : key}</View>
                {list[key].map((item: ClientItem) => (
                  <MyClientItem
                    key={item.mpUserId}
                    item={item}
                    onItemClick={this.onItemClick}
                    onBlockClick={this.onBlockClick}
                    itemPadding='0 25px'
                  />
                ))}
              </View>
            ))}
            {/* {Object.keys(list).length && (
              <View className='bottom'>
                {this.getIsMoreData() ? <Text>上拉加载更多～</Text> : <Text>没有更多数据了～</Text>}
              </View>
            )} */}
            <View className='bottom'>
              {this.getIsMoreData() ? <Text>上拉加载更多～</Text> : <Text>没有更多数据了～</Text>}
            </View>
          </ScrollView>
        ) : (
          <Block>
            <View className='client_search_bar'>
              <SearchbarView
                onInput={this.onInput}
                placeholder='搜索客户名称'
                onClearSearchClick={this.onClearInput}
                onSearchClick={this.onSearch}
              />
              <View className='client_search_bar__label' onClick={this.onSearch}>
                搜索
              </View>
            </View>
            <ScrollView
              className='centerScrollView centerScrollView--search'
              scrollY
              onScrollToLower={this._reachBottom}
              lowerThreshold={500}
            >
              {/* <View className='my_client_wrap_screen'>
              {this.getScreenTabs().map((item, i) => (
                <View
                  onClick={() => {
                    this.onScreenTabsClick(i)
                  }}
                  key={item}
                  className={`my_client_wrap_screen_item ${screenTabsIndex === i && 'screenTabsY'}`}
                >
                  {item}
                </View>
              ))}
              <View
                className='my_client_wrap_screen_item'
                style='color: #2E6BE6; font-size: 19px;'
                onClick={this.onFilterClick}
              >
                筛选
              </View>
            </View> */}
              {myClientList.map(item => (
                <MyClientItem
                  key={item.mpUserId}
                  item={item}
                  actionIsVisible={false}
                  onItemClick={this.onItemClick}
                  onBlockClick={this.onBlockClick}
                  itemPadding='0 25px'
                />
              ))}
              <View className='bottom'>
                {this.getRightIsMoreData() ? (
                  <Text>上拉加载更多～</Text>
                ) : (
                  <Text>没有更多数据了～</Text>
                )}
              </View>
            </ScrollView>
          </Block>
        )}

        {/* <View className='bottom'>
          {(topDataTabIndex === 0 && this.getIsMoreData()) ||
          (topDataTabIndex === 1 && this.getRightIsMoreData()) ? (
            <Text>上拉加载更多～</Text>
          ) : (
            <Text>没有更多数据了～</Text>
          )}
        </View> */}
        {/* {isFilterVisible && (
          <View className='mask'>
            {isFilterVisible && (
              <View className='screen_view'>
                <View className='screen_view_title'>客户分类</View>
                <View className='screen_view_user_type_items'>
                  {userTypeList.map(item => (
                    <View
                      className={`screen_view_user_type_items_item ${
                        item.flag === '1' ? 'userTypeItemY' : 'userTypeItemN'
                      }`}
                    >
                      {item.name}
                    </View>
                  ))}
                </View>
                <View className='screen_view_title'>是否拉黑</View>
                <View className='screen_view_user_type_items'>
                  <View
                    className={`screen_view_user_type_items_item ${
                      false ? 'userTypeItemY' : 'userTypeItemN'
                    }`}
                  >
                    已经拉黑
                  </View>
                  <View
                    className={`screen_view_user_type_items_item ${
                      false ? 'userTypeItemY' : 'userTypeItemN'
                    }`}
                  >
                    未拉黑
                  </View>
                </View>
                <View className='screen_view_title'>是否绑定商陆花档案</View>
                <View className='screen_view_user_type_items'>
                  <View
                    className={`screen_view_user_type_items_item ${
                      false ? 'userTypeItemY' : 'userTypeItemN'
                    }`}
                  >
                    已绑定
                  </View>
                  <View
                    className={`screen_view_user_type_items_item ${
                      false ? 'userTypeItemY' : 'userTypeItemN'
                    }`}
                  >
                    未绑定
                  </View>
                </View>

                <View className='bottom_view_wrap'>
                  <View className='filter-view__action-button'>
                    <View
                      className='filter-view__action-button__reset'
                      onClick={this.onFilterCencelClick}
                    >
                      <Text className='filter-view__action-button__reset___text'>取消</Text>
                    </View>
                    <View
                      className='filter-view__action-button__confirm'
                      // onClick={this.onConfirm.bind(this)}
                    >
                      <Text className='filter-view__action-button__confirm___text'>确认</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        )} */}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(myClient)