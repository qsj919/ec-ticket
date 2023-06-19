import Taro from '@tarojs/taro'
import React from 'react'
import { View, Button, Text, Input } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import { editMerchantAddr } from '@api/live_api_manager'
import { getTaroParams } from '@utils/utils'

import styles from './index.module.scss'
import RegionCodeSelect from '../../components/RegionCodeSelect'

const verifyEmptyVal = [
  {
    keyName: 'receiver_name',
    msg: '请输入收件人姓名'
  },
  {
    keyName: 'tel_number',
    msg: '请输入收件人手机号'
  },
  {
    keyName: 'detailed_address',
    msg: '请输入详细地址'
  }
]

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    mpErpId: goodsManage.mpErpId
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  receiver_name: string
  tel_number: string
  country: null | string
  province: null | string
  city: null | string
  town: null | string
  detailed_address: string
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class PerfectAddress extends React.Component<
  StateProps & DefaultDispatchProps,
  State
> {
  state = {
    receiver_name: '',
    tel_number: '',
    country: null,
    province: null,
    city: null,
    town: null,
    detailed_address: ''
  }
  async componentDidMount() {}

  updateReceiverName = e => this.setState({ receiver_name: e.detail.value })

  updateTelNumber = e => this.setState({ tel_number: e.detail.value })

  updateDetailedAddress = e => this.setState({ detailed_address: e.detail.value })

  updateRegion = ({ country, province, city, town }) => {
    this.setState({
      country: country ? country.label : null,
      province: province ? province.label : null,
      city: city ? city.label : null,
      town: town ? town.label : null
    })
  }

  submit = async () => {
    const { sessionId, mpErpId } = getTaroParams(Taro.getCurrentInstance?.())
    const regionToast = '请选择省市区'
    if (this.state.country === null) {
      return Taro.showToast({ title: regionToast, icon: 'none' })
    } else if (this.state.country !== '海外' && this.state.town === null) {
      return Taro.showToast({ title: regionToast, icon: 'none' })
    }

    for (let i = 0; i < verifyEmptyVal.length; i++) {
      const { keyName, msg } = verifyEmptyVal[i]
      if (!this.state[keyName]) {
        return Taro.showToast({ title: msg, icon: 'none' })
      }
    }

    Taro.showLoading({ title: '提交中' })
    const updateAddrRes = await editMerchantAddr({
      mpErpId,
      sessionId: sessionId,
      jsonParam: this.state
    })

    Taro.hideLoading()
    Taro.navigateTo({
      url: `/subpackages/live/pages/create_live/index?mpErpId=${mpErpId}&sessionId=${sessionId}`
    })
  }

  render() {
    const { receiver_name, tel_number, detailed_address } = this.state

    return (
      <View className={styles.page}>
        <View className={styles.page__form}>
          <View className={styles.page__form__item}>
            <Text className={styles.page__form__item__label}>姓名</Text>
            <View className={styles.page__form__item__content}>
              <Input
                placeholder='请输入收件人姓名'
                className={styles.page__form__item__content__input}
                value={receiver_name}
                onInput={this.updateReceiverName}
              ></Input>
            </View>
          </View>

          <View className={styles.page__form__item}>
            <Text className={styles.page__form__item__label}>手机号</Text>
            <View className={styles.page__form__item__content}>
              <Input
                placeholder='请输入收件人手机号'
                className={styles.page__form__item__content__input}
                value={tel_number}
                onInput={this.updateTelNumber}
                maxLength={11}
              ></Input>
            </View>
          </View>

          <View className={styles.page__form__item}>
            <Text className={styles.page__form__item__label}>省/市/区</Text>
            <View className={styles.page__form__item__content}>
              <RegionCodeSelect
                className={styles.page__form__item__content__input}
                handleChange={this.updateRegion}
              />
            </View>
          </View>

          <View className={styles.page__form__item}>
            <Text className={styles.page__form__item__label}>详细地址</Text>
            <View className={styles.page__form__item__content}>
              <Input
                placeholder='请输入收件详细地址'
                className={styles.page__form__item__content__input}
                value={detailed_address}
                onInput={this.updateDetailedAddress}
              ></Input>
            </View>
          </View>
        </View>

        <Button className={styles.page__submit} onClick={this.submit}>
          提交
        </Button>
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(PerfectAddress)