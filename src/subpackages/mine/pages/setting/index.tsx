import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Switch, Text } from '@tarojs/components'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { connect } from 'react-redux'
import dict from '@constants/dict'
import styles from './setting.module.scss'

interface State {
  pushAll: boolean
}

const mapStateToProps = ({ user }: GlobalState) => ({
  pushAll: user.pushAll,
  bigFont: user.userParams.mp_ticket_bill_use_big_font === '1',
  pushLogis: user.userParams.mp_ticket_push_logis_msg === '1'
})

type StateProps = ReturnType<typeof mapStateToProps>
// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class Setting extends React.PureComponent<StateProps & DefaultDispatchProps> {
  // config = {
  //   navigationBarTitleText: '设置'
  // }

  onPushSwitchChange = ({ detail }) => {
    this.props.dispatch({
      type: 'user/updateUserParams',
      payload: { code: dict.mp_ticket_bill_push, value: detail.value ? '0' : '1' }
    })
  }

  onFontSwitchChange = ({ detail }) => {
    this.props.dispatch({
      type: 'user/updateUserParams',
      payload: { code: dict.mp_ticket_bill_use_big_font, value: detail.value ? '1' : '0' }
    })
  }

  onLogisSwitchChange = ({ detail }) => {
    this.props.dispatch({
      type: 'user/updateUserParams',
      payload: { code: dict.mp_ticket_push_logis_msg, value: detail.value ? '1' : '0' }
    })
  }

  render() {
    const { pushLogis, pushAll, bigFont } = this.props
    return (
      <View className={styles.container}>
        {/* <View className={styles.cell} onClick={this.onPushSettingClick}>
          <View>推送设置</View>
          <View className={styles.cell__right}>
            <Text>{pushAll ? '接受所有推送' : '相同单据只接受一次'}</Text>
            <Image src={angleRight} className={styles.cell__right_icon} />
          </View>
        </View> */}
        <View className={styles.cell}>
          <View>相同单据只推送一次</View>
          <Switch checked={!pushAll} onChange={this.onPushSwitchChange} />
        </View>
        <View className={styles.cell}>
          <View>单据详情大字体</View>
          <Switch checked={bigFont} onChange={this.onFontSwitchChange} />
        </View>
        <View className={styles.cell}>
          <View>推送物流信息</View>
          <Switch checked={pushLogis} onChange={this.onLogisSwitchChange} />
        </View>
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(Setting)