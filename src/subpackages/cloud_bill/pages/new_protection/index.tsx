import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text, Switch, Input } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'

import SwitchItemView from '../../components/SwitchItemView/SwitchItemView'
import { MODE } from '../../components/SwitchItemView/mode'
import './index.scss'

interface State {
  switchMenu: Array<{ id: string; flag: boolean; value: number }>
  switchBtn: boolean
  days: number
}

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    shopProtectDays: goodsManage.shopProtectDays
  }
}
type StateProps = ReturnType<typeof mapStateToProps>
// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class newProtection extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  state = {
    switchMenu: [
      {
        id: '',
        flag: false,
        value: 3
      },
      {
        id: '',
        flag: false,
        value: 5
      },
      {
        id: '',
        flag: false,
        value: 7
      },
      {
        id: '',
        flag: false,
        value: 10
      }
    ],
    switchBtn: false,
    days: 0
  }

  // config = {
  //   navigationBarTitleText: '新款保护'
  // }

  componentDidMount() {
    this.init()
  }

  init = async () => {
    await this.props.dispatch({ type: 'goodsManage/selectShopProtectDays' })
    const { shopProtectDays } = this.props
    this.state.switchMenu.map((item, i) => {
      if (item.value === shopProtectDays) {
        this.onMenuClick(i)
      }
    })
    this.setState({ days: shopProtectDays, switchBtn: shopProtectDays > 0 })
  }

  onSwitchChange = e => {
    if (!e.detail.value) {
      this.clearSwitchStatu()
      this.setState({ days: 0 })
    } else {
      this.onMenuClick(0)
    }
    this.setState({ switchBtn: e.detail.value })
  }

  onMenuClick = i => {
    this.clearSwitchStatu()
    this.setState(prevState => {
      const arr = prevState.switchMenu.map((item, index) => {
        return { ...item, flag: i === index }
      })
      return {
        days: prevState.switchMenu[i].value,
        switchBtn: true,
        switchMenu: [...arr]
      }
    })
  }
  clearSwitchStatu = () => {
    this.setState(prevState => {
      const arr = prevState.switchMenu.map(item => {
        return { ...item, flag: false }
      })
      return {
        switchMenu: [...arr]
      }
    })
  }
  setDay = e => {
    const days = parseInt(e.detail.value || 0)

    this.setState({
      days,
      switchBtn: days > 0
    })
    let clear = false
    this.state.switchMenu.forEach((item, i) => {
      if (item.value === days) {
        this.onMenuClick(i)
        clear = true
      }
    })
    if (!clear) this.clearSwitchStatu()
  }

  submitBtnClick = async () => {
    const { days } = this.state
    // save
    Taro.showLoading()
    await this.props.dispatch({
      type: 'goodsManage/updateShopProtectDays',
      payload: {
        pubDelayDay: days
      }
    })
    Taro.hideLoading()
    Taro.navigateBack()
  }

  render() {
    const { switchMenu, switchBtn, days } = this.state
    return (
      <View className='protection_wrap'>
        <SwitchItemView
          title='新款保护'
          explain='开启后新款不自动上架'
          defaultValue={switchBtn}
          onItemClick={this.onSwitchChange}
          mode={MODE.switch}
        />
        <View className='protection_wrap_center'>
          <View
            style={{ borderTop: '0.5px solid #f7f7f7' }}
            className='protection_wrap_center_item'
          >
            <Text>新款保护时间</Text>
            <View className='protection_wrap_center_item_inputView'>
              <Input
                className='protection_wrap_center_item_inputView_input'
                type='number'
                placeholder='请输入天数'
                value={days + ''}
                onInput={this.setDay}
              ></Input>
              天
            </View>
          </View>

          <View className='protection_wrap_center_switchItems'>
            <View className='protection_wrap_center_switchItems_switchTab'>
              {switchMenu.map((item, i) => (
                <View
                  key={item.value}
                  className={
                    item.flag
                      ? 'protection_wrap_center_switchItems_switchTab_item chooseItem'
                      : 'protection_wrap_center_switchItems_switchTab_item'
                  }
                  onClick={() => {
                    this.onMenuClick(i)
                  }}
                >
                  <Text>{item.value}天</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View className='protection_wrap_save' onClick={this.submitBtnClick}>
          保存
        </View>
      </View>
    )
  }
}
export default onnect<StateProps, DefaultDispatchProps>(mapStateToProps)(newProtection)