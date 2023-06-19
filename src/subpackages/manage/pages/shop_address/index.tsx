import Taro from '@tarojs/taro'
import React from 'react'
import { View, Textarea } from '@tarojs/components'
import dva from '@utils/dva'

import './index.scss'

interface State {
  inputValue: string
}

export default class ShopAddress extends React.Component<{}, State> {
  state = {
    inputValue: ''
  }

  // config: Taro.Config | undefined = {
  //   navigationBarTitleText: '门店地址'
  // }

  inputValue: string = ''

  componentDidMount() {
    this.setState({
      inputValue: dva.getState().goodsManage.shopAddress
    })
  }

  onSaveClick = () => {
    dva.getDispatch()({
      type: 'goodsManage/save',
      payload: {
        shopAddress: this.state.inputValue
      }
    })
    Taro.navigateBack()
  }

  onInput = e => {
    this.setState({
      inputValue: e.detail.value
    })
  }

  renderActionView = () => {
    return (
      <View className='action_view'>
        <View className='action_view__save' onClick={this.onSaveClick}>
          保存
        </View>
      </View>
    )
  }

  render() {
    const { inputValue } = this.state
    return (
      <View className='shop_address'>
        <View className='textarea_view'>
          <View className='textarea_view__content'>
            <Textarea
              value={inputValue}
              className='textarea_com'
              onInput={this.onInput}
              placeholder='请输入地址'
              maxlength={200}
            ></Textarea>
            <View className='text_len'>{inputValue.length} /200</View>
          </View>
        </View>
        {this.renderActionView()}
      </View>
    )
  }
}
