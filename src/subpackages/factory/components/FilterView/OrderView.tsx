import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import cn from 'classnames'
import shadow from '@src/images/filter_shadow.png'
import images from '@src/config/images'
import i18n from '@src/i18n'

import caretDown from '../../images/caret_down_black_20.png'
import './order_view.scss'

export interface OrderData {
  label: string
  value: string
  disableOrder?: boolean
}

interface Props {
  data: OrderData[]
  filterBtn?: boolean
  onItemClick: (orderBy: string, order: 'decrease' | 'increase') => void
  onFilterClick?: () => void
  theme?: 'white' | ''
  increase?: boolean
}

interface State {
  activeIndex: number
  order: 'decrease' | 'increase'
}

export default class OrderView extends React.PureComponent<Props, State> {
  static defaultProps = {
    data: [],
    filterBtn: false,
    theme: ''
  }

  constructor(props) {
    super(props)
    this.state = {
      activeIndex: 0,
      order: props.increase ? 'increase' : 'decrease'
    }
  }

  onOrderItemClick = (index: number) => {
    const { data, onItemClick } = this.props
    const item = data[index]
    const { activeIndex, order } = this.state
    let _order
    if (item.disableOrder) {
      this.setState({ activeIndex: index })
    } else {
      if (index === activeIndex) {
        _order = order === 'decrease' ? 'increase' : 'decrease'
        this.setState((state: State) => ({
          order: state.order === 'decrease' ? 'increase' : 'decrease'
        }))
      } else {
        _order = 'decrease'
        this.setState((state: State) => ({
          activeIndex: index,
          order: 'decrease'
        }))
      }
    }
    onItemClick && onItemClick(item.value, _order)
  }

  onFilterBtnClick = () => {
    const { onFilterClick } = this.props
    onFilterClick && onFilterClick()
  }

  render() {
    const { data, filterBtn, theme } = this.props
    const { activeIndex, order } = this.state
    let image = caretDown
    if (theme === 'white') {
      image = images.common.arrow_white_down_20
    }
    return (
      <View className='order_container'>
        <View className={`order order_${theme}`} style={{ paddingRight: filterBtn ? '140rpx' : 0 }}>
          {data.map((item, index) => (
            <View
              className={cn('order_item', {
                'order_item--active': activeIndex === index
              })}
              onClick={() => this.onOrderItemClick(index)}
              key='value'
            >
              <Text>{item.label}</Text>
              {!item.disableOrder && activeIndex === index && (
                <Image src={image} className={cn('caret', { 'caret--up': order === 'increase' })} />
              )}
            </View>
          ))}
        </View>
        {filterBtn && (
          <View className='order__filter' onClick={this.onFilterBtnClick}>
            <Image src={shadow} className='order__filter__shadow' />
            {i18n.t._('filter')}
          </View>
        )}
      </View>
    )
  }
}
