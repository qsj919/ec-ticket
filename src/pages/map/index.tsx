import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image } from '@tarojs/components'
import { getTaroParams } from '@utils/utils'
import './map.scss'

interface State {
  latitude: string
  longitude: string
  width: number
  height: number
}

export default class AMapPage extends React.PureComponent<any, State> {
  state = {
    width: 0,
    height: 0,
    latitude: '0',
    longitude: ''
  }

  componentDidMount() {
    const { latitude, longitude } = getTaroParams(Taro.getCurrentInstance?.())
    const { windowWidth, windowHeight } = Taro.getSystemInfoSync()
    this.setState({
      width: windowWidth,
      height: windowHeight,
      latitude,
      longitude
    })

    /* eslint-disable no-undef */
    //@ts-ignore
    const map = new AMap.Map('map_container', {
      zoom: 18, //级别
      center: [longitude, latitude] //中心点坐标
    })

    //@ts-ignore
    const marker = new AMap.Marker({
      position: [longitude, latitude] //位置
    })
    map.add(marker) //添加到地图

    /* eslint-enable no-undef */
  }

  render() {
    const { longitude, width, height, latitude } = this.state
    // const mapUrl = `https://restapi.amap.com/v3/staticmap?location=${longitude},${latitude}&zoom=16&size=${width}*${height}&markers=mid,,A:${longitude},${latitude}&key=d3a5dc1d45a83a5cf70f7189288c39f3`
    return (
      <View id='map_container' style={{ width, height }}>
        {/* <Image src={mapUrl} style={{ width, height }} /> */}
      </View>
    )
  }
}
