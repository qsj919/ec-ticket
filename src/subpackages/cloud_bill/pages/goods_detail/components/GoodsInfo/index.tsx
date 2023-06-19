import Taro from '@tarojs/taro'
import React, { ComponentClass } from 'react'
import { View, Image, Text, Button, Block } from '@tarojs/components'
import images from '@config/images'
// import { SPUType } from '@src/models/GoodsType'
import numUtils from '@utils/num'
import { DefaultDispatchProps, GlobalState } from '@@/types/model_state'
import { connect } from 'react-redux'
import i18n from '@@/i18n'
import { IGoodsDetail } from '@@types/GoodsType'
import shareLineIcon from '@/images/icon/share_line.png'
import shareIcon from '../../../../images/goods_detail_share.png'
import selectors from '../../selector'
import './index.scss'

interface OwnProps {
  goods: IGoodsDetail
  hidePrice: boolean
  shopShowSpu: boolean
  shopShowSoldOut: boolean
  isHideInvText?: boolean
  hideShare?: boolean
  showSizeItems?: boolean
}

// type StateProps = ReturnType<typeof mapStateToProps>

type PageState = {}

type IProps = OwnProps & DefaultDispatchProps

const mapStateToProps = ({ cloudBill }: GlobalState) => ({
  // guestFlag: user.extProps.guestFlag,
  // dontShowPriceForTourist: productParams.dont_show_price_for_tourist,
  // goodsMarkedPrice: shop.goodsDetail.goodsMarkedPrice,
  // productCodeStatus: shop.goodsDetail.productCodeStatus,
  // startSaleRule: shop.shopInfo.startSaleRule
  colorItems: selectors.colorItemsSelector(cloudBill),
  sizeItems: selectors.sizeItemsSelector(cloudBill)
})

// @connect<{}, {}, IProps>(mapStateToProps)
class GoodsInfo extends React.PureComponent<IProps> {
  static defaultProps = {
    hidePrice: false,
    isHideInvText: false,
    hideShare: false,
    showSizeItems: false
  }

  componentDidMount(): void {
    Taro.loadFontFace({
      family: 'ProductSans-Regular',
      source: 'url(https://webdoc.hzecool.com/webCdn/weapp/ec-ticket/Product-Sans-Regular.ttf)',
      success: console.log
    })
  }

  render() {
    const {
      goods,
      hidePrice,
      shopShowSpu,
      shopShowSoldOut,
      isHideInvText,
      hideShare,
      showSizeItems,
      colorItems,
      sizeItems
    } = this.props

    let code = ''
    let title = ''
    let invText = ''
    if (goods) {
      code = goods.code
      title = goods.name
      if (shopShowSoldOut) {
        if (typeof goods.invNum === 'undefined' || goods.invNum <= 0) {
          invText = `已售罄`
        } else {
          if (shopShowSpu) {
            invText = `还剩${goods.invNum}件`
          }
        }
      } else {
        if (shopShowSpu) {
          invText = `还剩${goods.invNum}件`
        }
      }
    }

    let filterColors: string[] = []
    let filterSizes: string[] = []
    if (
      colorItems.length === 1 &&
      colorItems[0].name === '均色' &&
      sizeItems.length === 1 &&
      sizeItems[0].name === '均码'
    ) {
      filterColors = []
      filterSizes = []
    } else {
      filterColors = colorItems.map(color => color.name)
      filterSizes = sizeItems.map(size => size.name)
    }
    return (
      <View className='goods_info__basic'>
        {/* <View className='goods_price_line'> */}
        {/* <View style={{ display: 'flex', alignItems: 'center' }}>
            <View className='price_text'>
              <Text>¥</Text>
              <Text className='price_text__number'>{hidePrice ? '?' : goods.price}</Text>
            </View>
            <View className='spu_code'>
              <Text selectable>{code}</Text>
            </View>
          </View> */}
        {/* {!isHideInvText && <View className='stock_text'>{invText}</View>}
        </View> */}
        <View className='des_container_new'>
          <View className='info'>
            {!hidePrice && (
              <View className='info_price'>
                <Text>¥</Text>
                <View className='info_price_number'>{goods.price}</View>
              </View>
            )}
            <Text className='info_name' selectable>
              {title}
            </Text>
            <Text className='info_code' selectable>
              {code}
              {!isHideInvText && <Text className='stock'>{invText}</Text>}
            </Text>
          </View>
          {!hideShare && (
            <View className='share_view_new_wrap'>
              <View className='des_container_new_line'></View>
              <Button
                className='share_view_new'
                openType='share'
                data-id={goods.styleId}
                data-name={goods.name}
                data-img={goods.imgUrl}
              >
                <Image className='share_view_new__icon' src={shareLineIcon} />
                <Text>分享</Text>
              </Button>
            </View>
          )}
        </View>
        {/* {(filterColors.length > 0 || filterSizes.length > 0) &&  <View className='divid_line'></View>}  */}
        {filterColors.length > 0 && (
          <View className='specifications_container'>
            <View className='specifications_container_label'>{goods.spec1Name || ''}</View>
            <View className='specifications_container_industries'>
              {filterColors.map(colorName => (
                <View key={colorName} className='specifications_container_industries__item'>
                  {colorName}
                </View>
              ))}
            </View>
          </View>
        )}
        {filterSizes.length > 0 && (
          <View className='specifications_container'>
            <View className='specifications_container_label'>{goods.spec2Name || ''}</View>
            <View className='specifications_container_industries'>
              {filterSizes.map(sizeName => (
                <View key={sizeName} className='specifications_container_industries__item'>
                  {sizeName}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    )
  }
}

export default connect<{}, {}, IProps>(mapStateToProps)(GoodsInfo) as ComponentClass<OwnProps>
