import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Input, Text, Button } from '@tarojs/components'
import EButton from '@components/Button/EButton'
import { isChinaPhoneNumber, hidePhoneNumber, getTaroParams } from '@utils/utils'

import classNames from 'classnames'
import mobile from '@/images/mobile_32.png'
import pwd from '@/images/passwd_32.png'
import { sendSmsCode } from '@api/apiManage'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { t } from '@models/language'
import { connect } from 'react-redux'
import messageFeedback from '@services/interactive'
import styles from './index.module.scss'

const COUNT_DOWN_DURATION = 60

const texts = [
  { title: t('selectPhone'), sub: t('bindPhoneTip') },
  { title: t('verifyPhone'), sub: t('bindPhoneTip') }
]

enum Step {
  None = -1,
  PhoneList = 0,
  Inputs
}

const mapStateToProps = ({ user, language }: GlobalState) => ({
  phoneList: user.phoneList
})

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  errorMessage: string
  countDownNumber: number
  phone: string
  code: string
  disableCodeInput: boolean
  disablePhoneInput: boolean
  codeIpnutFocus: boolean
  step: Step
}

// @connect<StateProps, {}, DefaultDispatchProps>(mapStateToProps)
class BindPhone extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationBarTitleText: '验证手机号'
  // }
  timer: NodeJS.Timeout | null = null

  from = 'normal'

  state = {
    countDownNumber: 0,
    errorMessage: '',
    phone: '',
    code: '',
    disableCodeInput: true,
    disablePhoneInput: false,
    codeIpnutFocus: false,
    step: Step.None
  }

  componentDidMount() {
    const { phoneList } = this.props
    const { phone, from } = getTaroParams(Taro.getCurrentInstance?.())
    this.from = from
    if (from === 'search') {
      messageFeedback.showToast('请先绑定手机', 1000)
    }
    if (phone) {
      this.setState({ phone, step: Step.Inputs }, this.onGetCodeClick)
      return
    }
    if (phoneList && phoneList.length > 0) {
      this.setState({ step: Step.PhoneList })
    } else {
      this.setState({ step: Step.Inputs })
    }
  }

  componentWillUnmount() {
    this.stopCountDown()
  }

  onPhoneInput = e => {
    this.setState({ phone: e.detail.value, errorMessage: '' })
  }

  validatePhone = () => {
    return isChinaPhoneNumber(this.state.phone)
  }

  onPhoneBlur = () => {
    if (!this.validatePhone()) {
      this.setState({ errorMessage: t('inputCorrectPhone') })
    }
  }

  onCodeInput = e => {
    this.setState({ code: e.detail.value })
  }

  onGetCodeClick = () => {
    if (this.state.countDownNumber !== 0) return
    if (!this.validatePhone()) return
    this.setState({ disableCodeInput: false, codeIpnutFocus: true }, () => {
      // 设为false的原因是在倒计时时，点击手机号input ，code input又会聚焦
      this.setState({ codeIpnutFocus: false })
    })
    Taro.showLoading()
    sendSmsCode(this.state.phone).then(() => {
      Taro.showToast({ title: t('smsSent'), duration: 1000, icon: 'none' })
      this.countDown()
    })
  }

  countDown = () => {
    this.stopCountDown()
    this.setState({ countDownNumber: COUNT_DOWN_DURATION })
    this.timer = setInterval(() => {
      if (this.state.countDownNumber === 0) {
        return this.stopCountDown()
      }
      this.setState(state => ({ countDownNumber: state.countDownNumber - 1 }))
    }, 1000)
  }

  stopCountDown = () => {
    this.setState({ countDownNumber: 0 })
    this.timer && clearInterval(this.timer)
  }

  onPhoneClick = (phone?: string) => {
    if (phone) {
      this.setState({ phone, disablePhoneInput: true, code: '' })
    } else {
      this.stopCountDown()
    }
    this.setState({ step: Step.Inputs, code: '' })
  }

  onBackClick = () => {
    this.setState({ disablePhoneInput: false, step: Step.PhoneList, phone: '' })
  }

  onBtnClick = () => {
    const { phone, code } = this.state
    Taro.showLoading({ title: '加载中' })
    this.props
      .dispatch({
        type: 'user/verifyPhone',
        payload: { phone, captcha: code, from: this.from }
      })
      .then(this.onBindSuccess)
  }

  onGetPhone = e => {
    if (e.detail.errMsg.includes('ok')) {
      const { encryptedData, iv, code } = e.detail
      this.props
        .dispatch({
          type: 'user/verifyPhone',
          payload: { encryptedData, iv, from: this.from, wechat: true, code }
        })
        .then(this.onBindSuccess)
    }
  }

  onBindSuccess = (success: boolean) => {
    if (success) {
      Taro.navigateBack()
      messageFeedback.showToast('手机号绑定成功')
    }
  }

  renderPhoneList = () => {
    const { phoneList } = this.props
    return (
      <View className={styles.phones}>
        {phoneList.map(phone => (
          <View
            className={styles.phones__phone}
            key={phone}
            onClick={() => this.onPhoneClick(phone)}
          >
            <Text className={styles.phones__phone__text}>{hidePhoneNumber(phone)}</Text>
          </View>
        ))}
        <View className={styles.phones__phone} onClick={() => this.onPhoneClick('')}>
          <Text className={styles.phones__phone__text}>{t('otherPhone')}</Text>
        </View>
      </View>
    )
  }

  renderInputs = () => {
    const {
      countDownNumber,
      disableCodeInput,
      disablePhoneInput,
      phone,
      code,
      codeIpnutFocus
    } = this.state
    const phoneValue = disablePhoneInput ? hidePhoneNumber(phone) : phone
    return (
      <View className={styles.inputs}>
        <View className={styles.input}>
          <Image className={styles.input__icon} src={mobile} />
          <Input
            type={disablePhoneInput ? 'text' : 'number'}
            value={phoneValue}
            maxLength={11}
            className={styles.input__input}
            placeholder={t('inputPhone')}
            onInput={this.onPhoneInput}
            onBlur={this.onPhoneBlur}
            disabled={disablePhoneInput}
          />
          {disablePhoneInput && (
            <Text
              className={classNames(styles.input__code, styles['input__code--active'])}
              onClick={this.onBackClick}
            >
              {t('reselect')}
            </Text>
          )}
        </View>
        <View className={styles.input}>
          <Image className={styles.input__icon} src={pwd} />
          <Input
            type='number'
            disabled={disableCodeInput}
            onInput={this.onCodeInput}
            className={styles.input__input}
            placeholder={t('inputCode')}
            focus={codeIpnutFocus}
            value={code}
          />
          <Text
            className={classNames(styles.input__code, {
              [styles['input__code--wait']]: countDownNumber !== 0,
              [styles['input__code--active']]: phone.length === 11
            })}
            onClick={this.onGetCodeClick}
          >
            {countDownNumber === 0 ? t('fetchCode') : `${countDownNumber}s`}
          </Text>
        </View>
      </View>
    )
  }

  render() {
    const { errorMessage, code, step } = this.state
    // const { t } = this.props
    return (
      step !== Step.None && (
        <View className={styles.container}>
          <View className={styles.title}>{texts[step].title}</View>
          <View className={styles.sub_title}>{texts[step].sub}</View>
          {/* <View className={styles.tips__back}><Text>返回上一步</Text></View> */}
          <View>
            {step === Step.PhoneList && this.renderPhoneList()}
            {step === Step.Inputs && this.renderInputs()}
          </View>
          <View className={styles.tips}>
            <View className={styles.tips__error}>{errorMessage}</View>
          </View>
          {step === Step.Inputs && (
            <View className={styles.button}>
              <View style={{ flex: 1 }}>
                <EButton
                  label={t('confirm')}
                  size='large'
                  disabled={code.length === 0}
                  onButtonClick={this.onBtnClick}
                  buttonClass={styles.confirm_button}
                />
              </View>
              <Button
                className={styles.phone_button}
                openType='getPhoneNumber'
                onGetPhoneNumber={this.onGetPhone}
              >
                微信获取
              </Button>
            </View>
          )}
        </View>
      )
    )
  }
}
export default connect<StateProps, {}, DefaultDispatchProps>(mapStateToProps)(BindPhone)