/**
 * @author GaoYuJian
 * @create date 2019-02-23
 * @desc
 */
import Taro from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { View, Text, Picker } from '@tarojs/components'
import messageFeedback from '@services/interactive'
import dayjs from 'dayjs'
import './index.scss'

type Props = {
  startValue?: string
  endValue?: string
  typeValue: number
  onDateSelCancel: () => void
  onConfimDateClick: (param) => void
}

type State = {
  startTime: string
  endTime: string
}

const curData = dayjs().format('YYYY-MM-DD')

export default class DatePicker extends PureComponent<Props, State> {
  constructor(props) {
    super(props)
    const { startValue = '', endValue = '' } = props
    this.state = {
      startTime: startValue,
      endTime: endValue
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const { startValue = '', endValue = '' } = nextProps
    this.setState({
      startTime: startValue,
      endTime: endValue
    })
  }

  onStartChange = e => {
    const value = e.detail.value
    if (value) {
      this.setState({ startTime: value })
    } else {
      return this.state.startTime
    }
  }

  onEndChange = e => {
    const value = e.detail.value
    if (value) {
      this.setState({ endTime: value })
    } else {
      return this.state.endTime
    }
  }
  onConfim = () => {
    const { onConfimDateClick } = this.props
    const { startTime, endTime } = this.state
    if (startTime && endTime) {
      const date1 = dayjs(startTime)
      const date2 = dayjs(endTime)
      if (date1.diff(date2) > 0) {
        messageFeedback.showToast('开始时间选择不能晚于结束时间！')
        return
      }
    }
    const param = {
      prodate1: startTime,
      prodate2: endTime
    }
    onConfimDateClick(param)
  }
  render() {
    const { typeValue, onDateSelCancel } = this.props
    const { startTime, endTime } = this.state
    const isDate = typeValue === 17
    return (
      <View className='container'>
        <View className='mask' />
        <View className='dateSelector'>
          <View className='filter-range-view__header'>
            <Text className='filter-range-view__header__title'>选择时间：</Text>
          </View>
          <View className='filter-range-view' style={isDate ? 'margin-bottom: 20px' : ''}>
            <View className='filter-range-view__main'>
              {isDate && (
                <View className='filter-range-view__main__picker'>
                  <Picker
                    className='picker'
                    mode='date'
                    value={startTime}
                    start='1900-09-01'
                    end={curData}
                    onChange={this.onStartChange}
                  >
                    <View className={startTime ? 'has_text' : 'text'}>
                      {startTime ? startTime : '开始日期'}
                    </View>
                  </Picker>
                </View>
              )}
              <View className='filter-rang-view__main__divider' />
              {isDate && (
                <View className='filter-range-view__main__picker'>
                  <Picker
                    className='picker'
                    mode='date'
                    value={endTime}
                    start='1900-09-01'
                    end={curData}
                    onChange={this.onEndChange}
                  >
                    <View className={endTime ? 'has_text' : 'text'}>
                      {endTime ? endTime : '结束日期'}
                    </View>
                  </Picker>
                </View>
              )}
            </View>
            <View className='bottomBtn'>
              <View className='btnCancel' onClick={onDateSelCancel}>
                取消
              </View>
              <View className='btnConfirm' onClick={this.onConfim}>
                确认
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
