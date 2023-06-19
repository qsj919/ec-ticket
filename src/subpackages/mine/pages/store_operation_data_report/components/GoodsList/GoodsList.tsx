import Taro from '@tarojs/taro'
import React from 'react'
import { View, ScrollView, Text, Image } from '@tarojs/components'
import angleRight from '@/images/default_goods.png'
import './GoodsList.scss'

type goodsItem = {
  eventNum: number
  style: {
    code: string
    imgUrl: string
    name: string
    id: number
  }
  userNum: number
}

type OwnProps = {
  data: Array<goodsItem>
  onScrollBottom: Function
  isLoadMoreData: boolean
  activeTabIndex: number
}

interface State {}

export default class GoodsList extends React.Component<OwnProps & State> {
  state = {}

  static defaultProps = {
    data: []
  }

  onScrollViewRefersh = () => {
    this.props.onScrollBottom && this.props.onScrollBottom()
  }

  render() {
    const { data, isLoadMoreData, activeTabIndex } = this.props
    return (
      <View className='goodsList'>
        {data.map(item => (
          <View className='goodsList_item' key={item.style.id}>
            <View className='goodsList_item_logoUrl'>
              <Image className='headImage' src={item.style.imgUrl || angleRight} />
            </View>
            <View className='goodsList_item_name'>
              <View className='name'>{item.style.name}</View>
              <View>
                <Text className='code'> {item.style.code}</Text>
              </View>
              <View className='desc'>
                <Text className='font-weight-500'>{item.userNum}</Text>
                {`人${activeTabIndex ? '下单' : '浏览'}了`}
                <Text className='font-weight-500'>{item.eventNum}</Text>次
              </View>
            </View>
          </View>
        ))}
        <View style='text-Align: center'>
          {isLoadMoreData ? '上拉加载更多～' : '暂无更多数据～'}
        </View>
      </View>
    )
  }
}
