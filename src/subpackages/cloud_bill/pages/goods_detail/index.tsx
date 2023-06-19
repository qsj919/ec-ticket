import Taro, { Config } from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { View, ScrollView, Text, Image, Block, Button } from '@tarojs/components'
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'
import { ITouchEvent } from '@tarojs/components/types/common'

import { connect } from 'react-redux'
import numUtils from '@utils/num'
import dva from '@utils/dva'
import images from '@config/images'
import myLog from '@utils/myLog'
import { getTaroParams } from '@utils/utils'
import colors from '@@/style/colors'
import EButton, { ButotnLabels } from '@components/Button/EButton'
import CustomNavigation from '@components/CustomNavigation'
import messageFeedback from '@services/interactive'
import FooterViewContainer from '@@/subpackages/cloud_bill/components/ContainerView/FooterViewContainer'
import { GlobalState, DefaultDispatchProps } from '@@/types/model_state'
import i18n from '@@/i18n'
import fonts from '@@/style/fonts'
import navigatorSvc from '@services/navigator'
import trackSvc from '@services/track'
import { getTotal } from '@utils/dva_helper/map_state_to_props'
import ImageDownLoadProgressView from '@@/subpackages/cloud_bill/components/ImageDownLoadProgressView'
import { CloudEventPage, LIVE_SCENE } from '@@types/base'
import { enableOperate, getShopParamValWithSession } from '@api/goods_api_manager'
import LoginView from '@components/LoginView/LoginView'
import EmptyView from '@components/EmptyView'
import { WX_MOMENTS_SCENE } from '@constants/index'
import goodsErrorPng from './goods_detail_error.png'
import ImageViewer from './components/ImageViewer'
import ColorSizeModelView from './components/ColorSizeModelView'
import GoodsInfo from './components/GoodsInfo'
import cartIcon from '../../images/goods_detail_order_icon_new.png'
import shopIcon from '../../images/goods_detail_shop_icon_new.png'
import CustomerServiceIcon from '../../images/customer_service_icon_new.png'
import './index.scss'
import '../../../cloud_bill/components/VButton/vbutton.scss'
import selector from './selector'
import VButton from '../../components/VButton'
import NavigationToMini from '../../components/NavigationToMini'
import DoubleButton from './components/DoubleButton'

type PageState = {
  selectColorSizeType: 'addCart' | 'buy'
  // goodsParamsVisible: boolean // 商品参数
  // colorSizeButtonType: 'normal' | 'buttons' // 单按钮和双按钮
  enableBack: boolean
  stickyHeaderOpacity: number
  fromShare: boolean
  isOperate: boolean
  mpErpIdChanged: boolean
  /**
   * 朋友圈单页模式
   */
  isInMomentsMode: boolean
}

type Props = StateProps & DefaultDispatchProps

const mapStateToProps = ({
  cloudBill, // shop,
  replenishment,
  systemInfo,
  user,
  shop,
  imageDownload,
  goodsManage
}: GlobalState) => {
  const _shop = shop.list.find(s => s.id === cloudBill.mpErpId)
  return {
    goodsDetail: cloudBill.goodsDetail,
    sessionId: user.sessionId,
    navigationHeight: systemInfo.navigationHeight,
    statusBarHeight: systemInfo.statusBarHeight,
    model: systemInfo.model,
    colorSizeVisible: cloudBill.colorSizeVisible,
    totalNumWithoutChecked: getTotal(replenishment.spus).totalNumWithoutChecked,
    goodsParams: selector.goodsParamsSelector(cloudBill),
    shopList: shop.list,
    mpErpId: cloudBill.mpErpId,
    spuId: cloudBill.spuId,
    isImageDownloading: imageDownload.downLoadding,
    isSoldOut: selector.goodsSoldOutSelector({ ...goodsManage, ...cloudBill }),
    showPrice: cloudBill.shopParams.spuShowPrice === '1',
    shopShowSpu: goodsManage.shopShowSpu === '1',
    shopShowSoldOut: goodsManage.shopShowSoldOut === '1',
    mpUserId: user.mpUserId,
    data: cloudBill.videoPageData,
    shop: _shop,
    goodsError: cloudBill.goodsError
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect(mapStateToProps)
class GoodsDetail extends PureComponent<Props, PageState> {
  // config: Config = {
  //   navigationBarTitleText: '',
  //   navigationStyle: 'custom'
  // }

  maxScrollOffset: number = 500

  constructor(props: Props) {
    super(props)
    this.state = {
      selectColorSizeType: 'buy',
      // goodsParamsVisible: false,
      // colorSizeButtonType: 'normal',
      enableBack: true,
      stickyHeaderOpacity: 0,
      fromShare: false,
      isOperate: false,
      mpErpIdChanged: false,
      isInMomentsMode: getTaroParams(Taro.getCurrentInstance?.()).scene === WX_MOMENTS_SCENE
    }
    this.maxScrollOffset = 500 - props.navigationHeight - props.statusBarHeight
  }

  /**
   * 1. 处理路由参数
   * 2. 判断是否要调用 index/startup方法
   * 3. mount时加载商品数据
   * 4. didupdate时加载商品数据
   * 5. unmount时reset model
   */
  componentDidMount(): void {
    // mpErpId":853,"styleId":"10017147657"
    if (this.props.sessionId) {
      this.init()
    }

    this.initInMomentsMode()
  }
  componentDidUpdate(prevProps) {
    myLog.log(`didupdate，data:${JSON.stringify(this.props.data)}`)
    if (!prevProps.sessionId && this.props.sessionId) {
      this.init()
    }
  }

  // didupdate时加载商品数据
  // componentDidUpdate(prevProps: Readonly<StateProps>): void {
  // if (!prevProps.sessionId && this.props.sessionId) {
  //   this.init()
  // }
  // }
  init = async () => {
    const { spuId, mpErpId, scene = '' } = getTaroParams(Taro.getCurrentInstance?.())
    // eslint-disable-next-line
    const options = wx.getEnterOptionsSync()
    myLog.log(`初始化==> scene: ${options.scene}`)
    if (spuId && mpErpId) {
      if (Number(mpErpId) !== this.props.mpErpId) {
        this.setState({
          mpErpIdChanged: true
        })
      }
      // this.setState({ fromShare: true })
      this.props.dispatch({ type: 'cloudBill/save', payload: { mpErpId } })
      this.props.dispatch({ type: 'replenishment/save', payload: { mpErpId } })
      let _payload = {}

      // eslint-disable-next-line
      if (LIVE_SCENE.includes(options.scene)) {
        _payload = {
          spuId,
          appScene: 'channelLive'
        }
      } else {
        _payload = { spuId }
      }
      this.props.dispatch({
        type: 'cloudBill/fetchVideoPageDataByMpErpId',
        payload: {
          mpErpId
        }
      })
      this.props.dispatch({ type: 'cloudBill/fetchGoodsDetail', payload: { ..._payload } })

      await this.initShopParams(mpErpId)
      if (LIVE_SCENE.includes(options.scene)) {
        this.props.dispatch({ type: 'replenishment/fetchCartGoodsList' })
      }
    }

    if (scene && this.props.sessionId) {
      const _scene = decodeURIComponent(scene).split(',')
      this.props.dispatch({ type: 'cloudBill/save', payload: { mpErpId: _scene[0] } })
      this.props.dispatch({ type: 'replenishment/save', payload: { mpErpId: _scene[0] } })

      let _payload = {}
      if (LIVE_SCENE.includes(options.scene)) {
        _payload = {
          spuId: _scene[1],
          appScene: 'channelLive'
        }
      } else {
        _payload = { spuId: _scene[1] }
      }
      this.props.dispatch({ type: 'cloudBill/fetchGoodsDetail', payload: { ..._payload } })
      this.props.dispatch({
        type: 'cloudBill/fetchVideoPageDataByMpErpId',
        payload: {
          mpErpId: _scene[0]
        }
      })
      this.initShopParams(_scene[0])
    }
    this.initEnbleOperate()

    const shop = this.props.shopList.find(l => Number(l.id) === Number(this.props.mpErpId))
    if (shop) {
      const { sn, epid, shopid } = shop
      trackSvc.trackToBigData({
        sn,
        epid,
        shop: shopid,
        data: [{ key: 'enter_cloud', value: 1 }],
        tag: {
          page: CloudEventPage.DETAIL
        }
      })
    }
  }

  /**
   * 朋友圈模式下仅拉取商品详情数据
   */
  initInMomentsMode = () => {
    const { spuId, mpErpId, scene = '' } = getTaroParams(Taro.getCurrentInstance?.())
    // eslint-disable-next-line
    const options = wx.getEnterOptionsSync()
    myLog.log(`初始化==> scene: ${options.scene}`)
    if (options.scene === WX_MOMENTS_SCENE && spuId && mpErpId) {
      this.setState({ isInMomentsMode: true })
      this.props.dispatch({ type: 'cloudBill/save', payload: { mpErpId } })
      this.props.dispatch({ type: 'replenishment/save', payload: { mpErpId } })
      const _payload = { spuId, isIgnoreGroupNum: true }
      getShopParamValWithSession({ mpErpId }).then(({ data }) => {
        this.setState({ isOperate: data.val !== '1' })
        console.log(data.val === '1', '开启访客认证··')
        this.props.dispatch({ type: 'cloudBill/fetchGoodsDetail', payload: { ..._payload } })
      })
    }
  }

  initEnbleOperate = () => {
    enableOperate({
      mpErpId: getTaroParams(Taro.getCurrentInstance?.()).mpErpId || this.props.mpErpId,
      mpUserId: this.props.mpUserId
    }).then(({ data }) => {
      this.setState({
        isOperate: data.val
      })
    })
  }

  initShopParams = async _mpErpId => {
    this.props.dispatch({
      type: 'goodsManage/selectShopParamSpuShowInv',
      payload: {
        mpErpId: _mpErpId
      }
    })
    this.props.dispatch({
      type: 'goodsManage/fetchGoodsMarketStrategy',
      payload: {
        mpErpId: _mpErpId
      }
    })

    await this.props.dispatch({
      type: 'goodsManage/selectShopParamSpuShowPrice',
      payload: {
        mpErpId: _mpErpId,
        erpParamFirst: false,
        mpUserId: this.props.mpUserId
      }
    })
  }

  componentWillUnmount(): void {
    this.props.dispatch({ type: 'cloudBill/resetGoods' })
  }

  onShareAppMessage(obj: Taro.ShareAppMessageObject): Taro.ShareAppMessageReturn {
    const { goodsDetail } = this.props
    const { mpErpId, spuId } = this.getShareInfo()
    return {
      title: goodsDetail.name,
      path: `subpackages/cloud_bill/pages/goods_detail/index?mpErpId=${mpErpId}&spuId=${spuId}`,
      imageUrl: goodsDetail.imgUrlBig
    }
  }

  onShareTimeline() {
    const { goodsDetail } = this.props
    const { mpErpId, spuId } = this.getShareInfo()
    return {
      title: goodsDetail.name,
      path: `subpackages/cloud_bill/pages/goods_detail/index?mpErpId=${mpErpId}&spuId=${spuId}`,
      query: `mpErpId=${mpErpId}&spuId=${spuId}`,
      imageUrl: goodsDetail.imgUrlBig
    }
  }

  onBackClick = () => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else if (this.props.sessionId) {
      if (process.env.INDEPENDENT === 'independent') {
        Taro.redirectTo({ url: '/subpackages/cloud_bill/pages/all_goods/index' })
      } else {
        Taro.switchTab({ url: '/pages/eTicketList/index' })
      }
    }
  }

  getShareInfo = () => {
    let {
      mpErpId,
      spuId
    }: { mpErpId: string | number; spuId: string | number } = getTaroParams(Taro.getCurrentInstance?.())
    if (!mpErpId || !spuId) {
      mpErpId = this.props.mpErpId
      spuId = this.props.spuId
    }
    return { mpErpId, spuId }
  }

  onPageScroll = e => {
    const { scrollTop } = e
    this.onScroll(scrollTop)
  }

  onScroll = throttle((offset: number) => {
    let opacity
    if (offset > this.maxScrollOffset) {
      if (this.state.stickyHeaderOpacity === 1) {
        return
      } else {
        return this.setState({ stickyHeaderOpacity: 1 })
      }
    }
    if (offset <= 10) {
      opacity = offset * 0.03
    } else if (offset <= this.maxScrollOffset) {
      opacity = offset * (0.7 / this.maxScrollOffset) + 0.3
    } else {
      return
    }
    this.setState({ stickyHeaderOpacity: opacity })
  }, 50)

  // 购买弹窗
  onColorSizeVisibleChanged = (visible, type: 'normal' | 'buttons' = 'normal') => {
    this.props.dispatch({
      type: 'cloudBill/save',
      payload: { colorSizeVisible: visible }
    })

    // this.setState({ colorSizeButtonType: type })
  }

  showColorSizeModel = (
    selectColorSizeType
    // colorSizeButtonType: 'normal' | 'buttons' = 'normal'
  ) => {
    this.props.dispatch({
      type: 'cloudBill/save',
      payload: { colorSizeVisible: true }
    })
    this.setState({
      selectColorSizeType
      // colorSizeButtonType
    })
  }

  onSaveClick = selectColorSizeType => {
    this.props.dispatch({
      type: 'cloudBill/onColorSizeConfirm',
      payload: {
        type: selectColorSizeType || this.state.selectColorSizeType
      }
    })
  }

  downloadImages = debounce(() => {
    if (this.props.isImageDownloading) return
    this.props.dispatch({
      type: 'cloudBill/fetchImageUrls'
    })
  }, 400)

  /** 左下方3按钮 -- start */
  gotoShop = () => {
    const pages = Taro.getCurrentPages()
    const prevPageInstance = pages[pages.length - 2]
    if (
      prevPageInstance &&
      prevPageInstance.is === 'subpackages/cloud_bill/pages/all_goods/index' &&
      !this.state.mpErpIdChanged
    ) {
      Taro.navigateBack()
    } else {
      Taro.navigateTo({
        url: `/subpackages/cloud_bill/pages/all_goods/index?mpErpId=${this.props.mpErpId}`
      })
    }
  }

  gotoCart = () => {
    if (this.state.isInMomentsMode) {
      messageFeedback.showAlert('请前往小程序体验完成服务', '', '好的')
      return
    }
    if (!this.state.isOperate) {
      messageFeedback.showAlert('请等待商家审核通过', '', '好的')
      return
    }
    navigatorSvc.navigateTo({ url: '/subpackages/cloud_bill/pages/replenishment/index' })
    // this.props.dispatch({ type: 'shop/getShopInfo' })
    // this.props.dispatch({
    //   type: 'cartNew/queryShoppingCarList'
    // })
    // this.props.dispatch({
    //   type: 'router/switchTab',
    //   payload: '/pages/cartNew/index'
    // })
  }
  /** 左下方3按钮 -- end */

  // 底部左按钮
  onLeftBtnClick = () => {
    if (this.state.isInMomentsMode) {
      messageFeedback.showToast('请前往小程序使用完整服务')
      return
    }
    if (!this.state.isOperate) {
      messageFeedback.showAlert('请等待商家审核通过', '', '好的')
      return
    }
    // 加入购物车
    this.showColorSizeModel('addCart')
  }

  // 底部右按钮
  onRightBtnClick = () => {
    if (this.state.isInMomentsMode) {
      messageFeedback.showToast('请前往小程序使用完整服务')
      return
    }
    if (!this.state.isOperate) {
      messageFeedback.showAlert('请等待商家审核通过', '', '好的')
      return
    }
    this.showColorSizeModel('buy')
  }

  render() {
    const {
      goodsDetail,
      // totalSkuNum = 9,
      navigationHeight,
      statusBarHeight,
      model,
      colorSizeVisible,
      totalNumWithoutChecked,
      goodsParams,
      isSoldOut,
      showPrice,
      shopShowSpu,
      shopShowSoldOut,
      data,
      mpErpId,
      goodsError
    } = this.props
    const { fromShare, isOperate, isInMomentsMode } = this.state
    const shop = this.props.shopList.find(l => Number(l.id) === Number(this.props.mpErpId))
    // const { g } = goodsDetail

    // let price = goods ? goods.spu.pubPrice : ''
    // let lastPrice
    // let isLastPriceFlag = false
    // const flag = goods ? goods.spu.flag : 1
    // let descList = []
    // let protectedSpu = false
    // const offline = flag !== 1

    const isIphoneX = model.toLowerCase().includes('iphone x')

    let buttonLabels: [ButotnLabels, ButotnLabels] = [i18n.t._('addToCart'), i18n.t._('buyNow')]
    return (
      <Block>
        <CustomNavigation
          stickyTop
          enableBack={this.state.enableBack}
          // onHomeClick={this.gotoShop}
          disableIphoneXPaddingBottom
          containerClass='custom_goods_detail_container'
          onBackClick={this.onBackClick}
          // enableHome
        >
          {goodsError.isError ? (
            <EmptyView
              style={{ height: '100vh' }}
              emptyInfo={{ image: goodsErrorPng, label: goodsError.label || '出错啦～' }}
              needShowButton
              buttonLabel={Taro.getCurrentPages().length === 1 ? '去看看' : '返回'}
              onButtonClick={this.onBackClick}
            />
          ) : (
            <View style='padding-bottom: 168rpx'>
              <View
                className='sticky_header'
                style={{
                  paddingTop: `${statusBarHeight}px`,
                  height: `${navigationHeight}px`,
                  opacity: this.state.stickyHeaderOpacity
                }}
              >
                <Text className='title'>{i18n.t._('goodsDetail')}</Text>
              </View>
              {/* {protectedSpu && (
               <Modal visible direction='top'>
                 <View className='protected_modal'>
                   <Text className='title'>{i18n.t._('goodsHasOff')}</Text>
                   <Text className='go_to_shop' onClick={this.gotoShop}>
                     {i18n.t._('toShop')}
                   </Text>
                 </View>
               </Modal>
             )} */}
              <View className='goods_detail_page'>
                <ScrollView className='scroll_container' scrollY scrollWithAnimation scrollTop={0}>
                  <View className='goods_detail_container'>
                    <View className='image_viewer_container'>
                      <ImageViewer
                        disableDownload={!isOperate}
                        medias={goodsDetail.medias}
                        onDownLoadClick={this.downloadImages}
                      />
                      {!isOperate && (
                        <View className='blur_goods'>
                          {isInMomentsMode && (
                            <View className='blue_goods__moment_tip'>
                              <Text>商家已开启访客模式</Text>
                              <View>请在底部点击“前往小程序”查看详情</View>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                    <View className='goods_info'>
                      {/* price、isLastPriceFlag可以通过goods计算得出，这里已经算过 所以一并传下去，子组件不再书写计算逻辑 */}
                      <GoodsInfo
                        shopShowSoldOut={shopShowSoldOut}
                        shopShowSpu={shopShowSpu}
                        goods={goodsDetail}
                        hidePrice={!showPrice || !isOperate}
                        hideShare={(shop && shop.independentType === 1) || !isOperate}
                        showSizeItems={shop && shop.industries}
                      />
                      {/* {goodsParams.map(g => (
                      <View key={g.label} className='goods_info__param'>
                        <View className='goods_info__param__label'>{g.label}</View>
                        <Text>{g.value}</Text>
                      </View>
                    ))} */}
                    </View>
                    {/* <View className='divider_h' /> */}
                  </View>
                </ScrollView>
                {/* 底部按钮栏 */}
                {/* {(shopShowSoldOut && isSoldOut) && <View className='bottom_flag'>已售罄</View>} */}
                <View className='bottom_container'>
                  <View className='action_button_container'>
                    {/* <View className='action_button_item'> */}
                    {/* {!isOperate ? (
                      <View />
                    ) : (
                      <Block>
                        <VButton
                          customerStyle='margin-right: 20rpx; padding-right:10px;'
                          src={shopIcon}
                          imageStyle='width: 54rpx; height: 54rpx;'
                          textStyle={`font-size: ${fonts.font20WithTransformed}; color: ${colors.normalTextColor}`}
                          title={i18n.t._('tab_bar_5')}
                          maxBadge={99}
                          onClick={this.gotoShop}
                        />
                        <VButton
                          // customerStyle='padding: 12rpx 20rpx 10rpx; margin-right: 5rpx;'
                          src={cartIcon}
                          imageStyle='width: 54rpx; height: 54rpx;'
                          textStyle={`font-size: ${fonts.font20WithTransformed}; color: ${colors.normalTextColor}`}
                          title={i18n.t._('tab_bar_3')}
                          badge={totalNumWithoutChecked}
                          maxBadge={99}
                          onClick={this.gotoCart}
                        />
                      </Block>
                    )} */}
                    <VButton
                      customerStyle={`margin-right: 20rpx;${
                        process.env.INDEPENDENT !== 'independent' ? 'padding-right: 10rpx' : ''
                      }`}
                      src={shopIcon}
                      imageStyle='width: 54rpx; height: 54rpx;'
                      textStyle={`font-size: ${fonts.font20WithTransformed}; color: ${colors.normalTextColor}; white-space: nowrap;`}
                      title={i18n.t._('tab_bar_5')}
                      maxBadge={99}
                      onClick={this.gotoShop}
                    />
                    <VButton
                      // customerStyle='padding: 12rpx 20rpx 10rpx; margin-right: 5rpx;'
                      customerStyle='margin-right: 20rpx;'
                      src={cartIcon}
                      imageStyle='width: 54rpx; height: 54rpx;'
                      textStyle={`font-size: ${fonts.font20WithTransformed}; color: ${colors.normalTextColor}; white-space: nowrap;`}
                      title={i18n.t._('tab_bar_3')}
                      badge={totalNumWithoutChecked}
                      maxBadge={99}
                      onClick={this.gotoCart}
                    />

                    {(process.env.INDEPENDENT === 'independent' ||
                      process.env.INDEPENDENT === 'foodindependent') && (
                      <Button
                        className='v_button rebutton'
                        style='margin-right: 20rpx;margin-left: 14rpx'
                        openType='contact'
                      >
                        <View className='container'>
                          <Image
                            className='v_button_image'
                            style='width: 54rpx; height: 54rpx;'
                            src={CustomerServiceIcon}
                          />
                          <Text
                            style={`font-size: ${fonts.font20WithTransformed}; color: ${colors.normalTextColor}`}
                          >
                            客服
                          </Text>
                        </View>
                      </Button>
                    )}

                    {/* </View> */}
                    <View
                      style={{ display: 'flex', flex: 1, width: '90%', justifyContent: 'flex-end' }}
                    >
                      <DoubleButton
                        leftBtnConfig={{ text: '加进货车', onClick: this.onLeftBtnClick }}
                        rightBtnConfig={{ text: '立即下单', onClick: this.onRightBtnClick }}
                      ></DoubleButton>
                      {/* <EButton
                      disabled={isSoldOut && shopShowSoldOut}
                      labels={buttonLabels}
                      width={400}
                      leftButtonClass='orange_button'
                      onLeftButtonClick={this.onLeftBtnClick}
                      onRightButtonClick={this.onRightBtnClick}
                    /> */}
                    </View>
                  </View>
                </View>
              </View>
              <ImageDownLoadProgressView />
            </View>
          )}
        </CustomNavigation>
        {/* {process.env.INDEPENDENT === 'independent' && (
          <Button className='customer_service col aic jcc' openType='contact'>
            <Image src={CustomerServiceIcon} className='customer_icon' />
            <Text className='customer_label'>客服</Text>
          </Button>
        )} */}
        <LoginView scanError={data.scanError} mpErpId={mpErpId} notStickyTop />
        <View style='z-index: 500'>
          <ColorSizeModelView
            key='goods_detail'
            onSaveClick={this.onSaveClick}
            // onVisibleChanged={this.onColorSizeVisibleChanged}
            visible={colorSizeVisible}
            type={this.state.selectColorSizeType}
          />
        </View>
        <NavigationToMini shop={shop} />
      </Block>
    )
  }
}

export default connect(mapStateToProps)(GoodsDetail)
