import Taro from '@tarojs/taro'
import React from 'react'
import { View, Button, Text } from '@tarojs/components'
import dva from '@utils/dva'
import { orderApiInvoke } from '@api/live_api_manager'
import { connect } from 'react-redux'
import { GlobalState } from '@@types/model_state'
import messageFeedback from '@services/interactive'

const mapStateToProp = ({ user }: GlobalState) => {
  return {
    sessionId: user.sessionId
  }
}

type StateProps = ReturnType<typeof mapStateToProp>
// @connect<StateProps, {}>(mapStateToProp)
class CheckBeforeOrder extends React.Component<StateProps, {}> {
  componentDidMount() {
    if (this.props.sessionId) {
      this.init()
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.sessionId && !prevProps.sessionId) {
      this.init()
    }
  }

  init = () => {
    const options = Taro.getLaunchOptionsSync()
    const { independentMpErpId, wxOpenId } = dva.getState().user
    console.log(options.scene, '独立部署：scene', independentMpErpId)

    // eslint-disable-next-line
    if (!wx.checkBeforeAddOrder) {
      messageFeedback.showAlert('微信版本过低，请升级微信至8.0.19及以上')
    }
    if (options.scene === 1037 && independentMpErpId) {
      Taro.showLoading({ title: '请稍等...' })
      // eslint-disable-next-line
      wx.checkBeforeAddOrder({
        success: res => {
          console.log(res.data.traceId, 'traceId')
          orderApiInvoke({
            mpErpId: independentMpErpId,
            traceId: res.data.traceId,
            openId: wxOpenId
          }).then(({ data }) => {
            console.log(data, '支付参数')
            // eslint-disable-next-line
            wx.requestOrderPayment({
              timeStamp: data.timeStamp.toString(),
              nonceStr: data.nonceStr,
              package: data.packageStr,
              signType: data.signType,
              paySign: data.paySign,
              success(res) {
                Taro.hideLoading()
                // eslint-disable-next-line
                wx.navigateBackMiniProgram()
              },
              fail(res) {
                console.log(res, '支付异常')
                Taro.hideLoading()
              }
            })
          })
        }
      })
    }
  }

  render() {
    return <View></View>
  }
}
export default connect<StateProps, {}>(mapStateToProp)(CheckBeforeOrder)