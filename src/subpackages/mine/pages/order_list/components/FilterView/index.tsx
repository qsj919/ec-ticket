/**
 * @author GaoYuJian
 * @create date 2019-02-22
 * @desc  侧滑筛选视图
 */
import Taro from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { View, ScrollView, Text, Input } from '@tarojs/components'
import { cloneDeep } from 'lodash'
import { FilterOption, FilterOptionItem, FilterUpdateOption } from '@@types/base'
import { DefaultDispatchProps, GlobalState } from '@@/types/model_state'
import dayjs from 'dayjs'
import messageFeedback from '@services/interactive'

// import { Modal } from '@ecool/mini-ui'
import FilterTagView from './FilterTagView'
import FilterRangeView from './FilterRangeView'
import './index.scss'

/**
 * Props.configOptions用于设置State.defaultOptions
 * 后续组件内部状态以State.displayOptions为准
 * Props.updateOption 用于更新State.displayOptions
 */
type OwnProps = {
  isOpened: boolean
  onClose: () => void
  configOptions: FilterOption[]
  updateOption?: FilterUpdateOption
  // type = tag 类型的标签超过几行折叠，默认2行
  wrapLines?: number
  onValueChanged: (options: FilterOption[]) => void
  // option变化时用于外部处理联动数据(如城市变化时，相应的市场也发生变化)
  onItemChanged?: (option: FilterOption) => void
  statusBarHeight?: number
}

type State = {
  defaultOptions: FilterOption[]
  options: FilterOption[]
  displayOptions: FilterOption[]
}

class FilterView extends PureComponent<OwnProps, State> {
  static defaultProps = {
    wrapLines: 2
  }

  constructor(props) {
    super(props)
    const { configOptions = [] } = props
    this.state = {
      defaultOptions: configOptions,
      options: cloneDeep(configOptions),
      displayOptions: cloneDeep(configOptions)
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<OwnProps>, nextContext: any): void {
    const { configOptions, updateOption } = nextProps
    if (configOptions !== this.props.configOptions) {
      if (this.state.defaultOptions.length === 0) {
        this.setState({
          defaultOptions: configOptions,
          options: cloneDeep(configOptions),
          displayOptions: cloneDeep(configOptions)
        })
      }
    }

    if (updateOption !== this.props.updateOption && updateOption) {
      const displayOptions: FilterOption[] = cloneDeep(this.state.displayOptions)
      const target = displayOptions.find(itOption => itOption.typeValue === updateOption.typeValue)
      if (target) {
        displayOptions.splice(updateOption.position, 1)
      }
      if (!updateOption.isRemove) {
        // @ts-ignore
        displayOptions.splice(updateOption.position, 0, cloneDeep(updateOption))
      }
      this.setState({ displayOptions })
    }
    // if (nextProps.priClassId !== this.props.priClassId) {
    //   this.onReset()
    // }
  }

  componentDidMount(): void {
    Taro.eventCenter.on('resetData', () => {
      this.onReset()
    })
  }

  componentWillUnmount(): void {
    Taro.eventCenter.off('resetData')
  }

  onItemClick(typeValue: string, item: FilterOptionItem) {
    const displayOptions = cloneDeep(this.state.displayOptions)
    const option = displayOptions.find(
      // @ts-ignore
      itOption => itOption.typeValue === typeValue
    )
    if (option) {
      for (const itItem of option.items) {
        // @ts-ignore
        if (itItem.codeValue === item.codeValue) {
          // @ts-ignore
          itItem.isSelected = !item.isSelected
          if (option.multipleSelect) {
            break
          }
        } else {
          if (!item.isSelected && !option.multipleSelect) {
            // @ts-ignore
            itItem.isSelected = false
          }
        }
      }
      this.setState({ displayOptions }, () => {
        if (this.props.onItemChanged) {
          this.props.onItemChanged(cloneDeep(option))
        }
      })
    }
  }

  onRangeValueChanged(
    typeValue: string,
    startValue: string,
    endValue: string,
    buttonValue: number
  ) {
    const displayOptions = cloneDeep(this.state.displayOptions)
    const option = displayOptions.find(
      // @ts-ignore
      itOption => itOption.typeValue === typeValue
    )
    if (option && option.type === 'range') {
      const items = option.items as string[]
      items[0] = startValue
      items[1] = endValue
      items[4] = buttonValue !== undefined ? buttonValue : -1
      this.setState({ displayOptions })
    }
  }

  onInputChanged(e) {
    const displayOptions = cloneDeep(this.state.displayOptions)
    const option = displayOptions.find(
      // @ts-ignore
      itOption => itOption.type === 'input'
    )
    if (option) {
      const items = option.items as string[]
      items[0] = e.target.value
      this.setState({ displayOptions })
    }
  }

  onClose() {
    this.setState({ displayOptions: cloneDeep(this.state.options) })
    this.props.onClose()
  }

  onReset() {
    this.setState({ displayOptions: cloneDeep(this.state.defaultOptions) })
  }

  onConfirm() {
    const proTimeArr = this.state.displayOptions[0].items
    if (proTimeArr[0] && proTimeArr[1]) {
      const date1 = dayjs(proTimeArr[0])
      const date2 = dayjs(proTimeArr[1])
      if (date1.diff(date2) > 0) {
        messageFeedback.showToast('开始时间选择不能晚于结束时间！')
        return
      }
    }
    this.setState({ options: cloneDeep(this.state.displayOptions) })
    this.props.onValueChanged(cloneDeep(this.state.displayOptions))
    this.props.onClose()
  }

  render(): any {
    const { isOpened, wrapLines, statusBarHeight } = this.props
    const displayOptions = this.state.displayOptions
    return (
      // <Modal direction='right' visible={isOpened} onRequestClose={this.onClose.bind(this)}>
        <View className='filter-view'>
          <View
            className='filter-view__content'
            style={statusBarHeight ? `top: ${44 + statusBarHeight}px` : ''}
          >
            <ScrollView scrollY style='height: 100%;'>
              {displayOptions.map((option, index) => {
                return option.type === 'input' ? (
                  <View className='filter-input-view'>
                    <Text className='filter-input-view__title'>{option.typeName}</Text>
                    <Input
                      className='filter-input-view__input'
                      placeholder={'请输入' + option.typeName}
                      value={option.items[0] as string}
                      placeholderStyle='font-size: 15px; color: #cccccc; text-align: center;'
                      onInput={this.onInputChanged.bind(this)}
                    />
                  </View>
                ) : option.type === 'tag' ? (
                  <FilterTagView
                    key='typeValue'
                    typeName={option.typeName}
                    typeValue={option.typeValue}
                    items={option.items as FilterOptionItem[]}
                    wrapLines={wrapLines}
                    onClick={this.onItemClick.bind(this)}
                  />
                ) : (
                  <FilterRangeView
                    key='typeValue'
                    typeName={option.typeName}
                    typeValue={option.typeValue}
                    startValue={option.items[0] as string}
                    endValue={option.items[1] as string}
                    startPlaceholder={option.items[2] as string}
                    endPlaceholder={option.items[3] as string}
                    buttonValue={option.items[4] as number}
                    onValueChanged={this.onRangeValueChanged.bind(this)}
                  />
                )
              })}
            </ScrollView>
          </View>
          <View className='bottom_view_wrap'>
            <View className='filter-view__action-button'>
              <View className='filter-view__action-button__reset' onClick={this.onReset.bind(this)}>
                <Text className='filter-view__action-button__reset___text'>重置</Text>
              </View>
              <View
                className='filter-view__action-button__confirm'
                onClick={this.onConfirm.bind(this)}
              >
                <Text className='filter-view__action-button__confirm___text'>确认</Text>
              </View>
            </View>
          </View>
        </View>
      // </Modal>
    )
  }
}

export default FilterView
