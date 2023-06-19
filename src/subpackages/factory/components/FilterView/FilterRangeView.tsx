/**
 * @author GaoYuJian
 * @create date 2019-02-23
 * @desc
 */
import Taro from '@tarojs/taro'
import React, { PureComponent }  from 'react'
import { View, Input, Text, Picker } from '@tarojs/components'
import num from '@utils/num'
import dayjs from 'dayjs'
import './filter_range_view.scss'

type Props = {
  typeName: string
  typeValue: number
  startValue?: string
  endValue?: string
  startPlaceholder?: string
  endPlaceholder?: string
  onValueChanged: (typeValue: number, startValue: string, endValue: string) => void
}

type State = {
  start: string
  end: string
  startTime: string
  endTime: string
}

const curData = dayjs().format('YYYY-MM-DD')

export default class FilterRangeView extends PureComponent<Props, State> {
  constructor(props) {
    super(props)

    const { startValue = '', endValue = '' } = props
    this.state = {
      start: startValue,
      end: endValue,
      startTime: startValue,
      endTime: endValue
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const { startValue = '', endValue = '' } = nextProps
    this.setState({
      start: startValue,
      end: endValue,
      startTime: startValue,
      endTime: endValue
    })
  }

  onStartValueChanged(e) {
    const { onValueChanged, typeValue, endValue = '' } = this.props
    if (num.isNumber(e.detail.value)) {
      this.setState({ start: e.detail.value })
      onValueChanged(typeValue, e.detail.value, endValue)
    } else {
      return this.state.start
    }
  }

  onEndValueChanged(e) {
    const { onValueChanged, typeValue, startValue = '' } = this.props
    if (num.isNumber(e.detail.value)) {
      this.setState({ end: e.detail.value })
      onValueChanged(typeValue, startValue, e.detail.value)
    } else {
      return this.state.end
    }
  }

  onStartChange = e => {
    const { onValueChanged, typeValue, endValue = '' } = this.props
    const value = e.detail.value
    if (value) {
      this.setState({ startTime: value })
      onValueChanged(typeValue, value, endValue)
    } else {
      return this.state.startTime
    }
  }

  onEndChange = e => {
    const { onValueChanged, typeValue, startValue = '' } = this.props
    const value = e.detail.value
    if (value) {
      this.setState({ endTime: value })
      onValueChanged(typeValue, startValue, value)
    } else {
      return this.state.endTime
    }
  }

  render(): any {
    const { typeName, typeValue, startPlaceholder, endPlaceholder } = this.props
    const { start, end, startTime, endTime } = this.state
    const isDate = typeValue === 17
    return (
      <View className='filter-range-view' style={isDate ? 'margin-bottom: 20px' : ''}>
        <View className='filter-range-view__header'>
          <Text className='filter-range-view__header__title'>{typeName}</Text>
        </View>
        <View className='filter-range-view__main'>
          {!isDate && (
            <Input
              type='digit'
              className='filter-range-view__main__input'
              placeholder={startPlaceholder}
              value={start}
              placeholderStyle='font-size: 15px; color: #cccccc; text-align: center;'
              onInput={this.onStartValueChanged.bind(this)}
            />
          )}
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
          {!isDate && (
            <Input
              type='digit'
              className='filter-range-view__main__input'
              placeholder={endPlaceholder}
              value={end}
              disabled={isDate}
              placeholderStyle='font-size: 15px; color: #cccccc; text-align: center;'
              onInput={this.onEndValueChanged.bind(this)}
            />
          )}
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
        {!isDate && <View className='filter-tag-view__divider' />}
      </View>
    )
  }
}
