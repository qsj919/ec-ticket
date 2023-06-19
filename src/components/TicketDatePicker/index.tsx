import Taro, { memo } from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { View, Image, PickerView, PickerViewColumn, Block, Text } from '@tarojs/components'
import toggleIcon from '@/images/icon/toggle.png'
import { getDaysInOneMonth, getTargerPastDays } from '@utils/utils'
import deleteIcon from '@/images/delete_circle_32.png'
import dayjs from 'dayjs'
import trackSvc from '@services/track'
import events from '@constants/analyticEvents'
import cn from 'classnames'

import './index.scss'

interface State {
  days: Array<string>
  useType: number
  timeActiveIndex: number
  startDate: string
  endDate: string
  dayDate: string
  timeIndex?: Array<number>
  MONTH: Array<string>
}
type OwnProps = {
  mask?: boolean
  initDateStart?: string
  initDateEnd?: string
  onConfirmClick?: (date) => void
  onCancelClick?: (date) => void
  visible: boolean
  tips: string
  type: string
}

function getYearDate(type) {
  // type  0: 聚合小票开始日期为2021年
  // type  1: 老版小票开始日期为2018年
  let timeYear = new Date().getFullYear()
  let year = [] as string[]
  let _startYear = 2021
  if (type === '1') {
    _startYear = 2018
  }
  for (let i = _startYear; i <= timeYear; i++) {
    year.push(i.toString())
  }
  return year
}

export default class TicketDatePicker extends React.Component<OwnProps, State> {
  constructor(props) {
    super(props)
    this.state = {
      days: [],
      useType: 1, // 0：按月  1：按日
      timeActiveIndex: 0,
      startDate: '',
      endDate: '',
      dayDate: '',
      timeIndex: [],
      MONTH: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    }
  }

  static defaultProps = {
    mask: false,
    initDateStart: dayjs().format('YYYY-MM-DD'),
    initDateEnd: '',
    tips: ''
  }

  componentDidMount() {
    this.init()
  }

  init = () => {
    const { initDateStart, initDateEnd, type } = this.props
    const { MONTH } = this.state
    const YEAR = getYearDate(type)
    const date = initDateStart ? new Date(initDateStart) : new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    const DAYS = getDaysInOneMonth(year, month)
    const timeIndex = [
      YEAR.findIndex(y => Number(y) === year),
      MONTH.findIndex(m => Number(m) === month),
      DAYS.findIndex(
        d => d === (date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString())
      )
    ]
    this.setState(
      {
        days: DAYS,
        startDate: dayjs(date).format('YYYY-MM-DD'),
        endDate: initDateEnd ? dayjs(initDateEnd).format('YYYY-MM-DD') : '',
        dayDate: `${year}-${month < 10 ? `0${month}` : month}`
      },
      () => {
        this.setState({ timeIndex })
      }
    )
  }

  initTimeIndex = () => {
    const { startDate, dayDate, useType } = this.state
    const { type } = this.props
    const YEAR = getYearDate(this.props.type)
    const date = startDate ? new Date(startDate) : new Date()
    let _dayDate = dayDate ? new Date(dayDate) : new Date()
    let _date = useType === 0 ? date : _dayDate
    let _year = _date.getFullYear()
    let month = _date.getMonth() + 1
    let _month =
      _year === 2021 && type === '0'
        ? ['08', '09', '10', '11', '12']
        : ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    const DAYS = getDaysInOneMonth(_year, month)
    let timeIndex: Array<number> = []
    if (useType === 0) {
      timeIndex = [
        YEAR.findIndex(y => Number(y) === _year),
        _month.findIndex(m => Number(m) === month),
        DAYS.findIndex(
          d => d === (date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString())
        )
      ]
    } else {
      timeIndex = [
        YEAR.findIndex(y => Number(y) === _year),
        _month.findIndex(m => Number(m) === month)
      ]
    }
    this.setState({ timeIndex, MONTH: _month })
  }

  onPickerChange = e => {
    const { timeActiveIndex, useType } = this.state
    const { type } = this.props
    const YEAR = getYearDate(this.props.type)
    let year = YEAR.find((y, i) => i === e.detail.value[0])
    let _month: Array<string> = []
    if (year === '2021' && type === '0') {
      _month = ['08', '09', '10', '11', '12']
    } else {
      _month = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    }
    let month = _month.find((m, i) => i === e.detail.value[1])
    if (useType === 0) {
      if (timeActiveIndex === 0) {
        this.setState({
          days: getDaysInOneMonth(year, month),
          startDate: `${year}-${month}-${getDaysInOneMonth(year, month)[e.detail.value[2]]}`,
          MONTH: _month
        })
      } else {
        this.setState({
          days: getDaysInOneMonth(year, month),
          endDate: `${year}-${month}-${getDaysInOneMonth(year, month)[e.detail.value[2]]}`,
          MONTH: _month
        })
      }
    } else {
      this.setState({
        dayDate: `${year}-${_month.find((_m, i) => i === e.detail.value[1]) || '08'}`,
        MONTH: _month
      })
    }
  }

  onSwitchClick = () => {
    this.setState(
      prevState => ({
        useType: prevState.useType === 0 ? 1 : 0
      }),
      () => {
        this.initTimeIndex()
        if (this.state.useType === 0) {
          trackSvc.track(events.selectByMonthClick)
        } else if (this.state.useType === 1) {
          trackSvc.track(events.selectByDayClick)
        }
      }
    )
  }

  onTimeTabClick = e => {
    const { type } = e.currentTarget.dataset
    if (Number(type) === 1) {
      if (this.state.endDate === '') {
        this.setState({
          endDate: this.state.startDate,
          timeActiveIndex: Number(type)
        })
        return
      }
    }
    this.setState({
      timeActiveIndex: Number(type)
    })
  }

  onDeleteClick = () => {
    this.setState({
      dayDate: ''
    })
  }

  onCancelClick = () => {
    const { startDate, endDate, dayDate, useType } = this.state
    if (useType === 0) {
      this.props.onCancelClick &&
        this.props.onCancelClick({
          startDate,
          endDate
        })
    } else {
      this.props.onCancelClick &&
        this.props.onCancelClick({
          startDate: dayDate,
          endDate
        })
    }
    trackSvc.track(events.useDateCancel)
  }

  onResetClick = () => {
    const { startDate, endDate } = getTargerPastDays(90)

    this.setState({
      startDate,
      endDate,
      dayDate: ''
    })
    this.props.onConfirmClick &&
      this.props.onConfirmClick({
        startDate,
        endDate
      })
  }

  onDateConfirm = () => {
    const { useType, startDate, endDate, dayDate } = this.state
    if (useType === 0) {
      if (!startDate || !endDate) return
      this.props.onConfirmClick && this.props.onConfirmClick({ startDate, endDate })
    } else {
      if (!dayDate) return
      const date = new Date(dayDate)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      this.props.onConfirmClick &&
        this.props.onConfirmClick({
          startDate: `${dayDate}-01`,
          endDate: `${dayDate}-${new Date(year, month, 0).getDate()}`
        })
    }
    trackSvc.track(events.useDateConfirm)
  }

  render() {
    const {
      days,
      useType,
      timeActiveIndex,
      startDate,
      endDate,
      dayDate,
      timeIndex,
      MONTH
    } = this.state
    const { mask, visible, tips, type } = this.props
    const YEAR = getYearDate(type)
    return (
      <View
        className={cn('ticket_date_picker', { 'ticket_date_picker--visible': visible })}
        style={{
          backgroundColor: `${mask ? 'rgba(0,0,0,0.6)' : 'transparent'}`
        }}
      >
        <View className='ticket_date_picker__viewer'>
          <View className='ticket_date_picker__viewer___header'>
            <View style='display: flex; align-items: center;'>
              <View className='useTime_label'>选择时间：</View>
              <View className='switch_btn' onClick={this.onSwitchClick}>
                {`${useType === 0 ? ' 按日选择' : ' 按月选择'}`}{' '}
                <Image src={toggleIcon} className='toggle_icon' />
              </View>
            </View>
            <View className='reset_view' onClick={this.onResetClick}>
              重置
            </View>
          </View>
          <View className='ticket_date_picker__viewer__v'>
            <View className='ticket_date_picker__viewer___valueView'>
              {useType === 0 ? (
                <Block>
                  <View
                    className='ticket_date_picker__viewer___valueView_item'
                    onClick={this.onTimeTabClick}
                    data-type='0'
                    style={{
                      border: `${timeActiveIndex === 0 && '1px solid #E62E4D'}`,
                      color: `${!startDate && '#999999'}`
                    }}
                  >
                    {startDate || '开始日期'}
                  </View>
                  <View className='timeValue_line'></View>
                  <View
                    className='ticket_date_picker__viewer___valueView_item'
                    onClick={this.onTimeTabClick}
                    data-type='1'
                    style={{
                      border: `${timeActiveIndex === 1 && '1px solid #E62E4D'}`,
                      color: `${!endDate && '#999999'}`
                    }}
                  >
                    {endDate || '结束日期'}
                  </View>
                </Block>
              ) : (
                <View
                  className='ticket_date_picker__viewer___valueView_item'
                  style={{
                    border: `${dayDate && '1px solid #E62E4D'}`,
                    color: `${!dayDate && '#999999'}`
                  }}
                >
                  {dayDate || '选择月份'}
                  {dayDate && (
                    <Image src={deleteIcon} onClick={this.onDeleteClick} className='delete_icon' />
                  )}
                </View>
              )}
            </View>
            {tips.length > 0 && <Text className='ticket_date_picker__viewer__tips'>{tips}</Text>}
          </View>
          <View className='ticket_date_picker__viewer___content'>
            <PickerView
              onChange={this.onPickerChange}
              value={timeIndex}
              style='width: 100%;height: 100%;'
              // immediateChange
            >
              <PickerViewColumn>
                {YEAR.map(y => (
                  <View key={y} className='picker_view_column_item'>
                    {y}
                  </View>
                ))}
              </PickerViewColumn>
              <PickerViewColumn>
                {MONTH.map(m => (
                  <View key={m} className='picker_view_column_item'>
                    {m}
                  </View>
                ))}
              </PickerViewColumn>
              {useType === 0 && (
                <PickerViewColumn>
                  {days.map(d => (
                    <View key={d} className='picker_view_column_item'>
                      {d}
                    </View>
                  ))}
                </PickerViewColumn>
              )}
            </PickerView>
          </View>
          <View className='ticket_date_picker__viewer___action'>
            <View
              className='ticket_date_picker__viewer___action_item action_left'
              onClick={this.onCancelClick}
            >
              取消
            </View>
            <View
              className='ticket_date_picker__viewer___action_item action_right'
              onClick={this.onDateConfirm}
            >
              确认
            </View>
          </View>
        </View>
      </View>
    )
  }
}
