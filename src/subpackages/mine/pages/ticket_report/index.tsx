import Taro, { Config } from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Image } from '@tarojs/components'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { connect } from 'react-redux'
import { getOneDate, getTaroParams } from '@utils/utils'
import numberUtils from '@utils/num'
import { getDailyReportData } from '@api/apiManage'
import oneIcon from './img/one.png'
import twoIcon from './img/two.png'
import threeIcon from './img/three.png'
import fourIcon from './img/four.png'
import fiveIcon from './img/five.png'
import settingIcon from './img/setting.png'
import arrowUpIcon from './img/arrow_up.png'
import arrowDownIcon from './img/arrow_down.png'
import Chart from '../../components/ECharts'
import * as echarts from '../../components/ec-canvas/echarts'
import './index.scss'

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {}
}

type StateProps = ReturnType<typeof mapStateToProps>

interface StatisticsDataModel {
  paySum: number //	实收金额
  paySumLpRatio: string
  count: number //	单数
  actualSaleNum: number //	实销数
  actualSaleSum: number //	实销金额
  backNum: number //	退货数
  backRate: string //	退货率
  cost: number //	成本
  profit: number //	利润
  profitLpRatio: string //	利润增长值
  purchaseNum: number //	进货件数
  purchaseSum: number //	进货金额
  salesDailyData: Array<SalesDailyModel> //	店铺经营趋势数据
  clientPurchaseData: Array<ClientPurchaseModel> //	店铺客户拿货数据
  clientPurchaseSumData: Array<ClientPurchaseSumModel> // 店铺客户拿货金额数据
  spuSalesData: Array<SpuSalesModel> //	店铺热销产品
  spuBackData: Array<SpuBackModel> //	店铺退货货品
}

interface SalesDailyModel {
  proDate: string // 日期
  totalMoney: number // 收入
  cost: number //	成本
}

interface ClientPurchaseModel {
  name: string // 客户名
  purchaseNum: number // 拿货数
  purchaseSum: number
}
interface ClientPurchaseSumModel {
  name: string // 客户名
  purchaseSum: number //	拿货金额
}

interface SpuSalesModel {
  name: string //	货品名
  code: string //	款号
  totalNum: number //	单数
  totalMoney: number
  thumbUrl: string
  unitName: string
}

interface SpuBackModel {
  name: string //	货品名
  code: string //	款号
  totalNum: number //	单数
  totalMoney: number
  thumbUrl: string
  unitName: string
}

interface PageState {
  takeGoodsTabIndex: number
  statisticsData: StatisticsDataModel
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class TicketReport extends Component<
  StateProps & DefaultDispatchProps,
  PageState
> {
  // config: Config = {
  //   navigationBarTitleText: '日营业报表'
  // }
  constructor(props) {
    super(props)
    this.state = {
      takeGoodsTabIndex: 0,
      statisticsData: this.getInitData()
    }
  }

  componentDidMount() {
    this.loadStatisticsData()
  }

  getInitData = () => {
    return {
      paySum: 0,
      count: 0,
      actualSaleNum: 0,
      actualSaleSum: 0,
      backNum: 0,
      backRate: '0',
      cost: 0,
      profit: 0,
      profitLpRatio: '0',
      paySumLpRatio: '0',
      purchaseNum: 0,
      purchaseSum: 0,
      salesDailyData: [],
      clientPurchaseData: [],
      clientPurchaseSumData: [],
      spuSalesData: [],
      spuBackData: []
    }
  }

  loadStatisticsData = () => {
    const params  = getTaroParams(Taro.getCurrentInstance?.())
    const { sn, epid, date, _cid } = params
    getDailyReportData(
      {
        epid,
        curDate: date,
        sn: sn
      },
      _cid
    ).then(res => {
      this.setState({
        statisticsData: res.data
      })
    })
  }

  getBaseData = (type: number) => {
    const { statisticsData } = this.state
    if (type === 1) {
      const { count, actualSaleNum, actualSaleSum, backNum, backRate, cost } = statisticsData
      const baseArray = [
        {
          title: '开单笔数',
          value: count
        },
        {
          title: '实销数',
          value: actualSaleNum
        },
        {
          title: '实销金额',
          value: actualSaleSum,
          showUnit: true
        },
        {
          title: '退货数',
          value: backNum
        },
        {
          title: '退货率',
          value: `${backRate}%`
        },
        {
          title: '销售成本',
          value: numberUtils.toFixed(Number(cost)),
          showUnit: true
        }
      ]
      return baseArray
    } else if (type === 2) {
      const { purchaseNum, purchaseSum } = statisticsData
      const baseArray = [
        {
          title: '进货数量',
          value: purchaseNum
        },
        {
          title: '进货金额',
          value: purchaseSum,
          showUnit: true
        }
      ]
      return baseArray
    }
  }

  getSaleTendencyData = () => {
    const { statisticsData } = this.state
    const column: string[] = []
    const row1: number[] = []
    const row2: number[] = []
    const { salesDailyData } = statisticsData
    salesDailyData.forEach(item => {
      const { totalMoney, cost, proDate } = item
      column.push(proDate.slice(5, 10))
      row1.push(totalMoney)
      row2.push(cost)
    })
    return {
      legend: ['实销额', '成本'],
      column,
      row1,
      row2
    }
  }

  getPieChartData = (type: 'sale' | 'back') => {
    const { statisticsData } = this.state
    const data: any = []
    const colors = ['#FF6160', '#3764FF', '#26CA83', '#FF9137', '#f40']
    const legendArray: any = []
    if (type === 'sale') {
      const { spuSalesData } = statisticsData
      spuSalesData.forEach((item, index) => {
        const { code, totalNum } = item
        data.push({ value: totalNum, name: code })
        legendArray.push({ color: colors[index], name: code })
      })
    } else if (type === 'back') {
      const { spuBackData } = statisticsData
      spuBackData.forEach((item, index) => {
        const { code, totalNum } = item
        data.push({ value: totalNum, name: code })
        legendArray.push({ color: colors[index], name: code })
      })
    }
    return {
      data,
      legendArray
    }
  }

  getTopdata = () => {
    const { statisticsData, takeGoodsTabIndex } = this.state
    const list: any = []
    const { clientPurchaseData } = statisticsData
    clientPurchaseData.forEach(item => {
      const { name } = item
      list.push({
        name,
        value: takeGoodsTabIndex === 0 ? item.purchaseSum : item.purchaseNum
      })
    })
    return list
  }

  renderBodyPage = () => {
    const params  = getTaroParams(Taro.getCurrentInstance?.())

    return (
      <View>
        <View className='header'>
          <View className='header_text'>日期:{params.date ? params.date : getOneDate()}</View>
          <View
            className='filter_box'
            onClick={() => {
              let appId = 'wx0d0096859988aa29'
              if (process.env.PRODUCT_ENVIRONMENT === 'product') {
                appId = 'wx6023b84348c2b071'
              }
              Taro.navigateToMiniProgram({
                appId: appId,
                path: '/pages/function/pushNotificationSetting/pushNotificationSetting',
                envVersion: 'release',
                extraData: {
                  openid: getTaroParams(Taro.getCurrentInstance?.()).mpOpenId
                }
              })
            }}
          >
            <Image
              style={{ width: '16px', height: '16px', marginRight: '4px' }}
              src={settingIcon}
            />
            <View>设置</View>
          </View>
        </View>
        {this.renderSingleInfoCell('sale')}
        {this.renderDataInfoCell(1)}
        {this.renderSingleInfoCell('profit')}
        {this.renderDataInfoCell(2)}
        {this.renderLineChart()}
        {this.renderCustomerPurchaseLsit('sale')}
        {this.renderCustomerPurchaseLsit('back')}
        {/* {this.renderPieChart('sale')} */}
        {/* {this.renderPieChart('back')} */}
        {this.renderCustomerTakeGoodsTop()}
      </View>
    )
  }

  renderSingleInfoCell = (type: 'sale' | 'profit') => {
    const { statisticsData } = this.state
    let data = {
      leftTitle: '',
      leftValue: 0,
      rightTitle: '',
      rightValue: ''
    }
    let flag = 0
    if (type === 'sale') {
      const { paySum, paySumLpRatio } = statisticsData
      if (paySumLpRatio) {
        flag = Number(paySumLpRatio)
      }
      data = {
        leftTitle: '当日实收金额',
        leftValue: paySum,
        rightTitle: '与昨日相比',
        rightValue: paySumLpRatio
      }
    } else if (type === 'profit') {
      const { profit, profitLpRatio } = statisticsData
      if (profitLpRatio) {
        flag = Number(profitLpRatio)
      }
      data = {
        leftTitle: '当日营业利润',
        leftValue: numberUtils.toFixed(Number(profit)),
        rightTitle: '与昨日相比',
        rightValue: profitLpRatio
      }
    }
    return (
      <View className='single_info_cell'>
        <View>
          <View className='single_info_cell_title'>{data.leftTitle}</View>
          <View className='data_info_cell_item_right'>
            <View className='money_icon2'>￥</View>
            <View className='single_info_cell_num'>{data.leftValue}</View>
          </View>
        </View>
        <View>
          <View
            className='single_info_cell_right_rate'
            style={{ color: flag < 0 ? '#26CA83' : '#FF6160' }}
          >
            {flag !== 0 && (
              <Image className='icon_size' src={flag > 0 ? arrowUpIcon : arrowDownIcon} />
            )}
            {`${data.rightValue}%`}
          </View>
          <View className='single_info_cell_right_desc'>{data.rightTitle}</View>
        </View>
      </View>
    )
  }

  renderDataInfoCell = (type: number) => {
    const data = this.getBaseData(type)
    if (!data) {
      return null
    }

    switch (type) {
      case 1: {
        return (
          <View className='data_info_cell'>
            {data.map((item, index) => {
              const { title, value, showUnit } = item
              return (
                <View className='data_info_cell_item' key={index}>
                  <View className='data_info_cell_item_title'>{title}</View>
                  <View className='data_info_cell_item_right'>
                    {showUnit && <View className='money_icon1'>￥</View>}
                    <View className='data_info_cell_item_value'>{value}</View>
                  </View>
                </View>
              )
            })}
          </View>
        )
      }
      case 2: {
        return (
          <View className='data_info_cell'>
            {data.map((item, index) => {
              const { title, value, showUnit } = item
              return (
                <View className='data_info_cell_item' style={{ width: '50%' }} key={index}>
                  <View className='data_info_cell_item_title'>{title}</View>
                  <View className='data_info_cell_item_right'>
                    {showUnit && <View className='money_icon1'>￥</View>}
                    <View className='data_info_cell_item_value'>{value}</View>
                  </View>
                </View>
              )
            })}
          </View>
        )
      }
    }
  }

  renderChartHeader = (name: string = '标题', showUnit: boolean = true, subTitle = '近一周') => {
    return (
      <View className='chart_header'>
        <View className='chart_header_left'>
          <View className='chart_header_tag' />
          <View className='chart_header_name'>{name}</View>
          <View className='chart_header_sub_name'>{subTitle}</View>
        </View>
        {showUnit && <View className='chart_header_sub_name'>(单位: 笔)</View>}
      </View>
    )
  }

  renderLineChart = () => {
    const data = this.getSaleTendencyData()
    const { legend, column, row1, row2 } = data
    if (!column.length || !row1.length || !row2.length) {
      return null
    }
    let showSymbol = false
    if (row1.length === 1 || row2.length === 1) {
      showSymbol = true
    }
    const option = {
      xAxis: {
        type: 'category',
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          interval: 0
        },
        data: column
      },
      yAxis: {
        type: 'value',
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      grid: {
        left: '15%'
        // right: 'center'
      },
      // legend: {
      //   show: true,
      //   right: '2%'
      //   // bottom: '0%'
      // },
      series: [
        {
          name: '系列1',
          data: row1,
          type: 'line',
          showSymbol: showSymbol,
          // label: {
          //   show: true,
          //   position: 'bottom'
          // },
          clickable: false,
          lineStyle: {
            color: '#3764FF'
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
          }
        },
        {
          name: '系列2',
          data: row2,
          type: 'line',
          showSymbol: showSymbol,
          // label: {
          //   show: true,
          //   position: 'top'
          // },
          // itemStye: {
          //   normal: {
          //     label: {
          //       show: true
          //     }
          //   }
          // },
          lineStyle: {
            color: '#26CA83'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(76, 175, 80, 0.1)'
              },
              {
                offset: 1,
                color: 'rgba(76, 175, 80, 0)'
              }
            ])
          }
        }
      ]
    }
    return (
      <View className='line_chart_contanier'>
        <View className='line_chart_legend'>
          {legend.map((item, index) => {
            return (
              <View key={`${item}_${index}`} className='line_chart_legend_item'>
                <View
                  style={{ backgroundColor: index === 0 ? '#3764FF' : '#4CAF50' }}
                  className='line_chart_legend_item_dot'
                ></View>
                <View>{item}</View>
              </View>
            )
          })}
        </View>
        {this.renderChartHeader('店铺经营趋势', false)}
        <Chart width='100%' height='275px' option={option} />
      </View>
    )
  }

  renderPieChart = (type: 'sale' | 'back') => {
    const { legendArray, data } = this.getPieChartData(type)
    if (!legendArray.length || !data.length) {
      return null
    }
    const option = {
      tooltip: {
        trigger: 'item'
      },
      // legend: {
      //   show: true,
      //   bottom: '0%'
      // },
      color: ['#FF6160', '#3764FF', '#26CA83', '#FF9137', '#f40'],
      series: [
        {
          name: type === 'sale' ? '当天热销商品' : '当天退货商品',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          emphasis: {
            label: {
              show: false,
              fontSize: '40',
              fontWeight: 'bold'
            }
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n \n{d}%'
          },
          labelLine: {
            show: true,
            lineStyle: {
              cap: 'round'
            }
          },
          data: data
        }
      ]
    }
    return (
      <View
        style={{
          width: '100%',
          backgroundColor: '#fff',
          marginBottom: '12px',
          paddingBottom: '16px'
        }}
      >
        {this.renderChartHeader(
          type === 'sale' ? '当天热销商品' : '当天退货商品',
          false,
          getOneDate()
        )}
        <Chart width='100%' height={275 + 'px'} option={option} />
        <View style={{ display: 'flex', width: '100%', justifyContent: 'space-around' }}>
          {legendArray.map((legend, index) => {
            const { color, name } = legend
            return (
              <View className='legend_box' key={index}>
                <View
                  style={{
                    backgroundColor: color,
                    width: 8 + 'px',
                    height: 5 + 'px',
                    marginRight: 4 + 'px'
                  }}
                ></View>
                <View className='legend_title'>{name}</View>
              </View>
            )
          })}
        </View>
      </View>
    )
  }

  renderCustomerPurchaseLsit = (type: 'sale' | 'back') => {
    const { statisticsData } = this.state
    const { spuBackData, spuSalesData } = statisticsData
    const data = type === 'sale' ? spuSalesData : spuBackData

    if (!data.length) {
      return null
    }

    return (
      <View style={{ backgroundColor: '#ffffff', marginBottom: '12px' }}>
        {this.renderChartHeader(type === 'sale' ? '当天热销商品' : '当天退货商品', false, '前五')}
        <View className='purchase_list'>
          {/* <View className='purchase_list_header'>
            <View className='purchase_list_header_left'>店铺</View>
            <View className='purchase_list_header_right'>销售数/销售额</View>
          </View> */}
          <View className='purchase_list_header_body'>
            {data.map((item, index) => {
              const { name, code, totalMoney, totalNum, thumbUrl, unitName } = item
              return (
                <View style={{ display: 'flex', marginBottom: '10px' }} key={`${index}_${code}`}>
                  <View className='purchase_list_body_left '>
                    <Image src={thumbUrl} className='take_goods_top_list_item_image' />
                    <View style={{ fontSize: '14px' }}>
                      <View>{name}</View>
                      <View>{code}</View>
                    </View>
                  </View>
                  <View className='purchase_list_body_right '>{`${totalNum}${unitName ||
                    '件'}/${totalMoney}元`}</View>
                </View>
              )
            })}
          </View>
        </View>
      </View>
    )
  }

  renderCustomerTakeGoodsTop = () => {
    const { takeGoodsTabIndex } = this.state
    const topImageArray = [oneIcon, twoIcon, threeIcon, fourIcon, fiveIcon]
    const data = this.getTopdata()
    return (
      <View style={{ backgroundColor: '#FFFFFF', marginBottom: '12px' }}>
        {this.renderChartHeader('当天拿货客户', false, '前五')}
        <View className='take_goods_top'>
          <View className='take_goods_top_tab'>
            <View
              onClick={() => {
                this.setState({ takeGoodsTabIndex: 0 })
              }}
              className='take_goods_top_tab_item'
              style={{ backgroundColor: takeGoodsTabIndex === 0 ? '#fff' : '' }}
            >
              按拿货金额
            </View>
            <View
              onClick={() => {
                this.setState({ takeGoodsTabIndex: 1 })
              }}
              className='take_goods_top_tab_item'
              style={{ backgroundColor: takeGoodsTabIndex === 1 ? '#fff' : '' }}
            >
              按拿货数量
            </View>
          </View>
          <View className='take_goods_top_list'>
            {data.map((item, index) => {
              const { name, value } = item
              return (
                <View className='take_goods_top_list_item' key={index}>
                  <View style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
                    <View>
                      <Image
                        style={{ width: '20px', height: '34px', marginRight: '16px' }}
                        src={topImageArray[index]}
                      ></Image>
                    </View>
                    {/* <View className='take_goods_top_list_item_image'></View> */}
                    <View>{name}</View>
                  </View>
                  <View style={{ display: 'flex' }}>
                    {takeGoodsTabIndex === 0 && <View className='money_icon'>￥</View>}
                    <View className='take_goods_top_list_item_text'>{value}</View>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      </View>
    )
  }

  render() {
    return <View className='contanier'>{this.renderBodyPage()}</View>
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(TicketReport)