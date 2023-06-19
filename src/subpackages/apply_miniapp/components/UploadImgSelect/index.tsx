import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { SlideDirection } from '@components/SlideContainer/type'
import styles from './index.module.scss'

export default function UploadImgSelect(props) {
  const { hideSelectMenu, onImgUpload } = props
  const handleImgUpload = () => {
    onImgUpload()
    hideSelectMenu()
  }

  return (
    <SlideContainer direction={SlideDirection.Bottom} visible mask={true} maxHeight={100}>
      <View className={styles.selectmenu}>
        <View className={styles.selectmenu__item} onClick={handleImgUpload}>
          从相册选取
        </View>
        <View className='solid_line'></View>
        <View className={styles.selectmenu__item} onClick={hideSelectMenu}>
          取消
        </View>
      </View>
    </SlideContainer>
  )
}

UploadImgSelect.options = { addGlobalClass: true }