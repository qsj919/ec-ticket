import Taro, { Config } from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import SearchbarView from '@components/SearchBarView/SearchbarView'
import cn from 'classnames'
import { PAGE_SIZE } from '@constants/index'
import { ISpu, IGoodsDetailFromApi } from '@@types/GoodsType'
import { findCategoryList } from '@api/live_api_manager'
import { getTaroParams } from '@utils/utils'

import FilterIcon from '../../images/filter_icon.png'
import ClassIcon from '../../images/class_icon.png'
import GoodsItemForManage from '../../components/GoodsItemForManage'
import { checkedSpus } from '../goods_manage/selector'
import SelectModel from '../../components/SelectModel'
import SetGoodsSpecial from '../../components/SetGoodsSpecial/SetGoodsSpecial'
import SetGoodsSpecialFood from '../../components/SetGoodsSpecial/SetGoodsSpecialFood'
import UpGoods from '../../components/up_goods/up_goods'

import './index.scss'

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    goodsList: goodsManage.goodsList,
    ...checkedSpus(goodsManage),
    classList: goodsManage.classList,
    brandList: goodsManage.brandList,
    providerList: goodsManage.providerList,
    seasonList: goodsManage.seasonList,
    shopFilterList: goodsManage.shopFilterList,
    pageNo: goodsManage.pageNo,
    useGoodsSpus: goodsManage.useGoodsSpus,
    specialGoodsDetail: goodsManage.specialGoodsDetail,
    priceTypeList: goodsManage.priceTypeList,
    spuShowPrice: goodsManage.spuShowPrice === '1',
    mpErpId: goodsManage.mpErpId,
    saasProductType: goodsManage.saasProductType,
    independentType: goodsManage.independentType
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface CategoryList {
  name: string
  id: number
  childCatList: Array<{
    name: string
    id: number
  }>
}

interface State {
  showClassModel: boolean
  showFilterModel: boolean
  classId: number
  searchValue: string
  isSpecial: boolean
  isVideoLive: boolean
  currentSpecialGoods: ISpu
  categoryList: CategoryList
}
enum GoodsStauts {
  NO_SALE = 6,
  ON_SALE = 7
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class UseGoods extends React.Component<StateProps & DefaultDispatchProps, State> {
  // config: Config = {
  //   navigationBarTitleText: '选择货品'
  // }
  state = {
    showClassModel: false,
    showFilterModel: false,
    classId: 0,
    searchValue: '',
    isSpecial: false,
    currentSpecialGoods: {} as ISpu,
    isVideoLive: false,
    categoryList: {} as CategoryList
  }
  marketOptimeBegin: string = ''
  marketOptimeEnd: string = ''
  hotValue: string = ''
  filterShop = {}
  brand = {}
  provider = {}
  season = {}

  componentDidMount() {
    if (!this.props.priceTypeList.length) {
      this.props.dispatch({
        type: 'goodsManage/selectShopPriceTypeList'
      })
    }
    if (getTaroParams(Taro.getCurrentInstance?.()).from === 'live') {
      findCategoryList({
        mpErpId: this.props.mpErpId
      })
        .then(({ data }) => {
          console.log(data)
          this.setState({
            categoryList: data.rows
          })
        })
        .catch(() => {})
    }

    this.fetchList()
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'goodsManage/checkeAllGoods',
      payload: { checked: false }
    })

    this.props.dispatch({ type: 'goodsManage/resetList' })
  }

  onReachBottom() {
    if (this.props.goodsList.length < PAGE_SIZE * this.props.pageNo) return
    this.fetchList(true)
  }

  fetchList = (loadMore = false) => {
    this.props.dispatch({
      type: 'goodsManage/fetchGoodsList',
      payload: {
        excludeChannelLive: 1,
        classId: this.state.classId || undefined,
        type: GoodsStauts.ON_SALE,
        loadMore,
        // shopId: this.filterShop.id || undefined,
        brandId: this.brand.id || undefined,
        providerId: this.provider.id || undefined,
        season: this.season.id || undefined,
        slhMarketDateBegin: this.marketOptimeBegin || undefined,
        slhMarketDateEnd: this.marketOptimeEnd || undefined,
        styleNameLike: this.state.searchValue.trim(),
        styleIdsNotIn: this.props.useGoodsSpus.map(item => item.styleId)
      }
    })
  }

  onClearClick = () => {
    this.props.dispatch({
      type: 'goodsManage/checkeAllGoods',
      payload: { checked: false }
    })
  }

  onSaveClick = () => {
    const { checkedSpuIds, goodsList } = this.props
    if (checkedSpuIds) {
      const { from } = getTaroParams(Taro.getCurrentInstance?.())
      const _checkedSpuIds = checkedSpuIds.split(',')
      const _list = this.props.useGoodsSpus.map(item => ({ ...item }))
      if (from === 'share' && this.props.useGoodsSpus.length >= 40) {
        _list.splice(_list.length - _checkedSpuIds.length)
      }
      if (from === 'share' && this.props.useGoodsSpus.length + _checkedSpuIds.length >= 40) {
        _list.splice(_list.length - _checkedSpuIds.length + this.props.useGoodsSpus.length - 40)
      }
      this.props.dispatch({
        type: 'goodsManage/save',
        payload: {
          useGoodsSpus: [
            ..._list,
            ...goodsList.filter(good => _checkedSpuIds.includes(String(good.styleId)))
          ]
        }
      })
    }
    Taro.navigateBack()
  }
  onItemClick = data => {
    const { from = '' } = getTaroParams(Taro.getCurrentInstance?.())
    if (!data.allImgUrlBig && from === 'share') {
      Taro.showToast({
        title: '请选择有图的货品',
        icon: 'none'
      })
      return
    }
    if (from === 'special' || from === 'live') {
      Taro.showLoading({ title: '请稍等...' })
      this.props
        .dispatch({
          type: 'goodsManage/fetchGoodsDetail',
          payload: {
            spuId: data.styleId,
            isSpecial: true
          }
        })
        .then(() => {
          Taro.hideLoading()
          if (from === 'special') {
            this.setState({
              isSpecial: true
            })
          } else {
            // 视频号选择上架商品
            this.setState({
              isVideoLive: true
            })
          }
        })
    } else {
      let _checked
      if (from === 'share') {
        _checked = this.props.checkedSpuLength < 40 ? !data.checked : false
      } else {
        _checked = !data.checked
      }
      this.props.dispatch({
        type: 'goodsManage/updateSpuChecked',
        payload: {
          styleId: data.styleId,
          checked: _checked
        }
      })
    }
  }

  onClassificationClick = item => {
    this.setState({
      classId: item.codeValue
    })
  }

  onCloseClassModel = () => {
    this.setState({
      showClassModel: false
    })
  }

  onResetClick = () => {
    this.setState({
      classId: 0
    })
  }

  onConfirmClick = () => {
    this.onCloseClassModel()
    this.fetchList()
  }

  onClassClick = () => {
    this.setState(state => ({
      showClassModel: !state.showClassModel
    }))
  }

  onFilterClick = () => {
    this.setState(state => ({
      showFilterModel: !state.showFilterModel
    }))
  }

  onCloseFilterView = () => {
    this.setState({
      showFilterModel: false
    })
  }

  onSearchInput = searchValue => {
    this.setState({
      searchValue
    })
  }

  onClearSearchClick = () => {
    this.setState(
      {
        searchValue: ''
      },
      this.fetchList
    )
  }

  onSearchConfirm = () => {
    this.fetchList()
  }

  onFilterConfirm = arg => {
    const { prodate1, prodate2 } = arg.dateValue
    this.marketOptimeBegin = arg.dateValue ? prodate1 : ''
    this.marketOptimeEnd = arg.dateValue ? prodate2 : ''
    this.hotValue = arg.hotValue
    this.filterShop = arg.filterShop
    this.brand = arg.brand
    this.provider = arg.provider
    this.season = arg.season
    this.setState({
      showFilterModel: false
    })
    this.fetchList()
  }

  onFilterReset = () => {
    this.marketOptimeBegin = ''
    this.marketOptimeEnd = ''
    this.hotValue = ''
    this.filterShop = {}
    this.brand = {}
    this.provider = {}
    this.season = {}
  }

  onSpecialFoodSave = (skuState, styleId) => {
    const _good = this.props.goodsList.find(item => item.styleId === styleId)
    const price = Math.min(
      ...skuState.map(s => {
        s.sku.originPrice = s.sku.price
        s.sku.price = s._inputPrice
        return s._inputPrice
      })
    )
    if (this.props.useGoodsSpus.length < 100 && _good) {
      const skuList = skuState.map(state => state.sku)
      this.props.dispatch({
        type: 'goodsManage/addUseGoods',
        payload: {
          good: { ..._good, price, originPrice: _good.price, skus: skuList }
        }
      })
      Taro.navigateBack()
    }
  }

  onSpecialSave = (price, styleId) => {
    const _good = this.props.goodsList.find(item => item.styleId === styleId)
    if (this.props.useGoodsSpus.length < 100 && _good) {
      this.props.dispatch({
        type: 'goodsManage/addUseGoods',
        payload: {
          good: { ..._good, price, originPrice: _good.price }
        }
      })
      Taro.navigateBack()
    }
  }
  onClose = () => {
    this.setState({
      isSpecial: false
    })
  }

  onUpGoodsSuccess = () => {
    Taro.eventCenter.trigger('REFRESH_CHECK_GOODS')
    Taro.navigateBack()
  }
  onCloseClick = () => {
    this.setState({
      isVideoLive: false
    })
  }

  renderItem = () => {
    return (
      <View className='bottom_btn'>
        <View onClick={this.onResetClick} className='bottom_btn_rest'>
          重置
        </View>
        <View onClick={this.onConfirmClick} className='bottom_btn_sure'>
          确定
        </View>
      </View>
    )
  }

  renderScreenModel = () => {
    const { brandList, providerList, seasonList, shopFilterList } = this.props
    const { showFilterModel } = this.state
    return (
      <SelectModel
        isVisible={showFilterModel}
        onReset={this.onFilterReset}
        onConfirm={this.onFilterConfirm}
        onClose={this.onCloseFilterView}
        brandList={brandList}
        shopFilterList={shopFilterList}
        providerList={providerList}
        seasonList={seasonList}
        from='use_goods'
      />
    )
  }

  renderCategory = () => {
    const { classList = [] } = this.props
    const { classId } = this.state
    return (
      <View className='category_mask' onClick={this.onCloseClassModel}>
        <View className='category_cn' onClick={e => e.stopPropagation()}>
          <View className='category_con_header'>
            {classList.map(item => {
              return (
                <View
                  onClick={() => {
                    this.onClassificationClick(item)
                  }}
                  key={item.codeValue}
                  className={cn('category_con_item', {
                    ['category_con_item_active']: item.codeValue === classId
                  })}
                >
                  {item.codeName}
                </View>
              )
            })}
            {classList.length % 2 !== 0 && <View className={cn('category_con_item', 'hide')} />}
          </View>
          {this.renderItem()}
        </View>
      </View>
    )
  }

  render() {
    const {
      goodsList,
      checkedSpuLength,
      specialGoodsDetail,
      priceTypeList,
      spuShowPrice,
      mpErpId,
      saasProductType,
      independentType
    } = this.props
    const {
      showFilterModel,
      showClassModel,
      isSpecial,
      currentSpecialGoods,
      isVideoLive,
      categoryList
    } = this.state
    const { from = '' } = getTaroParams(Taro.getCurrentInstance?.())
    const isFoodIndependent = saasProductType === 40 && independentType !== 0
    return (
      <View className='use_goods'>
        <View className='use_goods__header aic'>
          <View className='use_goods__header__searchView aic'>
            <SearchbarView
              placeholder='搜索商品'
              onInput={this.onSearchInput}
              onClearSearchClick={this.onClearSearchClick}
              onSearchClick={this.onSearchConfirm}
            />
          </View>
          <View className='use_goods__header__action aic' onClick={this.onClassClick}>
            <Image src={ClassIcon} className='header_icon' />
            <Text>分类</Text>
          </View>
          <View className='use_goods__header__action aic' onClick={this.onFilterClick}>
            <Image src={FilterIcon} className='header_icon' />
            <Text>筛选</Text>
          </View>
        </View>
        <View
          className={cn('good_two_container', {
            'good_two_container--normal': true,
            'good_two_container_padding--zero': goodsList.length === 0
          })}
        >
          {goodsList.map(item => (
            <View key={item.id} className='good_items'>
              <GoodsItemForManage
                onItemClick={this.onItemClick}
                size='small'
                data={item}
                manage
                showViewCount
                showHotIcon={false}
                showInvNum={false}
              />
            </View>
          ))}
        </View>

        {from !== 'special' && (
          <View className='use_goods__bottom jcsb'>
            <View className='use_goods__bottom__actionLeft aic jcc' onClick={this.onClearClick}>
              清空
            </View>
            <View className='use_goods__bottom__actionRight aic jcc' onClick={this.onSaveClick}>
              {checkedSpuLength === 0 ? '请选择货品' : `已选(${checkedSpuLength})，保存`}
            </View>
          </View>
        )}

        {showClassModel && this.renderCategory()}
        {this.renderScreenModel()}

        {isSpecial &&
          (isFoodIndependent ? (
            <SetGoodsSpecialFood
              from='use_goods'
              showPrice={spuShowPrice}
              data={specialGoodsDetail}
              priceTypeList={priceTypeList}
              onSaveClick={this.onSpecialFoodSave}
              onClose={this.onClose}
            />
          ) : (
            <SetGoodsSpecial
              from='use_goods'
              showPrice={spuShowPrice}
              data={specialGoodsDetail}
              priceTypeList={priceTypeList}
              onSaveClick={this.onSpecialSave}
              onClose={this.onClose}
            />
          ))}
        {isVideoLive && (
          <UpGoods
            mpErpId={mpErpId}
            data={specialGoodsDetail}
            priceTypeList={priceTypeList}
            categoryList={categoryList}
            onClose={this.onCloseClick}
            onSuccess={this.onUpGoodsSuccess}
          />
        )}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(UseGoods)