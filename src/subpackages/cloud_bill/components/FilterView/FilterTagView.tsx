/**
 * @author GaoYuJian
 * @create date 2019-02-22
 * @desc
 */
import Taro from '@tarojs/taro'
import React, { PureComponent } from 'react'

import { View, Text, Image } from '@tarojs/components'
import classnames from 'classnames'
import FilterButton from './FilterButton'
import upIcon from './images/arrow_up_gray.png'
// import downIcon from './images/arrow_down_gray.png'
import './filter_tag_view.scss'

type OptionItem = {
  codeName: string
  codeValue: number
  isSelected?: boolean
}

type Props = {
  typeName: string
  typeValue: number
  items: OptionItem[]
  wrapLines: number
  onClick: (typeValue: number, item: OptionItem) => void
}

type State = {
  // 是否折叠
  isCollapse: boolean
  showCollapse: boolean
}

export default class FilterTagView extends PureComponent<Props, State> {
  static defaultProps = {
    items: []
  }

  constructor(props) {
    super(props)
    const { items = [], wrapLines = 2 } = props
    const showCollapse = items.length / 3 > wrapLines
    this.state = { isCollapse: false, showCollapse }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    if (nextProps.items !== this.props.items) {
      const showCollapse = nextProps.items.length / 3 > nextProps.wrapLines
      this.setState({ showCollapse })
    }
  }

  onItemClick(item: OptionItem) {
    const { onClick, typeValue } = this.props
    if (onClick) {
      onClick(typeValue, item)
    }
  }

  onCollapse() {
    this.setState({ isCollapse: !this.state.isCollapse })
  }

  render(): any {
    const { typeName, items } = this.props
    const { isCollapse, showCollapse } = this.state
    let displayItems = items
    if (showCollapse && isCollapse) {
      displayItems = items.slice(0, 3)
    }

    return (
      <View>
        {displayItems && displayItems.length > 0 && (
          <View className='filter-tag-view'>
            <View className='filter-tag-view__header'>
              <Text className='filter-tag-view__header__title'>{typeName}</Text>
              {showCollapse && (
                <Image
                  className={classnames('filter-tag-view__header__action', {
                    ['filter-tag-view__header__action--default']: isCollapse
                  })}
                  src={upIcon}
                  onClick={this.onCollapse.bind(this)}
                />
              )}
            </View>
            <View className='filter-tag-view__tags'>
              {displayItems.map(item => {
                return (
                  <FilterButton
                    key='codeValue'
                    title={item.codeName}
                    isSelected={item.isSelected}
                    onClick={this.onItemClick.bind(this, item)}
                    customStyle={`margin-bottom: ${Taro.pxTransform(
                      32
                    )}; margin-right: ${Taro.pxTransform(20)};`}
                  />
                )
              })}
            </View>
            <View className='filter-tag-view__divider' />
          </View>
        )}
      </View>
    )
  }
}
