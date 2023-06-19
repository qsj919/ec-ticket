import Taro from '@tarojs/taro'
import React, { PureComponent, ComponentClass } from 'react'
import { Block, Text, View, Image } from '@tarojs/components'
import { connect } from 'react-redux'
// import WithEmptyView from '@src/components/WithEmptyView'
import WithEmptyView from '@components/WithEmptyView'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { ISpu } from '@@types/GoodsType'
import images from '@config/images'
import cn from 'classnames'
import navigatorSvc from '@services/navigator'
import ListContainer from '@@/subpackages/cloud_bill/components/ContainerView/ListContainer'
// import GoodListView from '@@/subpackages/cloud_bill/components/GoodLIstView/GoodListView'
// // import GoodListView from '../../index/components/GoodListView'
import './all_contentview.scss'
// import GoodsFilterView from './GoodsFilterView'
import GoodsItemVertical from '../Goods/GoodsItemVertical'
import ProductList from '../Goods/ProductList'
import GoodsItemForManage from '../GoodsItemForManage'
import NoGoodsImg from '../../images/no_goods_img.png'

enum GoodsStauts {
  NO_SALE = 6,
  ON_SALE = 7
}

export interface OwnProps {
  dresStyleResultList: ISpu[]
  goodsStauts: GoodsStauts
  loadMoreDataVisible: boolean
  from: 'manage' | 'allGoods'
  noMoreDataVisible: boolean
  listHeight: string
  tabIndex?: number
  onItemButtonClick?(data: ISpu): void
  onGoodsItemClick?(data: ISpu): void
  itemButtonLabel?: string
  manageGoods?: boolean
  effectsName: string
  emptyInfo?: {
    label: string
    image: string
  }
  buttonLabel?: string
  onButtonClick?(): void
  showPrice: boolean
  managePageNo?: number
  isScreen?: boolean
  enableVisitorIn?: boolean // 是否模糊展示货品
  onShelvesClick?: () => void
  useLastPrice?: boolean
}

type PageState = {
  filterViewVisible: boolean
}

type IProps = OwnProps & StateProps & DefaultDispatchProps

const mapStateToProps = ({ shop, systemInfo, cloudBill, goodsManage, loading }: GlobalState) => {
  const _shop = shop.list.find(s => s.id === goodsManage.mpErpId)
  const bizShop = goodsManage.bizShops.find(s => s.bizShopId == goodsManage.shopId)
  const bizStatus = bizShop && bizShop.bizStatus ? bizShop.bizStatus : 1
  return {
    statusBarHeight: systemInfo.statusBarHeight,
    navigationHeight: systemInfo.navigationHeight,
    platform: systemInfo.platform,
    pageNo: cloudBill.pageNo,
    shop: _shop,
    mpErpId: goodsManage.mpErpId,
    bizStatus,
    loading:
      loading.effects['goodsManage/fetchGoodsList'] &&
      loading.effects['goodsManage/fetchGoodsList'].loading
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, {}, IProps>(mapStateToProps)
class AllContentView extends PureComponent<IProps, PageState> {
  static options = {
    styleIsolation: 'apply-shared' // 使该组件的css可以影响到页面和其他自定义组件
  }

  static defaultProps = {
    queryCondition: {
      pageNo: 1,
      queryType: 0,
      searchToken: '',
      orderBy: 'market_date',
      orderByDesc: true,
      priClassId: '',
      className: '',
      isScreen: false
    },
    dresStyleResultList: [],
    noMoreDataVisible: false,
    listHeight: 'calc(100vh - 400rpx)',
    emptyInfo: {
      label: '暂无商品～',
      image: images.noData.no_goods_v2
    },
    showPrice: false,
    enableVisitorIn: true
  }

  constructor(props) {
    super(props)
    this.state = {
      filterViewVisible: false
    }
  }

  emptyInfo = {
    label: '暂无商品～',
    image: images.noData.no_goods_v2
  }

  onButtonClick = () => {
    this.props.onButtonClick && this.props.onButtonClick()
  }

  onOrderItemClick = (_orderBy: string, _order) => {
    // let { orderBy, orderByDesc } = this.props.queryCondition
    // if (orderBy === data.value) {
    //   orderByDesc = !orderByDesc
    // }
    Taro.pageScrollTo({
      scrollTop: 0
    })
    this.search({
      pageNo: 1,
      orderBy: _orderBy,
      orderByDesc: _order === 'decrease'
    })
  }
  /**
   * 查询
   * @param queryConditionTo
   */
  search(queryConditionTo: {}) {}

  onItemClick = (item: ISpu) => {
    if (this.props.from === 'manage') {
      if (this.props.onGoodsItemClick) {
        this.props.onGoodsItemClick(item)
      }
    } else {
      // 浏览
      this.props.dispatch({
        type: 'cloudBill/fetchGoodsDetail',
        payload: { spuId: item.styleId, goodsDtail: { ...item, skus: [] } }
      })
      navigatorSvc.navigateTo({
        url: `/subpackages/cloud_bill/pages/goods_detail/index?spuId=${item.id}`
      })
    }
  }

  onGoodsItemButtonClick = async item => {
    return this.props.onItemButtonClick && this.props.onItemButtonClick(item)
  }

  onGoodsItemClick = data => {
    this.props.onGoodsItemClick && this.props.onGoodsItemClick(data)
  }

  onUpClick = () => {
    this.props.onShelvesClick && this.props.onShelvesClick()
  }

  render() {
    const {
      dresStyleResultList,
      loadMoreDataVisible,
      from,
      statusBarHeight,
      navigationHeight,
      platform,
      pageNo,
      noMoreDataVisible,
      listHeight,
      itemButtonLabel,
      manageGoods,
      effectsName,
      buttonLabel,
      emptyInfo,
      tabIndex,
      shop,
      showPrice,
      managePageNo,
      loading,
      goodsStauts,
      isScreen,
      enableVisitorIn,
      bizStatus,
      useLastPrice
    } = this.props
    const { filterViewVisible } = this.state
    let isHeight = statusBarHeight
    // padding-top: 176rpx;
    let listContainerStyle = 'display: flex;flex:1;'
    let topContentStyle = `top: ${navigationHeight}px;width: 596rpx;`
    const needShowButton = !!buttonLabel && !!this.props.onButtonClick
    const _pageNo = from === 'manage' ? managePageNo : pageNo
    return (
      <View className='all_goods_content_view'>
        <View className='category'>
          {from === 'manage' &&
            dresStyleResultList.length === 0 &&
            !isScreen &&
            !loading &&
            goodsStauts === GoodsStauts.ON_SALE &&
            bizStatus === 1 && (
              <View className='category__goods_empty_view' style={{ height: listHeight }}>
                <Image src={NoGoodsImg} className='category__goods_empty_view__icon' />
                <View className='category__goods_empty_view__label'>暂无商品</View>
                {/* <View className='category__goods_empty_view__content'>
                  可一键上架最近三个月且有图片的商品
                </View> */}
                <View className='category__goods_empty_view__action' onClick={this.onUpClick}>
                  一键上架
                </View>
              </View>
            )}
          <WithEmptyView
            effectsName={effectsName}
            alwaysDisplayLoading={_pageNo === 1}
            data={dresStyleResultList}
            containerClassName='rightView'
            height={listHeight}
            emptyInfo={emptyInfo}
            buttonLabel={buttonLabel}
            onButtonClick={this.onButtonClick}
            needShowButton={needShowButton}
            tabIndex={tabIndex}
            isBigImg={shop && shop.cloudBillFlag}
          >
            <View className='good_list_line'>
              <View style={listContainerStyle}>
                <ListContainer
                  // containerstyle={listContainerViewStyle}
                  noMoreDataVisible={dresStyleResultList.length >= 3 && noMoreDataVisible}
                  loadMoreDataVisible={loadMoreDataVisible}
                >
                  <Block>
                    <View
                      className={cn('good_two_container', {
                        'good_two_container--normal': true,
                        'good_two_container_padding--zero': dresStyleResultList.length === 0
                      })}
                    >
                      {dresStyleResultList.map((item, index) => {
                        return (
                          <View
                            className={from === 'allGoods' ? 'good_items_allGoods' : 'good_items'}
                            key={item.id}
                          >
                            <View>
                              {from === 'allGoods' ? (
                                <ProductList
                                  useLastPrice={useLastPrice}
                                  size='small'
                                  data={item}
                                  onItemClick={data => this.onItemClick(data)}
                                  showPrice={showPrice}
                                  from={from}
                                  blur={!enableVisitorIn}
                                />
                              ) : (
                                // <GoodsItemVertical
                                //   size='small'
                                //   data={item}
                                //   onItemClick={data => this.onItemClick(data)}
                                //   showPrice={showPrice}
                                // />
                                <GoodsItemForManage
                                  onItemClick={this.onItemClick}
                                  size='small'
                                  data={item}
                                  buttonLabel={itemButtonLabel}
                                  onButtonClick={this.onGoodsItemButtonClick}
                                  manage={manageGoods}
                                  showViewCount={goodsStauts === GoodsStauts.ON_SALE}
                                />
                              )}
                            </View>
                          </View>
                        )
                      })}
                    </View>
                    <View className='linear_bg' />
                  </Block>
                </ListContainer>
              </View>
            </View>
          </WithEmptyView>
        </View>
      </View>
    )
  }
}
export default connect(({ systemInfo }) => ({ ...systemInfo }))(AllContentView as ComponentClass<OwnProps>)
