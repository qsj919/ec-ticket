/**
 * @author GaoYuJian
 * @create date 2018-11-21
 * @desc
 */
import Taro from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { View, Textarea, Text } from '@tarojs/components'
import i18n from '@@/i18n'

import './remedit.scss'

type Props = {
  onEndInput: Function
  rem: string
  fixed: boolean
  cursorSpacing: number
  isRemInEdit: boolean
  type?: string
}

type State = {
  textSize: number
  text: string
}

export default class RemEdit extends PureComponent<Props, State> {
  static options = {
    addGlobalClass: true
  }

  constructor(props) {
    super(props)
    const rem = this.props.rem ? this.props.rem : ''
    this.state = {
      textSize: rem.length,
      text: rem
    }
  }

  onEndInput = () => {
    this.props.onEndInput(this.state.text)
  }

  onRemInput = event => {
    const text = event.detail.value
    const textSize = text.length
    if (textSize > 50) {
      this.setState({ text: text.substring(0, 50) })
      return
    }
    this.setState({ textSize, text })
  }

  render() {
    const { textSize, text } = this.state
    const { fixed, cursorSpacing, isRemInEdit, type } = this.props
    return (
      <View
        className='good_remark_edit'
        style={
          type === 'cart'
            ? 'width: 100vw; border-radius: 21px 21px 0 0;padding: 20px'
            : ' border-radius: 16px;'
        }
      >
        <View className='good_remark_content'>
          <Textarea
            className='remark_text'
            fixed={fixed}
            onConfirm={this.onEndInput}
            cursorSpacing={cursorSpacing}
            maxlength={50}
            focus={isRemInEdit}
            autoFocus={isRemInEdit}
            value={text}
            onInput={this.onRemInput}
          />
          <View className='remark_right'>
            <View className='remark_button' onClick={this.onEndInput}>
              {i18n.t._('complete')}
            </View>
            <View className='remark_size'>
              <Text className='remark_length'>{textSize}</Text>
              <Text className='remark_max_length'>/50</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
