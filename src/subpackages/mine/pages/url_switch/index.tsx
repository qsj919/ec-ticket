import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import { urlQueryParse, getTaroParams } from '@utils/utils'
import { setBaseUrl } from '@utils/request'

export default class UrlSwitchPage extends React.PureComponent {
  state = {
    url: ''
  }

  componentDidMount(): void {
    const { q } = getTaroParams(Taro.getCurrentInstance?.())
    const qString = decodeURIComponent(q)
    const p = urlQueryParse(qString)
    const url = p.url
    setBaseUrl(url)
    this.setState({ url })
  }

  render() {
    const { url } = this.state
    return (
      <View>
        设置url为：<View>{url}</View>
      </View>
    )
  }
}
