import Taro from '@tarojs/taro'
import React, { PureComponent }  from 'react'
import checkedIcon from '@/images/checked_circle_36.png'
import unCheckedIcon from '@/images/unchecked_circle_36.png'
import thumbnail1 from '@/images/share_thumbnail_1.png'
import thumbnail2 from '@/images/share_thumbnail_2.png'
import thumbnail3 from '@/images/share_thumbnail_3.png'
import thumbnail4 from '@/images/share_thumbnail_4.png'
import { View, Text, Image } from '@tarojs/components'
import styles from './share_setting.module.scss'

interface Props {
  visible: boolean
  onApply: (mode: number[]) => void
  onDismiss?: () => void
}

interface State {
  checked: number[]
}

const picModeOptions = [
  { label: '图文混合模式', value: 0 },
  { label: '纯图片模式', value: 1 }
]

const shareOptions = [
  {
    label: '样式一',
    value: 0,
    image: thumbnail1
  },
  {
    label: '样式二',
    value: 1,
    image: thumbnail2
  },
  {
    label: '样式三',
    value: 2,
    image: thumbnail3
  },
  {
    label: '样式四',
    value: 3,
    image: thumbnail4
  }
]

export default class ShareSetting extends React.PureComponent<Props, State> {
  static defaultProps = {
    visible: false
  }

  _checked = [0, 0]

  state = {
    checked: [0, 0] // 代表图片模式、分享样式
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    // 关闭弹窗后
    /* eslint-disable  react/no-did-update-set-state */
    if (prevProps.visible && !this.props.visible) {
      if (this.state.checked.toString() !== this._checked.toString()) {
        this.setState({ checked: [...this._checked] })
      }
    }
  }

  onChecked = (value: number, group: number) => {
    this.setState(state => ({
      checked: state.checked.map((item, index) => (index === group ? value : item))
    }))
  }

  onApplyClick = () => {
    const { onApply } = this.props
    this._checked = [...this.state.checked]
    onApply && onApply(this.state.checked)
  }

  onMaskClick = () => {
    const { onDismiss } = this.props
    onDismiss && onDismiss()
  }

  onTouchMove = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  preventOuterMove = e => {
    e.stopPropagation()
  }

  renderCheckBox = (label: string, value: number, group: number) => {
    const { checked } = this.state
    const currentValue = checked[group]
    const isChecked = currentValue === value
    return (
      <View className={styles.check_box} onClick={() => this.onChecked(value, group)}>
        <Image src={isChecked ? checkedIcon : unCheckedIcon} className={styles.check_icon} />
        <Text>{label}</Text>
      </View>
    )
  }

  render() {
    return (
      this.props.visible && (
        <View style={{ zIndex: 2, position: 'relative' }} onTouchMove={this.preventOuterMove}>
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
              <Text className={styles.title}>图片模式</Text>
              <View className={styles.check_box_wrapper}>
                {picModeOptions.map(item => this.renderCheckBox(item.label, item.value, 0))}
              </View>
            </View>
            <View className={styles.block}>
              <Text className={styles.title}>分享样式</Text>
              <View style={{ display: 'flex', flexWrap: 'wrap' }}>
                {shareOptions.map(item => (
                  <View style={{ width: '50%' }} key={item.value}>
                    <View className={styles.check_box_wrapper}>
                      {this.renderCheckBox(item.label, item.value, 1)}
                    </View>
                    <View
                      className={styles.thumbnail_wrapper}
                      onClick={() => this.onChecked(item.value, 1)}
                    >
                      <Image src={item.image} className={styles.thumbnail} />
                    </View>
                  </View>
                ))}
              </View>
            </View>
            {/* <View className={styles.thumbnail_container}>
              <View className={styles.thumbnail_wrapper}>
                <Image src={thumbnail1} className={styles.thumbnail} />
              </View>
              <View className={styles.thumbnail_wrapper}>
                <Image src={thumbnail2} className={styles.thumbnail} />
              </View>
            </View> */}
            <View className={styles.apply_btn} onClick={this.onApplyClick}>
              应用
            </View>
          </View>
        </View>
      )
    )
  }
}
