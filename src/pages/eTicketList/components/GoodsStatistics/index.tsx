import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import CaretDownGray from '@/images/caret_down_gray_32.png'
import TicketDatePicker from '@components/TicketDatePicker'

import './index.scss'

interface State {
  datePickerIsShow: boolean
}

type OwnProps = {}

export default class GoodsStatistics extends React.Component<OwnProps, State> {
  state = {
    datePickerIsShow: false
  }

  static defaultProps = {}

  onDateUseClick = () => {
    this.setState({
      datePickerIsShow: true
    })
  }

  datePickerAction = (actionType, dateType?, date?) => {
    if (actionType === 'cancel') {
      this.setState({
        datePickerIsShow: false
      })
    } else if (actionType === 'confirm') {
      console.log(date)
      this.setState({
        datePickerIsShow: false
      })
    }
  }

  renderRankingShop = () => {
    return (
      <View className='list_item_content'>
        <View className='list_item_content__left'>
          <View className='ranking_icon'>1</View>
          <View className='ranking_shopInfoView'>
            <View className='ranking_shopInfoView__shoplogo'></View>
            <View className='ranking_shopInfoView__shopinfo'>
              <View className='ranking_shopInfoView__shopinfo___goods'>显现店面</View>
              <Text className='ranking_shopInfoView__shopinfo___shopName'>款式: 23款12件</Text>
            </View>
          </View>
        </View>
        <View className='list_item_content__right'>
          <View className='list_item_content__right___money'>
            <Text style='font-size: 27rpx'>¥</Text>
            <Text>2099</Text>
          </View>
        </View>
      </View>
    )
  }

  renderRankingGood = () => {
    return (
      <View className='list_item_content'>
        <View className='list_item_content__left'>
          <View className='ranking_icon'>1</View>
          <View className='ranking_shopInfoView'>
            <View className='ranking_shopInfoView__goodlogo'></View>
            <View className='ranking_shopInfoView__shopinfo'>
              <View className='ranking_shopInfoView__shopinfo___goods'>时尚打底衫 #20029</View>
              <Text className='ranking_shopInfoView__shopinfo___shopName'>雪儿家</Text>
            </View>
          </View>
        </View>
        <View className='list_item_content__right'>
          <View className='list_item_content__right___money'>
            <Text style='font-size: 27rpx'>¥</Text>
            <Text>2099</Text>
          </View>
          <View className='list_item_content__right___count'>12件</View>
        </View>
      </View>
    )
  }

  render() {
    const { datePickerIsShow } = this.state
    return (
      <View className='goods_statistics_content'>
        <View className='goods_statistics_content__dateView'>
          <View className='goods_statistics_content__dateView__left'>
            <View className='month_view'>01</View>
            <View className='year_view'>
              <View className='year_view__year'>2022</View>
              <View className='year_view__label'>月·拿货统计</View>
            </View>
          </View>
          <View className='date_action-view' onClick={this.onDateUseClick}>
            选择时间
            <Image src={CaretDownGray} className='caret_down_gray' />
          </View>
        </View>
        <View className='goods_statistics_content__totalData'>
          <View className='goods_statistics_content__totalData__totalMoney'>
            <Text className='totalMoney_label'>拿货金额</Text>
            <View className='totalMoney_label'>
              <Text>¥</Text>
              <Text style='font-size: 36rpx;margin-left:8rpx;font-weight:500;'>20090909</Text>
            </View>
          </View>
          <View className='goods_statistics_content__totalData__otherView'>
            <View className='goods_statistics_content__totalData__otherView___item'>
              <Text className='item_label'>款式</Text>
              <Text className='item_value'>123</Text>
            </View>
            <View className='goods_statistics_content__totalData__otherView___item'>
              <Text className='item_label'>款式</Text>
              <Text className='item_value'>123</Text>
            </View>
            <View className='goods_statistics_content__totalData__otherView___item'>
              <Text className='item_label'>款式</Text>
              <Text className='item_value'>123</Text>
            </View>
          </View>
        </View>
        <View className='goods_statistics_content__shopRankingView'>
          <View className='goods_statistics_content__shopRankingView_title'>
            <Text className='title_label'>拿货门店排名</Text>
            <Text className='show_all'>查看全部</Text>
          </View>
          {this.renderRankingShop()}
        </View>
        <View className='goods_statistics_content__shopRankingView'>
          <View className='goods_statistics_content__shopRankingView_title'>
            <Text className='title_label'>拿货款式排名</Text>
            <Text className='show_all'>查看全部</Text>
          </View>
          {this.renderRankingGood()}
        </View>
        <TicketDatePicker visible={datePickerIsShow} mask onActionClick={this.datePickerAction} />
      </View>
    )
  }
}
