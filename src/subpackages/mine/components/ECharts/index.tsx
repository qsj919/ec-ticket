import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import * as echarts from '../ec-canvas/echarts'

let chart = null as any

interface Props {
  width: string
  height: string
  option: any
}

export default class ECharts extends React.PureComponent<Props> {
  static defaultProps = {
    width: '100%',
    height: '200px',
    option: {}
  }

  config = {
    usingComponents: {
      'ec-canvas': '../../components/ec-canvas/ec-canvas'
    }
  }

  state = {
    ec: {
      onInit: this.initChart
    }
  }

  // chart实例
  chart: any

  componentDidUpdate(prevProps) {
    if (this.props.option !== prevProps.option) {
      this.chart.setOption(this.props.option)
    }
  }

  initChart = (canvas, width, height, dpr) => {
    this.chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // 像素
    })
    canvas.setChart(chart)

    const option = this.props.option
    this.chart.setOption(option)
    return this.chart
  }

  render() {
    const { width, height } = this.props
    return (
      <View style={{ width, height }}>
        {/* eslint-disable-next-line taro/props-reserve-keyword */}
        <ec-canvas id='mychart-dom-bar' canvas-id='mychart-bar' ec={this.state.ec}></ec-canvas>
      </View>
    )
  }
}
