import Taro from '@tarojs/taro'
import React, { PureComponent }  from 'react'
import { View, Text, Input } from '@tarojs/components'
import styles from './custom_share.module.scss'

interface Props {
  visible: boolean
  onApply: (name: string, code: string) => void
  onDismiss?: () => void
  title: string
  code: string
}

interface State {
  sCode: string
  sTitle: string
}

export default class CustomShare extends React.PureComponent<Props, State> {
  static defaultProps = {
    visible: false
  }

  state = {
    sCode: '',
    sTitle: ''
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    // 关闭弹窗后
    /* eslint-disable  react/no-did-update-set-state */
    if (!prevProps.visible && this.props.visible) {
      this.setState({ sCode: this.props.code, sTitle: this.props.title })
    }
  }

  onCodeChange = e => {
    this.setState({ sCode: e.detail.value })
  }

  onTitleChange = e => {
    this.setState({ sTitle: e.detail.value })
  }

  onBlur = () => {
    // fix 在微信环境下 input失焦会造成页面假死的问题
    document.body.scrollIntoView(false)
  }

  onApplyClick = () => {
    const { onApply } = this.props
    const { sCode, sTitle } = this.state
    onApply && onApply(sTitle, sCode)
  }

  onMaskClick = () => {
    const { onDismiss } = this.props
    onDismiss && onDismiss()
  }

  onTouchMove = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  render() {
    return (
      this.props.visible && (
        <View style={{ zIndex: 2, position: 'relative' }}>
          <View
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0,0, 0.6)'
            }}
            onClick={this.onMaskClick}
            onTouchMove={this.onTouchMove}
          />
          <View className={styles.container}>
            <View className={styles.block}>
              <Text className={styles.title}>分享自定义</Text>
              <View className={styles.input_wrapper}>
                <Text className={styles.input__label}>分享款号</Text>
                <Input
                  className={styles.input__self}
                  placeholder='请输入'
                  onInput={this.onCodeChange}
                  value={this.state.sCode}
                  onBlur={this.onBlur}
                />
                <View className={styles.angle_right} />
              </View>
              <View className={styles.input_wrapper}>
                <Text className={styles.input__label}>分享名称</Text>
                <Input
                  className={styles.input__self}
                  placeholder='请输入'
                  onInput={this.onTitleChange}
                  value={this.state.sTitle}
                  onBlur={this.onBlur}
                />
                <View className={styles.angle_right} />
              </View>
            </View>
            <View className={styles.apply_btn} onClick={this.onApplyClick}>
              保存
            </View>
          </View>
        </View>
      )
    )
  }
}
