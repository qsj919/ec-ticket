import Taro, { eventCenter, Config, SelectorQuery, NodesRef } from '@tarojs/taro'
import React from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { debounce } from 'lodash'
import { ISpu } from '@@types/GoodsType'
import { connect } from 'react-redux'
import CustomNavigation from '@components/CustomNavigation'
import { getShopGoodsDetail } from '@api/goods_api_manager'
import navigatorSvc from '@services/navigator'
import { getTaroParams } from '@utils/utils'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import view_moreGoods_icon from '../../images/view_moreGoods_icon.png'
import GoodsDetailItem from './components/goodsDetailItem'
import ColorSizeModelView from './components/ColorSizeModelView'
import './goods_detail_new.scss'

const mapStateToProps = ({
  shop,
  systemInfo,
  user,
  cloudBill,
  loading,
  goodsManage
}: GlobalState) => {
  const _shop = shop.list.find(s => s.id === cloudBill.mpErpId)
  return {
    windowWidth: systemInfo.windowWidth,
    windowHeight: systemInfo.windowHeight,
    navigationHeight: systemInfo.navigationHeight,
    platform: systemInfo.platform,
    statusBarHeight: systemInfo.statusBarHeight,
    shopGoodsListTop10: cloudBill.shopGoodsListTop10,
    goodsListNew: cloudBill.goodsListNew,
    goodsDetail: cloudBill.goodsDetail,
    isLoadingMore:
      loading.effects['cloudBill/fetchGoodsList'] &&
      loading.effects['cloudBill/fetchGoodsList'].loading &&
      cloudBill.pageNo > 1,
    shop: cloudBill.shopInfo || _shop,
    shopListLoaded: shop.shopListLoaded,
    sessionId: user.sessionId,
    logining: user.logining,
    colorSizeVisible: cloudBill.colorSizeVisible,
    pageNo: cloudBill.pageNo,
    mpErpId: cloudBill.mpErpId,
    shopInfo: goodsManage.shopInfo,
    showPrice: cloudBill.shopParams.spuShowPrice === '1',
    marketInfo: cloudBill.marketInfo,
    toDayNewGoodsList: cloudBill.toDayNewGoodsList
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

type Props = StateProps & DefaultDispatchProps

type State = {
  selectColorSizeType: 'addCart' | 'buy'
  startGoodsIndex: number
  pageNo: number
  goodsItemScrollTop: number
  currentGoodsItemIndex: number
}
const IS_HIDE_INV_TEXT = true
const iS_HIDE_SHOP_ICON = true

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class GoodsDetailNew extends React.PureComponent<Props, State> {
  // config: Config = {
  //   onReachBottomDistance: 2000,
  //   navigationBarTitleText: '货品详情',
  //   navigationStyle: 'custom' as const,
  //   navigationBarTextStyle: 'white'
  // }

  constructor(props: Readonly<Props>) {
    super(props)
    this.state = {
      selectColorSizeType: 'addCart' as const,
      // startGoodsIndex: props.goodsListNew.findIndex(
      //   goods => Number(goods.id) === Number(getTaroParams(Taro.getCurrentInstance?.())._idx)
      // ),
      // startGoodsIndex: Number(getTaroParams(Taro.getCurrentInstance?.())._idx),
      pageNo: 1,
      goodsItemScrollTop: -1,
      currentGoodsItemIndex: 0
    }
  }

  itemHeight = 490 + 12

  windowHeight = 800

  viewedData = [] as string[]

  currentGoods: ISpu

  // scrollTop = 0

  componentDidMount() {
    this.itemHeight = (this.props.windowWidth / 375) * 490 + 12
    const { windowHeight } = Taro.getSystemInfoSync()
    this.windowHeight = windowHeight
    // this.setState({ startGoodsId: Number(getTaroParams(Taro.getCurrentInstance?.()).id) })
    if (Number(getTaroParams(Taro.getCurrentInstance?.())._idx)) {
      const query: SelectorQuery = Taro.createSelectorQuery()
      query
        .selectAll('._idx_view')
        .boundingClientRect((rects: any) => {
          if (
            Number(getTaroParams(Taro.getCurrentInstance?.())._idx) !== this.props.goodsListNew.length - 1 &&
            Number(getTaroParams(Taro.getCurrentInstance?.())._idx) !== 0
          ) {
            this.setState({
              goodsItemScrollTop:
                (rects && rects[0].height * Number(getTaroParams(Taro.getCurrentInstance?.())._idx) + 1) - 100
            })
          } else {
            this.setState({
              goodsItemScrollTop: rects && rects[0].height * Number(getTaroParams(Taro.getCurrentInstance?.())._idx) + 1
            })
          }
        })
        .exec()
    }
  }

  componentWillUnmount() {
    this.props.dispatch({ type: 'cloudBill/save', payload: { colorSizeVisible: false } })
  }

  onPageScroll(e) {}

  onNewGoodsListScroll = e => {
    const { scrollTop } = e.detail
    this._onPageScroll(scrollTop)
  }

  _onPageScroll = debounce((scrollTop: number) => {
    if (this.props.colorSizeVisible) return
    const diff = (scrollTop - 12) % this.itemHeight
    let index = Math.floor((scrollTop - 12) / this.itemHeight)
    index = index < 0 ? 0 : index
    // 前一项展示在页面中的部分
    const before = this.itemHeight - diff
    // wH - before === this.itemHeight 也就是后一个完整展示出来的时候。
    if (this.windowHeight - before >= this.itemHeight) {
      index = index + 1
    }
    this.setState({
      currentGoodsItemIndex: index
    })
    // console.log(this.state.startGoodsIndex, 'startGoodsIndex')
    // console.log(this.props.goodsListNew.slice(this.state.startGoodsIndex))[index]
    // console.log(index, 'index')
    // const good = this.props.goodsListNew.slice(this.state.startGoodsIndex)[index]
    // this.currentGoods = good
    // if (!this.viewedData.includes(good.id)) {
    //   console.log('=[]][]【】【】【】】【【】】【【】】【【】')
    //   console.log(good)
    //   // 看了这个款
    //   // this.viewedData.push(good.id)
    //   // getShopGoodsDetail({ jsonParam: { mpErpId: this.props.mpErpId, styleId: good.id } })
    //   // this.props.dispatch({ type: 'cloudBill/fetchGoodsDetail', payload: { spuId: good.id } })
    // }
  }, 100)

  onShareAppMessage(obj: Taro.ShareAppMessageObject): Taro.ShareAppMessageReturn {
    const { mpErpId } = this.props

    if (obj.from === 'button') {
      const { id, name, img } = obj.target.dataset
      return {
        path: `subpackages/cloud_bill/pages/goods_detail/index?mpErpId=${mpErpId}&spuId=${id}`,
        title: name,
        imageUrl: img
      }
    }
    const { styleId, name, imgUrl } = this.currentGoods
    return {
      path: `subpackages/cloud_bill/pages/goods_detail/index?mpErpId=${mpErpId}&spuId=${styleId}`,
      title: name,
      imageUrl: imgUrl
    }
  }

  loadMoreData = () => {
    const { marketInfo } = this.props
    this.setState(
      prevState => {
        return {
          pageNo: prevState.pageNo + 1
        }
      },
      () => {
        this.props.dispatch({
          type: 'cloudBill/fetchGoodsListToDayNew',
          payload: {
            marketOptimeBegin: marketInfo.marketDate,
            marketOptimeEnd: marketInfo.marketDate,
            pageNo: this.state.pageNo
          }
        })
      }
    )
  }

  onReachBottom() {
    // if (this.props.goodsListNew.length >= this.state.pageNo * 10) {
    //   this.loadMoreData()
    // }
    // eventCenter.trigger('on_detail_reach_bottom')
  }
  _onScrollEnd = debounce(() => {
    if (this.props.goodsListNew.length >= this.state.pageNo * 10) {
      this.loadMoreData()
    }
    eventCenter.trigger('on_detail_reach_bottom')
  }, 50)
  onScrollEnd = () => {
    if (getTaroParams(Taro.getCurrentInstance?.()).from === 'allGoods') {
      return
    }
    if (getTaroParams(Taro.getCurrentInstance?.()).from === 'new') {
      this._onScrollEnd()
    }
  }

  onGetGoodsDetailItemHeight = (height?: number) => {
    if (height) {
      this.itemHeight = height
    }
  }

  onSaveClick = selectColorSizeType => {
    this.setState({ selectColorSizeType })
    this.props.dispatch({
      type: 'cloudBill/onColorSizeConfirm',
      payload: {
        type: selectColorSizeType || this.state.selectColorSizeType
      }
    })
  }

  onGoodsBtnClick = (selectColorSizeType, styleId) => {
    if (styleId !== this.props.goodsDetail.styleId) {
      this.props.dispatch({
        type: 'cloudBill/showColorSizeInList',
        payload: { spuId: styleId }
      })
    } else {
      this.props.dispatch({ type: 'cloudBill/save', payload: { colorSizeVisible: true } })
    }
    this.setState({ selectColorSizeType })
  }

  onGoShopClick = () => {
    navigatorSvc.navigateTo({
      url: `/subpackages/cloud_bill/pages/all_goods/index?mpErpId=${this.props.mpErpId}`
    })
  }

  getGoodsList = () => {
    if (getTaroParams(Taro.getCurrentInstance?.()).from === 'new') {
      return [...this.props.goodsListNew]
    } else if (getTaroParams(Taro.getCurrentInstance?.()).from === 'allGoods') {
      return [...this.props.toDayNewGoodsList]
    }
    return [...this.props.shopGoodsListTop10]
  }

  render() {
    const { colorSizeVisible, statusBarHeight } = this.props
    const { goodsItemScrollTop, selectColorSizeType, currentGoodsItemIndex } = this.state
    const { _idx, from } = getTaroParams(Taro.getCurrentInstance?.())
    const goodsList = this.getGoodsList()
    return (
      <CustomNavigation enableBack>
        <ScrollView
          scrollY
          style={{
            padding: '24rpx',
            paddingBottom: '40rpx',
            height: '100vh',
            backgroundColor: '#000',
            paddingTop: `${statusBarHeight}px`,
            boxSizing: 'border-box'
          }}
          lowerThreshold={700}
          scrollTop={goodsItemScrollTop}
          onScroll={this.onNewGoodsListScroll}
          onScrollToLower={this.onScrollEnd}
        >
          {goodsList.map((goods, index) => (
            <View className='_idx_view' style={{ marginBottom: '12px' }} key={goods.id}>
              <GoodsDetailItem
                calHeight={index < 3}
                onGetGoodsDetailItemHeight={this.onGetGoodsDetailItemHeight}
                goodsDetail={goods}
                onSaveClick={this.onSaveClick}
                onButtonClick={this.onGoodsBtnClick}
                isHideInvText={IS_HIDE_INV_TEXT}
                isHideShopIcon={from === 'allGoods'}
                isHideCarIcon={from === 'allGoods'}
                currentGoodsItemIndex={currentGoodsItemIndex}
                goodsItemIndex={index}
                clickGoodsItemIndex={Number(_idx)}
              />
            </View>
          ))}
          {from === 'new' && (
            <View
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '10px',
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onClick={this.onGoShopClick}
            >
              <Text style={{ color: '#E62E4D' }}>进店浏览更多新款</Text>
              <Image style={{ width: '30px', height: '30px' }} src={view_moreGoods_icon} />
            </View>
          )}
        </ScrollView>
        <View style='z-index: 500'>
          <ColorSizeModelView
            key='goods_detail'
            onSaveClick={this.onSaveClick}
            // onVisibleChanged={this.onColorSizeVisibleChanged}
            visible={colorSizeVisible}
            type={selectColorSizeType}
          />
        </View>
      </CustomNavigation>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(GoodsDetailNew)