import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Block } from '@tarojs/components'
import cn from 'classnames'
import backIcon from '@/images/angle_left_black_60.png'
// import DatePicker from '@pages/component/dateComponent'
import { getOneDate, getTargerPastDays } from '@utils/utils'
import SearchbarView from '@components/SearchBarView/SearchbarView'

import rightIcon from '../../images/angle_right_gray_40.png'
import DatePicker from '../DatePicker/index'
import './index.scss'

interface FilterItem {
  id: string
  name: string
}

type OwnProps = {
  brandList: Array<FilterItem>
  shopFilterList: Array<FilterItem>
  providerList: Array<FilterItem>
  seasonList: Array<FilterItem>
  isVisible: boolean
  onConfirm: ({ dateValue, hotValue, filterShop, brand, provider, season }) => void
  onReset: () => void
  onClose: () => void
  from?: string
}

interface State {
  dateValue: string
  hotValue: string
  secondModelShow: boolean
  secondType: string
  filterShop: FilterItem
  brand: FilterItem
  provider: FilterItem
  season: FilterItem
  datePickerIsShow: boolean
  _dateValue: { prodate1: string; prodate2: string }
  providerListState
}

export default class SelectModel extends React.Component<OwnProps, State> {
  state = {
    dateValue: '',
    hotValue: '',
    secondModelShow: false,
    secondType: '',
    filterShop: {} as FilterItem,
    provider: {} as FilterItem,
    brand: {} as FilterItem,
    season: {} as FilterItem,
    datePickerIsShow: false,
    _dateValue: { prodate1: '', prodate2: '' },
    providerListState: []
  }

  defaultProps = {
    brandList: [],
    shopList: [],
    providerList: [],
    seasonList: []
  }

  dateType: number = 1
  searchValue: string = ''

  componentDidMount() {
    if (this.props.providerList) {
      this.setState({
        providerListState: this.props.providerList
      })
    }
  }

  onCellClick = e => {
    const { type } = e.currentTarget.dataset
    this.setState({
      secondModelShow: type !== 'date' && type !== 'hot',
      secondType: type
    })
  }

  getMemu = () => {
    const { dateValue, hotValue, filterShop, brand, provider, season } = this.state
    let _menu = [
      // {
      //   label: '门店',
      //   key: 'filterShop',
      //   value: filterShop.name
      // },
      {
        label: '商陆花上架日期',
        key: 'date',
        value: '',
        activeValue: dateValue,
        list: [
          {
            label: '近7天',
            value: '7'
          },
          {
            label: '近15天',
            value: '15'
          },
          {
            label: '近30天',
            value: '30'
          }
        ]
      },
      {
        label: '厂商',
        key: 'provider',
        value: provider.name
      },
      {
        label: '品牌',
        key: 'brand',
        value: brand.name
      },
      {
        label: '季节',
        key: 'season',
        value: season.name
      },
      {
        label: '爆款设置',
        key: 'hot',
        value: '',
        activeValue: hotValue,
        list: [
          {
            label: '爆款置顶',
            value: '1'
          }
        ]
      }
    ]
    if (this.props.from === 'use_goods') {
      _menu.pop()
    }
    return _menu
  }

  onCellItemClick = (k, v) => {
    if (k === 'date') {
      this.dateType = 1
      this.setState({
        dateValue: v,
        _dateValue: { prodate1: '', prodate2: '' }
      })
    }
    if (k === 'hot') {
      this.setState({
        hotValue: v
      })
    }
  }

  onBackClick = () => {
    this.setState({
      secondModelShow: false
    })
  }

  getSecondList = () => {
    const { secondType, providerListState } = this.state
    const { brandList, shopFilterList, seasonList } = this.props
    switch (secondType) {
      case 'filterShop':
        return {
          label: '门店',
          list: [...shopFilterList]
        }
      case 'provider':
        return {
          label: '厂商',
          list: [...providerListState]
        }
      case 'brand':
        return {
          label: '品牌',
          list: [...brandList]
        }
      case 'season':
        return {
          label: '季节',
          list: [...seasonList]
        }
      default:
        return {
          label: '',
          list: []
        }
    }
  }

  onResetClick = () => {
    this.setState(
      {
        dateValue: '',
        hotValue: '',
        filterShop: { id: '', name: '' },
        brand: { id: '', name: '' },
        provider: { id: '', name: '' },
        season: { id: '', name: '' },
        _dateValue: { prodate1: '', prodate2: '' },
        providerListState: this.props.providerList.map(p => ({ ...p }))
      },
      this.props.onReset
    )
  }
  onConfirmClick = () => {
    const { dateValue, hotValue, filterShop, brand, provider, season, _dateValue } = this.state
    let targetDate = dateValue ? getTargerPastDays(dateValue) : { startDate: '', endDate: '' }
    this.props.onConfirm &&
      this.props.onConfirm({
        dateValue:
          this.dateType === 1
            ? { prodate1: targetDate.startDate, prodate2: targetDate.endDate }
            : _dateValue,
        hotValue,
        filterShop,
        brand,
        provider,
        season
      })
  }

  onListClick = item => {
    const { secondType } = this.state
    this.setState(state => {
      return {
        ...state,
        [secondType]: item,
        secondModelShow: false
      }
    })
  }
  onDateClick = () => {
    this.dateType = 2
    this.setState({
      datePickerIsShow: true
    })
  }
  hideDatePicker = () => {
    this.setState({
      datePickerIsShow: false
    })
  }
  onDateConfirm = (params: { prodate1: string; prodate2: string }) => {
    this.dateType = 2
    this.setState({
      dateValue: '',
      _dateValue: params
    })

    this.hideDatePicker()
  }

  onMaskClose = () => {
    this.resetProviderList()
    this.props.onClose()
  }

  resetProviderList = () => {
    this.setState({
      providerListState: this.props.providerList.map(p => ({ ...p }))
    })
  }

  renderAction = () => {
    return (
      <View className='bottom_btn'>
        <View onClick={this.onResetClick} className='bottom_btn_rest'>
          重置
        </View>
        <View onClick={this.onConfirmClick} className='bottom_btn_sure'>
          确定
        </View>
      </View>
    )
  }

  onProviderInput = (searchValue: string) => {
    this.searchValue = searchValue
  }

  onProviderSearch = () => {
    const { providerList } = this.props
    this.setState({
      providerListState: providerList.filter(p => p.name.includes(this.searchValue))
    })
  }

  onProviderClear = () => {
    this.searchValue = ''
    this.resetProviderList()
  }

  renderSecondScreen = () => {
    const { secondModelShow, secondType } = this.state
    const content = this.getSecondList()
    return (
      <View
        className='select_model__content___secondScreen'
        style={{
          transform: secondModelShow ? 'translateX(0)' : 'translateX(100%)'
        }}
      >
        <View className='sticky_view'>
          <View className='select_model__content___secondScreen___header'>
            <View className='screen_back' onClick={this.onBackClick}>
              <Image src={backIcon} className='right_icon' />
              返回
            </View>
            <View className='select_model__content___secondScreen___header___label'>
              {content.label}
            </View>
          </View>
          {secondType === 'provider' && (
            <View className='select_model__content___secondScreen___searchView'>
              <SearchbarView
                placeholder='搜索厂商'
                onInput={this.onProviderInput}
                onSearchClick={this.onProviderSearch}
                onClearSearchClick={this.onProviderClear}
              />
              <View
                className='select_model__content___secondScreen___searchView__label'
                onClick={this.onProviderSearch}
              >
                搜索
              </View>
            </View>
          )}
        </View>
        <View className='select_model__content___secondScreen__list'>
          {content.list.map(l => (
            <View
              key={l.id}
              className='select_model__content___secondScreen__list___item'
              onClick={() => this.onListClick({ id: l.id, name: l.name })}
            >
              {l.name}
            </View>
          ))}
        </View>
      </View>
    )
  }

  render() {
    const MENU = this.getMemu()
    const { datePickerIsShow, _dateValue } = this.state
    const { isVisible } = this.props
    return (
      <Block>
        {isVisible && (
          <View className='select_model' onClick={this.onMaskClose}>
            <View className='select_model__content' onClick={e => e.stopPropagation()}>
              {MENU.map(m => (
                <View key={m.key}>
                  <View
                    className={cn('select_model__content___cell', {
                      select_model__content___cell__date: m.key === 'date',
                      select_model__content___cell__hotGood: m.key === 'hot'
                    })}
                    data-type={m.key}
                    onClick={this.onCellClick}
                  >
                    <View className='select_model__content___cell___label'>{m.label}</View>
                    <View className='select_model__content___cell___right'>
                      <View>{m.value}</View>
                      {m.key !== 'date' && m.key !== 'hot' && (
                        <Image src={rightIcon} className='right_icon' />
                      )}
                    </View>
                  </View>
                  {m.list && (
                    <View className='select_model__content__list'>
                      {m.list.map(l => (
                        <View
                          key={l.value}
                          // className='select_model__content___cell__list__item'
                          className={cn('select_model__content__list__item', {
                            ['select_model__content__list__item-active']: l.value === m.activeValue
                          })}
                          onClick={e => {
                            e.stopPropagation()
                            this.onCellItemClick(m.key, l.value)
                          }}
                        >
                          {l.label}
                        </View>
                      ))}
                    </View>
                  )}
                  {m.key === 'date' && (
                    <View className='screen_time_picker'>
                      <View
                        className='screen_time_picker__value'
                        onClick={this.onDateClick}
                        style={{
                          color: _dateValue ? '#222' : '#666'
                        }}
                      >
                        {_dateValue.prodate1
                          ? `${_dateValue.prodate1} 至 ${_dateValue.prodate2}`
                          : '选择时间'}
                      </View>
                    </View>
                  )}
                </View>
              ))}
              {this.renderAction()}

              {this.renderSecondScreen()}
            </View>
            <View onClick={e => e.stopPropagation()}>
              {datePickerIsShow && (
                // <DatePicker
                //   tabs={false}
                //   dateStart={getOneDate()}
                //   dateEnd={getOneDate()}
                //   onDateSelCancel={this.hideDatePicker}
                //   onConfimDateClick={this.onDateConfirm}
                // />
                <DatePicker
                  typeValue={17}
                  startValue={_dateValue.prodate1}
                  endValue={_dateValue.prodate2}
                  onDateSelCancel={this.hideDatePicker}
                  onConfimDateClick={this.onDateConfirm}
                />
              )}
            </View>
          </View>
        )}
      </Block>
    )
  }
}
