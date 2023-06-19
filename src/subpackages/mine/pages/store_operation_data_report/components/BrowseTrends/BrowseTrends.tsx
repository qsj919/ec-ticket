import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import { isWeapp } from '@utils/cross_platform_api'
import Chart from '../../../../components/ECharts'
import ChartH5 from '../../../../components/ECharts/Chart_h5'
import * as echarts from '../../../../components/ec-canvas/echarts'

import './BrowseTrends.scss'

type OwnProps = {
  optionData: Array<any>
  isVisible: boolean
}
export default class BrowseTrends extends React.Component<OwnProps> {
  static defaultProps = {
    optionData: []
  }

  render() {
    const { optionData, isVisible } = this.props
    const option = {
      title: {
        text: '浏览趋势',
        textStyle: {
          fontSize: 16
        }
      },
      xAxis: {
        type: 'category',
        data: optionData.map(item => item.proDate.split(' ')[0])
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '30%'],
        splitLine: {
          show: true,
          interval: '2',
          lineStyle: {
            color: ['#D1D1D1'],
            width: 1,
            type: 'dashed'
          }
        },
        axisLine: {
          show: false
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter(params) {
          for (let x in params) {
            return params[x].name + `${isWeapp() ? '\n' : '<br />'}访问人数: ` + params[x].data
          }
        },
        axisPointer: {
          type: 'line',
          label: {
            backgroundColor: '#E62E4D'
          },
          lineStyle: {
            color: '#333333',
            type: 'solid',
            width: 1
          }
        },
        position: function(point, params, dom, rect, size) {
          // 固定在顶部
          return [point[0] - 25, '10%']
        }
      },
      series: [
        {
          type: 'line',
          smooth: 0.6,
          lineStyle: {
            color: '#E62E4D',
            width: 2
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(230, 46, 77, 0.1)'
              },
              {
                offset: 1,
                color: 'rgba(230, 46, 77, 0)'
              }
            ])
          },
          data: optionData.map(item => item.userNum)
        }
      ]
    }
    return (
      <View className='browse_trends_wrap'>
        {/* <View className='label'>浏览趋势</View> */}
        {process.env.TARO_ENV === 'weapp' ? (
          !isVisible && <Chart width='100%' height='100%' option={option} />
        ) : (
          <ChartH5 width='100%' height='100%' option={option} />
        )}
      </View>
    )
  }
}
