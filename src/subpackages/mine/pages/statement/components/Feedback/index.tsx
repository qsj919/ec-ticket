import Taro from '@tarojs/taro'
import React, { useState, useEffect } from 'react'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { View, Textarea } from '@tarojs/components'
import EButton from '@components/Button/EButton'

import styles from './index.module.scss'

interface Props {
  visible: boolean
  onRequestClose(): void
  onBtnClick(v: string): void
}

export default function Feedback({ visible, onRequestClose, onBtnClick }: Props) {
  const [input, updateInput] = useState('')

  function onInput({ detail }) {
    updateInput(detail.value)
  }

  function onClick() {
    onBtnClick(input)
  }

  useEffect(() => {
    if (!visible) {
      updateInput('')
    }
  }, [visible])

  function fixWx() {
    document.body.scrollIntoView(false)
  }

  return (
    <SlideContainer visible={visible} onRequestClose={onRequestClose}>
      <View className={styles.container}>
        <View className={styles.title}>对账单数据出现问题？及时反馈吧~ </View>
        <Textarea
          className={styles.input}
          value={input}
          autoFocus
          placeholder='请描述遇到的问题,您也可以通过公众号《商陆花信息服务号》来反馈问题'
          onInput={onInput}
          onBlur={fixWx}
        />
        <EButton label='提交' onButtonClick={onClick} />
      </View>
    </SlideContainer>
  )
}
