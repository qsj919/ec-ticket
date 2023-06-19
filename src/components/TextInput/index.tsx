/* eslint-disable react/react-in-jsx-scope */
import { Input, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import React, { Component, useState} from 'react'
import classnames from 'classnames'
import './index.scss'

const TextInput = props => {
  const [isInput, setInput] = useState(false)

  const onBlur = e => {
    setInput(false)
    props.onBlur && props.onBlur(e)
  }

  const onTextClick = () => {
    setInput(true)
  }

  return isInput ? (
    <Input
      className={props.className}
      value={props.value}
      onInput={props.onInput}
      onBlur={onBlur}
      focus
      cursorSpacing={30}
      cursor={props.value ? props.value.toString().length : 0}
    />
  ) : (
    <View
      className={classnames('view', props.className, {
        placeholder_class: !props.value
      })}
      onClick={onTextClick}
    >
      {props.value || props.placeholder || ''}
    </View>
  )
}

export default TextInput
