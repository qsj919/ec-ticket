import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text } from '@tarojs/components'
import EImage from '@components/EImage'
import { getOneDate } from '@utils/utils'
import ListContainer from '@@/subpackages/cloud_bill/components/ContainerView/ListContainer'
import defaultGoods from '@/images/default_goods.png'
import './BrowseRecordsList.scss'

type OwnProps = {
  data: Array<{
    bizNum: number
    eventNum: number
    proDate: string
    styles: Array<{
      code: string
      imgUrl: string
      id: number
    }>
  }>
  loading: boolean
  noMoreDataVisible: boolean
}

interface State {}

type IProps = OwnProps

export default class BrowseRecordsList extends React.Component<IProps, State> {
  static defaultProps = {
    data: []
  }
  onBigImageView(item, index) {
    let urls: Array<string> = []
    if (item.styles) {
      item.styles.forEach(item => {
        urls.push(item.imgUrl)
      })
      Taro.previewImage({
        current: urls[index],
        urls
      })
    }
  }
  render() {
    const { data, loading, noMoreDataVisible } = this.props
    return (
      <ListContainer loadMoreDataVisible={loading} noMoreDataVisible={noMoreDataVisible}>
        {data.map((item, index) => (
          <View className='records_list_wrap' key={index}>
            <View className='records_list_wrap_left'>
              <View>{item.proDate === getOneDate() ? '今天' : item.proDate}</View>
            </View>
            {item.styles && item.styles.length ? (
              <View className='records_list_wrap_center'>
                <View className='arc'></View>
                <View className='line'></View>
                <View className='arc'></View>
              </View>
            ) : (
              <View></View>
            )}
            {item.styles && item.styles.length ? (
              <View className='records_list_wrap_right'>
                <View className='records_list_wrap_right_title'>
                  <Text className='titleColor'>浏览了以下商品</Text>
                </View>
                <View className='records_list_wrap_right_center'>
                  {item.styles &&
                    item.styles.map((goods, goodsIndex) => (
                      <View key={goods.id} className='records_list_wrap_right_center_item'>
                        <View
                          className='img'
                          onClick={() => {
                            this.onBigImageView(item, goodsIndex)
                          }}
                        >
                          <EImage lazyLoad mode='aspectFit' src={goods.imgUrl || defaultGoods} />
                        </View>
                        <Text className='code'>#{goods.code}</Text>
                      </View>
                    ))}
                </View>
                <View className='records_list_wrap_right_title'>
                  <Text className='titleColor'>打开云单{item.eventNum}次</Text>
                </View>
              </View>
            ) : (
              <View className='records_list_wrap_right'>
                <View className='records_list_wrap_right_title'>
                  <Text className='titleColor'>打开云单{item.eventNum}次</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ListContainer>
    )
  }
}
