/*
 * @Author: fhw
 * @Date: 2019-09-19
 * @Desc 自定义Stepper组件
 */
import Taro from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { View, Input, Image } from '@tarojs/components'
import num from 'number-precision'
// import images from '@src/config/images'
import debounce from 'lodash/debounce'
import messageFeedback from '@services/interactive'
import plusIcon from '@/images/cart_plus.png'
import reduceIcon from '@/images/cart_reduce.png'
import colors from '../../style/colors'

import './index.scss'

interface Props {
  type: 'number' | 'digit'
  value: number | string

  min: number

  max: number

  step: number

  disabled?: boolean

  onChange: Function

  sId?: number | string

  disableInput?: boolean
}

interface State {
  ivalue: number
}

export default class StepperV2 extends PureComponent<Props, State> {
  static defaultProps = {
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
    step: 1,
    disabled: false,
    disableInput: false
  }

  constructor(props) {
    super(props)

    this.state = { ivalue: props.value }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.value !== this.state.ivalue) {
      this.setState({ ivalue: Number(nextProps.value) })
    }
  }

  onStopP = e => e.stopPropagation()

  onChange = ({ detail }) => {
    this.setState({ ivalue: detail.value }, () => {
      let ivalue = Number(detail.value)
      if (!ivalue || ivalue === 0) ivalue = 0
      if (ivalue > this.props.max) {
        ivalue = this.props.max
      } else if (ivalue < this.props.min) {
        ivalue = this.props.min
      }
      this.setState({ ivalue })
      this.props.onChange(ivalue, this.props.sId)
    })
  }

  onAdd(e) {
    e.stopPropagation()
    const { disabled } = this.props
    if (disabled) {
      return
    }
    const newValue = roundStep(Number(this.state.ivalue) + this.props.step, this.props.step)
    if (newValue > this.props.max) {
      return messageFeedback.showToast(`数量已达库存上限`)
    }
    this.setState({ ivalue: newValue })
    this.props.onChange(newValue, this.props.sId)
  }

  onMinus = e => {
    e.stopPropagation()
    const { disabled } = this.props
    if (disabled) {
      return
    }
    const newValue = roundStep(Number(this.state.ivalue) - this.props.step, this.props.step)
    if (newValue < this.props.min) {
      let title = `最少购买${this.props.min}件`
      if (this.props.min === 0) {
        title = '不能再少了~'
      }
      return messageFeedback.showToast(title)
    }
    this.setState({ ivalue: newValue })
    this.props.onChange(newValue, this.props.sId)
  }

  onBlur = () => {
    const value = Number(this.state.ivalue)
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(value)) {
      this.setState({
        ivalue: 0
      })
      this.props.onChange(0, this.props.sId)
    } else {
      const newValue = roundStep(Number(this.state.ivalue), this.props.step)
      if (newValue < this.props.min) {
        this.setState({
          ivalue: Number(this.props.value)
        })
        return messageFeedback.showToast(`最少购买${this.props.min}件`)
      }
      if (newValue > this.props.max) {
        this.setState({
          ivalue: Number(this.props.value)
        })
        return messageFeedback.showToast(`最多购买${this.props.max}件`)
      }
      // this.props.onChange(newValue, this.props.sId)
    }
  }

  render() {
    const { type, disabled, disableInput } = this.props
    const textStyle: { color?: string } = {}

    const { ivalue } = this.state
    if (Number(ivalue) === 0) {
      textStyle.color = colors.normalTextColor
    }
    return (
      <View className='stepper-container'>
        <View className='stepper-container__op_wrapper' onClick={this.onMinus}>
          <View
            className='stepper-container__image stepper-container__image--left'
            // src={reduceIcon}
            style={disabled ? 'opacity: 0.5' : ''}
          />
        </View>
        <Input
          className={`stepper-container__input stepper-container__input--${
            disabled ? 'disable' : 'normal'
          }`}
          value={String(ivalue)}
          type={type}
          onInput={debounce(this.onChange)}
          onBlur={this.onBlur}
          disabled={disabled || disableInput}
          style={textStyle}
          onClick={this.onStopP}
        />
        <View className='stepper-container__op_wrapper' onClick={this.onAdd}>
          <View
            className='stepper-container__image stepper-container__image--right'
            style={disabled ? 'opacity: 0.5' : ''}
            // src={plusIcon}
          />
        </View>
      </View>
    )
  }
}

function roundStep(value: number, step: number) {
  return num.strip(Math.ceil(value / step) * step)
}
