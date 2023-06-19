import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Picker } from '@tarojs/components'
import { AtCalendar } from 'taro-ui'
import { t } from '@models/language'
import TabList from '../component/tabList'
import styles from './dateComponent.module.scss'
import { getOneDate, getMonthLast } from '../../utils/utils'

let dateTabList = [{ title: '' }, { title: '' }, { title: '' }]

const systemInfo = Taro.getSystemInfoSync()

type PropsType = {
  dateStart: string
  dateEnd: string
  onDateSelCancel: () => void
  onConfimDateClick: (param) => void
  tabs?: boolean
  bottom: string
}
type StateType = {
  dateAnimation: any
  currentIndex: number
  monthDate: string
  yearDate: string
  start: string
  end: string
  diyDate: { start: string; end: string }
}

class DatePicker extends Component<PropsType, StateType> {
  static defaultProps = {
    tabs: true,
    bottom: '0px'
  }

  constructor(props) {
    super(props)
    this.state = {
      monthDate: '',
      yearDate: '',
      start: '',
      end: '',
      diyDate: { start: '', end: '' },
      dateAnimation: null,
      currentIndex: 0
    }
  }
  UNSAFE_componentWillMount() {
    const { dateStart, dateEnd } = this.props
    dateTabList = [{ title: t('byCustomized') }, { title: t('byMonth') }, { title: t('byYear') }]
    // 自定义日期特殊处理
    const dateArr = dateStart.split('-')
    this.setState({
      monthDate: `${dateArr[0]}-${dateArr[1]}`,
      yearDate: dateArr[0],
      start: dateStart,
      end: dateEnd,
      diyDate: { start: dateStart, end: dateEnd }
    })
  }

  onMaskMove = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  onMaskClick = () => {
    this.props.onDateSelCancel()
  }

  onDateSelectClick = value => {
    const step = systemInfo.screenWidth / dateTabList.length
    const animation = this.createAnimation(value, step)
    this.setState({
      dateAnimation: animation,
      currentIndex: value
    })
  }

  onMonthDateChange = ({ detail }) => {
    this.setState({ monthDate: detail.value })
  }

  onYearDateChange = ({ detail }) => {
    this.setState({ yearDate: detail.value })
  }

  onSelectDateClick = ({ value }) => {
    this.setState({
      diyDate: {
        start: value.start,
        end: value.end
      }
    })
  }

  createAnimation = (value, step) => {
    const space = value * step
    return Taro.createAnimation({
      duration: 450,
      timingFunction: 'ease-out',
      transformOrigin: '0 0'
    })
      .translateX(space)
      .step()
      .export()
  }

  onConfim = () => {
    const { onConfimDateClick } = this.props
    const { currentIndex, monthDate, yearDate, diyDate } = this.state
    const param = {
      prodate1: '',
      prodate2: ''
    }
    const dateNow = getOneDate()
    const dateNowArr = dateNow.split('-')
    if (currentIndex === 0) {
      param.prodate1 = diyDate.start
      param.prodate2 = diyDate.end || diyDate.start
    } else if (currentIndex === 1) {
      const arr = monthDate.split('-')
      param.prodate1 = `${arr[0]}-${arr[1]}-01`
      const lastDay = getMonthLast(monthDate).getDate()
      param.prodate2 = `${arr[0]}-${arr[1]}-${lastDay}`
    } else if (currentIndex === 2) {
      const year = yearDate.split('-')[0]
      param.prodate1 = `${year}-01-01`
      if (year === dateNowArr[0]) {
        param.prodate2 = dateNow
      } else {
        param.prodate2 = `${year}-12-31`
      }
    }
    onConfimDateClick(param)
  }

  render() {
    const { onDateSelCancel, tabs, bottom } = this.props
    const { monthDate, yearDate, start, end, currentIndex, dateAnimation } = this.state
    return (
      <View className={styles.container}>
        <View className={styles.mask} onTouchMove={this.onMaskMove} onClick={this.onMaskClick} />
        <View className={styles.dateSelector} onTouchMove={this.onMaskMove} style={{ bottom }}>
          {tabs && (
            <View>
              <TabList
                listData={dateTabList}
                onTabItemClick={this.onDateSelectClick}
                current={currentIndex}
                animation={dateAnimation}
                titleSize={18}
              />
            </View>
          )}
          <View>
            {currentIndex === 0 ? (
              <AtCalendar
                isMultiSelect
                currentDate={{ start, end }}
                onSelectDate={this.onSelectDateClick}
              />
            ) : currentIndex === 1 ? (
              <View>
                <Picker
                  mode='date'
                  fields='month'
                  value={monthDate}
                  onChange={this.onMonthDateChange}
                >
                  <View className={styles.selectDate}>
                    <View>{t('selectDate')}</View>
                    <View>{monthDate}</View>
                  </View>
                </Picker>
              </View>
            ) : (
              <View>
                <Picker mode='date' fields='year' value={yearDate} onChange={this.onYearDateChange}>
                  <View className={styles.selectDate}>
                    <View>{t('selectDate')}</View>
                    <View>{yearDate}</View>
                  </View>
                </Picker>
              </View>
            )}
          </View>
          <View className={styles.bottomBtn}>
            <View className={styles.btnCancel} onClick={onDateSelCancel}>
              {t('cancel')}
            </View>
            <View className={styles.btnConfirm} onClick={this.onConfim}>
              {t('confirm')}
            </View>
          </View>
        </View>
      </View>
    )
  }
}

// export default connect<StateProps, {}, PropsType>(mapStateToProps)(
//   DatePicker
// ) as ComponentType<PropsType>
export default DatePicker
