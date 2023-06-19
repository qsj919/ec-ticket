import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text, Button } from '@tarojs/components'
import classNames from 'classnames'
import styles from './notification.module.scss'

interface Props {
  icon: string
  title: string
  content: string
  button: string
  onBtnClick: () => void
  onClick: () => void
  background?: string
  color?: string
  theme?: string
  buttonStyle: {}
  buttonType?:
    | 'contact'
    | 'share'
    | 'getUserInfo'
    | 'getPhoneNumber'
    | 'launchApp'
    | 'openSetting'
    | 'feedback'
    | 'getRealnameAuthInfo'
    | 'getAuthorize'
    | 'lifestyle'
    | 'contactShare'
  onGetUserInfo?(e): void
  onGetPhoneNumber?(e): void
}

export default function Notification({
  icon,
  title,
  content,
  button,
  onBtnClick,
  background,
  color,
  theme,
  buttonStyle,
  onClick,
  buttonType,
  onGetUserInfo,
  onGetPhoneNumber
}: Props) {
  function _onBtnClick(e) {
    e.stopPropagation()
    onBtnClick()
  }
  return (
    <View className={styles.container} onClick={onClick} style={{ background }}>
      <Image src={icon} className={styles.img} />
      <View className={styles.content}>
        <View className={styles.content__left}>
          <Text className={styles.content__left__title} style={{ color }}>
            {title}
          </Text>
          <Text className={styles.content__left__content} style={{ color }}>
            {content}
          </Text>
        </View>
        <Button
          className={classNames(styles.content__button, {
            [styles['content__button--border']]: !color
          })}
          style={{ backgroundColor: color, color: theme, ...buttonStyle }}
          onClick={_onBtnClick}
          openType={buttonType}
          onGetUserInfo={onGetUserInfo}
          onGetPhoneNumber={onGetPhoneNumber}
        >
          {/* <Text>{button}</Text> */}
          {button}
        </Button>
      </View>
    </View>
  )
}

Notification.defaultProps = {
  buttonStyle: {}
}
