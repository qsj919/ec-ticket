import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text, Switch, PickerView, PickerViewColumn, Picker } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import { isWeapp, setNavigationBarTitle } from '@utils/cross_platform_api'
import {
  sendErpOpenMallMsg,
  setAutoNoticeConfig,
  getAutoNoticeConfig
} from '@api/goods_api_manager'
import messageFeedback from '@services/interactive'
import debounce from 'lodash/debounce'
import './index.scss'

const hours = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24'
]
const minutes = [
  '00',
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '50',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '57',
  '58',
  '59'
]
const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    linkUserList: goodsManage.linkUsers.rows,
    userCount: goodsManage.linkUsers.total,
    mpErpId: goodsManage.mpErpId
  }
}

interface State {
  switchNotifly: boolean
  maskIsShow: boolean
  timeIndex: Array<number>
  weeks: Array<{
    label: string
    value: number
    flag: boolean
    ch: string
  }>
  timerValue_h5: string
  timeValue: string
  dateIsShow_h5: boolean
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class automaticNotification extends React.Component<
  StateProps & DefaultDispatchProps,
  State
> {
  pageNo = 1
  loading = false

  state = {
    switchNotifly: false,
    maskIsShow: false,
    timeIndex: [0, 0],
    weeks: [
      { label: '每周一', value: 1, flag: false, ch: '一' },
      { label: '每周二', value: 2, flag: false, ch: '二' },
      { label: '每周三', value: 3, flag: false, ch: '三' },
      { label: '每周四', value: 4, flag: false, ch: '四' },
      { label: '每周五', value: 5, flag: false, ch: '五' },
      { label: '每周六', value: 6, flag: false, ch: '六' },
      { label: '每周日', value: 7, flag: false, ch: '日' }
    ],
    timeValue: '',
    dateIsShow_h5: false,
    timerValue_h5: ''
  }

  // config = {
  //   navigationBarTitleText: '通知客户'
  // }

  onReachBottom() {
    this.loadMore()
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    if (!this.state.switchNotifly) {
      setAutoNoticeConfig({
        mpErpId: this.props.mpErpId
      })
    }
  }

  componentDidShow() {
    setNavigationBarTitle('通知客户')
  }

  init = async () => {
    this.loadList()
    this.initWeeks()
  }

  loadList = async () => {
    if (this.loading) return
    try {
      this.pageNo = 1
      await this.props.dispatch({
        type: 'goodsManage/selectErpLinkUsers',
        payload: { pageNo: this.pageNo }
      })
    } catch (e) {
      //
      this.loading = false
    }
  }

  loadMore = async () => {
    if (this.loading) return
    try {
      this.pageNo += 1
      await this.props.dispatch({
        type: 'goodsManage/selectErpLinkUsers',
        payload: { pageNo: this.pageNo }
      })
    } catch (e) {
      this.loading = false
      this.pageNo -= 1
    }
  }

  initWeeks = () => {
    getAutoNoticeConfig({
      mpErpId: this.props.mpErpId
    }).then(res => {
      let timeValueArr: Array<string> = []
      this.setState(prevState => {
        res.data.weeks &&
          res.data.weeks.forEach(item => {
            prevState.weeks[prevState.weeks.findIndex(week => week.value === item)].flag = true
          })
        prevState.weeks.forEach(week => week.flag && timeValueArr.push(week.ch))
        const time = res.data.time && res.data.time.split(':')
        return {
          ...prevState,
          weeks: prevState.weeks,
          timeValue: timeValueArr.length
            ? '每周' + timeValueArr.join('、') + (isWeapp() ? res.data.time : '')
            : '',
          switchNotifly: typeof res.data.weeks === 'undefined' ? false : true,
          timerValue_h5: res.data.time || '',
          timeIndex: [
            hours.findIndex(item => typeof time !== 'undefined' && item === time[0]),
            minutes.findIndex(item => typeof time !== 'undefined' && item === time[1])
          ]
        }
      })
    })
  }

  onSettingTime = () => {
    if (this.state.switchNotifly) {
      this.setState({ maskIsShow: true })
    }
  }

  onCloseClick = e => {
    this.setState({ maskIsShow: false, dateIsShow_h5: false })
  }

  onInformClick = () => {
    this.onInform()
  }

  onInform = debounce(() => {
    sendErpOpenMallMsg({
      mpErpId: this.props.mpErpId
    }).then(res => {
      this.Alert(`已经为您通知${this.props.userCount}位客户请留意来自云单的订单哦~`)
    })
  }, 200)

  Alert = (val, func?) => {
    messageFeedback.showAlert(val, '', '好的', () => {
      func && func()
    })
  }

  onBindChange = e => {
    this.setState({
      timeIndex: e.target.value
    })
  }
  onSwitchChange = e => {
    this.setState({
      switchNotifly: e.detail.value
    })
  }

  onSaveClick = async () => {
    this.setState({ maskIsShow: false, dateIsShow_h5: false })
    Taro.showLoading()
    const { weeks, timerValue_h5 } = this.state
    const { mpErpId } = this.props
    let weeksArr: Array<number> = []
    let timeValueArr: Array<string> = []
    let timer: string = ''
    weeks.forEach(item => {
      if (item.flag) {
        weeksArr.push(item.value)
        timeValueArr.push(item.ch)
      }
    })
    if (isWeapp()) {
      const timeIndex = this.state.timeIndex.map(item => (item < 0 ? 0 : item))
      timer = `${hours[timeIndex[0]]}:${minutes[timeIndex[1]]}`
    } else {
      if (!!timerValue_h5) {
        timer = timerValue_h5
      } else {
        this.setState({ timeValue: '每周' + timeValueArr.join('、') + (isWeapp() ? timer : '') })
        messageFeedback.showToast('请选择通知时间')
        return
      }
    }
    if (weeksArr.length > 0) {
      await setAutoNoticeConfig({
        mpErpId,
        weeks: weeksArr,
        time: timer
      })
    } else {
      Taro.hideLoading()
      messageFeedback.showToast('请选择通知日期！')
      return
    }
    Taro.hideLoading()
    messageFeedback.showToast('保存成功！')
    this.setState({ timeValue: '每周' + timeValueArr.join('、') + (isWeapp() ? timer : '') })
  }

  onWeekItemClick = index => {
    this.setState(prevState => {
      prevState.weeks[index].flag = !prevState.weeks[index].flag
      return {
        weeks: prevState.weeks
      }
    })
  }

  onSettingDateClick = () => {
    this.setState({
      maskIsShow: true,
      dateIsShow_h5: true
    })
  }

  onTimerChange = e => {
    const { value } = e.detail
    this.setState(
      {
        timerValue_h5: value
      },
      () => {
        this.onSaveClick()
      }
    )
  }

  getLinkUserList = () => {
    const { linkUserList } = this.props
    return linkUserList.filter(item => item.avatar || item.nickName)
  }

  renderDateView = () => {
    const { weeks } = this.state
    return (
      <View onClick={e => e.stopPropagation()}>
        <View className='time_picker__top'>
          <Text style='color: #999999' onClick={this.onCloseClick}>
            取消
          </Text>
          <Text style='color: #2E6BE6' onClick={this.onSaveClick}>
            确定
          </Text>
        </View>
        <View className='mask_title'>选择日期</View>
        <View className='weeks_view'>
          {weeks.map((item, index) => (
            <View
              key={item.value}
              className={`weeks_view_item ${item.flag ? 'item_y' : 'item_n'}`}
              onClick={() => {
                this.onWeekItemClick(index)
              }}
            >
              {item.label}
            </View>
          ))}
        </View>
      </View>
    )
  }

  render() {
    const {
      switchNotifly,
      maskIsShow,
      timeValue,
      timeIndex,
      dateIsShow_h5,
      timerValue_h5
    } = this.state
    const { userCount } = this.props
    const linkUserList = this.getLinkUserList()
    const _isWeapp = isWeapp()
    return (
      <View className='automatic_notification'>
        <View className='automatic_notification_header'>
          <View className='header_content'>
            <View className='header_content_title'>
              <View>
                您有
                <Text style={{ fontSize: '25px' }}> {userCount} </Text>
                位客户可收到消息
              </View>
              <View className='notifly' onClick={this.onInformClick}>
                一键通知
              </View>
            </View>

            <View
              className={`header_content_setting ${
                switchNotifly
                  ? _isWeapp
                    ? 'transitionHeightY'
                    : '_transitionHeightY'
                  : 'transitionHeightN'
              }`}
            >
              <View className='header_content_setting_lines'>
                <Text>自动通知</Text>
                <Switch checked={switchNotifly} onChange={this.onSwitchChange} />
              </View>
              {_isWeapp ? (
                <View className='header_content_setting_lines'>
                  <Text>通知时间</Text>
                  <View style='display:flex'>
                    <View className='useTime'>{timeValue}</View>
                    <Text
                      onClick={this.onSettingTime}
                      className='header_content_setting_lines_btn'
                      style='color: #2E6BE6'
                    >
                      {timeValue ? '修改' : '设置通知时间'}
                    </Text>
                  </View>
                </View>
              ) : (
                <View>
                  <View className='header_content_setting_lines' onClick={this.onSettingDateClick}>
                    <Text>通知日期</Text>
                    <View style='display:flex'>
                      <View className='useTime'>{timeValue}</View>
                      <Text
                        onClick={this.onSettingTime}
                        className='header_content_setting_lines_btn'
                        style='color: #2E6BE6'
                      >
                        {timeValue ? '修改' : '设置通知时间'}
                      </Text>
                    </View>
                  </View>
                  <Picker value={timerValue_h5} onChange={this.onTimerChange} mode='time'>
                    <View className='header_content_setting_lines'>
                      <Text>通知时间</Text>
                      <View
                        style={{
                          display: 'flex',
                          color: timerValue_h5 ? '' : '#2E6BE6'
                        }}
                      >
                        {timerValue_h5 || '设置'}
                        {timerValue_h5 && (
                          <Text
                            className='header_content_setting_lines_btn'
                            style='color: #2E6BE6;'
                          >
                            修改
                          </Text>
                        )}
                      </View>
                    </View>
                  </Picker>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className='center'>
          {linkUserList.map(item => (
            <View key={item.mpUserId} className='center_item'>
              <View className='center_item_headImg'>
                <Image className='center_item_headImg_img' src={item.avatar} />
              </View>
              <View className='center_item_inforMation'>
                <View className='center_item_inforMation_nickName'>
                  <View className='center_item_inforMation_nickName_text'>
                    <Text>{item.remark || item.nickName}</Text>
                  </View>
                </View>

                <View className='center_item_inforMation_nickName'></View>
              </View>
            </View>
          ))}
        </View>
        {maskIsShow && (
          <View className='mask' onClick={this.onCloseClick}>
            {_isWeapp ? (
              <View className='time_picker'>
                {this.renderDateView()}
                <View className='mask_title'>选择时间</View>
                <PickerView
                  onChange={this.onBindChange}
                  style='width: 100%; height: 110px;'
                  value={timeIndex}
                >
                  <PickerViewColumn>
                    {hours.map(item => (
                      <View key={item} className='picker_view_item'>
                        {item}时
                      </View>
                    ))}
                  </PickerViewColumn>
                  <PickerViewColumn>
                    {minutes.map(item => (
                      <View key={item} className='picker_view_item'>
                        {item}分
                      </View>
                    ))}
                  </PickerViewColumn>
                </PickerView>
              </View>
            ) : (
              <View className='time_picker'>{dateIsShow_h5 && this.renderDateView()}</View>
            )}
          </View>
        )}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(automaticNotification)