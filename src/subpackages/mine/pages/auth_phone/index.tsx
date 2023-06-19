import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text, Button } from '@tarojs/components'
import images from '@config/images'
import dva from '@utils/dva'
import { getTaroParams } from '@utils/utils'
import messageFeedback from '@services/interactive'
import { connect } from 'react-redux'
import styles from './index.module.scss'

// const texts = [
//   { title: t('selectPhone'), sub: t('bindPhoneTip') },
//   { title: t('verifyPhone'), sub: t('bindPhoneTip') }
// ]

const mapStateToProps = ({ user }: GlobalState) => ({
  phoneList: user.phoneList,
  userPhone: user.phone
})

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  phone: string
  code: string
}

// @connect<StateProps, {}, DefaultDispatchProps>(mapStateToProps)
class AuthUserPhone extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationBarTitleText: ''
  // }
  timer: NodeJS.Timeout | null = null

  from = 'normal'
  mpErpId = ''

  componentDidMount() {
    const { mpErpId } = getTaroParams(Taro.getCurrentInstance?.())
    console.log(getTaroParams(Taro.getCurrentInstance?.()))
    // if (res.result === 1) {
    this.mpErpId = mpErpId
    Taro.eventCenter.on('FETCH_USER_DATA', this.checkShopAuth)
  }

  componentWillUnmount() {
    Taro.eventCenter.off('FETCH_USER_DATA')
  }

  checkShopAuth = () => {
    const user = dva.getState().user
    console.log('userPhone' + JSON.stringify(user.phone))
    if (user.phone) {
      this.onBindSuccess()
    }
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

  onBindSuccess = () => {
    this.props
      .dispatch({
        type: 'user/authShopStaff',
        payload: { mpErpId: this.mpErpId }
      })
      .then(() => {
        // messageFeedback.showToast('手机号绑定成功')
        messageFeedback.showToast('授权成功')
      })
      .catch(() => {
        messageFeedback.showToast('授权成功')
      })
  }

  render() {
    return (
      <View className={styles.container}>
        <Image src={images.common.icon_authBg} style={{ width: '100%' }} />
        <View className={styles.contentView}>
          <View className={styles.infoContent}>
            <View className={styles.topView}>
              <View className={styles.redPoint1} />
              <View className={styles.redPoint2} />
              <View className={styles.title}>可支持推送内容</View>
              <View className={styles.redPoint2} />
              <View className={styles.redPoint1} />
            </View>
            <View className={styles.itemView}>
              <View className={styles.itemContent}>
                <Image
                  src={images.common.icon_send}
                  style={{ width: '48px', height: '48px', marginRight: '30px' }}
                />
                <View className={styles.itemTitle}>单据开始配送提醒</View>
              </View>
            </View>
            <View className={styles.itemView}>
              <View className={styles.itemContent}>
                <Image
                  src={images.common.icon_deliver}
                  style={{ width: '48px', height: '48px', marginRight: '30px' }}
                />
                <View className={styles.itemTitle}>单据已送达提醒</View>
              </View>
            </View>
            <View className={styles.itemView}>
              <View className={styles.itemContent}>
                <Image
                  src={images.common.icon_cancel}
                  style={{ width: '48px', height: '48px', marginRight: '30px' }}
                />
                <View className={styles.itemTitle}>单据已撤销送达提醒</View>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.button}>
          <Button
            className={styles.phone_button}
            openType='getPhoneNumber'
            onGetPhoneNumber={this.onGetPhone}
            disabled={!!this.props.userPhone}
          >
            {this.props.userPhone ? '您已授权无需再授权' : '授权认证'}
          </Button>
        </View>
        <View className={styles.bottomTitle}>
          <Text>杭州衣科信息技术有限公司提供支持</Text>
        </View>
      </View>
    )
  }
}
export default connect<StateProps, {}, DefaultDispatchProps>(mapStateToProps)(AuthUserPhone)