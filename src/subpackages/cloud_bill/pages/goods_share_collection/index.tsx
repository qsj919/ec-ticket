import Taro, { Config } from '@tarojs/taro'
import React from 'react'
import { View, Image, Text, Button } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import angleRightIcon from '@/images/angle_right_gray_40.png'
import { getShopGoodsList, getSpuGroup } from '@api/goods_api_manager'
import { ISpu } from '@@types/GoodsType'
import { enableVisitorIn } from '@api/shop_api_manager'
import { getTaroParams } from '@utils/utils'
import LoginView from '@components/LoginView/LoginView'
import HotHeaderBg from '../../images/hot_header_bg.png'
import NewHeaderBg from '../../images/new_header_bg.png'
import GoodsCar from '../../images/goods_car.png'
import ProductList from '../../components/Goods/ProductList'
import ColorSizeModelView from '../goods_detail/components/ColorSizeModelView'

import './index.scss'

const mapStateToProps = ({ user, cloudBill, shop }: GlobalState) => {
  return {
    sessionId: user.sessionId,
    mpUserId: user.mpUserId,
    showPrice: cloudBill.shopParams.spuShowPrice === '1',
    mpErpId: cloudBill.mpErpId,
    colorSizeVisible: cloudBill.colorSizeVisible,
    data: cloudBill.videoPageData
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  goodsList: Array<ISpu>
  enableVisitor: boolean
  type: number
  title: string
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class GoodsShareCollection extends React.Component<
  StateProps & DefaultDispatchProps,
  State
> {
  // config: Config = {
  //   navigationBarTitleText: ''
  // }

  state = {
    goodsList: [] as ISpu[],
    enableVisitor: true,
    type: -1,
    title: ''
  }

  componentDidMount() {
    if (this.props.sessionId) {
      this.init()
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.sessionId && this.props.sessionId) {
      this.init()
    }
  }

  init = () => {
    const { groupId, mpErpId, scene, spuGroupId } = getTaroParams(Taro.getCurrentInstance?.())
    if ((groupId || spuGroupId) && mpErpId && this.props.sessionId) {
      this.fetchData(mpErpId, groupId || spuGroupId)
    }
    if (scene) {
      const _scene = decodeURIComponent(scene).split(',')
      this.fetchData(_scene[0], _scene[1])
    }
  }

  fetchData = (mpErpId, groupId) => {
    Taro.showLoading({ title: '请稍等...' })
    this.props.dispatch({
      type: 'cloudBill/fetchVideoPageDataByMpErpId',
      payload: {
        mpErpId
      }
    })
    enableVisitorIn({
      mpErpId,
      mpUserId: this.props.mpUserId
    })
      .then(({ data }) => {
        this.props.dispatch({
          type: 'cloudBill/save',
          payload: {
            mpErpId
          }
        })
        this.props.dispatch({
          type: 'replenishment/save',
          payload: {
            mpErpId
          }
        })
        this.props.dispatch({
          type: 'goodsManage/selectShopParamSpuShowPrice',
          payload: {
            mpErpId,
            erpParamFirst: false,
            mpUserId: this.props.mpUserId
          }
        })
        this.props.dispatch({
          type: 'goodsManage/selectShopParamSpuShowInv',
          payload: {
            mpErpId
          }
        })
        Promise.all([
          getSpuGroup({
            id: groupId
          }),
          getShopGoodsList({
            pageNo: 1,
            pageSize: 40,
            jsonParam: {
              type: 8,
              mpErpId,
              groupId
            }
          })
        ])
          .then(([res1, res2]) => {
            if (res1.data.flag === 0) {
              Taro.redirectTo({
                url: `/subpackages/cloud_bill/pages/all_goods/index?mpErpId=${this.props.mpErpId}`
              })
              return
            }
            if (res1.data.type === 0) {
              Taro.setNavigationBarTitle({
                title: '自定义集合'
              })
            } else if (res1.data.type === 1) {
              Taro.setNavigationBarTitle({
                title: '爆款集合'
              })
            } else {
              Taro.setNavigationBarTitle({
                title: '上新集合'
              })
            }
            this.setState({
              goodsList: res2.data.rows,
              enableVisitor: data.val,
              type: res1.data.type,
              title: res1.data.name
            })

            Taro.hideLoading()
          })
          .catch(() => {
            Taro.hideLoading()
          })
      })
      .catch(e => {
        Taro.hideLoading()
      })
  }

  onItemClick = (data: ISpu) => {
    if (this.state.enableVisitor) {
      this.props.dispatch({
        type: 'cloudBill/fetchGoodsDetail',
        payload: { spuId: data.styleId, goodsDtail: { ...data, skus: [] } }
      })
      Taro.navigateTo({
        url: `/subpackages/cloud_bill/pages/goods_detail/index?spuId=${data.id}`
      })
    }
  }

  goShop = () => {
    Taro.navigateTo({
      url: `/subpackages/cloud_bill/pages/all_goods/index?mpErpId=${this.props.mpErpId}`
    })
  }

  goCart = () => {
    Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/replenishment/index' })
  }

  render() {
    const { goodsList, enableVisitor, type, title } = this.state
    const { showPrice, colorSizeVisible, data, mpErpId } = this.props
    return (
      <View className='goods_share_collection_page'>
        <View className='goods_share_collection_page__header'>
          {type === 1 ? (
            <Image className='header_bg' src={HotHeaderBg} />
          ) : (
            <View className='new_share_view'>
              <Image className='header_bg' src={NewHeaderBg} />
              <Text className='header_title'>{title}</Text>
            </View>
          )}
        </View>
        <View className='goods_share_collection_page__shopInfo'>
          <View className='aic'>
            <Image src={data.logoUrl} className='shop_logo' />
            <Text className='shop_name'>{data.shopName}</Text>
          </View>
          <View className='aic' onClick={this.goShop}>
            <Text className='go_shop'>进店</Text>
            <Image src={angleRightIcon} className='right_icon' />
          </View>
        </View>
        <View className='goods_share_collection_page__content'>
          {goodsList.map(spu => (
            <View className='goods_share_collection_page__content__item' key={spu.id}>
              <ProductList
                size='small'
                data={spu}
                blur={!enableVisitor}
                onItemClick={this.onItemClick}
                showPrice={showPrice}
                showHotIconForShare={type}
                from='allGoods'
              />
            </View>
          ))}
        </View>

        {enableVisitor && <Image src={GoodsCar} className='goods_car' onClick={this.goCart} />}

        <ColorSizeModelView
          key='goods_share'
          visible={colorSizeVisible}
          type='buttons'
          // onVisibleChanged={}
        />
        <LoginView scanError={data.scanError} mpErpId={mpErpId} />
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(GoodsShareCollection)