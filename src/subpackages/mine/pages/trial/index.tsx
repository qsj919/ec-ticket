import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Image, Button, Input } from '@tarojs/components'
import { connect } from 'react-redux'
import { GlobalState } from '@@types/model_state'
import styles from './index.module.scss'

type PropsType = {}
type StateType = {
  phoneMode: boolean
  phone: string
}

const mapStateToProp = ({ user }: GlobalState) => ({
  logining: user.logining,
  sessionId: user.sessionId,
  mpAppId: user.mpAppId
})

type StateProps = ReturnType<typeof mapStateToProp>

// @connect<StateProps>(mapStateToProp)
class Index extends Component<PropsType & StateProps, StateType> {
  // config = {
  //   navigationBarTitleText: '电子小票'
  // }

  state = {
    phoneMode: false,
    phone: ''
  }

  onGetUserInfo = e => {
    if (this.props.sessionId) return
    const { iv, encryptedData } = e.detail
    if (iv && encryptedData) {
      Taro.showLoading({ title: '登录中...' })
      this.props.dispatch({ type: 'user/login' }).then(() => {
        Taro.hideLoading()
        Taro.switchTab({ url: '/pages/eTicketList/index' })
      })
    }
  }

  onButtonLongPress = () => {
    this.setState({ phoneMode: true })
  }

  onInput = e => {
    this.setState({ phone: e.detail.value })
  }

  onPhoneConfirm = () => {
    this.props.dispatch({ type: 'user/login', payload: { phone: this.state.phone } })
  }

  render() {
    // const { logi } = this.props
    const { phoneMode, phone } = this.state
    return (
      <View className={styles.check}>
        <View>审核人员入口</View>
        <View style={{ margin: '20rpx 0' }}>如果你是审核人员，请在下方输入测试手机号码</View>
        <View className='aic  '>
          <Input
            className={styles.input}
            type='number'
            onConfirm={this.onPhoneConfirm}
            value={phone}
            onInput={this.onInput}
            placeholder='输入手机号'
          />
          <View onClick={this.onPhoneConfirm}>确定</View>
        </View>
      </View>
    )
  }
}
export default connect<StateProps>(mapStateToProp)(Index)