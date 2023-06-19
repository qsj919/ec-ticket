import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text } from '@tarojs/components'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { SlideDirection } from '@components/SlideContainer/type'

import './index.scss'

const intro = [
  {
    title: '期初',
    content: '选择日期范围之前的欠款总金额'
  },
  {
    title: '付款',
    content: '选择日期范围内的付款总金额'
  },
  {
    title: '退货',
    content: '选择日期范围内的退货总金额'
  },
  {
    title: '期末',
    content: '累计到目前为止的欠款总金额'
  },
  {
    title: '调整',
    content: '商家调整账款的金额'
  }
]

interface Props {
  visible: boolean
  onRequestClose?: () => void
}

export default function IntroModal(props: Props) {
  return (
    <SlideContainer {...props} direction={SlideDirection.Center} containerClass='bg_trans'>
      <View className='statement_intro_container'>
        <View className='statement_intro__content'>
          {intro.map(item => (
            <View className='statement_intro__content__item' key={item.title}>
              <Text className='statement_intro__content__item__title'>{item.title}</Text>
              <View className='statement_intro__content__item__text'>{item.content}</View>
            </View>
          ))}
        </View>
        <View className='close_circle' onClick={props.onRequestClose} />
      </View>
    </SlideContainer>
  )
}
