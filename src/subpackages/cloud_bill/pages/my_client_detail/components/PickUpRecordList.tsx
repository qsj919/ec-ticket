import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text } from '@tarojs/components'
import EImage from '@components/EImage'
import defaultGoods from '@/images/default_goods.png'
import ListContainer from '@@/subpackages/cloud_bill/components/ContainerView/ListContainer'

import './PickUpRecordList.scss'

type OwnProps = {
  data: Array<{
    billno: string
    stylename: string
    stylecode: string
    num: string
    total: string
    prodate: string
    imgUrl: Array<string>
  }>
  loading: boolean
  noMoreDataVisible: boolean
}

interface State {}

type IProps = OwnProps

export default class PickUpRecordList extends React.Component<IProps, State> {
  static defaultProps = {
    data: []
  }
  render() {
    const { data, loading, noMoreDataVisible } = this.props

    return (
      <ListContainer loadMoreDataVisible={loading} noMoreDataVisible={noMoreDataVisible}>
        {data.map(item => (
          <View className='pick_up_list_wrap' key={item.billno}>
            <View className='pick_up_list_wrap_top'>
              <Text>批次号 {item.billno}</Text>
              <Text>下单时间 {item.prodate}</Text>
            </View>

            <View className='pick_up_list_wrap_bottom'>
              <View className='pick_up_list_wrap_bottom_left'>
                <EImage
                  mode='aspectFit'
                  src={(item.imgUrl && (item.imgUrl[0] || item.imgUrl[1])) || defaultGoods}
                ></EImage>
              </View>
              <View className='pick_up_list_wrap_bottom_right'>
                <View className='stylename'>{item.stylename}</View>
                <View className='fontColorSmall'>款号 {item.stylecode}</View>
                <View className='count_price'>
                  <Text className='fontColorSmall'>×{item.num}</Text>
                  <Text>¥{item.total}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ListContainer>
    )
  }
}
