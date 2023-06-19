import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import { Shop } from '@@types/base'

import './index.scss'

type OwnProps = {
  shop: Shop
}

interface State {
  isNavigationToMini: boolean
}

export default class NavigationToMini extends React.Component<OwnProps, State> {
  state = {
    isNavigationToMini: false
  }

  componentDidMount() {
    this.init()
  }

  componentDidUpdate(prevProps) {
    if (this.props.shop !== prevProps.shop) {
      this.init()
    }
  }

  init = () => {
    const { shop } = this.props
    // eslint-disable-next-line no-undef
    const { miniProgram } = wx.getAccountInfoSync()
    if (shop && shop.independentType === 2 && shop.independentAppId !== miniProgram.appId) {
      this.setState({
        isNavigationToMini: true
      })
    }
  }

  gotoMini = () => {
    const { shop } = this.props
    if (shop.independentAppId) {
      Taro.navigateToMiniProgram({
        appId: shop.independentAppId,
        success: () => {},
        fail: () => {}
      })
    }
  }

  render() {
    const { isNavigationToMini } = this.state
    return (
      <View>
        {isNavigationToMini && (
          <View className='navigation_to_mini'>
            <View className='navigation_to_mini__content'>
              <View className='navigation_to_mini__content__top'>即将为您跳转至商家独立小程序</View>
              <View className='navigation_to_mini__content__bottom' onClick={this.gotoMini}>
                好的
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }
}
