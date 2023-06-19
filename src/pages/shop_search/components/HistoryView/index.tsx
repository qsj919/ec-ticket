import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import delIcon from '@/images/icon/delete_32.png'
import { BaseItem } from '@@types/base'
import messageFeedback from '@services/interactive'
import styles from './history.module.scss'

interface Props {
  data: BaseItem[]
  onDelAll(): void
  onTagDel(item: BaseItem, index: number): void
  onTagClick(item: BaseItem, index: number): void
}

export default function HistoryTagsView({ data, onDelAll, onTagDel, onTagClick }: Props) {
  function deleteAll() {
    messageFeedback.showAlertWithCancel('是否删除所有历史', '提示', onDelAll)
  }

  function deleteTag(data: BaseItem, index: number) {
    messageFeedback.showAlertWithCancel('是否删除该条历史', '提示', () => onTagDel(data, index))
  }

  function onTagClickInternal(data: BaseItem, index: number) {
    onTagClick(data, index)
  }

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>历史搜索</Text>
        <Image className={styles.del_icon} src={delIcon} onClick={deleteAll} />
      </View>
      <View className={styles.tags}>
        {data.map((item, index) => (
          <View
            className={styles.tag}
            key={item.value}
            onLongPress={() => deleteTag(item, index)}
            onClick={() => onTagClickInternal(item, index)}
          >
            {item.label}
          </View>
        ))}
      </View>
    </View>
  )
}

HistoryTagsView.defaultProps = {
  data: []
}
