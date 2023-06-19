import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Input, Block } from '@tarojs/components'
import CustomNavigation from '@components/CustomNavigation'
import HeaderBg from '@@/assets/images/open_shop_top.png'
import cn from 'classnames'
import RecordSuccess from '@@/assets/images/record_success.png'
import { createRecord } from '@api/apiManage'
import { storage } from '@constants/index'
import { getOneDate, daysDiff } from '@utils/utils'
import './index.scss'

interface State {
  shopName: string
  name: string
  mobile: string
  success: boolean
}

export default class OpenShop extends React.Component<{}, State> {
  state = {
    shopName: '',
    name: '',
    mobile: '',
    success: false
  }

  config?: Taro.Config | undefined = {
    navigationStyle: 'custom'
  }

  componentDidMount() {
    Taro.getStorage({ key: storage.OPEN_SHOP_TIME })
      .then(({ data }) => {
        console.log(data)
        this.setState({
          success: daysDiff(data) <= 3
        })
      })
      .catch(err => {})
  }

  onShopNameInput = e => {
    this.setState({
      shopName: e.detail.value
    })
  }
  onNameInput = e => {
    this.setState({
      name: e.detail.value
    })
  }
  onMobileInput = e => {
    this.setState({
      mobile: e.detail.value
    })
  }

  canSave = () => {
    const { shopName, name, mobile } = this.state

    return shopName && name && mobile
  }

  save = () => {
    if (this.state.success) {
      Taro.navigateBack()
      return
    }
    if (this.canSave()) {
      const { shopName, name, mobile } = this.state
      Taro.showLoading({
        title: '请稍等...'
      })
      createRecord({
        shopName,
        userName: name,
        phone: mobile,
        saasProductType: 40
      })
        .then(() => {
          Taro.hideLoading()
          Taro.setStorage({
            key: storage.OPEN_SHOP_TIME,
            data: getOneDate()
          })
          this.setState({
            success: true
          })
        })
        .catch(() => {
          Taro.hideLoading()
        })
    }
  }

  render() {
    const { shopName, name, mobile, success } = this.state
    const _canSave = this.canSave()
    return (
      <CustomNavigation
        title='申请开店'
        stickyTop={false}
        navigationClass='navigationClass_openShop'
      >
        <Image src={HeaderBg} className='header_bg' mode='aspectFill' />
        <View className='open_shop_content'>
          {success ? (
            <View className='record_view'>
              <Image src={RecordSuccess} className='record_icon' />
              <View>恭喜您申请成功</View>
              <View>客户经理会在1-3个工作日联系您</View>
            </View>
          ) : (
            <Block>
              <View className='open_shop_content__label'>请填写档口名称</View>
              <Input
                className='open_shop_content__input'
                value={shopName}
                onInput={this.onShopNameInput}
              />
              <View className='open_shop_content__label'>请填写您的姓名</View>
              <Input className='open_shop_content__input' value={name} onInput={this.onNameInput} />
              <View className='open_shop_content__label'>请填写您的手机号码</View>
              <Input
                className='open_shop_content__input'
                value={mobile}
                onInput={this.onMobileInput}
              />
            </Block>
          )}
          <View style={{ flex: 1 }}></View>
          <View
            className={cn('open_shop_content__action', {
              ['open_shop_content__action-normal']: !_canSave,
              ['open_shop_content__action-cansave']: _canSave
            })}
            onClick={this.save}
          >
            {success ? '我知道了' : '立即申请'}
          </View>
        </View>
        <View className='banner_label'>由商陆花食品生鲜版提供技术支持</View>
      </CustomNavigation>
    )
  }
}
