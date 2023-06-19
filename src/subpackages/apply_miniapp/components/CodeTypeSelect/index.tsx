import Taro from '@tarojs/taro'
import React, { ComponentClass } from 'react'
import { connect } from 'react-redux'
import { View, PickerView, PickerViewColumn, Text } from '@tarojs/components'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { SlideDirection } from '@components/SlideContainer/type'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import styles from './index.module.scss'
import { CodeTypes, ICodeType } from '../../utils/constants'

const mapStateToProps = ({ applyMiniapp }: GlobalState) => {
  const { seniorityAuth } = applyMiniapp
  return {
    seniorityAuth
  }
}
type State = {
  visible: boolean
  curCodeType: ICodeType | null
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class CodeTypeSelect extends React.Component<StateProps & DefaultDispatchProps, State> {
  state = {
    visible: false,
    curCodeType: CodeTypes[0],
    curCodeTypeIndex: 0
  }

  onChange = e => {
    const curCodeType = CodeTypes[e.detail.value[0]]

    this.setState(prev => {
      return {
        ...prev,
        curCodeType,
        curCodeTypeIndex: e.detail.value[0]
      }
    })
  }

  onCancel = () => this.hide()

  onConfirm = () => {
    this.props.dispatch({
      type: 'applyMiniapp/changeSeniorityAuth',
      payload: { codeType: this.state.curCodeType }
    })
    this.hide()
  }

  hide = () => this.setState({ visible: false })
  show = () => this.setState({ visible: true })

  render() {
    const { seniorityAuth } = this.props

    const { visible, curCodeTypeIndex } = this.state

    return visible ? (
      <SlideContainer direction={SlideDirection.Bottom} visible mask={true} maxHeight={100}>
        <View className={styles.selectmenu}>
          <View className={styles.selectmenu__head}>
            <Text className={styles.selectmenu__cancel} onClick={this.onCancel}>
              取消
            </Text>
            <Text className={styles.selectmenu__confirm} onClick={this.onConfirm}>
              确定
            </Text>
          </View>

          <PickerView
            className={styles.selectmenu__content}
            value={[curCodeTypeIndex]}
            onChange={this.onChange}
          >
            <PickerViewColumn>
              {CodeTypes.map(type => {
                return <View>{type.name}</View>
              })}
            </PickerViewColumn>
          </PickerView>
        </View>
      </SlideContainer>
    ) : (
      <View onClick={this.show}>
        {(seniorityAuth.codeType && seniorityAuth.codeType.name) || '请选择'}
      </View>
    )
  }
}

export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(CodeTypeSelect as ComponentClass<StateProps, State>
  )