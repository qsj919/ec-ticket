import Taro from '@tarojs/taro'
import React from 'react';
import { View, Image, Text, Input } from '@tarojs/components'
import { connect } from 'react-redux'
import mobile from '@/images/mobile_32.png'
import pwd from '@/images/passwd_32.png'
import { t } from '@models/language'
import EButton from '@components/Button/EButton'
import { isChinaPhoneNumber } from '@utils/utils'
import { DefaultDispatchProps } from '@@types/model_state'
import config from '../../config/config'

import styles from './login.module.scss'

interface State {
  phone: string
  code: string
  errorMessage: string
}

// @connect<{}, {}, DefaultDispatchProps>(() => ({}))
class Login extends React.PureComponent<DefaultDispatchProps, State> {
  config = {
    navigationBarTitleText: '登录'
  }

  state = {
    phone: '',
    code: '',
    errorMessage: ''
  }

  componentDidShow() {
    Taro.hideHomeButton()
  }

  onPhoneInput = e => {
    this.setState({ phone: e.detail.value, errorMessage: '' })
  }

  onCodeInput = e => {
    this.setState({ code: e.detail.value })
  }

  validatePhone = () => {
    return isChinaPhoneNumber(this.state.phone)
  }

  onPhoneBlur = () => {
    if (!this.validatePhone()) {
      this.setState({ errorMessage: t('inputCorrectPhone') })
    }
  }

  onBtnClick = () => {
    const { phone, code } = this.state
    const _phone = process.env.PRODUCT_ENVIRONMENT === 'product' ? '18968979900' : '18812345678'
    if (phone === _phone && code === '628991') {
      Taro.showLoading({ title: '登录中...' })
      this.props.dispatch({ type: 'user/login', payload: { phone } })
    } else {
      this.setState({
        errorMessage: `请输入正确的账号/密码，推荐您关注${config.wxPublicName}，畅享免密登录`
      })
    }
  }

  renderInputs = () => {
    const {
      // countDownNumber,
      // disableCodeInput,
      // disablePhoneInput,
      phone,
      code
      // codeIpnutFocus
    } = this.state
    // const phoneValue = disablePhoneInput ? hidePhoneNumber(phone) : phone
    return (
      <View className={styles.inputs}>
        <View className={styles.input}>
          <Image className={styles.input__icon} src={mobile} />
          <Input
            type='number'
            value={phone}
            maxLength={11}
            className={styles.input__input}
            placeholder={t('inputPhone')}
            onInput={this.onPhoneInput}
            onBlur={this.onPhoneBlur}
            // disabled={disablePhoneInput}
          />
        </View>
        <View className={styles.input}>
          <Image className={styles.input__icon} src={pwd} />
          <Input
            type='number'
            // disabled={disableCodeInput}
            onInput={this.onCodeInput}
            className={styles.input__input}
            placeholder='请输入密码'
            // focus={codeIpnutFocus}
            value={code}
          />
          {/* <Text
            className={classNames(styles.input__code, {
              [styles['input__code--wait']]: countDownNumber !== 0,
              [styles['input__code--active']]: phone.length === 11
            })}
            onClick={this.onGetCodeClick}
          >
            {countDownNumber === 0 ? t('fetchCode') : `${countDownNumber}s`}
          </Text> */}
        </View>
      </View>
    )
  }

  render() {
    const { wxPublicName } = config
    const { errorMessage } = this.state
    return (
      <View className={styles.container}>
        <View className={styles.title}>请登录</View>
        <View className={styles.sub_title}>
          <View>请确保您已经从您的商家获取了小票二维码</View>
          <Text>{`关注${wxPublicName}公众号可以获得后续小票推送`}</Text>
        </View>

        <View>{this.renderInputs()}</View>
        <View className={styles.tips}>
          <View className={styles.tips__error}>{errorMessage}</View>
        </View>
        <View className={styles.button}>
          <EButton label={t('confirm')} size='large' onButtonClick={this.onBtnClick} />
        </View>
      </View>
    )
  }
}
export default connect<{}, {}, DefaultDispatchProps>(() => ({}))(Login)