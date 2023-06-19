import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { Image, Text, View } from '@tarojs/components'
import { ShareHistoryItem } from '../../types'
import './index.scss'

interface Props {
  data: ShareHistoryItem
  onShareClick?(data: ShareHistoryItem): void
  onItemClick?(data: ShareHistoryItem): void
  onMoreClick?(data: ShareHistoryItem): void
}

function HistoryShareCell( props: Props ){
  const {
    data: { spuList = [], type, createdDate = '', name }
  } = props
  let typeName = ''
  switch (type) {
    case 0:
      typeName = '自定义'
      break
    case 1:
      typeName = '爆款'
      break
    case 2:
      typeName = '新品'
      break
  }

  const onMoreClick = e => {
    e.stopPropagation()
    props.onMoreClick && props.onMoreClick(props.data)
  }
  const onShareClick = e => {
    e.stopPropagation()
    props.onShareClick && props.onShareClick(props.data)
  }

  const onItemClick = () => {
    props.onItemClick && props.onItemClick(props.data)
  }

  return (
    <View className='share_history_cell' onClick={onItemClick}>
      <View className='share_history_cell__header aic'>
        <Text>{createdDate.split(' ')[0]}</Text>
        <Text className='share_history_cell__header__name'>{name}</Text>
        <Text className='share_history_cell__header__type'>{typeName}</Text>
      </View>
      <View className='share_history_cell__content aic jcsb'>
        <View className='share_history_cell__content__goods aic'>
          {spuList.slice(0, 3).map(item => (
            <Image
              mode='aspectFill'
              className='share_history_cell__content__goods_img'
              key={item.imgUrl}
              src={item.imgUrl}
            />
          ))}
        </View>
        <View className='share_history_cell__content__op aic'>
          <View
            className='share_history_cell__content__op__block share_history_cell__content__op__block--more'
            onClick={onMoreClick}
          >
            ···
          </View>
          <View
            className='share_history_cell__content__op__block share_history_cell__content__op__block--share'
            onClick={onShareClick}
          >
            分享
          </View>
        </View>
      </View>
    </View>
  )
}

HistoryShareCell.defaultProps = {
  data: {} as ShareHistoryItem
}

HistoryShareCell.options = {
  addGlobalClass: true
}

export default HistoryShareCell
