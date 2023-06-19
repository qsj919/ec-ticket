import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import btnIcon from '@/images/special/confirm_btn.png'
import bg from '@/images/special/invite_page_bg.png'
import confirmIcon from '@/images/special/confirm.png'
import { ActiveItem } from '@@types/base'
import { admitOpenGoodsData, checkShopApplyNum } from '@api/shop_api_manager'
import ActiveNumber from '@components/ActiveNumber'
import DanMu from '@components/DanMu'
import { hidePhoneNumber, getTaroParams } from '@utils/utils'
import navigatorSvc from '@services/navigator'
import messageFeedback from '@services/interactive'
import styles from './index.module.scss'

interface State {
  options: ActiveItem[]
  appliers: string[]
}

export default class InviteOpen extends React.PureComponent<any, State> {
  state = {
    options: [
      {
        label: '开放1个月内的款号',
        value: 0
      },
      {
        label: '开放3个月内的款号',
        value: 1
      },
      {
        label: '开放6个月内的款号',
        value: 2
      },
      {
        label: '开放所有的款号',
        value: 3,
        active: true
      }
    ],
    appliers: []
  }

  mpErpId: string = ''

  UNSAFE_componentWillMount() {
    Taro.showLoading()
    this.mpErpId = getTaroParams(Taro.getCurrentInstance?.()).mpErpId
    checkShopApplyNum(this.mpErpId).then(({ data }) => {
      if (data.isOpen === 1) {
        navigatorSvc.redirectTo({ url: `/pages/shop/index?mpErpId=${this.mpErpId}&preview=1` })
        Taro.hideLoading()
        return
      }
      const appliers = data.users.map(item => {
        return `${item.city ? '来自' + item.city + '的' : ''}${item.nickName}${hidePhoneNumber(
          item.phone
        )}想访问您的店铺`
      })
      this.setState({ appliers })
      Taro.hideLoading()
    })
  }

  onCheckbokClick = (v: number) => {
    this.setState(state => ({
      options: state.options.map(item => ({ ...item, active: item.value === v }))
    }))
  }

  onConfirm = () => {
    const { options } = this.state
    const activeItem = options.find(item => item.active)
    const type = (activeItem && activeItem.value) || 3
    const mpErpId = Number(this.mpErpId)
    admitOpenGoodsData({ type, mpErpId }).then(() => {
      messageFeedback.showAlertWithCancel('是否前往预览您的店铺首页?', '开放成功', () =>
        navigatorSvc.redirectTo({ url: `/pages/shop/index?mpErpId=${this.mpErpId}&preview=1` })
      )
    })
  }

  render() {
    const { appliers } = this.state
    return (
      <View className={styles.container}>
        <Image className={styles.bg} src={bg} />
        <View className={styles.danmu_c}>
          <DanMu data={appliers} />
        </View>
        <View className={styles.numbers}>
          <ActiveNumber number={appliers.length} />
        </View>
        <View className={styles.checkbox_group}>
          {this.state.options.map(item => (
            <View
              key={item.value}
              className={styles.checkbox_item}
              onClick={() => this.onCheckbokClick(item.value)}
            >
              <View className={styles.checkbox}>
                {item.active && <Image src={confirmIcon} className={styles.confirm} />}
              </View>
              <Text>{item.label}</Text>
            </View>
          ))}
        </View>
        <Image className={styles.btn} src={btnIcon} onClick={this.onConfirm} />
      </View>
    )
  }
}
