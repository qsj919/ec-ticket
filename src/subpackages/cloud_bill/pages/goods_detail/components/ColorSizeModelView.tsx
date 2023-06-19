/**
 * @author GaoYuJian
 * @create date 2018-11-21
 * @desc
 */
import Taro from '@tarojs/taro'
import React, { ComponentClass, PureComponent } from 'react'
import { Image, Text, View } from '@tarojs/components'
import images from '@config/images'
// import {
//   getCustomColorCharacter,
//   getCustomCurrencyCharacter,
//   getCustomSizeCharacter
// } from '@utils/localizableString'
import EButton from '@components/Button/EButton'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import className from 'classnames'
import { connect } from 'react-redux'
import { ColorSizeModeFromType } from '@@types/base'
import noImage from '@/images/no_image.png'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import i18n from '@@/i18n'

import './color_size_model_view.scss'
import ColorSizeView from './ColorSizeView'
import selector from '../selector'

type Props = {
  type: 'buy' | 'addCart' | 'buttons'
  visible: boolean
  onVisibleChanged?: Function
  onSaveClick?: (type?: string) => void
  showIpxPadding?: boolean
  fromWayType?: ColorSizeModeFromType
}

type IProps = StateProps & Props & DefaultDispatchProps

type States = {}

const mapStateToProps = ({ cloudBill, goodsManage, shop }: GlobalState) => {
  const _shop = shop.list.find(s => s.id === cloudBill.mpErpId)
  return {
    goodsDetail: cloudBill.goodsDetail,
    showPrice: cloudBill.shopParams.spuShowPrice === '1',
    isSoldOut: selector.goodsSoldOutSelector({ ...goodsManage, ...cloudBill }),
    shopShowSpu: goodsManage.shopShowSpu === '1',
    shopShowSoldOut: goodsManage.shopShowSoldOut === '1',
    mpErpId: cloudBill.mpErpId,
    shop: _shop
    // displaySizeView: selectors.displaySelector(goodsDetail),
    // goodsActivity: selectors.goodsActivitySelector(goodsDetail),
    // activeSku: selectors.activeSkuSelector(goodsDetail),
    // colorLabel: goodsDetail.goods
    //   ? goodsDetail.goods.spu.spec2FiledNameCaption
    //   : '',
    // sizeLabel: goodsDetail.goods
    //   ? goodsDetail.goods.spu.spec1FiledNameCaption
    //   : '',
    // total: selectors.getTotal(goodsDetail),
    // colorSizeVisible: goodsDetail.colorSizeVisible
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, {}, Props>(mapStateToProps)
class ColorSizeModelView extends PureComponent<IProps, States> {
  static options = {
    styleIsolation: 'shared'
  }

  static defaultProps = {
    showIpxPadding: true
  }

  // @ts-ignore
  colorSizeView: ColorSizeView | null

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidUpdate(prevProps: Props) {}

  onVisibleChanged(visible) {
    if (this.props.onVisibleChanged) {
      this.props.onVisibleChanged(visible)
    } else {
      this.props.dispatch({
        type: 'cloudBill/save',
        payload: { colorSizeVisible: visible }
      })
    }
  }

  onSaveClick(type?: string) {
    // console.log(this.rpops'save!')
    if (this.props.onSaveClick) {
      this.props.onSaveClick(type)
    } else {
      this.props.dispatch({
        type: 'cloudBill/onColorSizeConfirm',
        payload: { type }
      })
    }
  }

  onContainerClick = event => {
    event.stopPropagation()
  }

  render() {
    const {
      visible,
      type,
      showIpxPadding,
      goodsDetail,
      showPrice,
      isSoldOut,
      shopShowSoldOut,
      shop
    } = this.props

    let price = goodsDetail.price
    const { spec1Name = '颜色', spec2Name = '尺码', name = '', code } = goodsDetail
    const buttonLabel = type === 'buy' ? '立即下单' : '加入进货车'
    return (
      <SlideContainer
        visible={visible}
        maxHeight={100}
        onRequestClose={this.onVisibleChanged.bind(this, false)}
        showIpxPadding={showIpxPadding}
        containerClass='visible-y'
      >
        <View 
          className='color_size_model_view' 
          onClick={this.onContainerClick} 
          onTouchMove={e => {
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          <View className='goods'>
            <View className='goods__top'>
              <Image
                src={images.common.close_40}
                className='close'
                onClick={this.onVisibleChanged.bind(this, false)}
              />
              <View className='goods_detail'>
                <Image mode='aspectFill' className='image' src={goodsDetail.imgUrlBig || noImage} />
                <View className='good_info'>
                  <View className='goods_price_line'>
                    <Text className='rmb_sign'>¥</Text>
                    <Text className='price'>{showPrice ? price : '?'}</Text>
                  </View>
                  {name && <View className='selected_item'>{name}</View>}
                  {code && <View className='selected_item selected_item--sub'>{code}</View>}
                </View>
              </View>
              {visible && (
                <ColorSizeView industries={shop && shop.industries} showPrice={showPrice} />
              )}
            </View>

            <View className='divider_h' />
            <View className='button_wrapper'>
              <View style={{ flex: 1 }}>
                {type !== 'buttons' ? (
                  <EButton
                    label={buttonLabel}
                    onButtonClick={this.onSaveClick.bind(this, '')}
                    size='large'
                    height={72}
                  />
                ) : (
                  <EButton
                    height={72}
                    disabled={isSoldOut && shopShowSoldOut}
                    size='large'
                    labels={[i18n.t._('addToCart'), i18n.t._('buyNow')]}
                    leftButtonClass='orange_button'
                    onLeftButtonClick={this.onSaveClick.bind(this, 'addCart')}
                    onRightButtonClick={this.onSaveClick.bind(this, 'buy')}
                    // buttonClass={!displaySizeView ? 'font-30' : ''}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </SlideContainer>
    )
  }
}

export default connect<StateProps, {}, Props>(mapStateToProps)(ColorSizeModelView) as ComponentClass<Props>
