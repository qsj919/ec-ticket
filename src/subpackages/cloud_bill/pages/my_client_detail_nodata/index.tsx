import Taro from '@tarojs/taro'
import React from 'react'
import { connect } from 'react-redux'
import { View, Text, Image, Block } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { updateUserAuditFlag } from '@api/goods_api_manager'
import CloseIcon from '@/images/close.png'
import { getTaroParams } from '@utils/utils'
import defaultHeadImg from '../../images/default_headImg.png'
import '../my_client_detail/index.scss'

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    mpErpId: goodsManage.mpErpId,
    myClientList: goodsManage.myClientList
  }
}
interface State {
  isAlert: boolean
  isRefused: boolean
}
type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class myClientDetailNodata extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationBarTitleText: '客户详情'
  // }
  state = {
    isAlert: false,
    isRefused: false
  }

  componentDidMount() {
    const { auditFlag } = getTaroParams(Taro.getCurrentInstance?.())
    if (Number(auditFlag) === 2) {
      this.setState({
        isRefused: true
      })
    }
  }

  onNodataActionClick = e => {
    const { type } = e.currentTarget.dataset
    const { mpUserId } = getTaroParams(Taro.getCurrentInstance?.())
    let _auditFlag = 2
    if (type === 'through') {
      _auditFlag = 3
    } else {
      this.setState({
        isRefused: true,
        isAlert: false
      })
    }
    Taro.showLoading({ title: '请稍等...' })
    updateUserAuditFlag({
      mpErpId: this.props.mpErpId,
      mpUserId: mpUserId,
      auditFlag: _auditFlag
    })
      .then(res => {
        Taro.hideLoading()
        if (type === 'through') {
          this.props.dispatch({ type: 'goodsManage/selectShopLinkUsers' }).then(() => {
            const { myClientList } = this.props
            const user = myClientList.find(item => item.mpUserId === Number(mpUserId))
            Taro.redirectTo({
              url: `/subpackages/cloud_bill/pages/my_client_detail/index?mpUserId=${user &&
                user.mpUserId}&viewDate=${user && user.viewDate}&listType=1`
            })
          })
        }
        this.fetchList()
      })
      .catch(e => {
        Taro.hideLoading()
      })
    if (type === 'refused') {
      this.setState({
        isRefused: true
      })
    }
  }

  onCloseClick = () => {
    this.setState({
      isAlert: false
    })
  }

  onRefusedClick = () => {
    this.setState({
      isAlert: true
    })
  }

  fetchList = async () => {
    const { mpErpId } = this.props
    Taro.showLoading({ title: '请稍等...' })
    await this.props.dispatch({
      type: 'goodsManage/selectShopWaitAuditUsers',
      payload: {
        pageNo: 1,
        jsonParam: {
          mpErpId
        }
      }
    })
    this.props.dispatch({ type: 'goodsManage/getShopViewData' })
    Taro.hideLoading()
  }

  renderNodataAlertView = () => {
    return (
      <View className='alert_view_mask'>
        <View className='alert_view_mask__content'>
          <View className='alert_view_mask__content___title'>选择操作</View>
          <View className='alert_view_mask__content___label'>是否允许该客户访问您的云单</View>
          <View className='alert_view_mask__content___action'>
            <View
              className='alert_view_mask__content___action___item access_denied'
              onClick={this.onNodataActionClick}
              data-type='refused'
            >
              拒绝访问
            </View>
            <View
              className='alert_view_mask__content___action___item allow_access'
              onClick={this.onNodataActionClick}
              data-type='through'
            >
              允许访问
            </View>
          </View>
          <Image src={CloseIcon} className='close_icon' onClick={this.onCloseClick} />
        </View>
      </View>
    )
  }

  renderNodataActionView = () => {
    const auditFlag = Number(getTaroParams(Taro.getCurrentInstance?.()).auditFlag)
    return (
      <Block>
        {auditFlag === 1 && (
          <Block>
            <View
              className='nodata_client__item___right___y'
              onClick={this.onNodataActionClick}
              data-type='through'
            >
              通过
            </View>
            <View
              className='nodata_client__item___right___n'
              onClick={this.onNodataActionClick}
              data-type='refused'
            >
              拒绝
            </View>
          </Block>
        )}
        {auditFlag === 2 && (
          <View className='nodata_client__item___right___ned' onClick={this.onRefusedClick}>
            已拒绝
          </View>
        )}
      </Block>
    )
  }

  render() {
    const { logo, nickName } = getTaroParams(Taro.getCurrentInstance?.())
    const { isAlert, isRefused } = this.state
    return (
      <View className='my_client_detail'>
        <View className='user_information'>
          <View className='my_client_item'>
            <View className='my_client_item__left'>
              <Image src={logo || defaultHeadImg} className='head_image' />
              <View className='my_client_item__left__info'>{nickName}</View>
            </View>
            {isRefused && (
              <View className='my_client_item__right' onClick={this.onRefusedClick}>
                已拒绝访问
              </View>
            )}
          </View>
          <View className='user_information_items'>
            <View className='user_information_items_item'>
              <Text>0</Text>
              <Text className='fontColorSmall'>浏览云单/次</Text>
            </View>
            <View className='user_information_items_item'>
              <Text>0</Text>
              <Text className='fontColorSmall'>浏览商品/次</Text>
            </View>
            <View className='user_information_items_item'>
              <Text>0</Text>
              <Text className='fontColorSmall'>下单数/次</Text>
            </View>
            <View className='user_information_items_item'>
              <Text>0</Text>
              <Text className='fontColorSmall'>购买次数/次</Text>
            </View>
            <View className='user_information_items_item'>
              <Text>0</Text>
              <Text className='fontColorSmall'>购买频率/月</Text>
            </View>
            <View className='user_information_items_item'>
              <Text>0</Text>
              <Text className='fontColorSmall'>客单价/元</Text>
            </View>
          </View>
        </View>

        {!isRefused && (
          <View className='nodata_client__item'>
            <View className='nodata_client__item___left'>
              <Image className='user_logo' src={logo} mode='aspectFill' />
              <View className='user_info'>
                <Text className='user_info__name'>{nickName}</Text>
                <Text className='user_info__time'>正在申请访问您的云单</Text>
              </View>
            </View>
            <View className='nodata_client__item___right'>{this.renderNodataActionView()}</View>
          </View>
        )}
        {isAlert && this.renderNodataAlertView()}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(myClientDetailNodata)