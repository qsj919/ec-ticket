import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import React, { ComponentType } from 'react'
import { GlobalState } from '@@types/model_state'

const mapStateToProps = ({ language }: GlobalState) => ({
  language
})

export type withTransProps = ReturnType<typeof mapStateToProps>

export default function withTranslation<T extends object>(Wrapper: ComponentType<T>) {
  class withTrans extends React.PureComponent<withTransProps & T> {
    render() {
      return <Wrapper {...this.props} />
    }
  }

  return connect<withTransProps, {}, T>(mapStateToProps)(withTrans) as ComponentType<T>
}
