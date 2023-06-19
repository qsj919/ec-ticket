import React from 'react'
import Taro from '@tarojs/taro'
import { getTaroParams } from '@utils/utils'
import { WebView } from '@tarojs/components'
interface State {
  src: string
}
export default class PubWeb extends React.PureComponent<{}, State> {
  // config = {
  //   navigationBarTitleText: '电子小票'
  // }

  constructor() {
    super()
    this.state = {
      src:
        getTaroParams(Taro.getCurrentInstance?.()).type === '1'
          ? 'https://mp.weixin.qq.com/s/QrwnBEoR1xlfFMlWdsafNA'
          : 'https://mp.weixin.qq.com/s/-9sjb9mdrPxt5I0RpHHMcw'
    }
  }

  render() {
    const { src } = this.state
    return <WebView src={src}></WebView>
  }
}
