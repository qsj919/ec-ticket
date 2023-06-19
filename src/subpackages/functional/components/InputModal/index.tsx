import Taro from '@tarojs/taro'
import React, { useEffect, useState } from 'react'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { View, Input } from '@tarojs/components'
import { SlideDirection } from '@components/SlideContainer/type'
import './index.scss'

interface InputRule {
  rule?: RegExp
  msg: string
  maxLength?: number
  minLength?: number
}

interface Props {
  title: string
  // content?: string
  onConfirm?: (s: string) => void
  onCancel?: () => void
  visible: boolean
  onRequestClose: () => void
  defaultInput?: string
  rules?: InputRule[]
}

export default function InputModal({
  title,
  onConfirm,
  onCancel,
  onRequestClose,
  visible,
  defaultInput,
  rules
}: Props) {
  const [input, changeInput] = useState(defaultInput || '')
  function cancel() {
    onRequestClose()
    onCancel && onCancel()
  }

  function validate(value: string) {
    if (Array.isArray(rules)) {
      for (let i = 0; i < rules.length; i++) {
        const { maxLength = Number.MAX_SAFE_INTEGER, minLength = 0, msg, rule } = rules[i]
        if (value.length > maxLength || value.length < minLength || (rule && !rule.test(value))) {
          Taro.showToast({ title: msg, icon: 'none', duration: 1200 })
          return false
        }
      }
    }
    return true
  }

  function confirm() {
    const success = validate(input)
    if (success) {
      onRequestClose()
      onConfirm && onConfirm(input)
    }
  }

  function onInput(e) {
    changeInput(e.detail.value)
  }

  useEffect(() => {
    changeInput(defaultInput || '')
  }, [defaultInput])

  return visible ? (
    <SlideContainer
      // mask={false}
      onRequestClose={onRequestClose}
      visible={visible}
      direction={SlideDirection.Center}
      containerClass='bg_trans'
    >
      <View className='input_modal'>
        <View className='input_modal__title'>{title}</View>
        <View className='input_modal__input'>
          <View className='input_modal__input__input'>
            <Input
              style={{ position: 'relative', zIndex: 1 }}
              focus
              onInput={onInput}
              value={input}
            />
          </View>
        </View>
        <View className='input_modal__btns'>
          <View className='input_modal__btns__btn input_modal__btns__btn--left' onClick={cancel}>
            取消
          </View>
          <View className='input_modal__btns__btn input_modal__btns__btn--right' onClick={confirm}>
            确定
          </View>
        </View>
      </View>
    </SlideContainer>
  ) : null
}
