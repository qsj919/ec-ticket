import Taro from '@tarojs/taro'
import React, { CSSProperties }  from 'react'
import { View, Image } from '@tarojs/components'
import classnames from 'classnames'
import MidImg from './mid.png'
import './index.scss'

type BtnConfig = {
  text: string
  className?: string
  customStyle?: string | CSSProperties
  onClick: () => void
}
interface Props {
  className?: string
  leftBtnConfig: BtnConfig
  rightBtnConfig: BtnConfig
}

export default class DoubleButton extends React.PureComponent<Props> {
  static defaultProps = {
    leftBtnConfig: {
      text: '',
      onClick: () => {},
    },
    rightBtnConfig: {
      text: '',
      onClick: () => {},
    },
  }

  render() {
    const { className, leftBtnConfig, rightBtnConfig } = this.props

    const containerCls = classnames('container', className)
    const leftBtnCls = classnames('btn', 'left_btn', leftBtnConfig.className)
    const rightBtnCls = classnames('btn', 'right_btn', rightBtnConfig.className)

    return (
      <View className={containerCls}>
        <View className={leftBtnCls} onClick={leftBtnConfig.onClick} style={{ width: '86px' }}>
          {leftBtnConfig.text}
        </View>
        <Image className='mid_img' src={MidImg} style={{ width: '28px' }}></Image>
        <View className={rightBtnCls} onClick={rightBtnConfig.onClick} style={{ width: '86px' }}>
          {rightBtnConfig.text}
        </View>
      </View>
    )
  }
}
