import Taro from '@tarojs/taro'
import React, { ComponentClass }  from 'react'
import { connect } from 'react-redux'
import { View, Picker, PickerViewColumn, Text } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { CodeTypes, ICodeType } from '../../utils/constants'

const mapStateToProps = ({ applyMiniapp }: GlobalState) => {
  const { seniorityAuth } = applyMiniapp
  return {
    seniorityAuth
  }
}
type State = {
  curCodeTypeIndex: number
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class CodeTypePicker extends React.Component<StateProps & DefaultDispatchProps, State> {
  state = {
    curCodeTypeIndex: 0
  }

  onConfirm = e => {
    this.setState({ curCodeTypeIndex: e.detail.value })
    this.props.dispatch({
      type: 'applyMiniapp/changeSeniorityAuth',
      payload: { codeType: CodeTypes[e.detail.value] }
    })
  }

  render() {
    const { seniorityAuth } = this.props
    const { curCodeTypeIndex } = this.state
    return (
      <Picker
        mode='selector'
        value={curCodeTypeIndex}
        range={CodeTypes}
        rangeKey='name'
        onChange={this.onConfirm}
      >
        <View>{(seniorityAuth.codeType && seniorityAuth.codeType.name) || '请选择'}</View>
      </Picker>
    )
  }
}

export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(CodeTypePicker as ComponentClass<StateProps, State>)
