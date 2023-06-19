import Taro from '@tarojs/taro'
import {React,  useState } from 'react'
import { View, Image } from '@tarojs/components'
import UploadImgSelect from '../UploadImgSelect'
import BizLicenseBg from '../../images/biz_license_bg.png'
import DefaultBgImg from '../../images/default_bg.png'
import styles from './index.module.scss'

interface IProps {
  label?: string
  onImgUpload: any
  url?: string | null
  type?: 'bizLicense'
}

const bgImgTypeMap = {
  bizLicense: BizLicenseBg
}

export default function AuthImgUpload(props: IProps) {
  const { label, onImgUpload, url, type } = props
  const [isShowSelectMenu, setIsShowSelectMenu] = useState(false)

  const showSelectMenu = () => setIsShowSelectMenu(true)
  const hideSelectMenu = () => setIsShowSelectMenu(false)

  return (
    <View className={styles.container}>
      <Image
        className={styles.container__image}
        src={url || (type ? bgImgTypeMap[type] : DefaultBgImg)}
        onClick={showSelectMenu}
      />
      {label !== undefined && <View className={styles.container__label}>{label}</View>}
      {isShowSelectMenu && (
        <UploadImgSelect
          onImgUpload={onImgUpload}
          hideSelectMenu={hideSelectMenu}
        ></UploadImgSelect>
      )}
    </View>
  )
}
