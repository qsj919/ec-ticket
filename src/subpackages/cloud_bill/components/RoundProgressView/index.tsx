/**
 * @author lgl
 * @create date 2019-03-08
 * @desc 环形进度条
 */
import React, { PureComponent, ComponentClass } from 'react'
import Taro from '@tarojs/taro'
import { View, Canvas, Text } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'

import './index.scss'

type OwnProps = {
  percent: number // 当前百分比
  allPercent: number // 总份数
  onProgressComplete: Function
}

type PageState = {}

type IProps = OwnProps & StateProps & DefaultDispatchProps

const mapStateToProps = ({ shop, systemInfo }: GlobalState) => ({
  windowWidth: systemInfo.windowWidth
})

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, {}, IProps>(mapStateToProps)
class RoundProgressView extends PureComponent<IProps, PageState> {
  static defaultProps = {
    percent: 0,
    allPercent: 100
  }

  componentDidMount() {
    this.drawProgressbg()
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<IProps>): void {
    if (
      nextProps.percent !== this.props.percent ||
      nextProps.allPercent !== this.props.allPercent
    ) {
      this.drawProgressbg()
    }
  }

  // 绘制背景
  drawProgressbg() {
    const { percent, allPercent, onProgressComplete } = this.props
    const context = Taro.createCanvasContext('canvasProgress', this)
    if (percent <= allPercent) {
      const rpx = this.props.windowWidth / 375
      const eAngle = (percent * 2 * Math.PI) / allPercent + 1.5 * Math.PI
      context.setStrokeStyle('#FF506D')
      let y = 25.5
      let w = 3
      if (rpx !== 1) {
        y = 25
        w = 2.5
      }
      context.setLineWidth(w * rpx)
      context.arc(27 * rpx, 27 * rpx, y * rpx, 1.5 * Math.PI, eAngle, false)
      context.stroke()
      context.draw()
    } else {
      onProgressComplete()
    }
  }

  render() {
    const { percent, allPercent } = this.props
    return (
      <View className='round_progress_view'>
        <View className='back_view' />
        <Canvas className='progress_canvas' canvasId='canvasProgress' />
        <View className='progress_text_view'>
          <Text className='progress_info'>{`${percent}/${allPercent}`}</Text>
        </View>
      </View>
    )
  }
}

export default connect<StateProps, {}, IProps>(mapStateToProps)(RoundProgressView) as ComponentClass<OwnProps, PageState>
