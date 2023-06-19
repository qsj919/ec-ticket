import Taro from '@tarojs/taro'
import React from 'react'
import { Text, Textarea, View } from '@tarojs/components'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { SlideDirection } from '@components/SlideContainer/type'

import styles from './index.module.scss'

interface State {
  input: string
  keyboardHeight: number
}

interface Props {
  visible: boolean
  rem: string
  // isInputVisible: boolean
  onRequestClose(): void
  onConfirm(input: string): void
  mask: boolean
}

export default class RemInput extends React.PureComponent<Props, State> {
  static defaultProps = {
    rem: '',
    mask: true
  }

  state = {
    input: '',
    keyboardHeight: 0
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<Props>) {
    if (this.props.rem !== nextProps.rem && this.props.rem !== this.state.input) {
      this.setState({ input: this.props.rem })
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    if (!prevProps.visible && this.props.visible) {
      this.setState({ input: this.props.rem })
    }
  }

  onRemInput = e => {
    this.setState({ input: e.detail.value })
  }

  hideInputModal = () => {
    this.props.onRequestClose()
  }

  onInputConfirm = () => {
    this.props.onConfirm(this.state.input)
  }

  onKeyboardHeightChange = e => {
    this.setState({ keyboardHeight: e.detail.height })
  }

  render() {
    const { input, keyboardHeight } = this.state
    const { visible, mask } = this.props
    return (
      visible && (
        <SlideContainer
          direction={SlideDirection.Bottom}
          visible
          containerClass={styles.transparent}
          onRequestClose={this.hideInputModal}
          mask={mask}
          maxHeight={100}
        >
          <View className={styles.modal} style={{ paddingBottom: `${keyboardHeight + 20}px` }}>
            <Textarea
              className={styles.modal_input}
              placeholder='请输入备注'
              value={input}
              onInput={this.onRemInput}
              fixed
              autoFocus
              cursorSpacing={90}
              onConfirm={this.onInputConfirm}
              adjustPosition={false}
              onKeyboardHeightChange={this.onKeyboardHeightChange}
            />
            <Text className={styles.input_confirm} onClick={this.onInputConfirm}>
              完成
            </Text>
          </View>
        </SlideContainer>
      )
    )
  }
}
