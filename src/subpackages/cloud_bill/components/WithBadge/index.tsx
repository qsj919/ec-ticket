import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import cn from 'classnames'

// export default function WithBadge(Wrapper: ) {}
interface Props {
  value: number | string
  maxValue: number
  position: 'bottom' | 'right' | 'center' | 'top' | 'left' // 以元素右上角为中心, right,top会影响中心点
  right?: number
  top?: number
  className?: string
  badgeContainerStyle: string
}

export default class WithBadge extends React.PureComponent<Props> {
  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    value: 0,
    maxValue: Number.MAX_SAFE_INTEGER,
    position: 'bottom',
    badgeContainerStyle: ''
  }

  render() {
    const { value, maxValue, right, top, position, className, badgeContainerStyle } = this.props
    const visible = (typeof value === 'number' || typeof value === 'string') && value > 0
    let _value
    if (visible) {
      if (value > maxValue) {
        _value = `${maxValue}+`
      } else {
        _value = value
      }
    }
    const style: { right?: string; top?: string; transform?: string } = {}
    if (typeof right === 'number') {
      style.right = Taro.pxTransform(right)
    }
    if (typeof top === 'number') {
      style.top = Taro.pxTransform(top)
    }
    switch (position) {
      case 'center':
        style.transform = 'translate(50%, -50%)'
        break
      case 'right':
        style.transform = 'translate(100%, -50%)'
        break
      case 'left':
        style.transform = 'translate(0, -50%)'
        break
      case 'top':
        style.transform = 'translate(50%, -10%)'
        break
      case 'bottom':
        style.transform = 'translate(50%, 0)'
        break
      default:
        break
    }

    return (
      <View className={cn('badge_container', className)} style={badgeContainerStyle}>
        {this.props.children}
        {visible && (
          <View className='badge' style={style}>
            {_value}
          </View>
        )}
      </View>
    )
  }
}
