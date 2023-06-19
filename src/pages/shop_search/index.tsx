import Taro, { pxTransform } from '@tarojs/taro'
import React from 'react'
import { View, ScrollView, Text, Image } from '@tarojs/components'
import SearchBar from '@components/SearchBar'
import ShopCell from '@@/subpackages/mine/components/ShopCell'
import { connect } from 'react-redux'
import Menu from '@components/Menu'
import { BaseItem, SearchShop } from '@@types/base'
import WithEmptyView from '@components/WithEmptyView'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import navigatorSvc from '@services/navigator'
import classNames from 'classnames'
import debounce from 'lodash/debounce'
import angleRight from '@/images/angle_right_gray_40.png'
import trackSvc from '@services/track'
import events from '@constants/analyticEvents'
import HistoryTagsView from './components/HistoryView'
import { splitTargetText } from './helper'
import styles from './shop_search.module.scss'
import ShopSearchCell from './components/SearchShopCell'

interface State {
  inputValue: string
  isMenuVisible: boolean
  preFixFilterText: string
  inputFocus: boolean
  isSearched: boolean
  pageNo: number
}

const mapStateToProps = ({ searchShop }: GlobalState) => ({
  shopList: searchShop.shopList,
  noMoreShop: searchShop.noMoreShop,
  relativeShopNames: searchShop.relativeShopNames,
  historyWords: searchShop.historyWords,
  activedValue: [searchShop.activeProvinceCode, searchShop.activeCityCode] as const
})

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class ShopSearch extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  config = {
    navigationBarTitleText: '搜索店铺'
  }

  state = {
    inputValue: '',
    isMenuVisible: false,
    preFixFilterText: '全国',
    inputFocus: true,
    isSearched: false,
    pageNo: 1
  }

  UNSAFE_componentWillMount() {
    this.props.dispatch({ type: 'searchShop/fetchHistoryWords' })
    // fetchCities
    // this.props.dispatch({ type: 'address/fetchData' })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: 'searchShop/resetShopList' })
  }

  onReachBottom = () => {
    if (!this.props.noMoreShop) {
      this.setState(state => ({ pageNo: state.pageNo + 1 }), this.search)
    }
  }

  onInput = ({ detail }) => {
    this.setState({ inputValue: detail.value }, this.fetchRelativeShopNames)
    if (detail.value === '') {
      this.setState({ isSearched: false })
      //  清空联想词
      this.props.dispatch({ type: 'searchShop/save', payload: { relativeShopNames: [] } })
    }
  }

  onInputConfirm = e => {
    e.target.blur()
    this.onSearch()
  }

  onInputFocus = () => {
    this.setState({ inputFocus: true })
  }

  onInputBlur = () => {
    const { relativeShopNames } = this.props
    const { inputFocus, inputValue } = this.state
    const isRelativeVisible =
      relativeShopNames.length > 0 && inputFocus && inputValue.trim().length > 0
    // 在联想词里点击事件里手动失焦
    if (!isRelativeVisible) {
      this.setState({ inputFocus: false })
    }
    if (this.state.inputValue.length > 0) this.fetchRelativeShopNames()
  }

  clearInput = () => {
    this.onInput({ detail: { value: '' } })
    this.onInputFocus()
  }

  hideMenu = () => {
    this.setState({ isMenuVisible: false })
  }

  onFilterClick = () => {
    this.setState(state => ({ isMenuVisible: !state.isMenuVisible }))
  }

  onMenuClick = (item: BaseItem, index: number, parentItem: BaseItem, parentIndex: number) => {
    this.hideMenu()
    this.setState({ preFixFilterText: item.label })
    let activeCityCode = -1
    let activeProvinceCode = -1
    if (index === 0) {
      activeProvinceCode = Number(item.value)
    } else {
      activeCityCode = Number(item.value)
    }
    this.props.dispatch({
      type: 'searchShop/save',
      payload: { activeCityCode, activeProvinceCode }
    })
  }

  onHistoryClick = (data?: BaseItem) => {
    this.props.dispatch({ type: 'searchShop/deleteHistoryWords', payload: data })
  }

  onRelativeWordClick = (s: string) => {
    this.setState({ inputValue: s, inputFocus: false }, this.onSearch)
  }

  onHistoryTagClick = (data: BaseItem) => {
    this.setState({ inputValue: data.label }, this.onSearch)
  }

  onSearch = () => {
    trackSvc.track(events.shopSearch)
    if (this.state.pageNo === 1) {
      this.search()
    } else {
      this.setState({ pageNo: 1 }, this.search)
    }
  }

  search = () => {
    this.setState({ inputFocus: false, isSearched: true })
    const { inputValue } = this.state
    this.props.dispatch({
      type: 'searchShop/searchShop',
      payload: { pageNo: this.state.pageNo, jsonParam: { nameLike: inputValue, autoCompletion: 0 } }
    })
  }

  fetchRelativeShopNames = debounce(() => {
    const { inputValue } = this.state
    const nameLike = inputValue.trim()
    if (nameLike) {
      this.props.dispatch({
        type: 'searchShop/fetchRelativeWords',
        payload: { jsonParam: { nameLike } }
      })
    }
  }, 500)

  onShopClick = (data: SearchShop) => {
    // navigatorSvc.navigateTo({ url: `/pages/shop/index?mpErpId=${data.id}` })
  }

  renderWords = () => {
    const { relativeShopNames } = this.props
    const { inputFocus, inputValue } = this.state
    const isVisible = relativeShopNames.length > 0 && inputFocus && inputValue.trim().length > 0
    return (
      isVisible && (
        <View className={styles.words_container}>
          <ScrollView className={styles.words_wrapper} scrollY>
            {relativeShopNames.map(shopName => (
              <View
                key={shopName}
                className={styles.words__item}
                onClick={() => this.onRelativeWordClick(shopName)}
              >
                <View>
                  {splitTargetText(shopName, inputValue).map((item, index) => (
                    <Text key={item} className={classNames({ [styles.highlight]: index === 1 })}>
                      {item}
                    </Text>
                  ))}
                </View>

                <Image src={angleRight} className={styles.angle_righ} />
              </View>
            ))}
          </ScrollView>
        </View>
      )
    )
  }

  renderHistory = () => {
    const { isSearched } = this.state
    const { historyWords } = this.props
    return (
      !isSearched &&
      historyWords.length > 0 && (
        <View>
          <HistoryTagsView
            data={historyWords}
            onDelAll={this.onHistoryClick}
            onTagDel={this.onHistoryClick}
            onTagClick={this.onHistoryTagClick}
          />
        </View>
      )
    )
  }

  render() {
    const {
      inputValue,
      isMenuVisible,
      preFixFilterText,
      inputFocus,
      isSearched,
      pageNo
    } = this.state
    const { shopList, noMoreShop, activedValue } = this.props

    return (
      <View className={styles.container}>
        <View className={styles.header}>
          <SearchBar
            // preFixFilterText={preFixFilterText}
            onConfirm={this.onInputConfirm}
            placeholder='输入店名试试'
            confirmType='search'
            value={inputValue}
            onInput={this.onInput}
            onClear={this.clearInput}
            onFilterClick={this.onFilterClick}
            onSearch={this.onSearch}
            focus={inputFocus}
            onBlur={this.onInputBlur}
            onFocus={this.onInputFocus}
            maxLength={20}
          />
        </View>
        {/* 搜索结果：店铺列表 */}
        {isSearched && (
          <WithEmptyView
            effectsName='searchShop/searchShop'
            data={shopList}
            height={`calc(100vh - ${pxTransform(120)})`}
            alwaysDisplayLoading={pageNo === 1}
          >
            <ScrollView
              onScrollToLower={this.onReachBottom}
              scrollY
              className={styles.shop_list}
              scrollTop={pageNo === 1 ? 0 : undefined}
            >
              {shopList.map(item => (
                <ShopSearchCell key={item.id} data={item} onCellClick={this.onShopClick} />
              ))}
              {noMoreShop && <View className={styles.no_more}>已加载全部数据</View>}
            </ScrollView>
          </WithEmptyView>
        )}

        {/* 搜索历史 */}
        {this.renderHistory()}

        {/* 搜索词联想列表 */}
        {this.renderWords()}
        {/* 市场选择弹窗 */}
        {/* <SlideContainer
          visible={isMenuVisible}
          direction={SlideDirection.Top}
          onRequestClose={this.hideMenu}
        >
          <View className={styles.menu_container}>
            <Menu onMenuClick={this.onMenuClick} activedValue={activedValue} />
          </View>
        </SlideContainer> */}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(ShopSearch)