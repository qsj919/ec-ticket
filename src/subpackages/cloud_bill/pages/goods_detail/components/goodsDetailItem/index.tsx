import React, { ComponentType, PureComponent } from 'react'
import Taro, { Config, NodesRef } from '@tarojs/taro'
import { View } from '@tarojs/components'
import debounce from 'lodash/debounce'
import { ITouchEvent } from '@tarojs/components/types/common'

import { connect } from 'react-redux'
import { getTaroParams } from '@utils/utils'
import colors from '@@/style/colors'
import EButton, { ButotnLabels } from '@components/Button/EButton'
import { GlobalState, DefaultDispatchProps } from '@@/types/model_state'
import i18n from '@@/i18n'
import fonts from '@@/style/fonts'
import navigatorSvc from '@services/navigator'
import { getTotal } from '@utils/dva_helper/map_state_to_props'
import ImageDownLoadProgressView from '@@/subpackages/cloud_bill/components/ImageDownLoadProgressView'
import { ISpu } from '@@types/GoodsType'
import ImageViewer from '../ImageViewer'
import GoodsInfo from '../GoodsInfo'
import cartIcon from '../../../../images/goods_detail_order_icon_new.png'
import shopIcon from '../../../../images/goods_detail_shop_icon_new.png'
import './index.scss'
import selector from '../../selector'
import VButton from '../../../../components/VButton'
import DoubleButton from '../DoubleButton'

type PageState = {
  // selectColorSizeType: 'addCart' | 'buy' | 'groupBuy'
  // // goodsParamsVisible: boolean // 商品参数
  // // colorSizeButtonType: 'normal' | 'buttons' // 单按钮和双按钮
  // fromShare: boolean
}

type OwnProps = {
  onSaveClick(selectColorSizeType: 'addCart' | 'buy'): void
  goodsDetail: ISpu
  onGetGoodsDetailItemHeight(height?: number): void
  calHeight: boolean
  onButtonClick(selectColorSizeType: 'addCart' | 'buy', spuId): void
  isHideInvText?: boolean
  isHideShopIcon?: boolean
  isHideCarIcon?: boolean
  currentGoodsItemIndex: number
  goodsItemIndex: number
  clickGoodsItemIndex: number
}

type Props = OwnProps & StateProps & DefaultDispatchProps

const mapStateToProps = ({
  cloudBill, // shop,
  replenishment,
  systemInfo,
  user,
  shop,
  imageDownload,
  goodsManage
}: GlobalState) => ({
  // goodsDetail: cloudBill.goodsDetail,
  colorSizeVisible: cloudBill.colorSizeVisible,
  totalNumWithoutChecked: getTotal(replenishment.spus).totalNumWithoutChecked,
  shopList: shop.list,
  mpErpId: cloudBill.mpErpId,
  spuId: cloudBill.spuId,
  isImageDownloading: imageDownload.downLoadding,
  isSoldOut: selector.goodsSoldOutSelector({ ...goodsManage, ...cloudBill }),
  showPrice: cloudBill.shopParams.spuShowPrice === '1',
  shopShowSpu: goodsManage.shopShowSpu === '1',
  shopShowSoldOut: goodsManage.shopShowSoldOut === '1'
})

type StateProps = ReturnType<typeof mapStateToProps>

// @connect(mapStateToProps)
class GoodsDetailItem extends PureComponent<Props, PageState> {
  static defaultProps = {
    goodsDetail: {},
    isHideInvText: false,
    isHideShopIcon: false,
    isHideCarIcon: false
  }

  config: Config = {
    navigationBarTitleText: '',
    navigationStyle: 'custom'
  }

  // maxScrollOffset: number = 500

  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    if (this.props.calHeight) {
      const query = (Taro.getCurrentInstance().page as any).createSelectorQuery()
      query
        .select('.goods_detail')
        .boundingClientRect((res: any) =>
          this.props.onGetGoodsDetailItemHeight(res ? res.height : undefined)
        )
        .exec()
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

  // 购买弹窗
  onColorSizeVisibleChanged = (visible, type: 'normal' | 'buttons' = 'normal') => {
    this.props.dispatch({
      type: 'cloudBill/save',
      payload: { colorSizeVisible: visible }
    })

    // this.setState({ colorSizeButtonType: type })
  }

  showColorSizeModel = (selectColorSizeType, spuId) => {
    this.props.onButtonClick(selectColorSizeType, this.props.goodsDetail.styleId)
  }

  onSaveClick = selectColorSizeType => {
    this.props.onSaveClick(selectColorSizeType)
  }

  downloadImages = debounce(() => {
    if (this.props.isImageDownloading) return
    this.props.dispatch({
      type: 'cloudBill/fetchImageUrls',
      payload: {
        _id: this.props.goodsDetail.styleId
      }
    })
  }, 400)

  gotoCart = () => {
    navigatorSvc.navigateTo({ url: '/subpackages/cloud_bill/pages/replenishment/index' })
  }

  gotoShop = () => {
    navigatorSvc.navigateTo({
      url: `/subpackages/cloud_bill/pages/all_goods/index?mpErpId=${this.props.mpErpId}`
    })
  }

  // 底部左按钮
  onLeftBtnClick = () => {
    // 加入购物车
    this.showColorSizeModel('addCart')
  }

  // 底部右按钮
  onRightBtnClick = () => {
    this.showColorSizeModel('buy')
  }

  render() {
    const {
      goodsDetail,
      colorSizeVisible,
      totalNumWithoutChecked,
      isSoldOut,
      showPrice,
      shopShowSpu,
      shopShowSoldOut,
      isHideInvText,
      isHideShopIcon,
      isHideCarIcon,
      currentGoodsItemIndex,
      goodsItemIndex,
      clickGoodsItemIndex
    } = this.props
    const { allImgUrlBigs, videoUrl } = goodsDetail
    let medias: { url: string[] | string; typeId: number; coverUrl?: string }[] = []
    if (allImgUrlBigs) {
      medias = allImgUrlBigs.map(url => ({ url, typeId: 1 }))
    }
    if (videoUrl) {
      medias.unshift({ url: videoUrl, typeId: 3, coverUrl: goodsDetail.coverUrl })
    }

    let buttonLabels: [ButotnLabels, ButotnLabels] = [i18n.t._('addToCart'), i18n.t._('buyNow')]

    return (
      <View className='goods_detail'>
        <View className='goods_detail_page'>
          {/* <ScrollView className='scroll_container'> */}
          <View className='goods_detail_container'>
            <View className='image_viewer_container'>
              <View className='image_viewer_wrapper'>
                <ImageViewer
                  // disableDownload={fromShare}
                  medias={medias}
                  onDownLoadClick={this.downloadImages}
                  goodsItemIndex={goodsItemIndex}
                  currentGoodsItemIndex={currentGoodsItemIndex}
                  clickGoodsItemIndex={clickGoodsItemIndex}
                />
              </View>
            </View>
            <View className='goods_info'>
              {/* price、isLastPriceFlag可以通过goods计算得出，这里已经算过 所以一并传下去，子组件不再书写计算逻辑 */}
              <GoodsInfo
                shopShowSoldOut={shopShowSoldOut}
                shopShowSpu={shopShowSpu}
                goods={goodsDetail}
                hidePrice={!showPrice}
                isHideInvText={isHideInvText}
              />
            </View>
            <View className='divider_h' />
          </View>
          {/* </ScrollView> */}
          {/* 底部按钮栏 */}
          {/* {(shopShowSoldOut && isSoldOut) && <View className='bottom_flag'>已售罄</View>} */}
          <View className='bottom_container'>
            <View className='action_button_container'>
              {/* <View className='action_button_item'> */}
              { Boolean(!isHideShopIcon ) && (
                <VButton
                  customerStyle='margin-right: 20rpx; padding-right:10px;'
                  src={shopIcon}
                  imageStyle='width: 54rpx; height: 54rpx;'
                  textStyle={`font-size: ${fonts.font20WithTransformed}; color: ${colors.normalTextColor}`}
                  title={i18n.t._('tab_bar_5')}
                  maxBadge={99}
                  onClick={this.gotoShop}
                />
              )}
              {!isHideCarIcon && (
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
              )}

              {/* </View> */}
              <View style={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
                {/* <EButton
                  // disabled={isSoldOut && shopShowSoldOut}
                  labels={buttonLabels}
                  width={400}
                  leftButtonClass='orange_button'
                  onLeftButtonClick={this.onLeftBtnClick}
                  onRightButtonClick={this.onRightBtnClick}
              /> */}
                <DoubleButton 
                  leftBtnConfig={{ text:'加进货车', onClick:this.onLeftBtnClick}} 
                  rightBtnConfig={{ text:'立即下单', onClick:this.onRightBtnClick}}
                ></DoubleButton>
              </View> 

            </View>
          </View>
        </View>
        <ImageDownLoadProgressView />
      </View>
    )
  }
}

export default connect(mapStateToProps)(GoodsDetailItem) as ComponentType<OwnProps>
