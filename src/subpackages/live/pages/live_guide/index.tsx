import Taro from '@tarojs/taro'
import React from 'react'
import { Image, Text, View } from '@tarojs/components'
import guideImage1 from '../../images/live_guide_1.png'
import guideImage2 from '../../images/live_guide_2.png'

export default class LiveGuidePage extends React.PureComponent {
  // config: Taro.Config = {
  //   navigationBarTitleText: '绑定教程'
  // }

  render() {
    const viewStyle = { marginTop: '10px', marginBottom: '10px', color: '#222', fontSize: '14px' }

    return (
      <View style={{ minHeight: '100vh', padding: '10px', backgroundColor: '#fff' }}>
        <View style={viewStyle}>1.登录小程序后台找到交易组件</View>
        <View style={viewStyle}>2.点击场景接入——视频号，进入视频号推广页</View>
        <Image
          onClick={() => {
            Taro.previewImage({ urls: [guideImage1] })
          }}
          mode='aspectFit'
          style={{ width: '100%', height: '60vw' }}
          src={guideImage1}
        />
        <View style={viewStyle}>
          3.点击添加关联按钮，扫描二维码将邀请发送给需要视频号带货的微信
        </View>
        <Image
          onClick={() => {
            Taro.previewImage({ urls: [guideImage2] })
          }}
          mode='aspectFit'
          style={{ width: '100%', height: '90vw' }}
          src={guideImage2}
        />
      </View>
    )
  }
}
