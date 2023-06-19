import Taro, { chooseImage } from '@tarojs/taro'
import React, { useState } from 'react'
import { View, Image } from '@tarojs/components'
import styles from './index.module.scss'
import AvatarBg from '../../images/avatar_bg.png'
import UploadImgSelect from '../UploadImgSelect'

interface IProps {
  label?: string
  dispatch: any
  url?: string | null
}

export default function AvatarUpload(props: IProps) {
  const { label, url } = props
  const [isShowSelectMenu, setIsShowSelectMenu] = useState(false)

  const showSelectMenu = () => setIsShowSelectMenu(true)
  const hideSelectMenu = () => setIsShowSelectMenu(false)

  const onImgUpload = async () => {
    await chooseImage({
      count: 1,
      sourceType: ['album'],
      success: res => {
        Taro.navigateTo({
          url: `/subpackages/apply_miniapp/pages/img_cropper/index?width=144&height=144&imgtype=avatar&url=${res.tempFilePaths[0]}`
        })
      }
    })
  }

  return (
    <View className={styles.container}>
      <Image className={styles.container__image} src={url || AvatarBg} onClick={showSelectMenu} />
      {label !== undefined && <View className={styles.container__label}>{label}</View>}
      {isShowSelectMenu && (
        <UploadImgSelect onImgUpload={onImgUpload} hideSelectMenu={hideSelectMenu}></UploadImgSelect>
      )}
    </View>
  )
}
