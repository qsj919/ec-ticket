import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import { EChart } from 'echarts-taro3-react'

interface Props {
  width: string
  height: string
  option: any
}

export default class Chart_h5 extends React.PureComponent<Props> {
  static defaultProps = {
    width: '100%',
    height: '200px',
    option: {}
  }
  componentDidMount() {
    const { option } = this.props
    this.barChart.refresh(option)
  }

  barChart: any

  refChart = (node)=> (this.barChart = node)

  render() {
    const { width, height, option } = this.props
    return (
      <View style={{ width, height }}>
        <EChart ref={this.refChart} canvasId='my-chart' />
      </View>
    )
  }
}
