/**
 * 暗黑模式检测
 * 微信相关api必须在开启了暗黑模式后才能检测到
 */
import Taro, { NodesRef } from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import events from '@constants/analyticEvents'
import trackSvc from '@services/track'
import './index.scss'

// 可以暴露onDarkModeDetected钩子出来，目前直接把业务逻辑写进去

export default class DarkModeDetector extends React.PureComponent {
  componentDidMount() {
    this.detect()
  }

  detect = () => {
    setTimeout(() => {
      const query = Taro.createSelectorQuery().in(Taro.getCurrentInstance()?.page as any)
      query
        .select('.dark_hook')
        .boundingClientRect((rect: any ) => {
          let mode = 'light'
          if (rect[0].height > 0) {
            // 暗黑！！
            mode = 'dark'
          }
          trackSvc.track(events.darkMode, { mode })
        })
        .exec()
    }, 200)
  }

  render() {
    return <View className='dark_hook'></View>
  }
}
