import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image } from '@tarojs/components'
import { uploadImage } from '@utils/download'
import myLog from '@utils/myLog'
import { getTaroParams } from '@utils/utils'
import './index.scss'

export default class ShopWxCode extends React.Component<
  {},
  {
    url: string
  }
> {
  // config: Taro.Config | undefined = {
  //   navigationBarTitleText: '门店二维码'
  // }

  constructor(props) {
    super(props)
    this.state = {
      url: getTaroParams(Taro.getCurrentInstance?.()).url
    }
  }

  onClearClick = () => {
    this.setState({
      url: ''
    })
    Taro.eventCenter.trigger('WX_CODE_URL_CLEAR')
    Taro.navigateBack()
  }

  onUpdateClick = () => {
    this.onChooseImage()
  }

  onChooseImage = () => {
    Taro.showActionSheet({
      itemList: ['从相册选取'],
      success: res => {
        Taro.chooseImage({
          count: 1,
          success: res => {
            Taro.showLoading({ title: '上传中...' })
            uploadImage(res.tempFilePaths[0])
              .then(({ data }) => {
                Taro.hideLoading()
                const _data = JSON.parse(data)
                this.setState({
                  url: _data.data.org[0]
                })
                Taro.eventCenter.trigger('WX_CODE_URL', _data.data.org[0])
              })
              .catch(e => {
                Taro.hideLoading()
                myLog.log(`上传图片失败${e}`)
              })
          },
          fail: () => {
            Taro.hideLoading()
          }
        })
      }
    })
  }

  render() {
    const { url } = this.state
    return (
      <View className='shop_wx_code'>
        <Image src={url} className='code_view' mode='aspectFill' />
        <View className='action_view'>
          <View className='action_view__left' onClick={this.onClearClick}>
            删除
          </View>
          <View className='action_view__right' onClick={this.onUpdateClick}>
            修改
          </View>
        </View>
      </View>
    )
  }
}
