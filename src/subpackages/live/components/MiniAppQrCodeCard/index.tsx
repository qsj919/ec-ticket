import { View, Image, Text } from '@tarojs/components'
import React, { useEffect, useState } from 'react'
import { getOrderApiInvokeQrCodeUrl } from '@api/live_api_manager'
import EImage from '@components/EImage'
import { getTaroParams } from '@utils/utils'
import CloseBtn from '../../images/close_icon.png'
import styles from './index.module.scss'
interface IProps {
  visible: boolean
  mpErpId: string
  closeVisible: () => void
}
export default function MiniAppQrCodeCard(props: IProps) {
  const { visible, closeVisible } = props
  const [qrCode, setQrCode] = useState([])

  useEffect(() => {
    if (visible === true) {
      Taro.showLoading({ title: '加载中' })
      getOrderApiInvokeQrCodeUrl({ mpErpId: getTaroParams(Taro.getCurrentInstance?.()).mpErpId })
        .then(res => {
          setQrCode(res.data.rows)
          Taro.hideLoading()
        })
        .catch(() => {
          Taro.hideLoading()
        })
    }
  }, [visible])

  return visible ? (
    <View className={styles.container}>
      <View className={styles.container__card}>
        <Image
          className={styles.container__card__close__btn}
          src={CloseBtn}
          onClick={closeVisible}
        ></Image>
        <View className={styles.container__card__imgWarp}>
          <EImage src={qrCode}></EImage>
        </View>
        <Text className={styles.container__card__label}>请扫描此二维码</Text>
        <Text className={styles.container__card__label}>完成生成订单任务</Text>
      </View>
      <View className={styles.mask}></View>
    </View>
  ) : (
    <View></View>
  )
}
