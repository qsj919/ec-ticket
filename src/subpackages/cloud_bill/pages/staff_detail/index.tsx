import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import Tabs from '@components/Tabs'
import messageFeedback from '@services/interactive'
import {
  findShopStaffBindUserList,
  findShopForbiddenUserList,
  forbidLinkUserVisit,
  allowLinkUserVisit,
  cancelUserShopStaffLink
} from '@api/goods_api_manager'
import StaffDetailItem from './components/StaffDetailItem'
import './index.scss'

const TAB_MENU = [
  { label: '正常访问员工', value: 0 },
  { label: '限制访问员工', value: 1 }
]

type staffItem = {
  logo: string
  mpUserId: number
  nickName: string
  role: string
  staffId?: number
  staffName?: string
}

interface State {
  activeTabIndex: number
  staffBindUserList: Array<staffItem>
  forbiddenUserList: Array<staffItem>
}

const mapStateToProps = ({ goodsManage }: GlobalState) => ({
  mpErpId: goodsManage.mpErpId,
  shopName: goodsManage.shopName,
  staffInfo: goodsManage.staffInfo,
  shopLogoUrl: goodsManage.shopLogoUrl,
  epid: goodsManage.epid,
  shopid: goodsManage.shopId,
  sn: goodsManage.sn
})

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class staffDetail extends React.Component<StateProps & DefaultDispatchProps, State> {
  state = {
    activeTabIndex: 0,
    staffBindUserList: [] as staffItem[],
    forbiddenUserList: [] as staffItem[]
  }

  // config = {
  //   navigationBarTitleText: '我的'
  // }

  componentDidMount() {
    this.init()
  }

  init = async () => {
    const { mpErpId } = this.props
    this.fetchShopStaffBindUserList(mpErpId)
    this.fetchShopForbiddenUserList(mpErpId)
  }

  // 获取店铺员工绑定用户列表
  fetchShopStaffBindUserList(mpErpId) {
    findShopStaffBindUserList({
      mpErpId
    }).then(res => {
      this.setState({ staffBindUserList: res.data.rows })
    })
  }

  // 获取后台限制访问用户列表
  fetchShopForbiddenUserList(mpErpId) {
    findShopForbiddenUserList({
      mpErpId
    }).then(res => {
      this.setState({ forbiddenUserList: res.data.rows })
    })
  }

  onTabClick = index => {
    this.init()
    this.setState({ activeTabIndex: index })
  }

  onItemClick = mpUserId => {
    this.showAlert(mpUserId)
  }
  showAlert(mpUserId) {
    const { activeTabIndex } = this.state
    messageFeedback.showAlertWithCancel(
      `确定${activeTabIndex === 0 ? '限制' : '允许'}该用户访问您的云单后台？`,
      '',
      () => {
        this.filterList(mpUserId)
      }
    )
  }

  filterList = async mpUserId => {
    const { activeTabIndex } = this.state
    const { mpErpId } = this.props
    Taro.showLoading()
    if (activeTabIndex === 0) {
      await forbidLinkUserVisit({ mpErpId, mpUserId })
      this.setState(prevState => {
        return {
          staffBindUserList: prevState.staffBindUserList.filter(item => item.mpUserId !== mpUserId)
        }
      })
    } else {
      await allowLinkUserVisit({ mpErpId, mpUserId })
      this.setState(prevState => {
        return {
          forbiddenUserList: prevState.forbiddenUserList.filter(item => item.mpUserId !== mpUserId)
        }
      })
    }
    Taro.hideLoading()
  }

  onUnBindclick = async () => {
    const { mpErpId } = this.props
    messageFeedback.showAlertWithCancel('确定要解绑当前角色？', '', () => {
      cancelUserShopStaffLink({
        mpErpId
      }).then(res => {
        this.props.dispatch({ type: 'goodsManage/resetIsHotUnboundTrue' })
        this.props.dispatch({
          type: 'goodsManage/fetchAuthAndDocUrl',
          payload: {
            mpErpId
          }
        })
        this.props.dispatch({
          type: 'goodsManage/selectShopStaffList',
          payload: {
            curpageno: 1
          }
        })
        this.props.dispatch({ type: 'goodsManage/selectShopStaffAuth' })
        Taro.navigateBack()
      })
    })
  }

  render() {
    const { activeTabIndex, staffBindUserList, forbiddenUserList } = this.state
    const { staffInfo, shopLogoUrl, shopName } = this.props
    const BindUserList = staffBindUserList.filter(user => user.staffId !== staffInfo.id)
    return (
      <View className='staff_detail_wrap'>
        <View className='staff_detail_wrap_header'>
          <View className='staff_detail_wrap_header_headImg'>
            <Image src={shopLogoUrl} className='head_portrait' />
          </View>
          <View className='staff_detail_wrap_header_staff_info'>
            <View>{shopName}</View>
            <View className='staff_role'>
              当前角色：{staffInfo.name}
              <Text className='staff_position'>{staffInfo.rolename}</Text>
            </View>
          </View>
          <View className='staff_detail_wrap_header_btn'>
            <Text className='staff_unbound' onClick={this.onUnBindclick}>
              解绑
            </Text>
          </View>
        </View>

        {staffInfo.rolename &&
          (staffInfo.rolename.indexOf('总经理') !== -1 ||
            staffInfo.rolename.indexOf('店长') !== -1) && (
            <View className='staff_detail_wrap_body'>
              <View className='tabs'>
                <Tabs
                  data={TAB_MENU}
                  activeIndex={activeTabIndex}
                  underlineColor='#E62E4D'
                  textColor='#222'
                  activeColor='#E62E4D'
                  onTabItemClick={this.onTabClick}
                  margin={180}
                />

                <View className='staff_items'>
                  {activeTabIndex === 0
                    ? BindUserList.map(item => (
                        <StaffDetailItem
                          key={item.mpUserId}
                          item={item}
                          onItemClick={this.onItemClick}
                          activeTabIndex={activeTabIndex}
                          btnIsVisible={item.role.indexOf('总经理') === -1}
                        />
                      ))
                    : forbiddenUserList.map(item => (
                        <StaffDetailItem
                          key={item.mpUserId}
                          item={item}
                          onItemClick={this.onItemClick}
                          activeTabIndex={activeTabIndex}
                          btnIsVisible={!false}
                        />
                      ))}
                </View>
              </View>
            </View>
          )}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(staffDetail)