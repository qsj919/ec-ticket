import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image } from '@tarojs/components'
import Tabs from '@components/Tabs'
import { BaseItem } from '@@types/base'
import caretDown from '@/images/caret_down_gray_32.png'
import { t } from '@models/language'
import dayjs from 'dayjs'
import { getTargerPastDays } from '@utils/utils'

import DatePicker from '../../pages/component/dateComponent'
import styles from './index.module.scss'

const dateTabData = [
  { value: 7, label: '7天' },
  { value: 15, label: '15天' },
  { value: 30, label: '30天' },
  { value: 90, label: '90天' }
]

function formatDate(date: string) {
  return date.slice(5)
}

interface Props {
  tabData: BaseItem[]
  onTabClick(index: number, item: BaseItem, startDate: string, endDate: string): void
  activeTabIndex?: number
  onDateClick?(): void
  // startDate: string
  // endDate: string
  onDateConfirm(s: string, e: string): void
}

interface State {
  activeIndex: number
  startDate: string
  endDate: string
  isPickerVisible: boolean
}

export default class DateQuickSelect extends React.PureComponent<Props, State> {
  static defaultProps = {
    tabData: dateTabData
  }

  static getDerivedStateFromProps(
    props: Props,
    state: State
  ): NonNullable<Partial<State>> | undefined {
    if (typeof props.activeTabIndex === 'number' && props.activeTabIndex !== state.activeIndex) {
      return {
        activeIndex: props.activeTabIndex
      }
    } else {
      return null
    }
  }

  state = {
    activeIndex: 1,
    startDate: dayjs()
      .subtract(15, 'day')
      .format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    isPickerVisible: false
  }

  onTabClick = (i: number, data: BaseItem) => {
    const { startDate, endDate } = getTargerPastDays(data.value)
    this.setState({ startDate, endDate, activeIndex: i })
    this.props.onTabClick(i, data, startDate, endDate)
  }

  onDateClick = () => {
    this.setState({ isPickerVisible: true })
    const { onDateClick } = this.props
    onDateClick && onDateClick()
  }

  hideDatePicker = () => {
    this.setState({ isPickerVisible: false })
  }

  onDateConfirm = (params: { prodate1: string; prodate2: string }) => {
    this.hideDatePicker()
    this.setState({ startDate: params.prodate1, endDate: params.prodate2 })
    const { onDateConfirm } = this.props
    onDateConfirm(params.prodate1, params.prodate2)
  }

  render() {
    const { tabData } = this.props
    const { activeIndex, startDate, endDate, isPickerVisible } = this.state
    return (
      <View>
        <View className={styles.container}>
          <Tabs
            data={tabData}
            onTabItemClick={this.onTabClick}
            margin={30}
            underlineWidth={40}
            activeIndex={activeIndex}
          />
          <View className={styles.date} onClick={this.onDateClick}>
            {`${formatDate(startDate)}${t('statement:to')}${formatDate(endDate)}`}
            <Image src={caretDown} className={styles.caret_down} />
          </View>
        </View>

        {isPickerVisible && (
          <DatePicker
            tabs={false}
            dateStart={startDate}
            dateEnd={endDate}
            onDateSelCancel={this.hideDatePicker}
            onConfimDateClick={this.onDateConfirm}
            // bottom='50px'
          />
        )}
      </View>
    )
  }
}
