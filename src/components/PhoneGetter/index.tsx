import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import React, { ComponentClass } from 'react'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { Button, View } from '@tarojs/components'
import { SlideDirection } from '@components/SlideContainer/type'
import myLog from '@utils/myLog'
import styles from './index.module.scss'

interface OwnProps {
  visible: boolean
  // onGetPhoneNumber(e): void
  onRequestClose?(): void
  desc?: string
  onGetPhone?(encryptedData: string, iv: string): void
  onGetUserInfo?(): void
}

const mapStateToProp = ({ user }: GlobalState) => {
  return {
    logining: user.logining,
    nickName: user.nickName,
    phone: user.phone,
    sessionId: user.sessionId
  }
}

type StateProps = ReturnType<typeof mapStateToProp>

type Props = StateProps & OwnProps & DefaultDispatchProps
// @connect<StateProps, DefaultDispatchProps, OwnProps>(mapStateToProp)
class PhoneGetter extends React.PureComponent<Props> {
  // componentDidUpdate(prevProps: Readonly<Props>) {
  // if (this)
  // }

  onGetPhoneNumber = e => {
    const { onGetPhone } = this.props
    if (e.detail.errMsg.includes('ok')) {
      Taro.showLoading()
      const { encryptedData, iv, code } = e.detail
      if (onGetPhone) {
        Taro.hideLoading()
        return onGetPhone(encryptedData, iv)
      }
      this.props.dispatch({
        type: 'user/verifyPhone',
        payload: { encryptedData, iv, wechat: true, code }
      })
    } else {
      myLog.log(`getPhoneNumber fail: ${e.detail.errMsg}`)
    }
  }

  onGetUserInfo = e => {
    if (this.props.sessionId) return
    const { iv, encryptedData } = e.detail
    if (iv && encryptedData) {
      Taro.showLoading({ title: '登录中...' })
      this.props.dispatch({ type: 'user/login' }).then(() => {
        Taro.hideLoading()
      })
    }
  }

  onUpdateWXInfo = () => {
    if (this.props.nickName) return
    // eslint-disable-next-line no-undef
    wx.getUserProfile({
      desc: '用于完善个人资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: res => {
        Taro.showLoading({ title: '正在更新信息...' })
        const { nickName, avatarUrl } = res.userInfo
        this.props
          .dispatch({
            type: 'user/updateNickNameAndAvatar',
            payload: {
              nickName,
              headimgurl: avatarUrl
            }
          })
          .then(() => {
            this.props.onGetUserInfo && this.props.onGetUserInfo()
            Taro.hideLoading()
          })
          .catch(() => {
            Taro.hideLoading()
          })
      }
    })
  }

  render() {
    let { desc, nickName } = this.props
    let title = '授权手机号'
    let btn = '去授权'
    if (!nickName) {
      title = '请先登录'
      btn = '去登录'
    } else if (!this.props.phone) {
      title = '授权手机号'
      btn = '去授权'
    }
    return (
      <SlideContainer
        visible={this.props.visible}
        direction={SlideDirection.Center}
        containerClass='bg_trans'
        onRequestClose={this.props.onRequestClose}
      >
        <View className={styles.phone_getter}>
          <View>
            <View className={styles.phone_getter__title}>{title}</View>
            <View>{desc}</View>
          </View>

          <Button
            className={styles.phone_getter__button}
            openType={!nickName ? undefined : 'getPhoneNumber'}
            onGetPhoneNumber={this.onGetPhoneNumber}
            onGetUserInfo={this.onGetUserInfo}
            onClick={this.onUpdateWXInfo}
          >
            {btn}
          </Button>
        </View>
      </SlideContainer>
    )
  }
}

export default connect<StateProps, DefaultDispatchProps, OwnProps>(mapStateToProp)(PhoneGetter as ComponentClass<OwnProps>
  )