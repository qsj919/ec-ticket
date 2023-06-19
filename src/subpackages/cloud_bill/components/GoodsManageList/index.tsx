import Taro, { eventCenter } from '@tarojs/taro'
import React, { ComponentType }  from 'react'
import { Block, Image, View, Input, Text, ScrollView } from '@tarojs/components'
import Tabs from '@components/Tabs'
import colors from '@@/style/colors'
import { connect } from 'react-redux'
import uncheckedIcon from '@/images/icon/uncheck_circle.png'
import checkedIcon from '@/images/checked_circle_36.png'
import { PAGE_SIZE } from '@constants/index'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { FilterOption, GoodsFilterType } from '@@types/base'
import { ISpu } from '@@types/GoodsType'
import EButton from '@components/Button/EButton'
import messageFeedback from '@services/interactive'
import searchIcon from '@/images/search_black.png'
import navigatorSvc from '@services/navigator'
import cn from 'classnames'
import myLog from '@utils/myLog'
import {
  setTopStyles,
  unsetTopStyles,
  oneClickMarket,
  getOneClickMarketSpuCount
} from '@api/goods_api_manager'
import { isWeapp } from '@utils/cross_platform_api'
import caretDown from '@/images/caret_down_gray_32.png'
import caretDownRed from '@/images/caret_down_gray_red.png'
import ScreenIcon from '@/images/screen_icon.png'
import DeleteImg from '@/images/delete_circle_32.png'
import styles from './index.module.scss'
import shelvesIcon from '../../images/shelves_icon_red.png'
// import FilterView from '../FilterView 111'
import AllContentView from '../../components/AllContentView/AllContentView'
import { checkedSpus } from './selector'
import SelectModel from '../../components/SelectModel/index'
import FlashUploadGoods from './components/FlashUpload'

enum GoodsStauts {
  NO_SALE = 6,
  ON_SALE = 7
}

const TAB_DATA = [
  {
    label: '已上架',
    value: GoodsStauts.ON_SALE
  },
  {
    label: '未上架',
    value: GoodsStauts.NO_SALE
  }
]

interface OwnProps {
  type: 'edit' | 'op' // 编辑 or 操作
}

interface State {
  activeTabIndex: number
  manage: boolean
  searchValue: string
  activeBtnType: string
  showClassModel: boolean
  isSecondScreen: boolean
  classId: number
  showScreenModel: boolean
  isCategoryScreen: boolean
  isFilterScreen: boolean
  isUploadGoodsVisible: boolean
}

const mapStateToProps = ({ shop, systemInfo, loading, goodsManage }: GlobalState) => {
  const _shop = shop.list.find(s => s.id === goodsManage.mpErpId)
  const isFetchingData =
    loading.effects['goodsManage/fetchGoodsList'] &&
    loading.effects['goodsManage/fetchGoodsList'].loading &&
    loading.effects['goodsManage/fetchGoodsList'] &&
    loading.effects['goodsManage/fetchGoodsList'].loading
  return {
    windowWidth: systemInfo.windowWidth,
    navigationHeight: systemInfo.navigationHeight,
    platform: systemInfo.platform,
    statusBarHeight: systemInfo.statusBarHeight,
    goodsList: goodsManage.goodsList,
    isLoadingMore: isFetchingData && goodsManage.pageNo > 1,
    isFetchingData,
    shop: _shop,
    pageNo: goodsManage.pageNo,
    mpErpId: goodsManage.mpErpId,
    classList: goodsManage.classList,
    brandList: goodsManage.brandList,
    providerList: goodsManage.providerList,
    seasonList: goodsManage.seasonList,
    shopFilterList: goodsManage.shopFilterList,
    filterOptins:
      goodsManage.classList.length > 0
        ? [
            {
              typeValue: GoodsFilterType.hot,
              type: 'tag' as const,
              typeName: '爆款设置',
              multipleSelect: false,
              items: [
                { codeName: '爆款置顶', codeValue: 1 }
                // { codeName: '非爆款', codeValue: 2 }
              ]
            },
            {
              typeValue: GoodsFilterType.class,
              type: 'tag' as const,
              typeName: '分类',
              multipleSelect: false,
              items: goodsManage.classList
            }
          ]
        : [],
    goodsManage,
    ...checkedSpus(goodsManage),
    saasProductType: goodsManage.saasProductType
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps, OwnProps>(mapStateToProps)
class GoodsManageList extends React.PureComponent<
  StateProps & DefaultDispatchProps & OwnProps,
  State
> {
  config = {
    navigationBarTitleText: '货品管理'
  }

  state = {
    activeTabIndex: 0,
    manage: false,
    searchValue: '',
    activeBtnType: '',
    showClassModel: false,
    isSecondScreen: false,
    classId: 0,
    showScreenModel: false,
    isCategoryScreen: false,
    isFilterScreen: false,
    isUploadGoodsVisible: false
  }

  marketOptimeBegin: string = ''
  marketOptimeEnd: string = ''
  hotValue: string = ''
  filterShop = {}
  brand = {}
  provider = {}
  season = {}

  UNSAFE_componentWillMount() {
    // this.fetchList()
  }

  componentDidMount() {
    eventCenter.on('goods_manage_list_on_reach_bottom', this.onReachBottom)
    eventCenter.on('goods_manage_list_on_reach_list', () => {
      this.onFilterReset()
      this.fetchList()
    })
    this.fetchClassList()
    this.fetchList()
  }

  componentWillUnmount() {
    eventCenter.off('goods_manage_list_on_reach_bottom')
  }

  //获取店铺款号筛选条件
  fetchClassList = () => {
    this.props.dispatch({
      type: 'goodsManage/fetchClassList'
    })
  }

  fetchList = (loadMore = false) => {
    this.props.dispatch({
      type: 'goodsManage/fetchGoodsList',
      payload: {
        classId: this.state.classId || undefined,
        type: TAB_DATA[this.state.activeTabIndex].value,
        styleNameLike: this.state.searchValue.trim(),
        hotType: this.hotValue || undefined,
        loadMore,
        // shopId: this.filterShop.id || undefined,
        brandId: this.brand.id || undefined,
        providerId: this.provider.id || undefined,
        season: this.season.id || undefined,
        slhMarketDateBegin:
          TAB_DATA[this.state.activeTabIndex].value === GoodsStauts.ON_SALE
            ? this.marketOptimeBegin || undefined
            : undefined,
        slhMarketDateEnd:
          TAB_DATA[this.state.activeTabIndex].value === GoodsStauts.ON_SALE
            ? this.marketOptimeEnd || undefined
            : undefined,
        marketOptimeBegin:
          TAB_DATA[this.state.activeTabIndex].value === GoodsStauts.NO_SALE
            ? this.marketOptimeBegin || undefined
            : undefined,
        marketOptimeEnd:
          TAB_DATA[this.state.activeTabIndex].value === GoodsStauts.NO_SALE
            ? this.marketOptimeEnd || undefined
            : undefined
      }
    })
  }

  onInputConfirm = e => {
    if (e.target && e.target.blur) {
      e.target.blur()
    }
    this.fetchList()
  }

  onClearClick = () => {
    this.setState(
      {
        searchValue: ''
      },
      this.fetchList
    )
  }

  onReachBottom = () => {
    if (this.props.goodsList.length < PAGE_SIZE * this.props.pageNo) return
    this.fetchList(true)
  }

  onTabItemClick = (index: number) => {
    // if (!this.dataFetched || this.props.isFetchingData || this.props.mpErpId === -1) return
    Taro.eventCenter.trigger('resetData')
    Taro.pageScrollTo({ scrollTop: 0 })
    this.setState({ activeTabIndex: index, searchValue: '' }, this.fetchList)
  }

  onManageClick = () => {
    this.setState(state => ({
      manage: !state.manage
    }))
  }

  onCancelManageClick = () => {
    this.setState({ manage: false })
    this.props.dispatch({
      type: 'goodsManage/checkeAllGoods',
      payload: { checked: false }
    })
  }

  onToggleCheckAllClick = () => {
    this.props.dispatch({
      type: 'goodsManage/checkeAllGoods',
      payload: { checked: !this.props.isAllChecked }
    })
  }

  // onValueChanged = (data: FilterOption[]) => {
  //   const classes = data.find(d => d.typeValue === GoodsFilterType.class) as FilterOption
  //   const hots = data.find(d => d.typeValue === GoodsFilterType.hot) as FilterOption
  //   const selectedClass = classes.items.find(item => item.isSelected)
  //   const hotType = hots.items.find(item => item.isSelected)

  //   this.setState({
  //     classId: selectedClass ? selectedClass.codeValue : undefined
  //   })
  //   this.hotType = hotType ? hotType.codeValue : undefined

  //   this.fetchList()
  // }
  manageGoods = async (styleIds: string) => {
    const { isAllChecked } = this.props
    const typeString = this.state.activeTabIndex === 0 ? '下架' : '上架'
    let type = 'goodsManage/'
    type += this.state.activeTabIndex === 0 ? 'takeDownGoods' : 'takeUpGoods'
    if (this.state.activeTabIndex === 0) {
      messageFeedback.showAlertWithCancel('确定下架商品？', '', () => {
        this.props
          .dispatch({
            type,
            payload: { styleIds }
          })
          .then(() => {
            if (isAllChecked) {
              Taro.pageScrollTo({ scrollTop: 0 })
              this.fetchList()
            }
            messageFeedback.showToast(`${typeString}成功`, 1000)
          })
      })
    } else {
      await this.props.dispatch({
        type,
        payload: { styleIds }
      })
      if (isAllChecked) {
        Taro.pageScrollTo({ scrollTop: 0 })
        this.fetchList()
      }
      messageFeedback.showToast(`${typeString}成功`, 1000)
    }
  }

  onItemButtonClick = async (data: ISpu) => {
    if (this.props.type === 'edit') {
      navigatorSvc.navigateTo({
        url: `/subpackages/cloud_bill/pages/goods_edit/index?styleId=${data.styleId}`
      })
    } else {
      await this.manageGoods(String(data.styleId))
    }
    // return Promise.resolve()
  }

  onGoodsItemClick = (data: ISpu) => {
    if (this.props.type === 'edit') {
      navigatorSvc.navigateTo({
        url: `/subpackages/cloud_bill/pages/goods_edit/index?styleId=${data.styleId}`
      })
    } else {
      if (this.state.manage) {
        this.props.dispatch({
          type: 'goodsManage/updateSpuChecked',
          payload: { styleId: data.styleId, checked: !data.checked }
        })
      } else {
        // 图片管理
        Taro.navigateTo({
          url: `/subpackages/manage/pages/goods_detail_manage/index?styleId=${data.styleId}&activeTabIndex=${this.state.activeTabIndex}`
        })
      }
    }
  }

  onBottomManageButtonClick = async () => {
    Taro.showLoading()
    try {
      await this.manageGoods(this.props.checkedSpuIds)
    } catch (e) {
      Taro.hideLoading()
    }
    Taro.hideLoading()
  }

  onShareClick = () => {
    Taro.showActionSheet({
      itemList: ['上新分享', '爆款分享', '自定义主题分享']
    }).then(({ tapIndex }) => {
      const { goodsList, checkedSpuIds } = this.props
      const _checkedSpuIds = checkedSpuIds.split(',')
      let type
      if (tapIndex === 0) {
        type = '2'
      } else if (tapIndex === 1) {
        type = '1'
      } else {
        type = '0'
      }
      this.props.dispatch({
        type: 'goodsManage/save',
        payload: {
          useGoodsSpus: goodsList.filter(good => _checkedSpuIds.includes(String(good.styleId)))
        }
      })

      Taro.navigateTo({
        url: `/subpackages/cloud_bill/pages/goods_share_edit/index?type=${type}`
      })
    })
  }

  onBottomHotSpuButtonClick = () => {
    if (this.props.checkedSpuLength !== 0) {
      Taro.showActionSheet({ itemList: ['爆款置顶', '取消爆款置顶'] }).then(res => {
        const params = { mpErpId: this.props.mpErpId, styleIds: this.props.checkedSpuIds }
        let promiseFunc = Promise.resolve()
        if (res.tapIndex === 0) {
          promiseFunc = setTopStyles(params)
        } else if (res.tapIndex === 1) {
          promiseFunc = unsetTopStyles(params)
        } else {
          // 取消
          promiseFunc = Promise.reject()
        }

        promiseFunc.then(() => {
          this.props.dispatch({
            type: 'goodsManage/updateCheckedSpu',
            payload: { hotFlag: res.tapIndex === 0 ? 1 : 0 }
          })
          this.props.dispatch({ type: 'goodsManage/checkeAllGoods', payload: { checked: false } })
          messageFeedback.showToast('设置成功')
          this.setState({ manage: false })
        })
      })
    }
  }

  searchValueInput = e => {
    this.setState({ searchValue: e.detail.value })
  }
  inputBlur() {
    this.props.dispatch({
      type: 'goodsManage/fetchGoodsList',
      payload: {
        type: TAB_DATA[this.state.activeTabIndex].value,
        styleNameLike: this.state.searchValue.trim()
      }
    })
  }

  onBtnClick = e => {
    const { type } = e.currentTarget.dataset
    if (type === 'category') {
      this.setState(state => ({
        activeBtnType: type,
        showClassModel: !state.showClassModel
      }))
    } else {
      this.setState(state => ({
        activeBtnType: type,
        showScreenModel: !state.showScreenModel
      }))
    }
  }

  onCloseModel = () => {
    const { activeBtnType, isSecondScreen } = this.state
    if (activeBtnType === 'screen' && isSecondScreen) {
      this.setState({
        isSecondScreen: false
      })
    } else {
      this.setState({
        showClassModel: false
      })
    }
  }

  /*选择器重置操作*/
  onSelectModelRest = () => {
    this.setState({
      classId: 0
    })
  }

  onClassificationClick = item => {
    this.setState({
      classId: item.codeValue
    })
  }

  onFilterConfirm = arg => {
    console.log(arg, 'arg')
    const { prodate1, prodate2 } = arg.dateValue
    this.marketOptimeBegin = arg.dateValue ? prodate1 : ''
    this.marketOptimeEnd = arg.dateValue ? prodate2 : ''
    this.hotValue = arg.hotValue
    this.filterShop = arg.filterShop
    this.brand = arg.brand
    this.provider = arg.provider
    this.season = arg.season
    this.setState({
      showScreenModel: false,
      isFilterScreen: true
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
    this.setState({
      isFilterScreen: false
    })
  }

  onCloseFilterView = () => {
    this.setState({
      showScreenModel: false
    })
  }
  onCloseClassModel = () => {
    this.setState({
      showClassModel: false,
      isCategoryScreen: true
    })
  }

  onConfirmClick = () => {
    this.onCloseClassModel()
    this.fetchList()
  }

  onResetClick = () => {
    this.setState({
      classId: 0,
      isCategoryScreen: false
    })
  }

  onUpClick = () => {
    if (this.props.saasProductType === 40) {
      messageFeedback.showAlertWithCancel('一键上架最近三个月，有图片的商品', '', () => {
        this.onGoodsShelves()
      })
    } else {
      this.setState({ isUploadGoodsVisible: true })
    }
  }

  hideUpload = () => {
    this.setState({ isUploadGoodsVisible: false })
  }

  onGoodsShelves = () => {
    Taro.showLoading({ title: '请稍等...' })
    const { mpErpId } = this.props
    oneClickMarket({
      mpErpId
    })
      .then(({ code }) => {
        Taro.hideLoading()
        if (code === 0) {
          getOneClickMarketSpuCount({ mpErpId })
            .then(({ data }) => {
              Taro.hideLoading()
              const _count = Number(data.val)
              if (_count === 0) {
                messageFeedback.showAlert(
                  '可能原因：货品没有图片，不满足库存、新款保护要求等\n您可以手动上架',
                  '没有符合条件的货品',
                  '好的'
                )
              } else if (_count > 0 && _count < 100) {
                messageFeedback.showAlert(`即将为您上架${data.val}个货品`, '', '好的', () => {
                  Taro.eventCenter.trigger('goods_manage_list_on_reach_list')
                  if (this.state.activeTabIndex === 1) {
                    this.onTabItemClick(0)
                  }
                })
              } else if (_count > 100) {
                messageFeedback.showAlert(
                  `即将为您上架${data.val}个货品\n货品较多，需要花费几秒的时间`,
                  '',
                  '好的',
                  () => {
                    Taro.eventCenter.trigger('goods_manage_list_on_reach_list')
                    if (this.state.activeTabIndex === 1) {
                      this.onTabItemClick(0)
                    }
                  }
                )
              }
            })
            .catch(e => {
              Taro.hideLoading()
            })
        }
      })
      .catch(e => {
        Taro.hideLoading()
        myLog.log(`新用户一键上架失败${e}`)
      })
  }

  renderCategory = () => {
    const { classList = [] } = this.props
    const { classId } = this.state
    return (
      <View className={styles.category_mask} onClick={this.onCloseClassModel}>
        <View className={styles.category_cn} onClick={e => e.stopPropagation()}>
          <View className={styles.category_header}>
            <View>分类管理</View>
            <View
              className={styles.category_header__text}
              onClick={() => {
                Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/category_manage/index' })
              }}
            >
              管理分类
            </View>
          </View>
          <View className={styles.category_con_header}>
            {classList.map(item => {
              return (
                <View
                  onClick={() => {
                    this.onClassificationClick(item)
                  }}
                  key={item.codeValue}
                  className={cn(styles.category_con_item, {
                    [styles['category_con_item_active']]: item.codeValue === classId
                  })}
                >
                  {item.codeName}
                </View>
              )
            })}
            {classList.length % 2 !== 0 && (
              <View className={cn(styles.category_con_item, styles.hide)} />
            )}
          </View>
          {this.renderItem()}
        </View>
      </View>
    )
  }
  renderItem = () => {
    return (
      <View className={styles.bottom_btn}>
        <View onClick={this.onResetClick} className={styles.bottom_btn_rest}>
          重置
        </View>
        <View onClick={this.onConfirmClick} className={styles.bottom_btn_sure}>
          确定
        </View>
      </View>
    )
  }

  renderScreenModel = () => {
    const { brandList, providerList, seasonList, shopFilterList } = this.props
    const { showScreenModel } = this.state
    return (
      <SelectModel
        isVisible={showScreenModel}
        onReset={this.onFilterReset}
        onConfirm={this.onFilterConfirm}
        onClose={this.onCloseFilterView}
        brandList={brandList}
        shopFilterList={shopFilterList}
        providerList={providerList}
        seasonList={seasonList}
        from='goods_manage'
      />
    )
  }

  render() {
    const {
      activeTabIndex,
      manage,
      searchValue,
      activeBtnType,
      showClassModel,
      isCategoryScreen,
      isFilterScreen,
      showScreenModel,
      isUploadGoodsVisible
    } = this.state
    const {
      goodsList,
      isLoadingMore,
      pageNo,
      isAllChecked,
      checkedSpuLength,
      type,
      mpErpId,
      saasProductType
    } = this.props
    const buttonLabel = type === 'edit' ? '编辑' : this.state.activeTabIndex === 0 ? '下架' : '上架'
    const bottomButtonLabel =
      type === 'edit' ? '编辑' : this.state.activeTabIndex === 0 ? '批量下架' : '批量上架'
    return (
      <View className={manage && styles.container}>
        <View className={styles.header}>
          <View className={styles.tabs_search_view}>
            {!showScreenModel && !showClassModel && (
              <View className={styles.flex_top_header}>
                <View
                  className={styles.top_filter_view}
                  style={{
                    width: '260px'
                  }}
                >
                  <Image className={styles.top_filter_search} src={searchIcon}></Image>
                  <Input
                    className={styles.top_filter_input}
                    type='text'
                    placeholder='搜索商品'
                    confirmType='search'
                    value={searchValue}
                    onInput={this.searchValueInput}
                    onConfirm={this.onInputConfirm}
                  ></Input>
                  {searchValue && (
                    <Image
                      onClick={this.onClearClick}
                      src={DeleteImg}
                      className={styles.top_filter_view__delete}
                    />
                  )}
                </View>
              </View>
            )}

            {type === 'op' && (
              <View className={styles.header__btns__btn} onClick={this.onManageClick}>
                <Image src={ScreenIcon} className={styles.screen_icon} />
                <Text>{!manage ? '批量操作' : '取消'}</Text>
              </View>
            )}
          </View>
          <View className={styles.header__btns}>
            <View className={styles.header_tab_con}>
              <Tabs
                data={TAB_DATA}
                activeColor={colors.themeColor}
                activeIndex={activeTabIndex}
                onTabItemClick={this.onTabItemClick}
                padding={0}
              />
            </View>

            <View className={styles.header__btns__btnView}>
              <View
                className={styles.header__btns__btnView___btn}
                data-type='category'
                onClick={this.onBtnClick}
              >
                <Text style={{ color: activeBtnType === 'category' ? '#E62E4D' : '#666666' }}>
                  分类
                </Text>
                <Image
                  src={activeBtnType === 'category' ? caretDownRed : caretDown}
                  className={styles.header__btns__btnView___btn__icon}
                />
              </View>
              <View
                className={styles.header__btns__btnView___btn}
                data-type='screen'
                onClick={this.onBtnClick}
              >
                <Text style={{ color: activeBtnType === 'screen' ? '#E62E4D' : '#666666' }}>
                  筛选
                </Text>
                <Image
                  src={activeBtnType === 'screen' ? caretDownRed : caretDown}
                  className={styles.header__btns__btnView___btn__icon}
                />
              </View>
            </View>

            {/* {manage ? (
              <View className={styles.header__btns__btn} onClick={this.onCancelManageClick}>
                取消
              </View>
            ) : (
              <Block>
                <View className={styles.header__btns__btn} onClick={this.showFilterView}>
                  筛选
                </View>
                {type === 'op' && (
                  <View className={styles.header__btns__btn} onClick={this.onManageClick}>
                    批量设置
                  </View>
                )}
              </Block>
            )} */}
          </View>
        </View>
        <AllContentView
          from='manage'
          isScreen={isCategoryScreen || isFilterScreen}
          goodsStauts={TAB_DATA[this.state.activeTabIndex].value}
          effectsName='goodsManage/fetchGoodsList'
          dresStyleResultList={goodsList}
          loadMoreDataVisible={isLoadingMore}
          noMoreDataVisible={!isLoadingMore && goodsList.length < pageNo * PAGE_SIZE}
          listHeight='100vh'
          itemButtonLabel={buttonLabel}
          onItemButtonClick={this.onItemButtonClick}
          manageGoods={manage}
          onGoodsItemClick={this.onGoodsItemClick}
          managePageNo={pageNo}
          onShelvesClick={this.onUpClick}
        />
        {/* <FilterView
          isOpened={isFilterVisible}
          configOptions={this.props.filterOptins}
          onClose={this.hideFilterView}
          onValueChanged={this.onValueChanged}
        /> */}
        {manage && (
          <View className={styles.manage_panel}>
            <View className={styles.manage_panel__checkall} onClick={this.onToggleCheckAllClick}>
              <Image
                className={styles.manage_panel__checkall__img}
                src={isAllChecked ? checkedIcon : uncheckedIcon}
              />
              全选
              <View className={styles.manage_panel__checkall__num}>
                {`已选${checkedSpuLength}`}
                {/* {isAllChecked && (
                  <View className={styles.manage_panel__checkall__all}>{`选择全部${11}个款`}</View>
                )} */}
              </View>
            </View>

            <View className={styles.manage_panel__btns}>
              <View className={styles.manage_panel__btns__btn_wrapper}>
                <EButton
                  disabled={checkedSpuLength === 0}
                  label={bottomButtonLabel}
                  size='normal'
                  buttonClass={styles.manage_panel__btn}
                  onButtonClick={this.onBottomManageButtonClick}
                />
              </View>
              {activeTabIndex === 0 && isWeapp() && (
                <View className={styles.manage_panel__btns__btn_wrapper}>
                  <EButton
                    disabled={checkedSpuLength === 0}
                    label='分享'
                    size='normal'
                    buttonClass={styles.manage_panel__btn}
                    onButtonClick={this.onShareClick}
                  />
                </View>
              )}
            </View>
          </View>
        )}
        {showClassModel && this.renderCategory()}
        {this.renderScreenModel()}
        {activeTabIndex === 1 && goodsList.length !== 0 && (
          <View className={styles.shelves_btn_view} onClick={this.onUpClick}>
            <Image src={shelvesIcon} className={styles.shelves_btn_view__icon} />
            一键上架
          </View>
        )}

        <FlashUploadGoods
          saasProductType={saasProductType}
          visible={isUploadGoodsVisible}
          mpErpId={mpErpId}
          onRequestClose={this.hideUpload}
        />
      </View>
    )
  }
}

export default connect<StateProps, DefaultDispatchProps, OwnProps>(mapStateToProps)(GoodsManageList) as ComponentType<OwnProps>
