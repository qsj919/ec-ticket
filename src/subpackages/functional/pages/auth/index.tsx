import Taro from '@tarojs/taro'
import React from 'react'
import { View, Canvas, Text } from '@tarojs/components'
import navigatorSvc from '@services/navigator'
import drawQrcode from 'weapp-qrcode'
import { AtIcon } from 'taro-ui'
import { connect } from 'react-redux'
import config from '@config/config'
import EmptyView from '@components/EmptyView'
import { GlobalState } from '@@types/model_state'
import noShopImg from '../../images/no_shop.png'
// import dayjs from 'dayjs'

import styles from './auth.module.scss'

const mapStateToProps = ({ user, shop }: GlobalState) => ({
  mpUserId: user.mpUserId,
  haveAtLeastOneShop: shop.list.length > 0
})

type StateProps = ReturnType<typeof mapStateToProps>

// @connect(mapStateToProps)
class Auth extends React.PureComponent<StateProps> {
  // config = {
  //   navigationBarTitleText: '授权管理'
  // }

  emptyInfo = {
    label: '尚未关联任何店铺，快去扫码关联吧～',
    image: noShopImg
  }

  scale: number = 1

  timer: NodeJS.Timeout

  onCheckAuth = () => {
    navigatorSvc.navigateTo({ url: '/subpackages/functional/pages/auth_history/index' })
  }

  componentDidMount() {
    const { windowWidth } = Taro.getSystemInfoSync()
    this.scale = windowWidth / 750
    this.drawQr()
    this.startCountDown()
  }

  componentWillUnmount() {
    this.clearTimer()
  }

  drawQr = () => {
    const date = Date.now()
    const { mpUserId } = this.props
    const text = `${config.authQrUrlPrefix}mpUserId=${mpUserId}&timestamp=${date}&from=auth`
    drawQrcode({
      width: 480 * this.scale,
      height: 480 * this.scale,
      canvasId: 'qr',
      _this: Taro.getCurrentInstance().page as any,
      // text: `https://slbtest.hzdlsoft.com/weapp/auth_history?mpUserId=209&timestamp=1587004200000&from=auth`,
      text,
      correctLevel: 0
    })
  }

  startCountDown = () => {
    this.clearTimer()
    this.timer = setInterval(() => {
      this.drawQr()
    }, 3 * 60 * 1000)
  }

  clearTimer = () => {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  onUpdateQrClick = () => {
    this.drawQr()
    this.startCountDown()
  }

  render() {
    const { haveAtLeastOneShop } = this.props
    return haveAtLeastOneShop ? (
      <View className={styles.page}>
        <View className={styles.container}>
          <View className={styles.title}>扫码进行授权</View>
          <View className={styles.warn}>授权后对方可以查看您的所有单据</View>
          <Canvas canvasId='qr' className={styles.qr} />
          <View className={styles.tips} onClick={this.onUpdateQrClick}>
            <AtIcon value='reload' size={15}></AtIcon>
            <View className={styles.tips__text}>二维码每3分钟自动更新</View>
          </View>
          <View className={styles.history} onClick={this.onCheckAuth}>
            查看授权用户
          </View>
        </View>
      </View>
    ) : (
      <EmptyView emptyInfo={this.emptyInfo} />
    )
  }
}
export default connect(mapStateToProps)(Auth)