import Taro, { pxTransform } from '@tarojs/taro'
import React from 'react'
import { View, Text, Block } from '@tarojs/components'
import cn from 'classnames'

export type ButotnLabels = [string, string?] | string

interface Props {
  size: 'large' | 'normal' | 'small' // large 670 x 88, normal 200 x 72, small, 126 x 48
  label: string
  labels: [ButotnLabels, ButotnLabels] // 优先级大于label 按钮组 仅支持2个按钮
  onButtonClick?: () => void
  onLeftButtonClick?: () => void
  onRightButtonClick?: () => void
  width?: number // 影响整体的宽度，下同
  height?: number
  buttonClass?: string
  disabled: boolean | [boolean, boolean?]
  leftButtonClass: string
  rightButtonClass: string
}

// interface State {}

export default class EButton extends React.PureComponent<Props> {
  static defaultProps = {
    leftButtonClass: 'orange_button',
    rightButtonClass: '',
    size: 'normal',
    label: '',
    labels: [],
    disabled: false
  }

  static options = {
    addGlobalClass: true
  }

  isDisabled = (index: number = 0) => {
    const { disabled } = this.props
    if (Array.isArray(disabled)) {
      return disabled[index]
    } else {
      return disabled
    }
  }

  onLeftClick = () => {
    const { onButtonClick, onLeftButtonClick } = this.props
    if (this.isDisabled()) return
    if (onLeftButtonClick) {
      onLeftButtonClick()
    } else if (onButtonClick) {
      onButtonClick()
    }
  }

  onRightClick = () => {
    const { onButtonClick, onRightButtonClick } = this.props
    if (this.isDisabled(1)) return
    if (onRightButtonClick) {
      onRightButtonClick()
    } else if (onButtonClick) {
      onButtonClick()
    }
  }

  onSingleClick = () => {
    const { onButtonClick } = this.props
    if (this.isDisabled()) return
    onButtonClick && onButtonClick()
  }

  onBtnClick = (btnType: 'left' | 'right') => {
    if (btnType === 'left') {
      this.onLeftClick()
    } else if (btnType === 'right') {
      this.onRightClick()
    }
  }

  render() {
    const {
      label,
      labels,
      size,
      width,
      height,
      buttonClass,
      leftButtonClass,
      rightButtonClass
    } = this.props
    const containerStyle: { width?: string; height?: string } = {}
    const buttonStyle: { borderRadius?: string } = {}
    const buttonLeftStyle: { borderRadius?: string } = {}
    const buttonRightStyle: { borderRadius?: string } = {}
    if (typeof width === 'number') {
      containerStyle.width = pxTransform(width)
    }
    if (typeof height === 'number') {
      const radius = pxTransform(height / 2)
      containerStyle.height = pxTransform(height)
      buttonStyle.borderRadius = pxTransform(height / 2)
      buttonLeftStyle.borderRadius = `${radius} 0 0 ${radius}`
      buttonRightStyle.borderRadius = `0 ${radius} ${radius} 0`
    }
    return (
      <View
        className={cn('e_button_container', `e_button_container--${size}`)}
        // onClick={this.onBtnClick}
        style={containerStyle}
      >
        {labels.length > 0 ? (
          labels.slice(0, 2).map((item, index) => (
            <View
              key={index}
              className={cn(
                'e_button',
                {
                  'e_button--disabled': this.isDisabled(index)
                },
                buttonClass,
                {
                  'e_button--left': index === 0,
                  [leftButtonClass]: index === 0,
                  'e_button--right': index === 1,
                  [rightButtonClass]: index === 1
                }
              )}
              style={index === 0 ? buttonLeftStyle : buttonRightStyle}
              data-index={index}
              onClick={this.onBtnClick.bind(this, index === 0 ? 'left' : 'right')}
            >
              {Array.isArray(item) ? (
                <Block>
                  <View className='line_1'>
                    {/* 如果以人民币符号¥开头,将符号字号置小 */}
                    {item[0]}
                  </View>
                  <View className='line_2'>{item[1]}</View>
                </Block>
              ) : (
                item
              )}
            </View>
          ))
        ) : (
          <View
            className={cn(
              'e_button',
              'e_button--single',
              {
                'e_button--disabled': this.isDisabled()
              },
              buttonClass
            )}
            onClick={this.onSingleClick}
          >
            {label}
          </View>
        )}
      </View>
    )
  }
}
