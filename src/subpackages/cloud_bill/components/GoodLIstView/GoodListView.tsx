import Taro from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { View, Image, Block } from '@tarojs/components'
import cn from 'classnames'
import myLog from '@utils/myLog'
import navigatorSvc from '@services/navigator'
import dva from '@utils/dva'
import ListContainer from '@@/subpackages/cloud_bill/components/ContainerView/ListContainer'
import { ISpu } from '@@types/GoodsType'
import GoodsItemVertical from '../Goods/GoodsItemVertical'
import './good_list.scss'

type Props = {
  style?: string
  listContainerStyle?: string
  listContainerViewStyle?: string
  dresStyleResultList: Array<ISpu>
  onItemClick?: Function
  noMoreDataVisible?: boolean
  loadMoreDataVisible?: boolean
  noDataVisible?: boolean
  layout?: string
  page?: string
  special?: string
  type?: string // 增加 special_activity_preview(大图看款)
  activityId?: string // 大图看款activityId
  onQuickReplenishment?: Function
  categoryIsHidden?: boolean
  emptyViewImageStyle?: string
  imageMode?: string
  manage?: boolean
}

type PageState = {
  visible: boolean
  currentNum: number
  urls: [string] | []
  startVideoId: string
  videoReady: boolean
}
// 当前网络类型
let networkType

// 获取当前网络类型
Taro.getNetworkType({
  success: res => {
    networkType = res.networkType
  }
})

// 检测网络类型变化
Taro.onNetworkStatusChange(res => {
  networkType = res.networkType
})

export default class GoodListView extends PureComponent<Props, PageState> {
  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    dresStyleResultList: [],
    onItemClick: null
  }

  timer: NodeJS.Timeout

  onItemClick = (item: ISpu) => {
    const { onItemClick } = this.props
    if (onItemClick) {
      onItemClick(item)
      return
    }
    // const { clusterCode, tenantId } = dva.getState().shop.shopInfo
    // dva.getDispatch()({
    //   type: 'goodsDetail/saveGoods',
    //   payload: {
    //     spuId: item.id,
    //     clusterCode,
    //     tenantId,
    //     goods: { spu: { ...item, flag: 1 } },
    //     entryActType: item.activity ? item.activity.actType : ''
    //   } // 提前将部分数据带入，商品默认有效
    // })
    dva.getDispatch()({
      type: 'cloudBill/fetchGoodsDetail',
      payload: { spuId: item.styleId, goodsDtail: { ...item, skus: [] } }
    })
    navigatorSvc.navigateTo({ url: '/subpackages/cloud_bill/pages/goods_detail/index' })
  }

  render() {
    const {
      dresStyleResultList,
      noMoreDataVisible,
      listContainerStyle,
      listContainerViewStyle,
      loadMoreDataVisible,
      noDataVisible,
      layout,
      page,
      special,
      type,
      categoryIsHidden,
      emptyViewImageStyle
    } = this.props

    return (
      <View className='good_list_line'>
        <View style={listContainerStyle}>
          <ListContainer
            containerstyle={listContainerViewStyle}
            noMoreDataVisible={dresStyleResultList.length >= 3 && noMoreDataVisible}
            loadMoreDataVisible={loadMoreDataVisible}
            noDataVisible={noDataVisible}
            emptyViewImageStyle={emptyViewImageStyle}
          >
            <Block>
              <View
                className={cn('good_two_container', {
                  'good_two_container--normal': !categoryIsHidden,
                  'good_two_container_padding--zero': dresStyleResultList.length === 0,
                  'good_two_container--white': page === 'classGoodsList'
                })}
              >
                {dresStyleResultList.map((item, index) => {
                  return (
                    <View className='good_items' key='id'>
                      <View>
                        <GoodsItemVertical
                          size='small'
                          data={item}
                          onItemClick={data => this.onItemClick(data)}
                          showVideo={this.state.startVideoId === `${item.id}`}
                          videoId={`${this.props.page}video${item.id}`}
                          videoReady={this.state.videoReady}
                          startVideoId={this.state.startVideoId}
                          // imageMode={this.props.imageMode}
                        />
                      </View>
                    </View>
                  )
                })}
              </View>
              {page === 'allGoods' && <View className='linear_bg' />}
            </Block>
          </ListContainer>
        </View>
      </View>
    )
  }
}
