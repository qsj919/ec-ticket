import Taro from '@tarojs/taro'
import { View, ScrollView, Text } from '@tarojs/components'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { connect } from 'react-redux'
import React, { ComponentType } from 'react'
import { getLastPriceBatch, getShopGoodsList, getSpuActivity } from '@api/goods_api_manager'
import { ISpu } from '@@types/GoodsType'
import navigatorSvc from '@services/navigator'
import { PAGE_SIZE } from '@constants/index'
import { getTaroParams } from '@utils/utils'
import styles from './index.module.scss'
import ListContainer from '../../components/ContainerView/ListContainer'
import ProductList from '../../components/Goods/ProductList'
import ColorSizeModelView from '../goods_detail/components/ColorSizeModelView'

interface State {
  goodsList: Array<ISpu>
  currentCateValue: number
}

interface OwnProps {
  codeValue: number
}

const mapStateToProps = ({ goodsManage, cloudBill }: GlobalState) => {
  return {
    classList: cloudBill.classList,
    mpErpId: cloudBill.mpErpId,
    // sn: goodsManage.sn,
    // shopId: goodsManage.shopId,
    shopInfo: goodsManage.shopInfo,
    colorSizeVisible: cloudBill.colorSizeVisible,
    showPrice: cloudBill.shopParams.spuShowPrice === '1',
    hotSettingGoodsList: cloudBill.hotSettingGoodsList,
    hotSettingGoodsFinished: cloudBill.hotSettingGoodsListFinished
    // shopName: goodsManage.shopName
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps, OwnProps>(mapStateToProps)
class AllGoodsCategory extends React.PureComponent<
  StateProps & DefaultDispatchProps & OwnProps,
  State
> {
  // config = {
  //   navigationBarTitleText: ''
  // }

  pageNo = 1
  pageSize = PAGE_SIZE

  state: State = {
    goodsList: [],
    currentCateValue: -1
  }

  componentDidMount() {
    const codeValue = Number(getTaroParams(Taro.getCurrentInstance?.()).codeValue)
    this.setState(
      {
        currentCateValue: codeValue
      },
      () => {
        if (codeValue === -2) {
          this.fetchHotSettingGood()
        } else if (codeValue === -3) {
          this.fetchSpecialGoodsList()
        } else {
          this.fetchGoodsList()
        }
      }
    )
    Taro.setNavigationBarTitle({ title: getTaroParams(Taro.getCurrentInstance?.()).shopName })
  }

  onReachBottom() {
    const { currentCateValue } = this.state
    if (currentCateValue === -2) {
      this.fetchHotSettingGood(true)
    } else if (currentCateValue === -3) {
      // ignore
    } else {
      this.pageNo++
      this.fetchGoodsList()
    }
  }

  onItemClick = item => {
    this.props.dispatch({
      type: 'cloudBill/fetchGoodsDetail',
      payload: { spuId: item.styleId, goodsDtail: { ...item, skus: [] } }
    })
    navigatorSvc.navigateTo({
      url: `/subpackages/cloud_bill/pages/goods_detail/index?spuId=${item.id}`
    })
  }

  fetchGoodsList = async () => {
    const { mpErpId } = this.props
    const { currentCateValue } = this.state
    const params = {
      pageNo: this.pageNo,
      pageSize: this.pageSize,
      jsonParam: {
        mpErpId,
        // sn,
        // shopId,
        type: 1,
        classId: currentCateValue === -1 ? undefined : currentCateValue
      }
    }
    const { data } = await getShopGoodsList(params)
    if (data.rows.length > 0) {
      try {
        const {
          data: { dataList }
        } = await getLastPriceBatch({
          mpErpId,
          styleIds: data.rows.map(g => g.styleId).join(',')
        })

        if (dataList.length) {
          dataList.forEach((lastPrice, index) => {
            const spu = data.rows[index]
            if (Number(lastPrice.styleId) === spu.styleId) {
              spu.price = lastPrice.price
              spu.useLastPrice = true
            }
          })
        }
      } catch (e) {
        // ignore
      }
      let list = [...this.state.goodsList]
      if (this.pageNo > 1) {
        list.push(...data.rows)
      } else {
        list = data.rows
      }

      if (process.env.INDEPENDENT === 'foodindependent') {
        // 过滤掉特价商品
        const params = {
          pageSize: 300,
          pageNo: 1,
          type: 10,
          mpErpId: mpErpId
        }
        const { data } = await getSpuActivity(params)
        const specialSpuIds = data.spuList.map(spu => spu.styleId)
        list = list.filter(good => !specialSpuIds.includes(good.styleId))
      }
      this.setState({
        goodsList: list
      })
    }
  }

  fetchHotSettingGood = async (loadMore?) => {
    const { dispatch, mpErpId, hotSettingGoodsList, hotSettingGoodsFinished } = this.props
    if (hotSettingGoodsFinished && loadMore) {
      return
    }
    await dispatch({ type: 'cloudBill/fetchHotBySetting', payload: { mpErpId, loadMore } })
    this.setState({ goodsList: hotSettingGoodsList })
  }

  fetchSpecialGoodsList = () => {
    const { mpErpId } = this.props
    if (mpErpId) {
      const params = {
        pageSize: 300,
        pageNo: 1,
        type: 10,
        mpErpId: mpErpId
      }
      return getSpuActivity(params)
        .then(({ data }) => {
          this.setState({
            goodsList: data.spuList
          })
        })
        .catch(() => {})
    }
  }

  onCategoryClick = (value: number) => {
    Taro.pageScrollTo({ scrollTop: 0 })
    this.pageNo = 1
    let cb = () => this.fetchGoodsList()
    if (value === -2) {
      // 店长推荐 爆款
      cb = () => this.fetchHotSettingGood()
    } else if (value === -3) {
      // 福利商品 特价
      cb = () => this.fetchSpecialGoodsList()
    }
    this.setState(
      {
        currentCateValue: value,
        goodsList: []
      },
      cb
    )
  }

  render() {
    const { classList, colorSizeVisible, showPrice, shopInfo } = this.props
    const { goodsList, currentCateValue } = this.state
    console.log('classList--------------', classList)

    if (process.env.INDEPENDENT === 'foodindependent') {
      const hasHot = classList.findIndex(c => c.codeValue === -2)
      const hasSpecial = classList.findIndex(c => c.codeValue === -3)
      if (hasSpecial < 0) {
        classList.unshift({
          codeName: shopInfo.activityNames[2] || '福利商品',
          codeValue: -3,
          hidden: false
        })
      }

      if (hasHot < 0) {
        classList.unshift({
          codeName: shopInfo.activityNames[10] || '店长推荐',
          codeValue: -2,
          hidden: false
        })
      }
    }

    return (
      <View className={styles.contanier}>
        <View style={{ zIndex: 9999 }}>
          <ColorSizeModelView
            key='all_goods'
            visible={colorSizeVisible}
            type='buttons'
            // onVisibleChanged={}
          />
        </View>
        <View className={styles.left}>
          <ScrollView className={styles.left__list} scrollY scrollIntoView={`s${currentCateValue}`}>
            <View
              onClick={() => {
                this.onCategoryClick(-1)
              }}
              className={styles.left__list__item}
            >
              <Text>全部</Text>
              {currentCateValue === -1 && <View className={styles.left__list__item__flag} />}
            </View>
            {classList.map(item => {
              return (
                <View
                  id={`s${item.codeValue}`}
                  key={item.codeValue}
                  onClick={() => {
                    this.onCategoryClick(item.codeValue)
                  }}
                  className={styles.left__list__item}
                >
                  <Text>{item.codeName}</Text>
                  {currentCateValue === item.codeValue && (
                    <View className={styles.left__list__item__flag} />
                  )}
                </View>
              )
            })}
          </ScrollView>
        </View>
        <View className={styles.right}>
          <ListContainer
            containerstyle={goodsList.length === 0 ? 'height: 100vh' : ''}
            noDataVisible={goodsList.length === 0}
            noMoreDataVisible={
              this.pageNo * this.pageSize > goodsList.length && goodsList.length > 0
            }
          >
            {goodsList.length > 0 && (
              <View className={styles.right__list}>
                {goodsList.map(good => {
                  return (
                    <View className={styles.right__list__item} key={good.id}>
                      <ProductList
                        isCartBtnVisible
                        data={good}
                        onItemClick={data => {
                          this.onItemClick(data)
                        }}
                        showPrice={showPrice}
                        from='allGoods'
                      />
                    </View>
                  )
                })}
              </View>
            )}
          </ListContainer>
        </View>
      </View>
    )
  }
}

export default connect<StateProps, DefaultDispatchProps, OwnProps>(mapStateToProps)(AllGoodsCategory) as ComponentType<OwnProps>
