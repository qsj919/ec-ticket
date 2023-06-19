import Taro from '@tarojs/taro'
import React from 'react'
import { View, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import SearchbarView from '@components/SearchBarView/SearchbarView'
import Tabs from '@components/Tabs'
import {
  findGoodsList,
  listingGoodsparams,
  delistingGoods,
  deleteGoods,
  addGoods,
  findCategoryList,
  updateGoods
} from '@api/live_api_manager'
import dva from '@utils/dva'
import { LIVE_GOODS, LIVE_ACTION_TYPE } from '@@types/base'
import { getTaroParams } from '@utils/utils'
import { debounce } from 'lodash'
import UpdatePrice from '../../components/update_price'

import Goods from '../../components/Goods'

import './index.scss'

const TABS_MENU = [
  {
    label: '在售',
    value: 1
  },
  {
    label: '审核中',
    value: 1
  }
]

interface State {
  activeTabsIndex: number
  upGoodsList: Array<LIVE_GOODS>
  auditGoodsList: Array<LIVE_GOODS>
  downGoodsList: Array<LIVE_GOODS>
  upPageNo: number
  auditPageNo: number
  downPageNo: number
  loading: boolean
  updatePriceIsShow: boolean
  realPrice: number
  searchKey: string
}

export default class LiveGoodsManage extends React.Component<{}, State> {
  // config: Taro.Config = {
  //   navigationBarTitleText: '商品管理'
  // }

  state = {
    activeTabsIndex: 0,
    upGoodsList: [] as LIVE_GOODS[],
    auditGoodsList: [] as LIVE_GOODS[],
    downGoodsList: [] as LIVE_GOODS[],
    upPageNo: 1,
    auditPageNo: 1,
    downPageNo: 1,
    loading: false,
    updatePriceIsShow: false,
    realPrice: 0,
    searchKey: ''
  }

  updatePriceData: LIVE_GOODS

  /**
   * status
   * 列表类型 1-上架 2=审核中 3-下架
   */

  componentDidMount() {
    this.init()

    Taro.eventCenter.on('REFRESH_CHECK_GOODS', () => {
      this.setState(
        {
          auditPageNo: 1
        },
        async () => {
          Taro.showLoading({ title: '请稍等...' })
          await this.fetchList(2, 1)
          Taro.hideLoading()
        }
      )
    })
  }

  componentWillUnmount() {
    Taro.eventCenter.off('REFRESH_CHECK_GOODS')
  }

  init = async () => {
    Taro.showLoading({
      title: '请稍等...'
    })
    const { upPageNo, auditPageNo, downPageNo } = this.state
    await this.fetchList(1, upPageNo)
    await this.fetchList(2, auditPageNo)
    this.fetchList(3, downPageNo)
    Taro.hideLoading()
  }

  fetchList = (status, pageNo) => {
    const { mpErpId } = getTaroParams(Taro.getCurrentInstance?.())
    this.setState({ loading: true })
    return findGoodsList({
      mpErpId,
      status,
      pageNo,
      searchKey: this.state.searchKey || undefined
    }).then(({ data }) => {
      const { upPageNo, auditPageNo, downPageNo } = this.state
      // 已上架列表
      if (status === 1) {
        this.setState(prevState => ({
          upGoodsList: upPageNo === 1 ? data.rows : [...prevState.upGoodsList, ...data.rows],
          loading: false
        }))
      }

      // 审核中列表
      if (status === 2) {
        this.setState(prevState => ({
          auditGoodsList:
            auditPageNo === 1 ? data.rows : [...prevState.auditGoodsList, ...data.rows],
          loading: false
        }))
      }

      // 已下架列表
      if (status === 3) {
        this.setState(prevState => ({
          downGoodsList: downPageNo === 1 ? data.rows : [...prevState.downGoodsList, ...data.rows],
          loading: false
        }))
      }
    })
  }

  onTabClick = index => {
    this.setState({
      activeTabsIndex: index
    })
  }

  onSwiperChange = e => {
    this.setState({
      activeTabsIndex: e.detail.current
    })
  }

  _onScrollLower = debounce(() => {
    const { activeTabsIndex } = this.state
    if (activeTabsIndex === 0) {
      if (this.state.upGoodsList.length >= this.state.upPageNo * 20) {
        this.setState(
          prevState => ({
            upPageNo: prevState.upPageNo + 1
          }),
          () => {
            this.fetchList(1, this.state.upPageNo)
          }
        )
      }
    }
    if (activeTabsIndex === 1) {
      if (this.state.auditGoodsList.length >= this.state.auditPageNo * 20) {
        this.setState(
          prevState => ({
            auditPageNo: prevState.auditPageNo + 1
          }),
          () => {
            this.fetchList(2, this.state.auditPageNo)
          }
        )
      }
    }
    if (activeTabsIndex === 2) {
      if (this.state.downGoodsList.length >= this.state.downPageNo * 20) {
        this.setState(
          prevState => ({
            downPageNo: prevState.downPageNo + 1
          }),
          () => {
            this.fetchList(2, this.state.downPageNo)
          }
        )
      }
    }
  }, 100)

  onScrollLower = () => {
    this._onScrollLower()
  }

  onItemClick = (type, data) => {
    switch (type) {
      case LIVE_ACTION_TYPE.UP:
        this.operationGoods(data.styleId, LIVE_ACTION_TYPE.UP)
        break

      case LIVE_ACTION_TYPE.EDIT:
        break

      case LIVE_ACTION_TYPE.DOWN:
        this.operationGoods(data.styleId, LIVE_ACTION_TYPE.DOWN)
        break

      case LIVE_ACTION_TYPE.ASYNC:
        this.asyncGoodsInv(data)
        break

      case LIVE_ACTION_TYPE.UPDATE:
        this.updatePrice(data)
        break

      case LIVE_ACTION_TYPE.DELETE:
        this.operationGoods(data.styleId, LIVE_ACTION_TYPE.DELETE)
        break
    }
  }

  asyncGoodsInv = (data: LIVE_GOODS) => {
    Taro.showLoading({ title: '请稍等...' })
    dva
      .getDispatch()({
        type: 'goodsManage/fetchGoodsDetail',
        payload: {
          spuId: data.styleId,
          isSpecial: true
        }
      })
      .then(goodsDetail => {
        Taro.hideLoading()
        updateGoods({
          mpErpId: getTaroParams(Taro.getCurrentInstance?.()).mpErpId,
          styleId: data.styleId,
          invType: 1,
          skus: goodsDetail.skus.map(sku => ({
            id: sku.id,
            colorId: sku.colorId,
            colorName: sku.colorName,
            sizeId: sku.sizeId,
            sizeName: sku.sizeName,
            invNum: sku.invNum
          }))
        })
          .then(() => {
            Taro.hideLoading()
          })
          .catch(() => {
            Taro.hideLoading()
          })
      })
  }

  updatePrice = (data: LIVE_GOODS) => {
    this.updatePriceData = data
    this.setState({
      realPrice: data.realPrice,
      updatePriceIsShow: true
    })
  }

  onUpdateCallBack = value => {
    const _data = JSON.parse(this.updatePriceData.auditData)
    Taro.showLoading({
      title: '请稍等...'
    })
    updateGoods({
      ..._data,
      livePrice: Number(value) || undefined
    })
      .then(res => {
        this.onCloseUpdatePrice()
        Taro.hideLoading()
        this.init()
      })
      .catch(e => {
        this.onCloseUpdatePrice()
        Taro.hideLoading()
      })
  }

  onCloseUpdatePrice = () => {
    this.updatePriceData = {} as LIVE_GOODS
    this.setState({
      updatePriceIsShow: false
    })
  }

  operationGoods = (styleId, type) => {
    Taro.showLoading({
      title: '请稍等...'
    })
    let _api = listingGoodsparams

    if (type === LIVE_ACTION_TYPE.DOWN) {
      _api = delistingGoods
    }
    if (type === LIVE_ACTION_TYPE.DELETE) {
      _api = deleteGoods
    }

    const { mpErpId } = getTaroParams(Taro.getCurrentInstance?.())
    _api({
      mpErpId,
      styleId
    })
      .then(({ data }) => {
        Taro.hideLoading()
        this.init()
      })
      .catch(e => {
        console.log(e)
        Taro.hideLoading()
      })
  }

  onAddClick = () => {
    Taro.navigateTo({
      url: '/subpackages/cloud_bill/pages/use_goods/index?from=live'
    })
  }

  onGoodsListRefresh = () => {
    const { activeTabsIndex, upPageNo, auditPageNo, downPageNo } = this.state
    if (activeTabsIndex === 0) {
      this.setState(
        {
          upPageNo: 1
        },
        () => {
          this.fetchList(activeTabsIndex + 1, upPageNo)
        }
      )
    }
    if (activeTabsIndex === 1) {
      this.setState(
        {
          auditPageNo: 1
        },
        () => {
          this.fetchList(activeTabsIndex + 1, auditPageNo)
        }
      )
    }
    if (activeTabsIndex === 2) {
      this.setState(
        {
          downPageNo: 1
        },
        () => {
          this.fetchList(activeTabsIndex + 1, downPageNo)
        }
      )
    }
  }

  refreshAll = () => {
    const { upPageNo, auditPageNo, downPageNo } = this.state
    this.setState(
      {
        upPageNo: 1,
        auditPageNo: 1,
        downPageNo: 1
      },
      () => {
        this.fetchList( 1, upPageNo)
        this.fetchList( 2, auditPageNo)
        this.fetchList( 3, downPageNo)
      }
    )
  }

  debounceSearchRefresh = debounce(() => this.refreshAll(), 500)

  handleSearchInput = (value) => {
    this.setState({ searchKey: value })
    if(value === '') this.refreshAll()
    else this.debounceSearchRefresh()
  }

  render() {
    const { activeTabsIndex, loading, updatePriceIsShow, realPrice } = this.state
    const { upGoodsList, auditGoodsList, downGoodsList } = this.state
    return (
      <View className='create_live__wrapper'>
        <View className='create_live__wrapper__header'>
          <View className='create_live__wrapper__header__searchView'>
            <SearchbarView placeholder='搜索商品' onInput={this.handleSearchInput} onClearSearchClick={this.handleSearchInput} />
          </View>
          <View className='create_live__wrapper__header__tabsView aic jcc'>
            <Tabs
              data={TABS_MENU}
              margin={150}
              underlineHeight={7}
              underlineColor='#E62E4D'
              activeIndex={activeTabsIndex}
              onTabItemClick={this.onTabClick}
            />
          </View>
        </View>
        <View className='create_live__wrapper__content'>
          <Swiper
            className='swiper_viewer'
            current={activeTabsIndex}
            onChange={this.onSwiperChange}
          >
            <SwiperItem className='swiper_viewer__item'>
              <ScrollView
                scrollY
                refresherEnabled
                scrollAnchoring
                lowerThreshold={300}
                refresherTriggered={loading}
                onRefresherRefresh={this.onGoodsListRefresh}
                onScrollToLower={this.onScrollLower}
                className='swiper_viewer__item__scroll'
              >
                <View style='height:12px;' />
                {upGoodsList.map(up_good => (
                  <Goods
                    key={up_good.id}
                    type={activeTabsIndex}
                    data={up_good}
                    onActionClick={this.onItemClick}
                  />
                ))}
              </ScrollView>
            </SwiperItem>
            <SwiperItem className='swiper_viewer__item'>
              <ScrollView
                scrollY
                refresherEnabled
                scrollAnchoring
                lowerThreshold={300}
                refresherTriggered={loading}
                onRefresherRefresh={this.onGoodsListRefresh}
                onScrollToLower={this.onScrollLower}
                className='swiper_viewer__item__scroll'
              >
                <View style='height:12px;' />
                {auditGoodsList.map(audit_good => (
                  <Goods
                    key={audit_good.id}
                    type={activeTabsIndex}
                    data={audit_good}
                    onActionClick={this.onItemClick}
                  />
                ))}
              </ScrollView>
            </SwiperItem>
            {/* <SwiperItem className='swiper_viewer__item'>
              <ScrollView
                scrollY
                refresherEnabled
                scrollAnchoring
                lowerThreshold={300}
                refresherTriggered={loading}
                onRefresherRefresh={this.onGoodsListRefresh}
                onScrollToLower={this.onScrollLower}
                className='swiper_viewer__item__scroll'
              >
                <View style='height:12px;' />
                {downGoodsList.map(down_good => (
                  <Goods
                    key={down_good.id}
                    type={activeTabsIndex}
                    data={down_good}
                    onActionClick={this.onItemClick}
                  />
                ))}
              </ScrollView>
            </SwiperItem> */}
          </Swiper>
        </View>
        <View className='create_live__wrapper__bottom'>
          <View className='create_live__wrapper__bottom__action' onClick={this.onAddClick}>
            添加商品
          </View>
        </View>
        {updatePriceIsShow && (
          <UpdatePrice
            realPrice={realPrice}
            onCloseClick={this.onCloseUpdatePrice}
            onCallback={this.onUpdateCallBack}
          />
        )}
      </View>
    )
  }
}
