/**
 * @author lgl
 * @create date 2019-11-06
 * @desc
 */
import Taro from '@tarojs/taro'
import { Block, Image, Text, View } from '@tarojs/components'
import React, { ComponentClass, PureComponent } from 'react'
import { connect } from 'react-redux'
import numUtils from '@utils/num'
import images from '@config/images'
import { ITouchEvent } from '@tarojs/components/types/common'
import { defaultMapDispatchToProps, DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { ISpu } from '@@types/GoodsType'
import cartIcon from '../../../images/goods_list_order_icon.png'
import NewGoodsIcon from '../../../images/new_goods_icon.png'
import './index.scss'

type OwnProps = {
  data: ISpu
  onItemClick?: (e, data: ISpu) => void
  isCartBtnVisible?: boolean
  blur: boolean
  showPrice: boolean
  from?: string
  noShowCode?: boolean
  showNewIcon?: boolean
  useLastPrice?: boolean
}

const mapStateToProps = ({ user }: GlobalState) => ({
  // goodsSalesVolumeStatus: shop.goodsDetail.goodsSalesVolumeStatus,
  // goodsMarkedPrice: shop.goodsDetail.goodsMarkedPrice,
  // productCodeStatus: shop.goodsDetail.productCodeStatus,
  // guestFlag: user.extProps.guestFlag,
  // dontShowPriceForTourist: productParams.dont_show_price_for_tourist,
  // clusterCode: shop.shopInfo.clusterCode,
  // tenantId: shop.shopInfo.tenantId,
  // shopInfo: shop.shopInfo,
  // colorSizeVisible: goodsDetail.colorSizeVisible
})

type StateProps = ReturnType<typeof mapStateToProps>

type PageState = {}

type IProps = OwnProps & StateProps & DefaultDispatchProps

// @connect<StateProps, DefaultDispatchProps, OwnProps>(mapStateToProps)
class GoodsInfoView extends PureComponent<IProps, PageState> {
  static defaultProps = {
    data: {} as ISpu,
    isCartBtnVisible: true,
    showPrice: false,
    blur: false,
    noShowCode: false,
    showNewIcon: false
  }

  onGoodsItemClick = (e: ITouchEvent) => {
    // e.stopPropagation()
    const { onItemClick, data } = this.props
    onItemClick && onItemClick(e, data)
  }

  onAddClick = (e: ITouchEvent) => {
    e.stopPropagation()
    this.props.dispatch({
      type: 'cloudBill/showColorSizeInList',
      payload: { spuId: this.props.data.styleId }
    })
    Taro.eventCenter.trigger('on_goods_add_click')
  }

  render() {
    const {
      data,
      isCartBtnVisible,
      blur,
      showPrice,
      from,
      noShowCode,
      showNewIcon,
      useLastPrice
    } = this.props
    // let price: number | string = data.pubPrice
    // const isDefaultPriceVisible = data.defaultPrice > 0 && data.defaultPrice > price
    const isInvalid = data.flag === 1 || data.marketFlag === 0
    // const showPrice = true
    const customCurrencyCharacter = '¥'

    const showPriceSkeleton = useLastPrice && !data.useLastPrice
    return (
      <View className='good_info' onClick={this.onGoodsItemClick}>
        <View className='title_line'>
          {blur ? (
            <View className='s_placeholder'></View>
          ) : (
            <View className='good_info__title'>
              {showNewIcon && (
                <Image src={NewGoodsIcon} style='width:25px;height:14px;margin-right:5px;' />
              )}
              {`${data.name}`}
            </View>
          )}
        </View>
        {from === 'allGoods' && showPrice && (
          <View className='good_info_code'>
            {blur ? (
              <View className='s_placeholder'></View>
            ) : (
              !noShowCode && <Text className='code__text'>{data.code}</Text>
            )}
          </View>
        )}
        <View className='good_info__bottom good_info__bottom--primary'>
          {showPrice && !blur ? (
            <View className='price_wrapper'>
              {showPriceSkeleton ? (
                <View className='price_placeholder'></View>
              ) : (
                <Block>
                  {customCurrencyCharacter}
                  <Text className='good_info__bottom__price'>{data.price}</Text>
                </Block>
              )}
            </View>
          ) : blur ? (
            <View className='s_placeholder'></View>
          ) : (
            !noShowCode && <View className='code_wrapper'>{data.code}</View>
          )}
          {!isInvalid && isCartBtnVisible && !blur && (
            <View className='replenish_btn_wrapper' onClick={this.onAddClick}>
              <View className='replenish_btn'>
                <View className='replenish_btn__h'></View>
                <View className='replenish_btn__v'></View>
              </View>
            </View>
          )}
        </View>
        {/* <View className='good_info__bottom good_info__bottom--primary'>
          {blur ? <View className='s_placeholder'></View> : <View>{data.code}</View>}
          {showPrice && (
            <View className='price_wrapper'>
              {customCurrencyCharacter}
              <Text className='good_info__bottom__price'>{data.price}</Text>
            </View>
          )}
          {!isInvalid && isCartBtnVisible && !blur && (
            <View className='replenish_btn_wrapper' onClick={this.onAddClick}>
              <View className='replenish_btn'>
                <View className='replenish_btn__h'></View>
                <View className='replenish_btn__v'></View>
              </View>
            </View>
          )}
        </View> */}
      </View>
    )
  }
}

export default connect<StateProps, DefaultDispatchProps, OwnProps>(mapStateToProps)(GoodsInfoView as ComponentClass<OwnProps>)
