import Taro, { eventCenter } from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { View } from '@tarojs/components'
import { connect } from 'react-redux'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import SearchbarView from '@components/SearchBarView/SearchbarView'
import { ALL_GOODS_PAGE_SIZE } from '@constants/index'
import AllContentView from '../../components/AllContentView/AllContentView'
import './index.scss'
import ColorSizeModelView from '../goods_detail/components/ColorSizeModelView'

type PageState = {
  searchKey: string
  isFirstSearch: boolean // 第一次搜索不展示缺省图
}

const mapStateToProps = ({ cloudBill, loading }: GlobalState) => {
  return {
    pageNo: cloudBill.searchPageNo,
    goodsList: cloudBill.goodsSearchList,
    isLoadingMore:
      loading.effects['cloudBill/fetchGoodsSearchList'] &&
      loading.effects['cloudBill/fetchGoodsSearchList'].loading &&
      cloudBill.searchPageNo > 1,
    showPrice: cloudBill.shopParams.spuShowPrice === '1',
    colorSizeVisible: cloudBill.colorSizeVisible
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class Index extends PureComponent<StateProps & DefaultDispatchProps, PageState> {
  // config = {
  //   navigationBarTitleText: '搜索',
  //   navigationBarBackgroundColor: '#f7f7f7'
  // }

  constructor(props) {
    super(props)

    this.state = {
      searchKey: '',
      isFirstSearch: true
    }
  }

  onReachBottom() {
    if (
      (this.props.goodsList && this.props.goodsList.length) <
      ALL_GOODS_PAGE_SIZE * this.props.pageNo
    ) {
      return
    }
    const { searchKey } = this.state
    this.props.dispatch({
      type: 'cloudBill/fetchGoodsSearchList',
      payload: { styleNameLike: searchKey, loadMore: true }
    })
  }

  onInput = (searchKey: string) => {
    this.setState({ searchKey })
  }

  onSearch = () => {
    const { searchKey } = this.state
    this.props.dispatch({
      type: 'cloudBill/fetchGoodsSearchList',
      payload: { styleNameLike: searchKey }
    })
    this.setState({ isFirstSearch: false })
  }

  onClearSearch = () => {
    // 清空，不请求(初始状态)
    this.setState({ searchKey: '', isFirstSearch: true })
  }

  render() {
    const { goodsList, isLoadingMore, pageNo, showPrice, colorSizeVisible } = this.props
    const { isFirstSearch } = this.state

    return (
      <View>
        <View className='search_contanier'>
          <SearchbarView
            focus
            onInput={this.onInput}
            allgoodSearch
            onSearchClick={this.onSearch}
            placeholder='输入商品名称、款号搜索'
            onClearSearchClick={this.onClearSearch}
          />
          <View className='search_contanier_search_text' onClick={this.onSearch}>
            搜索
          </View>
        </View>
        <View className='list_contanier'>
          {!isFirstSearch && (
            <AllContentView
              from='allGoods'
              effectsName='cloudBill/fetchGoodsSearchList'
              dresStyleResultList={goodsList}
              loadMoreDataVisible={isLoadingMore}
              showPrice={showPrice}
              noMoreDataVisible={
                !isLoadingMore && (goodsList && goodsList.length) < pageNo * ALL_GOODS_PAGE_SIZE
              }
              listHeight='100vh'
            />
          )}
        </View>
        <ColorSizeModelView key='all_goods' visible={colorSizeVisible} type='buttons' />
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(Index)