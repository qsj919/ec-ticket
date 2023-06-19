import Taro from '@tarojs/taro'
import React, { ComponentType } from 'react'
import { modalHelper } from '@utils/helper'

interface Props {
  visible: boolean
}

export default function<T extends object>(Wrapper: ComponentType<T>) {
  return class extends React.PureComponent<Props & T> {
    componentDidUpdate(prevProps) {
      if (!prevProps.visible && this.props.visible) {
        modalHelper.open()
      } else if (prevProps.visible && !this.props.visible) {
        modalHelper.close()
      }
    }
    render() {
      return <Wrapper {...this.props} />
    }
  }
}
