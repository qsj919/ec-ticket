import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import { connect } from 'react-redux'

import { DefaultDispatchProps, GlobalState } from '@@types/model_state'

import './index.scss'

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {}
}

type StateProps = ReturnType<typeof mapStateToProps>

interface PageState {}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class ShopSpacialGoods extends React.Component<StateProps & DefaultDispatchProps, PageState> {
  render() {
    return <View></View>
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(ShopSpacialGoods)
