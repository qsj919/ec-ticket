import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Image, Text, Input, Picker } from '@tarojs/components'
import DeleteIcon from '@/images/delete.png'
import angleRight from '@/images/angle_right_gray_40.png'
import checkedIcon from '@/images/checked_circle_red.png'
import uncheckedIcon from '@/images/icon/uncheck_circle.png'
import { IGoodsDetailFromApi } from '@@types/GoodsType'
import DefaultGood from '@/images/default_good_pic.png'
import EImage from '@components/EImage'
import messageFeedback from '@services/interactive'
import { addGoods } from '@api/live_api_manager'

import './up_goods.scss'

interface CategoryList {
  name: string
  id: number
  childCatList: Array<{
    name: string
    id: number
  }>
}

interface Category_Item {
  id: number
  name: string
  productQualification: string
  productQualificationType: number
  qualification: string
  qualificationType: number
}

interface PriceType {
  delflag: string
  flagname: string
  id: string
  name: string
  sid: string
}

type OwnProps = {
  data: IGoodsDetailFromApi
  priceTypeList: Array<PriceType>
  mpErpId: number
  categoryList: CategoryList
  onClose: () => void
  onSuccess: () => void
}

interface State {
  invSwitch: boolean
  list: any
  categoryValue: Category_Item
}

export default class UpGoods extends React.Component<OwnProps, State> {
  state = {
    invSwitch: true,
    list: [] as CategoryList[],
    categoryValue: {} as Category_Item
  }

  livePrice: number

  columnValue: number = 0

  static defaultProps = {
    priceTypeList: [],
    data: {} as IGoodsDetailFromApi,
    categoryList: []
  }

  componentDidMount() {
    this.initCategoryList()
  }
  initCategoryList = () => {
    const { categoryList } = this.props
    this.setState({
      list: [
        categoryList,
        categoryList[0].childCatList,
        categoryList[0].childCatList[0].childCatList
      ]
    })
  }
  onPickerChange = e => {
    const { column, value } = e.detail
    if (column === 0) {
      this.columnValue = value
      this.setState(prevState => {
        const { categoryList } = this.props
        prevState.list[1] = categoryList[value].childCatList
        prevState.list[2] = categoryList[value].childCatList[0].childCatList
        return {
          list: [...prevState.list]
        }
      })
    }
    if (column === 1) {
      this.setState(prevState => {
        const { categoryList } = this.props
        prevState.list[2] = categoryList[this.columnValue].childCatList[value].childCatList
        return {
          list: [...prevState.list]
        }
      })
    }
  }

  onPickerConfirm = e => {
    const { value } = e.detail
    const { categoryList } = this.props
    this.setState({
      categoryValue: categoryList[value[0]].childCatList[value[1]].childCatList[value[2]]
    })
  }

  onInvSwitchClick = e => {
    const { type } = e.currentTarget.dataset
    this.setState({
      invSwitch: type === 'real' ? true : false
    })
  }

  onPriceInput = e => {
    this.livePrice = e.detail.value
  }

  onAddGoodsClick = () => {
    const { invSwitch, categoryValue } = this.state
    const { data, mpErpId } = this.props
    if (!categoryValue || !categoryValue.id) {
      messageFeedback.showToast('请选择商品类目')
      return
    }
    Taro.showLoading({ title: '请稍等...' })
    addGoods({
      mpErpId,
      styleId: data.styleId,
      thirdCatId: categoryValue.id,
      styleName: data.name,
      styleCode: data.code,
      spec1Name: data.spec1Name,
      spec2Name: data.spec2Name,
      livePrice: this.livePrice ? Number(this.livePrice) : data.price,
      realPrice: data.price,
      priceType: data.priceType,
      invType: 1,
      allImgUrlBigs: data.allImgUrlBigs,
      skus: data.skus.map(sku => ({
        id: sku.id,
        colorId: sku.colorId,
        colorName: sku.colorName,
        sizeId: sku.sizeId,
        sizeName: sku.sizeName,
        invNum: sku.invNum
      }))
    })
      .then(res => {
        this.props.onSuccess()
        Taro.hideLoading()
      })
      .catch(e => {
        Taro.hideLoading()
      })
  }

  onClose = () => {
    this.props.onClose()
  }

  render() {
    const { invSwitch, list, categoryValue } = this.state
    const { data, priceTypeList } = this.props
    const priceTypeLabel = priceTypeList.find(item => item.sid === String(data.priceType))
    return (
      <View className='up_goods_mask' onClick={this.onClose}>
        <View className='up_goods_mask__content' onClick={e => e.stopPropagation()}>
          <View className='up_goods_mask__content__goodsInfo'>
            <View className='up_goods_mask__content__goodsInfo__goodsImage'>
              {data && data.imgUrls ? (
                <EImage mode='aspectFill' src={data.imgUrls} />
              ) : (
                <EImage mode='aspectFill' src={(data && data.imgUrl) || DefaultGood} />
              )}
            </View>
            <View className='up_goods_mask__content__goodsInfo__info'>
              <View className='up_goods_mask__content__goodsInfo__info__name'>{data.name}</View>
              <View className='up_goods_mask__content__goodsInfo__info__priceView'>
                <View className='up_goods_mask__content__goodsInfo__info__priceView__label'>
                  原价
                </View>
                <View className='up_goods_mask__content__goodsInfo__info__priceView__price'>
                  ¥{data.originPrice || data.price}
                </View>
                {priceTypeLabel && (
                  <View className='up_goods_mask__content__goodsInfo__info__priceView__priceType'>
                    {priceTypeLabel.name}
                  </View>
                )}
              </View>
            </View>

            <Image src={DeleteIcon} className='delete_icon' onClick={this.onClose} />
          </View>
          <View className='up_goods_mask__content__category'>
            <Text className='up_goods_mask__content__category__label'>上架类目</Text>
            <Picker
              mode='multiSelector'
              range={list}
              rangeKey='name'
              onColumnChange={this.onPickerChange}
              onChange={this.onPickerConfirm}
            >
              <View className='up_goods_mask__content__category__value'>
                {categoryValue.name || '选择类目'}
                <Image src={angleRight} className='angle_right_icon' />
              </View>
            </Picker>
          </View>
          <View className='up_goods_mask__content__goodsPrice'>
            <View className='up_goods_mask__content__goodsPrice__left'>
              <View className='up_goods_mask__content__goodsPrice__left__title'>直播价格</View>
              <View className='up_goods_mask__content__goodsPrice__left__label'>
                不设置则以原价上架
              </View>
            </View>
            <View className='up_goods_mask__content__goodsPrice__right'>
              <Input
                type='digit'
                onInput={this.onPriceInput}
                placeholder='输入价格'
                placeholderStyle='color: #999;'
                className='up_goods_mask__content__goodsPrice__right__input'
              />
            </View>
          </View>
          {/* <View className='up_goods_mask__content__invNum'>
            <View className='up_goods_mask__content__invNum__label'>库存显示</View>
            <View className='up_goods_mask__content__invNum__radio'>
              <View
                className='up_goods_mask__content__invNum__radio__item'
                data-type='real'
                onClick={this.onInvSwitchClick}
              >
                <Image src={invSwitch ? checkedIcon : uncheckedIcon} className='check_icon' />
                <Text className='check_label'>真实库存</Text>
              </View>
              <View
                className='up_goods_mask__content__invNum__radio__item'
                data-type='virtual'
                onClick={this.onInvSwitchClick}
              >
                <Image src={!invSwitch ? checkedIcon : uncheckedIcon} className='check_icon' />
                <Text className='check_label'>虚拟库存</Text>
              </View>
            </View>
          </View> */}
          <View className='up_goods_mask__content__bottom'>
            <View className='up_goods_mask__content__bottom__action' onClick={this.onAddGoodsClick}>
              上架商品
            </View>
          </View>
        </View>
      </View>
    )
  }
}
