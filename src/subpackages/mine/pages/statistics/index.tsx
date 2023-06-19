/*
 * @Author: HuKai
 * @Date: 2019-08-27 08:54:25
 * @Last Modified by: Miao Yunliang
 */
// eslint-disable-next-line
import React, { Component } from 'react'
import Taro, { Config, NodesRef } from '@tarojs/taro'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import calendar from '@/images/calendar.png'
import first from '@/images/first.png'
import second from '@/images/second.png'
import third from '@/images/third.png'
import defaultLogo from '@/images/default_goods.png'
import { GlobalState } from '@@types/model_state'
import { t } from '@models/language'
import trackSvc from '@services/track'
import { getETicketStatic, getShopList } from '@api/apiManage'
import events from '@constants/analyticEvents'
import { getOneDate, getTaroParams } from '@utils/utils'
import TabList from '@pages/component/tabList'
import DateComponent from '@pages/component/dateComponent'
import ShopListComponent from '@components/ShopList/shopList'
import styles from './index.module.scss'
import Chart from '../../components/ECharts'

let tabList = [{ title: '' }, { title: '' }, { title: '' }, { title: '' }]

type StateType = {
  date: string
  start: string
  end: string
  showDateModal: boolean
  listCurrent: number
  listAnimation: any
  listData: Array<{
    fileUrl: string
    name: string
    code: string
    saleNum: string
  }>
  chartData: Array<{
    name: string
    label: {
      formatter: string
    }
    value: string
  }>
  shopList: Array<{
    shopName: string
    logoUrl: string
    flag: number
    id: number
  }>
  checkShopIndex: number
  params: {
    menuBtn: string
    subscribe: string
    shopName: string
    shopId: string
    epid: string
    pk: string
    sn: string
  }
  sumrow: {
    totalSum: string
    saleNum: string
    codeNum: string
    backNum: string
  }
}
interface Index {
  state: StateType
}

class Index extends Component {
  // config: Config = {
  //   navigationBarTitleText: '拿货统计'
  // }

  constructor(props) {
    super(props)
    const param = getTaroParams(Taro.getCurrentInstance?.())
    param.shopName = decodeURIComponent(param.shopName)
    this.state = {
      date: '',
      start: '',
      end: '',
      showDateModal: false,
      listCurrent: 0,
      listAnimation: null,
      listData: [],
      chartData: [],
      shopList: [],
      checkShopIndex: 0,
      params: {
        menuBtn: param.menuBtn,
        pk: param.pk,
        shopName: param.shopName,
        shopId: param.shopId,
        subscribe: param.subscribe,
        epid: param.epid,
        sn: param.sn
      },
      sumrow: {
        totalSum: '',
        saleNum: '',
        codeNum: '',
        backNum: ''
      }
    }
  }

  UNSAFE_componentWillMount() {
    const { params } = this.state
    tabList = [
      { title: t('goodsRank') },
      { title: t('classProp') },
      { title: t('colorProp') },
      { title: t('sizeProp') }
    ]
    const todayDate = getOneDate()
    const oneYear = 1000 * 60 * 60 * 24 * 30
    const lastOneYear = getOneDate(new Date(todayDate.replace(/-/g, '/')).getTime() - oneYear)
    this.setState({
      date: lastOneYear + ' 至 ' + todayDate,
      start: lastOneYear,
      end: todayDate
    })
    const param = {
      sn: params.sn,
      epid: params.epid,
      shopid: params.shopId,
      prodate1: lastOneYear,
      prodate2: todayDate,
      charttype: 1,
      pageOffset: 0
    }
    this.getDataList(param)
  }
  getDataList = params => {
    const { listCurrent } = this.state
    getETicketStatic(params)
      .then(res => {
        const sumrow = res.data.sumrow
        if (Number(sumrow.backNum) < 0) {
          sumrow.backNum = sumrow.backNum.split('-')[1]
        }
        if (listCurrent === 0) {
          this.setState({
            sumrow,
            listData: res.data.dataList.filter(item => item.saleNum > 0),
            chartData: []
          })
        } else {
          const array = res.data.dataList
            .filter(item => item.saleNum >= 0)
            .reduce((o, v) => {
              o.push({
                name: v.name,
                value: v.saleNum,
                label: {
                  formatter: '{d}%'
                }
              })
              return o
            }, [])
          this.setState({
            sumrow,
            chartData: array,
            listData: []
          })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  componentDidMount() {
    trackSvc.track(events.statistics)
    const { params } = this.state
    getShopList()
      .then(res => {
        const rows = [...(res.data.cloudBillOpenList || []), ...(res.data.cloudBillCloseList || [])]

        let index = 0
        for (let i = 0; i < rows.length; i++) {
          const shop = rows[i]
          if (shop.shopid == params.shopId) {
            index = i
            break
          }
        }

        this.setState({
          shopList: rows,
          checkShopIndex: index,
          params: {
            menuBtn: params.menuBtn,
            subscribe: params.subscribe,
            pk: params.pk,
            shopName: rows[index].shopName,
            shopId: rows[index].shopid,
            epid: rows[index].epid,
            sn: rows[index].sn
          }
        })
      })
      .catch(err => console.log(err))
  }

  onDateSelectorClick = () => {
    this.setState({ showDateModal: true })
  }

  onDateSelCancel = () => {
    this.setState({ showDateModal: false })
  }

  onConfimDateClick = data => {
    const { listCurrent, params } = this.state
    let date = `${data.prodate1} 至 ${data.prodate2}`
    const param = {
      sn: params.sn,
      epid: params.epid,
      shopid: params.shopId,
      prodate1: data.prodate1,
      prodate2: data.prodate2,
      charttype: listCurrent + 1,
      pageOffset: 0
    }
    this.getDataList(param)
    this.setState({
      date,
      start: data.prodate1,
      end: data.prodate2,
      showDateModal: false
    })
  }

  onReturnBtnClick = () => {
    // navigatorSvc.navigateTo({ url: `/pages/eTicketList/index?${query}` })
    Taro.navigateBack()
  }

  onShopNameClick = (item, index) => {
    const { listCurrent, params, start, end } = this.state
    const param = {
      sn: item.sn,
      epid: item.epid,
      shopid: item.shopid,
      prodate1: start,
      prodate2: end,
      charttype: listCurrent + 1,
      pageOffset: 0
    }
    this.setState({
      checkShopIndex: index,
      params: {
        menuBtn: params.menuBtn,
        subscribe: params.subscribe,
        shopName: item.shopName,
        shopId: item.shopid,
        epid: item.epid,
        pk: params.pk,
        sn: item.sn
      }
    })
    this.getDataList(param)
  }
  onTabListClick = value => {
    const { start, end, params } = this.state
    const query = Taro.createSelectorQuery().in(Taro.getCurrentInstance().page as any)
    query
      .select('#goods-list')
      .boundingClientRect((rect: any ) => {
        const step = (rect.width - 30) / tabList.length
        const animation = this.createAnimation(value, step)

        const param = {
          sn: params.sn,
          epid: params.epid,
          shopid: params.shopId,
          prodate1: start,
          prodate2: end,
          charttype: value + 1,
          pageOffset: 0
        }
        this.setState({ listCurrent: value, listAnimation: animation }, () => {
          this.getDataList(param)
        })
      })
      .exec()
  }

  createAnimation = (value, step) => {
    const space = value * step
    return Taro.createAnimation({
      duration: 450,
      timingFunction: 'ease-out',
      transformOrigin: '0 0'
    })
      .translateX(space)
      .step()
      .export()
  }

  render() {
    const {
      date,
      start,
      end,
      showDateModal,
      listCurrent,
      listAnimation,
      listData,
      chartData,
      shopList,
      checkShopIndex,
      sumrow
    } = this.state
    return (
      <View className={styles.statisticsWrapper} id='statistics-wrapper'>
        {showDateModal && (
          <DateComponent
            onDateSelCancel={this.onDateSelCancel}
            onConfimDateClick={this.onConfimDateClick}
            dateStart={start}
            dateEnd={end}
          />
        )}
        <View className={styles.top}>
          <View className={styles.returnBtn}>
            <View className='at-icon at-icon-chevron-left' />
            <View onClick={this.onReturnBtnClick}>返回</View>
          </View>
          <View className={styles.topDateSel} onClick={this.onDateSelectorClick}>
            <Text>{date}</Text>
            <Image src={calendar} className={styles.calendarIcon} />
          </View>
        </View>
        <View className={styles.body}>
          <ScrollView scrollY scrollWithAnimation className={styles.shopScrollView}>
            {shopList.map((shopItem, index) => {
              return (
                <ShopListComponent
                  index={index}
                  shopItem={shopItem}
                  checkShopIndex={checkShopIndex}
                  key={shopItem.id}
                  onShopNameClick={this.onShopNameClick}
                />
              )
            })}
          </ScrollView>
          <View className={styles.bodyRight}>
            <View className={styles.numStatistics}>
              <View className={styles.aggregateAnmtmt}>
                <View>￥{sumrow.totalSum}</View>
                <View className={styles.numBot}>{t('aggregateAnmtmt')}</View>
              </View>
              <View className={styles.numbers}>
                <View>
                  <View>{sumrow.saleNum}</View>
                  <View className={styles.numBot}>{t('saleNum')}</View>
                </View>
                <View>
                  <View>{sumrow.codeNum}</View>
                  <View className={styles.numBot}>{t('num4Code')}</View>
                </View>
                <View>
                  <View>{sumrow.backNum}</View>
                  <View className={styles.numBot}>{t('num4Return')}</View>
                </View>
              </View>
            </View>
            <View className={styles.goodsList} id='goods-list'>
              <TabList
                listData={tabList}
                onTabItemClick={this.onTabListClick}
                current={listCurrent}
                animation={listAnimation}
                // redLineWidth={30}
                lineWidth={60}
              />
              <View className={styles.listBody}>
                {listCurrent === 0 ? (
                  <View>
                    <View className={styles.listTitle}>
                      <View className={styles.itemTitle}>{t('index')}</View>
                      <View className={styles.itemGoodsTitle}>{t('goods')}</View>
                      <View className={styles.itemTitle}>拿货数</View>
                    </View>
                    {listData.length > 0 ? (
                      <ScrollView
                        scrollY
                        className={styles.listCover}
                        scrollWithAnimation
                        // onScrollToUpper={this.onScrollToUpper}
                        // onScrollToLower={this.onScrollToLower}
                      >
                        {listData.map((item, index) => {
                          return (
                            <View key={index} className={styles.listItem}>
                              <View className={styles.itemIndex}>
                                {index === 0 || index === 1 || index === 2 ? (
                                  <Image
                                    className={styles.indexImg}
                                    src={index === 0 ? first : index === 1 ? second : third}
                                  />
                                ) : (
                                  <View>{index + 1}</View>
                                )}
                              </View>
                              <View className={styles.goodsDetail}>
                                <View className={styles.imgCover}>
                                  <Image
                                    className={styles.imgUrl}
                                    src={item.fileUrl ? item.fileUrl : defaultLogo}
                                  />
                                </View>
                                <View>
                                  <View className={styles.itemName}>{item.name}</View>
                                  <View className={styles.itemCode}>{item.code}</View>
                                </View>
                              </View>
                              <View className={styles.itemNum}>{item.saleNum}</View>
                            </View>
                          )
                        })}
                      </ScrollView>
                    ) : (
                      <View className={styles.noData}>暂无数据</View>
                    )}
                  </View>
                ) : (
                  <View>
                    {chartData.length > 0 ? (
                      <View className={styles.chart}>
                        {!showDateModal && (
                          <Chart
                            chartId=''
                            width='185px'
                            height='270px'
                            option={{
                              legend: {
                                orient: 'horizontal',
                                padding: [10, 5, 10, 5],
                                bottom: 0,
                                icon: 'circle'
                              },
                              series: [
                                {
                                  radius: ['15%', '30%'],
                                  center: ['50%', '40%'],
                                  data: chartData,
                                  type: 'pie'
                                  // roseType: 'angle',
                                }
                              ]
                            }}
                          />
                        )}
                      </View>
                    ) : (
                      <View className={styles.noData}>暂无数据</View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default Index
