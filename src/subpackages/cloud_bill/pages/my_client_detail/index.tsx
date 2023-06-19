import Taro from '@tarojs/taro'
import React from 'react'
import { connect } from 'react-redux'
import { View, Text, Image, ScrollView, Input, Switch, Block } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import MyClientItem from '@@/subpackages/cloud_bill/components/MyClientItem/MyClientItem'
import Tabs from '@components/Tabs'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { SlideDirection } from '@components/SlideContainer/type'
import EButton from '@components/Button/EButton'
import SearchbarView from '@components/SearchBarView/SearchbarView'
import messageFeedback from '@services/interactive'
import { PAGE_SIZE } from '@constants/index'
import { bindSLHDw, fetchSLHDwList } from '@api/shop_api_manager'
import classnames from 'classnames'
import { isWeapp, setNavigationBarTitle } from '@utils/cross_platform_api'
import { setRemarkForCbUserDwxxLink } from '@api/goods_api_manager'
import angleRightIcon from '@/images/angle_right_gray_40.png'
import DeleteImg from '@/images/delete_circle_32.png'
import { getTaroParams } from '@utils/utils'
import checkedIcon from '../../images/right_checkbox_yes.png'
import BrowseRecordsList from './components/BrowseRecordsList'
import PickUpRecordList from './components/PickUpRecordList'
import linkPng from '../../images/link.png'
import PhoneIcon from '../../images/phone_icon.png'
import './index.scss'

const TAB_MENU = [
  { label: '浏览记录', value: 0 },
  { label: '拿货记录', value: 1 }
]

const mapStateToProps = ({ goodsManage, loading }: GlobalState) => {
  return {
    mpErpId: goodsManage.mpErpId,
    viewerSalesData: goodsManage.viewerSalesData,
    userShopViewData: goodsManage.userShopViewData,
    shopSalesDetails: goodsManage.shopSalesDetails,
    usersListValues: goodsManage.viewDataViewers,
    myClientList: goodsManage.myClientList,
    priceTypeList: goodsManage.priceTypeList.filter(t => t.delflag === '1'),
    spuShowPrice: goodsManage.spuShowPrice,
    isBrowseLoading:
      loading.effects['goodsManage/selectUserShopViewData'] &&
      loading.effects['goodsManage/selectUserShopViewData'].loading,
    isPickUpLoading:
      loading.effects['goodsManage/selectUserShopSalesDetails'] &&
      loading.effects['goodsManage/selectUserShopSalesDetails'].loading,
    showPhone:
      goodsManage.allowStaffViewClientPhone === '1' ||
      goodsManage.staffInfo.rolename === '总经理' ||
      goodsManage.staffInfo.rolename === '總經理'
  }
}

type DWType = {
  dwname: string
  id: string
  checked?: boolean
}
type priceTypeItem = {
  delflag: string
  flagname: string
  id: string
  name: string
  sid: string
}

interface State {
  activeTabIndex: number
  detailsPageNo: number
  browsePageNo: number
  dwName: string
  dwList: DWType[]
  isDwListVisible: boolean
  priceType: priceTypeItem
  isSettingModalVisible: boolean
  remarkValue: string
  alertIsShow: boolean
  showPriceValue: boolean
  blockValue: boolean
}
type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class myClientDetail extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationBarTitleText: '客户详情'
  // }
  state = {
    activeTabIndex: 0,
    detailsPageNo: 1,
    browsePageNo: 1,
    dwName: '',
    dwList: [] as DWType[],
    isDwListVisible: false,
    priceType: {} as priceTypeItem,
    isSettingModalVisible: false,
    remarkValue: '',
    alertIsShow: false,
    showPriceValue: false,
    blockValue: false
  }

  pageNo = 1

  componentDidMount() {
    this.init()
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'goodsManage/clearUserDetailData' })
  }
  componentDidShow() {
    setNavigationBarTitle('客户详情')
  }
  init = () => {
    const requestParam = this.getRequestParams(true)
    this.fetchTotaldata(requestParam)
    this.fetchBrowseList(requestParam)
    this.fetchPickUpList(this.getRequestParams(false))
    const clientItem = this.getItem()
    this.props.dispatch({
      type: 'goodsManage/selectShopParamSpuShowPrice',
      payload: {
        erpParamFirst: false,
        mpUserId: clientItem.mpUserId
      }
    })
    Promise.all([
      this.props.dispatch({
        type: 'goodsManage/selectShopDefaulPriceType',
        payload: {
          mpUserId: clientItem.mpUserId,
          erpParamFirst: false
        }
      }),
      this.props.dispatch({
        type: 'goodsManage/selectShopPriceTypeList'
      })
    ]).then(([priceType, priceList]) => {
      this.setState({
        priceType: priceList.find(p => p.sid === priceType),
        showPriceValue: this.props.spuShowPrice === '1',
        blockValue: clientItem.shopBlackUser === '1',
        remarkValue: clientItem.remark
      })
    })
    // this.fetchDwList()
  }

  fetchDwList = () => {
    fetchSLHDwList({
      mpErpId: this.props.mpErpId,
      dwname: this.state.dwName,
      curpageno: this.pageNo,
      pagesize: PAGE_SIZE
    }).then(({ data }) => {
      this.setState(state => ({
        dwList: this.pageNo === 1 ? data.rows : [...state.dwList, ...data.rows]
      }))
    })
  }

  refreshDwList = () => {
    this.pageNo = 1
    this.fetchDwList()
  }

  fetchMoreDwList = () => {
    if (this.pageNo * PAGE_SIZE > this.state.dwList.length) return
    this.pageNo++
    this.fetchDwList()
  }

  onDwClick = (id: string) => {
    this.setState(state => ({
      dwList: state.dwList.map(_dw => ({ ..._dw, checked: id === _dw.id }))
    }))
  }

  onInput = (s: string) => {
    this.setState({ dwName: s })
  }

  clearInputClick = (s: string) => {
    this.setState({ dwName: s }, () => {
      this.refreshDwList()
    })
    this.pageNo = 1
  }

  hideDwList = () => {
    const clientItem = this.getItem()
    this.setState({
      isDwListVisible: false,
      isSettingModalVisible: false,
      alertIsShow: false,
      remarkValue: clientItem.remark || ''
    })
  }

  fetchTotaldata(params) {
    this.props.dispatch({
      type: 'goodsManage/selectShopViewerSalesData',
      payload: {
        ...params
      }
    })
  }
  fetchBrowseList(params) {
    const { browsePageNo } = this.state
    this.props.dispatch({
      type: 'goodsManage/selectUserShopViewData',
      payload: {
        pageNo: browsePageNo,
        ...params
      }
    })
  }
  fetchPickUpList(params) {
    const { detailsPageNo } = this.state
    if (params.dwid !== 0) {
      this.props.dispatch({
        type: 'goodsManage/selectUserShopSalesDetails',
        payload: {
          curpageno: detailsPageNo,
          ...params
        }
      })
    }
  }

  getRequestParams(isUserId) {
    const { params } = Taro.getCurrentInstance?.()
    if (params.dwId && params.mpUserId) {
      return { dwid: params.dwId, mpUserId: params.mpUserId }
    }
    const item = this.getItem()
    if (isUserId)
      return {
        mpUserId: item.mpUserId,
        dwId: item.dwId
      }
    return { dwid: item.dwId }
  }
  onTabClick = index => {
    this.setState({ activeTabIndex: index })
  }

  isMoreData(pageNo, values) {
    return values.length >= pageNo * 20
  }

  _reachBottom = () => {
    const { activeTabIndex, browsePageNo, detailsPageNo } = this.state
    const { userShopViewData, shopSalesDetails } = this.props
    if (activeTabIndex) {
      if (this.isMoreData(detailsPageNo, shopSalesDetails)) {
        this.setState(
          prevState => {
            return {
              detailsPageNo: prevState.detailsPageNo + 1
            }
          },
          () => {
            this.fetchPickUpList(this.getRequestParams(false))
          }
        )
      }
    } else {
      if (this.isMoreData(browsePageNo, userShopViewData)) {
        this.setState(
          prevState => {
            return {
              browsePageNo: prevState.browsePageNo + 1
            }
          },
          () => {
            this.fetchBrowseList(this.getRequestParams(true))
          }
        )
      }
    }
  }
  onBlockClick = async item => {
    const clientItem = this.getItem()
    this.setState({
      isSettingModalVisible: true,
      remarkValue: clientItem.remark
    })
    // Taro.showLoading()
    // await this.props.dispatch({
    //   type: 'goodsManage/updataUserJurisdiction',
    //   payload: {
    //     mpUserId: item.mpUserId,
    //     code: 'shop_black_user',
    //     val: item.shopBlackUser === '0' ? '1' : '0'
    //   }
    // })
    // Taro.hideLoading()
  }

  onBindClick = () => {
    this.refreshDwList()
    this.setState({ isDwListVisible: true })
  }

  onConfirmBindClick = () => {
    const dw = this.state.dwList.find(dw => dw.checked)
    if (dw) {
      const content = `确定与商陆花客户【${dw.dwname}】绑定？绑定后的单据会同步至客户【${dw.dwname}】之下`
      messageFeedback.showAlertWithCancel(content, '确定绑定该客户？', this.onConfirmBind)
    } else {
      messageFeedback.showToast('请选择客户')
    }
  }
  onConfirmBind = () => {
    const { mpUserId } = getTaroParams(Taro.getCurrentInstance?.())
    const dw = this.state.dwList.find(dw => dw.checked)
    if (dw) {
      this.hideDwList()
      bindSLHDw({ dwId: dw.id, mpErpId: this.props.mpErpId, mpUserId }).then(() => {
        this.props.dispatch({
          type: 'goodsManage/updateLocalViewers',
          payload: { dwId: dw.id, mpUserId, dwName: dw.dwname }
        })
        messageFeedback.showToast('绑定成功')
        Taro.eventCenter.trigger('UPDATE_BIND')
      })
    } else {
      messageFeedback.showToast('请选择客户')
    }
  }

  getViewersList() {
    const { listType } = getTaroParams(Taro.getCurrentInstance?.())
    const { usersListValues, myClientList } = this.props
    const _list = listType === '1' ? myClientList : usersListValues
    let list = {}
    _list.forEach(item => {
      if (list.hasOwnProperty(item.viewDate)) {
        list[item.viewDate].push({ ...item })
      } else {
        list[item.viewDate] = [{ ...item }]
      }
    })
    return list || []
  }
  getItem = () => {
    const { viewDate, mpUserId, fromOrder = '0' } = getTaroParams(Taro.getCurrentInstance?.())
    const { usersListValues, myClientList } = this.props
    if (fromOrder === '1') {
      return [...usersListValues, ...myClientList].filter(
        item => item.mpUserId === parseInt(mpUserId)
      )[0]
    }
    const list = this.getViewersList()[viewDate]
    return list && list.filter(item => item.mpUserId === parseInt(mpUserId))[0]
  }

  onCallPhoneClick = () => {
    if (!this.props.showPhone) return
    const clientItem = this.getItem()
    if (clientItem.phone) {
      Taro.makePhoneCall({
        phoneNumber: clientItem.phone
      })
    }
  }

  onSwitchChange = e => {
    const { key } = e.currentTarget.dataset
    const { value } = e.detail
    if (key === 'showPrice') {
      this.setState({
        showPriceValue: value
      })
    }
    if (key === 'block') {
      this.setState({
        blockValue: value
      })
    }
  }

  onSelectClick = e => {
    const { key } = e.currentTarget.dataset
    const { priceTypeList = [] } = this.props
    switch (key) {
      case 'priceType':
        Taro.showActionSheet({
          itemList: priceTypeList.map(price => price.name),
          success: ({ tapIndex }) => {
            this.setState({
              priceType: priceTypeList[tapIndex]
            })
          }
        })
        break
    }
  }

  onSettingConfirm = async () => {
    const clientItem = this.getItem()
    const { priceType, remarkValue, showPriceValue, blockValue } = this.state
    const { mpErpId } = this.props
    Taro.showLoading({ title: '请稍等...' })
    await this.props.dispatch({
      type: 'goodsManage/updataUserJurisdiction',
      payload: {
        mpUserId: clientItem.mpUserId,
        code: 'shop_black_user',
        val: blockValue ? '1' : '0'
      }
    })
    if (priceType) {
      await this.props.dispatch({
        type: 'goodsManage/updateShopParamVal',
        payload: {
          code: 'spu_default_price_type',
          val: priceType.sid,
          mpErpId,
          mpUserId: clientItem.mpUserId
        }
      })
    }
    await this.props.dispatch({
      type: 'goodsManage/updateShopParamVal',
      payload: {
        code: 'spu_show_price',
        mpErpId,
        mpUserId: clientItem.mpUserId,
        val: showPriceValue ? '1' : '0'
      }
    })
    setRemarkForCbUserDwxxLink({
      jsonParam: {
        mpErpId,
        mpUserId: clientItem.mpUserId,
        remark: remarkValue || ''
      }
    })
    this.props.dispatch({
      type: 'goodsManage/updateClientPriceType',
      payload: {
        mpUserId: clientItem.mpUserId,
        remark: remarkValue || '',
        type: 'remark'
      }
    })
    if (priceType) {
      this.props.dispatch({
        type: 'goodsManage/updateClientPriceType',
        payload: {
          mpUserId: clientItem.mpUserId,
          priceType: priceType.sid,
          type: 'priceType'
        }
      })
    }
    Taro.hideLoading()
    this.hideDwList()

    this.props.dispatch({
      type: 'goodsManage/selectShopParamSpuShowPrice',
      payload: {
        erpParamFirst: false,
        mpUserId: clientItem.mpUserId
      }
    })
  }

  onRemarkInput = e => {
    this.setState({
      remarkValue: e.detail.value
    })
  }

  onClearInput = () => {
    this.setState({
      remarkValue: ''
    })
  }

  onRemarkClick = () => {
    this.setState({
      alertIsShow: true
    })
  }

  onRemarkSave = () => {
    this.setState({
      alertIsShow: false
    })
  }

  onRemarkCancel = () => {
    this.setState({ alertIsShow: false, remarkValue: this.getItem().remark })
  }

  getMenu = () => {
    const { priceType, showPriceValue, blockValue, remarkValue } = this.state
    const clientItem = this.getItem()
    if (clientItem) {
      return [
        {
          label: '客户备注',
          type: 'input',
          value: remarkValue || '去设置',
          key: 'remark'
        },
        // {
        //   label: '客户分组',
        //   type: 'select',
        //   value: '零批客户',
        //   key: 'class'
        // },
        {
          label: '允许看到价格',
          type: 'switch',
          value: showPriceValue,
          key: 'showPrice'
        },
        {
          label: '看到的价格类型',
          type: 'select',
          value: priceType ? priceType.name : '无',
          key: 'priceType'
        },
        {
          label: '拉黑该用户',
          type: 'switch',
          value: blockValue,
          key: 'block'
        }
      ]
    }
    return []
  }

  renderAlertInput = () => {
    const { alertIsShow } = this.state
    const { remarkValue } = this.state
    return (
      <View className='alert_input_view'>
        <View className='alert_input_view__header'>客户备注</View>
        <View className='alert_input_view__input'>
          <Input
            placeholder='请输入备注'
            className='alert_input_view__input___com'
            onInput={this.onRemarkInput}
            value={remarkValue}
            focus={alertIsShow}
          />
          {remarkValue && (
            <Image
              src={DeleteImg}
              onClick={this.onClearInput}
              className='alert_input_view__input___delete'
            />
          )}
        </View>
        <View className='alert_input_view__action'>
          <View className='alert_input_view__action__cancel' onClick={this.onRemarkCancel}>
            取消
          </View>
          <View className='alert_input_view__action__confirm' onClick={this.onRemarkSave}>
            确定
          </View>
        </View>
      </View>
    )
  }

  render() {
    const {
      activeTabIndex,
      browsePageNo,
      detailsPageNo,
      dwList,
      isDwListVisible,
      isSettingModalVisible,
      alertIsShow
    } = this.state
    const {
      viewerSalesData,
      userShopViewData,
      isBrowseLoading,
      shopSalesDetails,
      isPickUpLoading,
      showPhone
    } = this.props
    const clientItem = this.getItem()
    const MENU = this.getMenu()
    // const phone = showPhone ? clientItem.phone : '***'
    let phone = (clientItem && clientItem.phone) || '无'
    if (clientItem && clientItem.phone && !showPhone) {
      phone = '****'
    }
    return (
      <Block>
        <ScrollView
          className={classnames('my_client_detail', { 'my_client_detail--ov': isDwListVisible })}
          scrollY
          onScrollToLower={this._reachBottom}
          lowerThreshold={500}
        >
          <View className='user_information'>
            <MyClientItem
              from='detail'
              item={clientItem}
              onBlockClick={this.onBlockClick}
              onBindClick={this.onBindClick}
              itemPadding='10px'
            />
            <View className='user_information__info'>
              <View className='archives_view' style='width: 100%;'>
                <View className='fontColorSmall'>商陆花档案：{clientItem.dwName}</View>
                <View className='detail_bind_text' onClick={this.onBindClick}>
                  <Image src={linkPng} className='link_img' />
                  {clientItem.dwName ? '更换绑定' : '绑定客户'}
                </View>
              </View>
              <View className='phone_icon_view'>
                <View className='archives_view' onClick={this.onCallPhoneClick}>
                  手机号：{phone}{' '}
                  {showPhone && (
                    <Image style='margin-left: 6px;' src={PhoneIcon} className='link_img' />
                  )}
                </View>
              </View>
            </View>
            <View className='user_information_items'>
              {viewerSalesData.map(item => (
                <View className='user_information_items_item' key={item.title}>
                  <Text>{item.value}</Text>
                  <Text className='user_information_items_item__label'>{item.title}</Text>
                </View>
              ))}
            </View>
          </View>

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
          </View>

          <View>
            {activeTabIndex === 0 ? (
              <BrowseRecordsList
                loading={isBrowseLoading}
                data={userShopViewData}
                noMoreDataVisible={
                  !isBrowseLoading &&
                  (userShopViewData && userShopViewData.length) < browsePageNo * 20
                }
              />
            ) : (
              <PickUpRecordList
                loading={isPickUpLoading}
                data={shopSalesDetails}
                noMoreDataVisible={
                  !isPickUpLoading &&
                  (shopSalesDetails && shopSalesDetails.length) < detailsPageNo * 20
                }
              />
            )}
          </View>
        </ScrollView>

        <SlideContainer
          visible={isDwListVisible || isSettingModalVisible}
          direction={SlideDirection.Bottom}
          className='bg_trans'
          maxHeight={100}
          onRequestClose={this.hideDwList}
          containerClass={`${isSettingModalVisible ? 'setting_containerClass' : ''}`}
        >
          {isSettingModalVisible && (
            <View
              className={`modal_setting ${
                alertIsShow ? 'hide_modal_setting' : 'show_modal_setting'
              }`}
            >
              <View className='modal_setting__header aic jcsb'>
                <Text className='modal_setting__header__cancel' onClick={this.hideDwList}>
                  取消
                </Text>
                <Text className='modal_setting__header__title'>设置客户信息</Text>
                <Text className='modal_setting__header__confirm' onClick={this.onSettingConfirm}>
                  保存
                </Text>
              </View>
              <View className='modal_setting__content aic col'>
                {MENU.map(item => (
                  <View key={item.key} className='modal_setting__content__item aic jcsb'>
                    <Text className='modal_setting__content__item__label'>{item.label}</Text>
                    {item.type === 'input' && (
                      <View
                        onClick={this.onRemarkClick}
                        className='input_com'
                        style={{
                          color: item.value !== '去设置' ? '#222' : '#999'
                        }}
                      >
                        {item.value}
                      </View>
                    )}
                    {item.type === 'select' && (
                      <View
                        className='select_com aic'
                        onClick={this.onSelectClick}
                        data-key={item.key}
                      >
                        <Text>{item.value}</Text>
                        <Image src={angleRightIcon} className='angle_right' />
                      </View>
                    )}
                    {item.type === 'switch' && (
                      <Switch
                        data-key={item.key}
                        checked={item.value}
                        onChange={this.onSwitchChange}
                      />
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
          {isDwListVisible && (
            <View className='modal'>
              <View className='modal__header aic jcsb'>
                {/* 布局占位 */}
                <View className='modal__header__cancel modal__header__cancel--trans'>取消</View>
                <View className='modal__header__title'>选择要绑定的商陆花用户</View>
                <View className='modal__header__cancel' onClick={this.hideDwList}>
                  取消
                </View>
              </View>
              <View className='modal__search'>
                <SearchbarView
                  onInput={this.onInput}
                  onClearSearchClick={this.clearInputClick}
                  placeholder='搜索客户'
                  onSearchClick={this.refreshDwList}
                />
                <View className='modal__search___label' onClick={this.refreshDwList}>
                  搜索
                </View>
              </View>
              <ScrollView
                className='modal__main'
                scrollY
                onScrollToLower={this.fetchMoreDwList}
                lowerThreshold={100}
              >
                {dwList.map(dw => (
                  <View
                    className='aic jcsb modal__dw'
                    key={dw.id}
                    onClick={() => this.onDwClick(dw.id)}
                  >
                    <View>{dw.dwname}</View>
                    {dw.checked && <Image src={checkedIcon} className='modal__checked' />}
                  </View>
                ))}
              </ScrollView>
              <View className='modal__button'>
                <EButton label='绑定客户' onButtonClick={this.onConfirmBindClick} />
              </View>
            </View>
          )}
        </SlideContainer>
        {alertIsShow && this.renderAlertInput()}
      </Block>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(myClientDetail)