import Taro from '@tarojs/taro'
import React from 'react'
import { Text, View } from '@tarojs/components'
import RemInput from '@components/RemInput'

import classnames from 'classnames'
import styles from './index.module.scss'

interface State {
  input: string
  isInputVisible: boolean
}

interface Props {
  rem: string
  onConfirm(input: string): void
  mask: boolean
  disabled?: boolean
}

export default class GoodsRem extends React.PureComponent<Props, State> {
  static defaultProps = {
    rem: '',
    mask: true
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      input: props.rem,
      isInputVisible: false
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<Props>) {
    if (this.props.rem !== nextProps.rem && nextProps.rem !== this.state.input) {
      this.setState({ input: nextProps.rem })
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    if (!prevState.isInputVisible && this.state.isInputVisible) {
      this.setState({ input: this.props.rem })
    }
  }

  hideInputModal = () => {
    this.setState({ isInputVisible: false })
  }

  onEditClick = () => {
    if (this.props.disabled) return
    this.setState({ isInputVisible: true })
  }

  onInputConfirm = (input: string) => {
    this.setState({ input })
    this.hideInputModal()
    this.props.onConfirm(input)
  }

  render() {
    const { input, isInputVisible } = this.state
    const stringValue = input || '可备注其他需求'
    return (
      <View>
        <View className={styles.rem}>
          <Text
            className={classnames(styles.rem__p, { [styles['rem__p--input']]: !!this.state.input })}
          >
            {stringValue}
          </Text>
          <Text className={styles.rem__btn} onClick={this.onEditClick}>
            备注
          </Text>
        </View>
        <RemInput
          rem={input}
          visible={isInputVisible}
          onRequestClose={this.hideInputModal}
          onConfirm={this.onInputConfirm}
          mask={this.props.mask}
        />
      </View>
    )
  }
}
