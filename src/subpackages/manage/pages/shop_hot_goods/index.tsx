import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Textarea, Text, Button, Input } from '@tarojs/components'
import cn from 'classnames'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import { ISpu } from '@@types/GoodsType'
import messageFeedback from '@services/interactive'
import {
  setTopStyles,
  saveSpuActivity,
  unsetTopStyles,
  getSpuActivity
} from '@api/goods_api_manager'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { SlideDirection } from '@components/SlideContainer/type'
import { getTaroParams } from '@utils/utils'
import DeleteIcon from '@/images/delete.png'
import EditIcon from '@/images/edit.png'
import SetGoodsSpecialFood, { SkuState } from '../../components/SetGoodsSpecial/SetGoodsSpecialFood'
import InputModal from './InputModal'
import GoodsSortView from '../../components/GoodsSortView'
import SetGoodsSpecial from '../../components/SetGoodsSpecial/SetGoodsSpecial'

import './index.scss'
// import { DescText, FoodDescText } from '../shop_manage'
enum DescText {
  hot = '爆款',
  special = '特价'
}

enum FoodDescText {
  hot = '店长推荐',
  special = '福利'
}
const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    manageHotList: goodsManage.manageHotList,
    manageSpecialList: goodsManage.manageSpecialList,
    description: goodsManage.description,
    useGoodsSpus: goodsManage.useGoodsSpus,
    mpErpId: goodsManage.mpErpId,
    specialId: goodsManage.specialId,
    specialGoodsDetail: goodsManage.specialGoodsDetail,
    priceTypeList: goodsManage.priceTypeList,
    spuShowPrice: goodsManage.spuShowPrice === '1',
    goodsList: goodsManage.goodsList,
    saasProductType: goodsManage.saasProductType,
    independentType: goodsManage.independentType,
    shopInfo: goodsManage.shopInfo
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface PageState {
  switchSort: boolean
  goodsList: Array<ISpu>
  inputValue: string
  _inputValue: string
  inputSlideVisible: boolean
  isSpecial: boolean
  hotId: number
  editModalVisible: boolean
  confirmValue: string
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class ShopHotGoods extends React.Component<StateProps & DefaultDispatchProps, PageState> {
  state = {
    switchSort: false,
    goodsList: [] as ISpu[],
    inputValue: '',
    _inputValue: '',
    inputSlideVisible: false,
    isSpecial: false,
    hotId: 0,
    editModalVisible: false,
    confirmValue:
      getTaroParams(Taro.getCurrentInstance?.()).type === 'hot'
        ? this.props.shopInfo.activityNames[2]
        : this.props.shopInfo.activityNames[10]
  }

  _goodsList: Array<ISpu> = []

  UNSAFE_componentWillMount(): void {
    const { saasProductType, independentType, mpErpId, shopInfo } = this.props
    const { type } = getTaroParams(Taro.getCurrentInstance?.())
    if (type === 'hot') {
      getSpuActivity({
        pageSize: 300,
        pageNo: 1,
        type: 2,
        mpErpId
      }).then(({ data }) => {
        this.setState({
          hotId: data.id
        })
      })
    }
    // if (saasProductType === 40 && independentType !== 0) {
    //   this.setState({
    //     hotText: FoodDescText.hot,
    //     specialText: FoodDescText.special
    //   })
    // }
  }

  componentDidMount() {
    const { saasProductType, independentType, shopInfo } = this.props
    const { type } = getTaroParams(Taro.getCurrentInstance?.())
    this.props.dispatch({ type: 'goodsManage/selelctShopProfileInformation' }).then(() => {
      Taro.setNavigationBarTitle({
        title: type === 'hot' ? shopInfo.activityNames[2] : shopInfo.activityNames[10]
      })
    })
    if (type === 'hot') {
      if (saasProductType === 40 && independentType !== 0) {
        Taro.setNavigationBarTitle({ title: FoodDescText.hot })
      } else {
        Taro.setNavigationBarTitle({ title: DescText.hot })
      }
      if (this.props.manageHotList) {
        this.setGoodsList(this.props.manageHotList)
      }
    } else {
      if (saasProductType === 40 && independentType !== 0) {
        Taro.setNavigationBarTitle({ title: FoodDescText.special })
      } else {
        Taro.setNavigationBarTitle({ title: DescText.special })
      }
      if (this.props.manageHotList) {
        this.setGoodsList(this.props.manageSpecialList)
      }
      this.setState({
        inputValue: this.props.description,
        _inputValue: this.props.description
      })
    }

    this.props.dispatch({
      type: 'goodsManage/selectShopParamSpuShowPrice',
      payload: {
        erpParamFirst: true
      }
    })
    if (!this.props.priceTypeList.length) {
      this.props.dispatch({
        type: 'goodsManage/selectShopPriceTypeList'
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.useGoodsSpus !== this.props.useGoodsSpus) {
      this.setGoodsList(this.props.useGoodsSpus)
    }
  }

  setGoodsList = list => {
    this._goodsList = list
    this.setState({
      goodsList: list
    })
  }

  onSortClick = () => {
    this.setState(state => ({
      switchSort: !state.switchSort
    }))
  }

  onAddClick = async () => {
    const { type } = getTaroParams(Taro.getCurrentInstance?.())
    Taro.showLoading({ title: '请稍等...' })
    if ((type === 'special' && this._goodsList.length < 100) || type === 'hot') {
      await this.props.dispatch({
        type: 'goodsManage/fetchGoodsList',
        payload: {
          styleIdsNotIn: this._goodsList.map(item => item.styleId)
        }
      })
      this.props.dispatch({
        type: 'goodsManage/save',
        payload: {
          useGoodsSpus: this._goodsList
        }
      })
      const { type } = getTaroParams(Taro.getCurrentInstance?.())
      Taro.hideLoading()
      if (type === 'hot') {
        Taro.navigateTo({
          url: '/subpackages/cloud_bill/pages/use_goods/index'
        })
      } else {
        Taro.navigateTo({
          url: '/subpackages/cloud_bill/pages/use_goods/index?from=special'
        })
      }
    } else {
      messageFeedback.showToast(`最多添加100个${this.props.shopInfo.activityNames[10]}货品`)
    }
  }

  // 排序 or 删除 or 保存
  onGoodsChange = list => {
    this._goodsList = list
  }

  onGoodsDelete = styleId => {
    messageFeedback.showToast('删除成功')
    const { type } = getTaroParams(Taro.getCurrentInstance?.())
    // if (type === 'hot') {
    //   unsetTopStyles({
    //     mpErpId: this.props.mpErpId,
    //     styleIds: styleId
    //   })
    // }
  }

  onSettingClick = spuId => {
    Taro.showLoading({ title: '请稍等...' })
    this.props
      .dispatch({
        type: 'goodsManage/fetchGoodsDetail',
        payload: {
          spuId,
          isSpecial: true
        }
      })
      .then(() => {
        Taro.hideLoading()
        this.setState({
          isSpecial: true
        })
      })
      .catch(() => {
        Taro.hideLoading()
      })
  }

  onSaveClick = () => {
    if (this._goodsList.length || this.props.specialId) {
      const { mpErpId, specialId } = this.props
      const { type } = getTaroParams(Taro.getCurrentInstance?.())
      const { inputValue, hotId, confirmValue } = this.state
      if (type === 'hot') {
        Taro.showLoading({ title: '请稍等...' })
        saveSpuActivity({
          jsonParam: {
            mpErpId,
            type: 2,
            name: confirmValue,
            description: '',
            id: hotId || undefined,
            spuList: this._goodsList.map(item => ({ styleId: item.styleId }))
          }
        })
          .then(() => {
            this.props.dispatch({ type: 'goodsManage/selelctShopProfileInformation' })
            Taro.hideLoading()
            messageFeedback.showToast('保存成功！')
            Taro.navigateBack()
          })
          .catch(() => {
            Taro.hideLoading()
          })
      } else {
        Taro.showLoading({ title: '请稍等...' })
        saveSpuActivity({
          jsonParam: {
            mpErpId,
            type: 10,
            name: confirmValue,
            description: inputValue,
            id: specialId || undefined,
            spuList: this._goodsList.map(item => {
              if (item.skus && item.skus.length > 0) {
                return {
                  styleId: item.styleId,
                  price: item.price,
                  skuList: item.skus.map(sku => ({
                    id: sku.id,
                    price: sku.price,
                    sizeName: sku.sizeName
                  }))
                }
              } else {
                return {
                  styleId: item.styleId,
                  price: item.price
                }
              }
            })
          }
        })
          .then(() => {
            this.props.dispatch({ type: 'goodsManage/selelctShopProfileInformation' })
            Taro.hideLoading()
            messageFeedback.showToast('保存成功！')
            Taro.navigateBack()
          })
          .catch(() => {
            Taro.hideLoading()
          })
      }
    } else {
      messageFeedback.showToast('请添加货品')
    }
  }

  onInputClick = () => {
    if (!this.state.inputValue) {
      this.setState({
        inputSlideVisible: true
      })
    }
  }

  onTextareaInput = e => {
    this.setState({
      _inputValue: e.detail.value
    })
  }

  onTextSave = () => {
    this.setState({
      inputValue: this.state._inputValue || `${this.state.confirmValue}清仓商品，不退不换`,
      inputSlideVisible: false
    })
  }

  onDescriptionEdit = () => {
    this.setState({
      inputSlideVisible: true
    })
  }

  onSlideClose = () => {
    this.setState(prevState => {
      return {
        inputSlideVisible: false,
        _inputValue: prevState.inputValue
      }
    })
  }

  onSpecialFoodSave = (operatedSkus: SkuState[], styleId) => {
    const list = this._goodsList.map(item => {
      let skus = Array.isArray(item.skus) ? item.skus : []
      let maxDiscountDiff
      let maxDiscountPrice = item.price

      if (item.styleId === styleId) {
        if (Array.isArray(item.skus)) {
          operatedSkus.forEach(s => {
            const curSku = skus.find(sku => sku.id === s.sku.id)
            if (curSku && s._inputPrice !== undefined) {
              if (maxDiscountDiff === undefined) {
                maxDiscountDiff = (s.sku.originPrice || s.sku.price) - s._inputPrice
                maxDiscountPrice = String(s._inputPrice)
              } else {
                if (maxDiscountDiff < (s.sku.originPrice || s.sku.price) - s._inputPrice) {
                  maxDiscountDiff = (s.sku.originPrice || s.sku.price) - s._inputPrice
                  maxDiscountPrice = String(s._inputPrice)
                }
              }
              curSku.price = s._inputPrice
            }
          })
        } else {
          maxDiscountPrice = operatedSkus[0]._inputPrice || item.price
        }
        return {
          ...item,
          price: maxDiscountPrice,
          skus
        }
      } else {
        return item
      }
    })
    this.setGoodsList(list)
    this.setState({
      isSpecial: false
    })
  }

  handleEditTitleSave = value => {
    // const { editModalValue } = this.state
    if (!value) {
      return Taro.showToast({ title: '活动标题不能为空', icon: 'none' })
    }
    if (value.length > 4) {
      return Taro.showToast({ title: '活动标题不能大于4个字', icon: 'none' })
    }
    this.setState({
      editModalVisible: false,
      confirmValue: value
    })
  }

  onSpecialSave = (price, styleId) => {
    const list = this._goodsList.map(item => {
      return {
        ...item,
        price: item.styleId === styleId ? price : item.price
      }
    })
    this.setGoodsList(list)
    this.setState({
      isSpecial: false
    })
  }

  onClose = () => {
    this.setState({
      isSpecial: false
    })
  }

  render() {
    const {
      switchSort,
      goodsList,
      inputValue,
      inputSlideVisible,
      _inputValue,
      isSpecial,
      editModalVisible,
      confirmValue
    } = this.state
    const { type } = getTaroParams(Taro.getCurrentInstance?.())
    const {
      specialGoodsDetail,
      priceTypeList,
      spuShowPrice,
      saasProductType,
      independentType,
      shopInfo
    } = this.props
    const { activityNames } = shopInfo
    const isFoodIndependent = saasProductType === 40 && independentType !== 0

    console.log('activityNames', activityNames)
    return (
      <View className='shop_hot_goods'>
        {type === 'hot' ? (
          <View className='shop_hot_goods__header'>
            <View className='shop_hot_goods__header__title'>
              活动标题：{confirmValue || activityNames[2]}
              <Image
                className='shop_hot_goods__header__icon'
                src={EditIcon}
                onClick={() => this.setState({ editModalVisible: true })}
              ></Image>
            </View>
            <View className='shop_hot_goods__header__label'>
              主推的商品将置顶在{activityNames[2]}栏目中
            </View>
            <View
              onClick={this.onSortClick}
              className={cn('shop_hot_goods__header__actionView aic jcc', {
                ['action_save']: switchSort,
                ['action_sort']: !switchSort
              })}
            >
              {switchSort ? '保存' : '排序'}
            </View>
          </View>
        ) : (
          <View
            className={cn('shop_hot_goods__infoView aic', {
              ['jcc']: !inputValue,
              ['jcsb']: inputValue
            })}
            onClick={this.onInputClick}
          >
            {inputValue || '点击添加公告'}
            {inputValue && (
              <Text className='description_edit' onClick={this.onDescriptionEdit}>
                编辑
              </Text>
            )}
          </View>
        )}
        {type === 'special' && (
          <View className='shop_hot_goods__special_header'>
            <View className='shop_hot_goods__header__title'>
              活动标题：{confirmValue || activityNames[10]}
              <Image
                className='shop_hot_goods__header__icon'
                src={EditIcon}
                onClick={() => this.setState({ editModalVisible: true })}
              ></Image>
            </View>
            <View
              onClick={this.onSortClick}
              className={cn('shop_hot_goods__header__actionView aic jcc', {
                ['action_save']: switchSort,
                ['action_sort']: !switchSort
              })}
            >
              {switchSort ? '保存' : '排序'}
            </View>
          </View>
        )}
        <View className='shop_hot_goods__content'>
          <GoodsSortView
            type={type}
            data={goodsList}
            sort={switchSort}
            needShowDiscountPrice={isFoodIndependent}
            onChange={this.onGoodsChange}
            onDeleteImage={this.onGoodsDelete}
            onSettingClick={this.onSettingClick}
          />
        </View>
        <View className='shop_hot_goods__bottom' style={{ zIndex: 101 }}>
          <View className='shop_hot_goods__bottom__left' onClick={this.onAddClick}>
            添加{type === 'hot' ? activityNames[2] : activityNames[10]}
          </View>
          <View className='shop_hot_goods__bottom__right' onClick={this.onSaveClick}>
            保存
          </View>
        </View>

        <SlideContainer
          visible={inputSlideVisible}
          direction={SlideDirection.Bottom}
          onRequestClose={this.onSlideClose}
        >
          <View className='slide_container_content'>
            <View className='slide_container_content__header aic jcc'>
              公告
              <Image onClick={this.onSlideClose} src={DeleteIcon} className='delete_icon' />
            </View>
            <View className='slide_container_content__content'>
              <Textarea
                placeholder={`默认文案：${activityNames[10]}清仓商品，不退不换`}
                className='slide_container_content__content__text'
                maxlength={20}
                value={_inputValue}
                onInput={this.onTextareaInput}
              />
              <View className='slide_container_content__content__length'>
                <Text style='color: #222;'>{_inputValue.length}</Text>/20
              </View>
            </View>
            <View className='slide_container_content__label'>
              公告会展示在{activityNames[10]}模块内
            </View>
            <View className='slide_container_content__action aic jcc' onClick={this.onTextSave}>
              保存
            </View>
          </View>
        </SlideContainer>
        {isSpecial &&
          (isFoodIndependent ? (
            <SetGoodsSpecialFood
              from='shop_goods'
              showPrice={spuShowPrice}
              data={specialGoodsDetail}
              priceTypeList={priceTypeList}
              onSaveClick={this.onSpecialFoodSave}
              onClose={this.onClose}
            />
          ) : (
            <SetGoodsSpecial
              from='shop_goods'
              showPrice={spuShowPrice}
              data={specialGoodsDetail}
              priceTypeList={priceTypeList}
              onSaveClick={this.onSpecialSave}
              onClose={this.onClose}
            />
          ))}
        <InputModal
          visible={editModalVisible}
          value={confirmValue}
          onCancel={() => this.setState({ editModalVisible: false })}
          onConfirm={value => this.handleEditTitleSave(value)}
        ></InputModal>
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(ShopHotGoods)