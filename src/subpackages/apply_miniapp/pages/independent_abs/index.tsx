import { View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import React, { useState } from 'react'
import IndependentAbsBg from '../../images/independent_abs_bg.jpg'
import CustomerServiceQR from '../../images/customer_service_qr_code.jpg'
import styles from './index.module.scss'

export default function IndependentAbs() {
  const [previewing, setPreviewing] = useState(false)
  const PreviewImage = () => {
    if (Taro.getEnv() === Taro.ENV_TYPE.WEB) {
      setPreviewing(true)
    } else {
      Taro.previewImage({
        urls: [CustomerServiceQR]
      })
    }
  }

  const cancelPreview = e => {
    e.stopPropagation()
    setPreviewing(false)
  }

  return (
    <View onClick={PreviewImage}>
      <Image className={styles.bg_img} src={IndependentAbsBg} mode='widthFix'></Image>
      {previewing && (
        <View className={styles.preview} onClick={cancelPreview}>
          <Image className={styles.preview__img} src={CustomerServiceQR} mode='widthFix'></Image>
        </View>
      )}
    </View>
  )
}
