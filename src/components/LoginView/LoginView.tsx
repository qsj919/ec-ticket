import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import LoginBg from '@/images/login_bg.png'
import TicketLoginBg from '@/images/ticket_login_bg.png'
import dva from '@utils/dva'
import WechatLogo from '@/images/share_weChat.png'
import cn from 'classnames'
import myLog from '@utils/myLog'
import { compareVersion } from '@utils/utils'
import { ScanError } from '@@types/base'
import './LoginView.scss'

type OwnProps = {
  mpErpId?: number
  scanError: number
  notStickyTop?: boolean
  fromTicket?: boolean
  phone?: string | number
  needPhone?: boolean
  onSuccess?(): void
  title?: string
  tips?: string
  buttonTip: string
}

interface State {
  isNeedLogin: boolean
}

export default class LoginView extends React.Component<OwnProps, State> {
  static defaultProps = {
    notStickyTop: false,
    fromTicket: false
  }

  state = {
    isNeedLogin: false
  }

  componentDidShow() {
    this.initScanerror()
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.scanError !== this.props.scanError ||
      prevState.isNeedLogin !== this.state.isNeedLogin
    ) {
      this.initScanerror()
    }
  }

  initScanerror = () => {
    // console.log(
    //   'inintScann',
    //   `s=${this.props.scanError}; needPhone=${this.props.needPhone} ; !phone=${!this.props.phone}`
    // )
    switch (this.props.scanError) {
      case 2:
      case 4:
      case 6:
      // 需要登陆  获取昵称
      case 5:
        this.setState({ isNeedLogin: true })
        break
      default:
        if (
          (process.env.INDEPENDENT === 'independent' ||
            process.env.INDEPENDENT === 'foodindependent') &&
          this.props.needPhone &&
          !this.props.phone
        ) {
          this.setState({ isNeedLogin: true })
        } else {
          this.props.onSuccess && this.props.onSuccess()
          this.setState({ isNeedLogin: false })
        }
    }
  }

  onGetUserInfoClick = () => {
    const currentVersion = Taro.getSystemInfoSync().SDKVersion || '1.1.0'

    // 大于2.27.1的基本库 getUserProfile会返回“微信用户”
    const forceUpdate = compareVersion(currentVersion, '2.27.1') < 0
    // if (this.props.scanError === ScanError.NONE_PHONE || this.props.phone) return
    // eslint-disable-next-line no-undef
    wx.getUserProfile({
      desc: '用于完善个人资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: res => {
        // Taro.showLoading({ title: '正在更新信息...' })
        const { nickName, avatarUrl } = res.userInfo
        dva
          .getDispatch()({
            type: 'user/updateNickNameAndAvatar',
            payload: {
              nickName,
              headimgurl: avatarUrl,
              forceUpdate
            }
          })
          .then(() => {
            // this.setState({ isNeedLogin: false })
            // this.onGetUserInfo()
            // Taro.hideLoading()
          })
          .catch(() => {
            // Taro.hideLoading()
          })
      }
    })
  }

  onGetUserInfo = () => {
    const { mpErpId, fromTicket } = this.props
    if (fromTicket) {
      dva.getDispatch()({
        type: 'user/fetchGrayFunc'
      })
    } else {
      if (mpErpId) {
        dva.getDispatch()({
          type: 'cloudBill/fetchVideoPageDataByMpErpId',
          payload: { mpErpId }
        })
      }
    }
  }

  onGetPhoneNumber = e => {
    const { mpErpId, fromTicket } = this.props
    const { encryptedData, iv, code } = e.detail
    if (e.detail.errMsg.includes('ok')) {
      dva
        .getDispatch()({
          type: 'user/verifyPhone',
          payload: { encryptedData, iv, wechat: true, code, needRedirect: true }
        })
        .then(() => {
          dva
            .getDispatch()({ type: 'user/login', payload: { refreshSessionOnly: true } })
            .then(() => {
              // 给了昵称，没给手机号，scanError是3. 这时候绑定手机号后 isNeedLogin 设为false
              if (this.props.scanError === 3) {
                this.setState({ isNeedLogin: false })
                this.props.onSuccess && this.props.onSuccess()
              }
              if (fromTicket) {
                dva.getDispatch()({
                  type: 'user/fetchGrayFunc'
                })
              } else {
                if (mpErpId) {
                  dva.getDispatch()({
                    type: 'cloudBill/fetchVideoPageDataByMpErpId',
                    payload: { encryptedData, iv, mpErpId }
                  })
                }
              }
            })
        })
    } else {
      this.setState({ isNeedLogin: false })
      this.onGetUserInfo()
      myLog.log(`getPhoneNumber fail: ${e.detail.errMsg}`)
    }
  }

  render() {
    const { scanError, notStickyTop, fromTicket, phone, title, tips, buttonTip } = this.props
    const { isNeedLogin } = this.state
    return (
      <View>
        {isNeedLogin && (
          <View
            className={cn('login_page__warpper', {
              ['not_sticky_top']: notStickyTop
            })}
          >
            <View className='login_page__warpper__header'>
              <Text>欢迎使用</Text>
              <Text style={{ marginLeft: '10px', fontWeight: 500 }}>
                {title ? title : fromTicket ? '商陆花电子小票' : '商陆花云单'}
              </Text>
            </View>
            <View className='login_page__warpper__label'>
              {tips ? tips : fromTicket ? '为了您的数据安全，请登录后查看小票' : '在线看款更方便'}
            </View>
            <Image
              src={fromTicket ? TicketLoginBg : LoginBg}
              className='login_page__warpper__content_bg'
            />
            <View className='login_page__warpper__login_label'>
              {buttonTip ? buttonTip : !fromTicket ? '登录后查看精彩内容' : ''}
            </View>
            <Button
              className='login_page__warpper__login_btn'
              onClick={this.onGetUserInfoClick}
              onGetPhoneNumber={this.onGetPhoneNumber}
              openType={
                scanError === ScanError.NONE_PHONE ||
                scanError === ScanError.NONE_NICKNAME_AND_PHONE ||
                scanError === ScanError.NONE_USER ||
                !phone
                  ? 'getPhoneNumber'
                  : undefined
              }
            >
              <Image src={WechatLogo} className='wechat_logo' />
              微信一键登录
            </Button>
          </View>
        )}
      </View>
    )
  }
}
