import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import { LIVE_STATUS } from '@@types/base'
import { registerCheck } from '@api/live_api_manager'
import GoodsIcon from '../../images/small_goods_icon.png'
import PromoteIcon from '../../images/promote_icon.png'

// import UpGoods from '../../components/up_goods'
import UpdatePrice from '../../components/update_price'

import './index.scss'

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    mpErpId: goodsManage.mpErpId
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  status: number
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class LiveIndex extends React.Component<StateProps & DefaultDispatchProps, State> {
  // config: Taro.Config = {
  //   navigationBarTitleText: '视频号带货',
  //   navigationBarBackgroundColor: '#F7F7F7'
  // }

  state = {
    status: 3
  }

  componentDidMount() {
    this.init()
  }

  init = () => {
    const { mpErpId } = this.props
    registerCheck({
      mpErpId
    }).then(({ data }) => {
      this.setState({
        status: data.sceneGroupList[0].status
      })
    })
  }

  render() {
    const { status } = this.state
    return (
      <View className='live_index_wrapper'>
        <View className='live_index_wrapper__status aic jcsb'>
          <Text className='live_index_wrapper__status__label'>视频号接口状态</Text>
          {status === LIVE_STATUS.SUCCESS && (
            <View className='aic'>
              <View className='round_view' />
              <Text className='status_label'>正常</Text>
            </View>
          )}
        </View>
        <View className='live_index_wrapper__manage aic'>
          <Image className='live_index_icon' src={GoodsIcon} />
          <View className='col jcc'>
            <Text className='live_index_wrapper__manage__title'>直播商品管理</Text>
            <Text className='live_index_wrapper__manage__label'>发布商品到视频号</Text>
          </View>
        </View>
        <View className='live_index_wrapper__manage aic'>
          <Image className='live_index_icon' src={PromoteIcon} />
          <View className='col jcc'>
            <Text className='live_index_wrapper__manage__title'>直播推广</Text>
            <Text className='live_index_wrapper__manage__label'>推广你的带货直播</Text>
          </View>
        </View>
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(LiveIndex)