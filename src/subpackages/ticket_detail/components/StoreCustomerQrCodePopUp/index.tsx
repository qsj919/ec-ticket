import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Block } from '@tarojs/components'
import CloseIcon from '@/images/close_white_circle.png'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StoreCustomerQrCodePopUpProps {
  visible: boolean
  url?: string
  onCloseClick: () => void
}

const StoreCustomerQrCodePopUp = (props: StoreCustomerQrCodePopUpProps) => {
  const { visible, url, onCloseClick } = props

  const containerCls = classnames(styles.container, {
    [styles['container--active']]: visible
  })

  const maskCls = classnames(styles.mask, {
    [styles['mask--active']]: visible
  })

  return visible ? (
    <Block>
      <View className={containerCls}>
        <Image className={styles.close} src={CloseIcon} onClick={onCloseClick}></Image>
        <Image
          className={styles.bg}
          src={url}
          mode='widthFix'
          onClick={() => url && Taro.previewImage({ urls: [url] })}
        ></Image>
      </View>
      <View className={maskCls}></View>
    </Block>
  ) : (
    <Block />
  )
}

export default StoreCustomerQrCodePopUp
