import Taro from '@tarojs/taro'
import React, { useState } from 'react'
import { View, Image, ScrollView, Text, Block } from '@tarojs/components'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import SearchbarView from '@components/SearchBarView/SearchbarView'
import Tabs from '@components/Tabs'
import { connect } from 'react-redux'
import { setNavigationBarTitle } from '@utils/cross_platform_api'
import { getRelativeDate } from '@utils/utils'
import CloseIcon from '@/images/close.png'
import { updateUserAuditFlag } from '@api/goods_api_manager'
import defaultHeadImg from '../../images/default_headImg.png'
import styles from './index.scss'

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    mpErpId: goodsManage.mpErpId,
    clientAuditList: goodsManage.clientAuditList,
    myClientList: goodsManage.myClientList,
    clientAuditTotal: goodsManage.myClientViewData.waitAuditCount
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface USER_ITEM {
  mpUserId: number
  nickName: string
  logo: string
  viewDate: string
  viewTime: string
  auditFlag: number
  remark: string
}
interface State {
  isAlert: boolean
  userItem: USER_ITEM
  pageNo: number
  activeIndex: number
  showPassToast: boolean
  curPassClientName: string
  tabsMenu: Array<{
    label: string
    value?: string | number
  }>
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class AuditClient extends React.Component<StateProps & DefaultDispatchProps, State> {
  // config = {
  //   navigationBarTitleText: '审核客户'
  // }

  state = {
    isAlert: false,
    userItem: {} as USER_ITEM,
    pageNo: 1,
    activeIndex: 0,
    showPassToast: false,
    curPassClientName: '',
    tabsMenu: [
      {
        label: '待处理',
        value: 0
      },
      {
        label: '已通过',
        value: 1
      }
    ]
  }

  searchKey: string = ''

  componentDidShow() {
    setNavigationBarTitle('审核客户')
  }

  componentDidMount() {
    this.fetchList()
  }

  onTabClick = index => {
    const { activeIndex } = this.state
    const _activeIndex = activeIndex === index ? activeIndex : index
    this.props.dispatch({ type: 'goodsManage/save', payload: { clientAuditList: [] } })
    this.setState({ activeIndex: _activeIndex, pageNo: 1 }, () => {
      this.fetchList()
    })
  }

  onActionClick = (u, type) => {
    if (u.auditFlag === 1) {
      this.updateStatus(u, type)
    }
    if (u.auditFlag === 2) {
      if (this.state.isAlert) {
        this.updateStatus(u, type)
      } else {
        this.setState({
          isAlert: true,
          userItem: u
        })
      }
    } else {
      this.onCloseClick()
    }
  }

  onCloseClick = () => {
    this.setState({
      isAlert: false
    })
  }

  onScrollToLower = () => {
    if (this.getRightIsMoreData()) {
      this.setState(
        prevState => {
          return {
            pageNo: prevState.pageNo + 1
          }
        },
        () => {
          this.fetchList()
        }
      )
    }
  }

  fetchList = async () => {
    const { pageNo, activeIndex } = this.state
    const { mpErpId = 1 } = this.props
    Taro.showLoading({ title: '请稍等...' })
    await this.props.dispatch({
      type: 'goodsManage/selectShopWaitAuditUsers',
      payload: {
        pageNo,
        jsonParam: {
          mpErpId,
          searchKey: this.searchKey,
          auditFlags: activeIndex === 0 ? [1, 2] : [3]
        }
      }
    })
    if (activeIndex === 0) {
      this.changeTabMenu()
    }
    Taro.hideLoading()
  }

  changeTabMenu = () => {
    const { clientAuditTotal } = this.props
    // const pendingNum = clientAuditList.reduce((pre, cur) => {
    //   return cur.auditFlag !== 3 ? pre + 1 : pre
    // }, 0)
    this.setState({
      tabsMenu: [
        {
          label: `待处理(${clientAuditTotal})`,
          value: 0
        },
        {
          label: '已通过',
          value: 1
        }
      ]
    })
  }

  getRightIsMoreData = () => {
    const { clientAuditList } = this.props
    const { pageNo } = this.state
    return clientAuditList.length >= pageNo * 20
  }

  updateStatus = (u, type) => {
    let _auditFlag = 2
    if (type === 'through') {
      _auditFlag = 3
      this.setState({ curPassClientName: u.nickName, showPassToast: true }, () => {
        setTimeout(() => {
          this.setState({ showPassToast: false })
        }, 2000)
      })
    }
    updateUserAuditFlag({
      mpErpId: this.props.mpErpId,
      mpUserId: u.mpUserId,
      auditFlag: _auditFlag
    }).then(() => {
      this.fetchList()
      this.props.dispatch({ type: 'goodsManage/getShopViewData' })
    })
    this.onCloseClick()
  }

  onInput = searchKey => {
    this.searchKey = searchKey
  }

  onSearchConfirm = () => {
    this.setState(
      {
        pageNo: 1
      },
      this.fetchList
    )
  }

  onClearClick = () => {
    this.searchKey = ''
    this.setState(
      {
        pageNo: 1
      },
      this.fetchList
    )
  }

  onHeadImageClick = async client => {
    if (client.auditFlag === 1 || client.auditFlag === 2) {
      Taro.navigateTo({
        url: `/subpackages/cloud_bill/pages/my_client_detail_nodata/index?logo=${client.logo}&nickName=${client.nickName}&mpUserId=${client.mpUserId}&auditFlag=${client.auditFlag}`
      })
    } else {
      Taro.showLoading({ title: '请稍等...' })
      this.props
        .dispatch({ type: 'goodsManage/selectShopLinkUsers' })
        .then(myClientList => {
          const user = myClientList.find(item => item.mpUserId === client.mpUserId)
          Taro.hideLoading()
          Taro.navigateTo({
            url: `/subpackages/cloud_bill/pages/my_client_detail/index?mpUserId=${user &&
              user.mpUserId}&viewDate=${user && user.viewDate}&listType=1`
          })
        })
        .catch(e => {
          Taro.hideLoading()
        })
    }
  }

  getViewersList = () => {
    const { clientAuditList = [] } = this.props
    let list = {}
    clientAuditList.forEach(item => {
      if (list.hasOwnProperty(item.viewDate)) {
        list[item.viewDate].push({ ...item })
      } else {
        list[item.viewDate] = [{ ...item }]
      }
    })
    return list
  }

  renderAlertView = () => {
    const { userItem } = this.state
    return (
      <View className='alert_view_mask'>
        <View className='alert_view_mask__content'>
          <View className='alert_view_mask__content___title'>选择操作</View>
          <View className='alert_view_mask__content___label'>是否允许该客户访问您的云单</View>
          <View className='alert_view_mask__content___action'>
            <View
              className='alert_view_mask__content___action___item access_denied'
              onClick={this.onActionClick.bind(this, userItem, 'refused')}
            >
              拒绝访问
            </View>
            <View
              className='alert_view_mask__content___action___item allow_access'
              onClick={this.onActionClick.bind(this, userItem, 'through')}
            >
              允许访问
            </View>
          </View>
          <Image src={CloseIcon} className='close_icon' onClick={this.onCloseClick} />
        </View>
      </View>
    )
  }

  renderActionView = u => {
    return (
      <View>
        {u.auditFlag === 1 && (
          <View style='display: flex;'>
            <View
              className='audit_client__content___item___right___y'
              onClick={this.onActionClick.bind(this, u, 'through')}
            >
              通过
            </View>
            <View
              className='audit_client__content___item___right___n'
              onClick={this.onActionClick.bind(this, u, 'refused')}
            >
              拒绝
            </View>
          </View>
        )}
        {u.auditFlag === 2 && (
          <View
            className='audit_client__content___item___right___y'
            onClick={this.onActionClick.bind(this, u, 'through')}
          >
            通过
          </View>
        )}
        {u.auditFlag === 3 && (
          <View className='audit_client__content___item___right___yed'>已通过</View>
        )}
      </View>
    )
  }

  renderAucitClientList = () => {
    const list = this.getViewersList()
    return (
      <View>
        {Object.keys(list).map(k => (
          <View key={k}>
            <View className='view_time'>{getRelativeDate(k)}</View>
            {list[k].map(u => (
              <View key={u.mpUserId} className='audit_client__content___item'>
                <View className='audit_client__content___item___left'>
                  <Image
                    className='user_logo'
                    onClick={() => this.onHeadImageClick(u)}
                    src={u.logo || defaultHeadImg}
                    mode='aspectFill'
                  />
                  <View className='user_info'>
                    <View className='user_info__title'>
                      <Text className='user_info__title__name'>{u.remark || u.nickName}</Text>
                      {u.auditFlag === 2 && (
                        <View className='user_info__title__tag'>
                          <Text>已拒绝</Text>
                        </View>
                      )}
                    </View>
                    <Text className='user_info__time'>{u.viewTime}</Text>
                  </View>
                </View>
                <View className='audit_client__content___item___right'>
                  {this.renderActionView(u)}
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    )
  }

  render() {
    const { isAlert, tabsMenu, activeIndex, showPassToast, curPassClientName } = this.state
    return (
      <View className='audit_client'>
        <View className='search_bar_view'>
          <SearchbarView
            placeholder='搜索访客'
            onInput={this.onInput}
            onSearchClick={this.onSearchConfirm}
            onClearSearchClick={this.onClearClick}
          />
        </View>
        <View className='tab'>
          <Tabs
            data={tabsMenu}
            activeIndex={activeIndex}
            tabItemClass={styles.tab_item}
            tabsBackgroundImage='linear-gradient(to right, #FF788F , #E62E4D)'
            textColor='#666666'
            activeColor='#E62E4D'
            margin={200}
            underlineWidth={40}
            underlineHeight={6}
            onTabItemClick={this.onTabClick}
          />
        </View>
        <ScrollView
          scrollY
          className='audit_client__content'
          lowerThreshold={500}
          onScrollToLower={this.onScrollToLower}
        >
          {this.renderAucitClientList()}
        </ScrollView>
        {isAlert && this.renderAlertView()}
        {showPassToast && <View className='toast'>{`已通过${curPassClientName}的访客申请`}</View>}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(AuditClient)