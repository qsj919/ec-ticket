/**
 * @Author: Miao Yunliang
 * @Date: 2019-11-26 13:42:15
 * @Desc: 绑定手机号 推送海报页
 */
import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Input } from '@tarojs/components'
import bg from '@/images/bind_phone_poster.png'
import { isChinaPhoneNumber } from '@utils/utils'
import { GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import navigatorSvc from '@services/navigator'
import styles from './bind_phone_poster.module.scss'

const mapStateToProps = ({ user }: GlobalState) => ({
  userMobile: user.phone,
  userLoaded: user.id !== -1
})

interface State {
  phone: string
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect(mapStateToProps)
class BindPhonePoster extends React.PureComponent<StateProps, State> {
  componentDidUpdate() {
    if (this.props.userMobile !== '') {
      navigatorSvc.switchTab({ url: '/pages/mine/index' })
    }
  }

  state = {
    phone: ''
  }

  onInput = ({ detail }) => {
    this.setState({ phone: detail.value })
  }

  onBtnClick = () => {
    const { phone } = this.state
    if (isChinaPhoneNumber(this.state.phone)) {
      navigatorSvc.navigateTo({ url: `/subpackages/mine/pages/bind_phone/index?phone=${phone}` })
    } else {
      Taro.showToast({ icon: 'none', title: '请输入正确的手机号' })
    }
  }

  onFocus = () => {
    // 让输入框浮起
    // 为什么是taro-tabbar__panel呢？ 猜测和taro框架设置了各种height: 100%有关系
    // document.body / document.scrollingElement 的scrollTo均不起作用
    const el = document.querySelector('.taro-tabbar__panel')
    setTimeout(() => {
      el && el.scrollTo(0, 1000)
    }, 400)
  }

  render() {
    const { userLoaded, userMobile } = this.props
    return userLoaded && userMobile === '' ? (
      <View className={styles.container}>
        <Image src={bg} className={styles.img} />
        <View className={styles.user_interface}>
          <View className={styles.input_wrapper}>
            <Input
              onClick={this.onFocus}
              placeholder='需与在店铺处所留手机一致'
              onInput={this.onInput}
              type='number'
              maxLength={11}
              // onFocus={this.onFocus}
            />
          </View>
          <View className={styles.bind_btn} onClick={this.onBtnClick}>
            立即绑定
          </View>
        </View>
      </View>
    ) : (
      <View />
    )
    // sb taro ,return null会报错
  }
}
export default connect(mapStateToProps)(BindPhonePoster)