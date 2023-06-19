import { View, Image, Text, Button } from '@tarojs/components'
import React from 'react'
import WarningBg from '../../../images/warning.png'
import styles from '../index.module.scss'

interface IProps {
  onReSubmit: () => void
}

export default function ApplyError(props: IProps) {
  const { onReSubmit } = props

  return (
    <View className={styles.page}>
      <Image className={styles.img} src={WarningBg} mode='widthFix'></Image>
      <Text className={styles.title}>小程序创建失败</Text>
      <Text className={styles.label}>请修改信息后重新创建</Text>
      <Button className={styles.btn} onClick={onReSubmit}>
        去修改
      </Button>
    </View>
  )
}
