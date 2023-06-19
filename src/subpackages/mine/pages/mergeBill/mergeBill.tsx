// eslint-disable-next-line
import Taro from '@tarojs/taro'
import React, { Component, ComponentType } from 'react'
import { View, Text } from '@tarojs/components'
import deepCopy from 'deep-copy'
import { GlobalState } from '@@types/model_state'
import trackSvc from '@services/track'
import { getOneDate, getDateTime, getTaroParams } from '@utils/utils'
import events from '@constants/analyticEvents'
import { getMergeBillData } from '@api/apiManage'
import MergeBillList from './component/mergeBillList'
import styles from './mergeBill.module.scss'

import { mainType, detsType } from './typeConfig'

type StateType = {
  main: mainType
  dets: Array<detsType>
  params: {
    sessionId: string
    shopName: string
    subscribe: string
    shopId: string
    epid: string
    sn: string
  }
  dateStart: string
  dateEnd: string
}
interface Index {
  props: {}
  state: StateType
}

class Index extends Component {
  constructor(props) {
    super(props)
    const params = getTaroParams(Taro.getCurrentInstance?.())
    params.shopName = decodeURIComponent(params.shopName)
    this.state = {
      main: {
        billNo: '',
        ownerName: '',
        compName: '',
        proDate: '',
        rem: '',
        cash: 0,
        lastBalance: 0,
        lastBillBalance: 0,
        balance: 0,
        totalMoney: '',
        shopAddr: '',
        accountNo: '',
        accountName: '',
        accountNo2: '',
        accountName2: '',
        accountNo3: '',
        accountName3: '',
        accountNo4: '',
        accountName4: '',
        accountNo5: '',
        accountName5: '',
        accountNo6: '',
        accountName6: '',
        shopPhone: '',
        shareDate: '',
        remit: 0,
        card: 0,
        weiXinPay: 0,
        aliPay: 0,
        storedValueCost: 0,
        debt: 0,
        agency: 0,
        ticketQrcode1: '',
        ticketQrcode2: '',
        ticketQrcode3: '',
        ticketTopic1: '',
        ticketTopic2: '',
        ticketTopic3: '',
        billQRCodeContent: '',
        bottomTips: ''
      },
      dets: [],
      dateStart: params.dateStart,
      dateEnd: params.dateEnd,
      params: {
        sessionId: params.sessionId,
        subscribe: params.subscribe,
        shopName: params.shopName,
        shopId: params.shopId,
        epid: params.epid,
        sn: params.sn
      }
    }
  }

  UNSAFE_componentWillMount() {
    const { params, dateStart, dateEnd } = this.state
    const data = {
      sn: params.sn,
      shopid: params.shopId,
      epid: params.epid,
      sessionId: params.sessionId,
      prodate1: dateStart,
      prodate2: dateEnd
    }
    getMergeBillData(data)
      .then(res => {
        const main = res.data.main
        const dets = res.data.dets
        const sizeGroups = res.data.sizeGroups
        const arr: any = []

        // 对货品分类，同样的货品放到一起
        while (dets.length > 0) {
          const sameCodeArr: any = []
          for (let i = dets.length - 1; i >= 0; i--) {
            const item = dets[i]
            if (item.code === dets[0].code) {
              sameCodeArr.unshift(item)
              dets.splice(i, 1)
            }
          }
          arr.push(sameCodeArr)
        }
        const sameCodeObjArr: any = []
        // 先循环生成同code的总手数跟数量
        arr.forEach(arrItem => {
          let obj = {
            code: arrItem[0].code,
            name: arrItem[0].name,
            imgUrl: arrItem[0].imgUrl,
            price: arrItem[0].price,
            tenantSpuId: arrItem[0].tenantSpuId,
            repFlag: arrItem[0].repFlag
          }
          let sumNum = 0
          let sumGroup = 0
          for (let i = 0; i < arrItem.length; i++) {
            const ele = arrItem[i]
            sumNum += Number(ele.num)
            sumGroup += Number(ele.groupNum)
            if (ele.repFlag) {
              obj.repFlag = ele.repFlag
            }
          }
          obj['sumNum'] = sumNum
          obj['sumGroup'] = sumGroup
          sameCodeObjArr.push(obj)
        })
        main.proDate = getOneDate(main.proDate)
        main['shareDate'] = getDateTime()
        const detsArr: any = []
        const numDetailArr: any = []
        // 对数组进行相同颜合并处理
        arr.forEach(arrItem => {
          const sameColorArr: any = []
          const numDetailObj = {
            code: arrItem[0].code
          }
          let sizeMapObj: any = {}
          // 获取sizeGroups
          for (let i = 0; i < arrItem.length; i++) {
            const ele = arrItem[i]
            for (let j = 0; j < sizeGroups.length; j++) {
              const item = sizeGroups[j]
              if (ele.sizeGroupId === item.sizeGroupId) {
                sizeMapObj = { ...sizeMapObj, ...item.sizeMap }
                break
              }
            }
          }
          // 对要合并的数组循环
          while (arrItem.length > 0) {
            let sizeNumMap = {}
            try {
              if (typeof arrItem[0].sizeNumMap === 'string') {
                sizeNumMap = JSON.parse(arrItem[0].sizeNumMap)
              }
            } catch (e) {
              // ignore
            }
            const tempArrItem = {
              code: arrItem[0].code,
              colorId: arrItem[0].colorId,
              color: arrItem[0].color,
              name: arrItem[0].name,
              imgUrl: arrItem[0].imgUrl,
              sizeGroupId: arrItem[0].sizeGroupId,
              sizeNumMap,
              repFlag: arrItem[0].repFlag,
              price: arrItem[0].price,
              tenantSpuId: arrItem[0].tenantSpuId,
              sizeNumArr: [],
              sizeMap: deepCopy(sizeMapObj),
              sumArr: [],
              totalNum: 0
            }
            // 生成合计数据
            const sumArr: any = []
            for (const key in tempArrItem.sizeMap) {
              if (tempArrItem.sizeMap.hasOwnProperty(key)) {
                let num = 0
                for (let j = 0; j < arrItem.length; j++) {
                  const item = arrItem[j]
                  if (key == item.sizeId) {
                    num += Number(item.num)
                  }
                }
                sumArr.push({
                  name: key,
                  value: num
                })
              }
            }
            tempArrItem.sumArr = deepCopy(sumArr)
            // 把数据综合到一个arr
            for (let i = arrItem.length - 1; i >= 0; i--) {
              if (tempArrItem.colorId === arrItem[i].colorId) {
                const key = tempArrItem.sizeMap[arrItem[i].sizeId]
                if (tempArrItem.sizeNumMap[key]) {
                  tempArrItem.sizeNumMap[key] += Number(arrItem[i].num)
                } else {
                  tempArrItem.sizeNumMap[key] = Number(arrItem[i].num)
                }
                tempArrItem.totalNum += Number(arrItem[i].num)
                if (arrItem[i].repFlag === 1) {
                  tempArrItem.repFlag = arrItem[i].repFlag
                }
                arrItem.splice(i, 1)
              }
            }
            sameColorArr.unshift(tempArrItem)
          }
          sameColorArr

          // 童装模式需要把同款的数量跟颜色合并
          let str = ''
          sameColorArr.forEach(item => {
            if (str) {
              str += ` / ${item.color}-${item.totalNum}`
            } else {
              str += `${item.color}-${item.totalNum}`
            }
            item.sizeNumArr = []
            // 尺码表头列表的数据
            for (const key in item.sizeMap) {
              if (item.sizeMap.hasOwnProperty(key)) {
                const name = item.sizeMap[key]
                const obj = {
                  name,
                  value: item.sizeNumMap[name] || '-'
                }
                item.sizeNumArr.push(obj)
              }
            }
          })
          numDetailObj['str'] = str
          numDetailArr.push(numDetailObj)
          detsArr.push(sameColorArr)
        })
        for (let i = 0; i < sameCodeObjArr.length; i++) {
          const sameCodeItem = sameCodeObjArr[i]
          for (let j = 0; j < numDetailArr.length; j++) {
            const numDetailItem = numDetailArr[j]
            if (sameCodeItem.code === numDetailItem.code) {
              sameCodeItem['numDetail'] = numDetailItem.str
              break
            }
          }
        }
        this.setState({
          main,
          dets: detsArr
        })
      })
      .catch(err => {
        console.log(err)
      })
  }

  // onAllTicketClick = () => {
  //   const query = this.getQuery()
  //   navigatorSvc.navigateTo({ url: `/pages/eTicketList/index?${query}` })
  // }
  componentDidMount() {
    trackSvc.track(events.mergeBill)
  }

  onReturnClick = () => {
    Taro.navigateBack()
  }

  getQuery = () => {
    const { params } = this.state
    const query = `sn=${params.sn}&epid=${params.epid}&sessionId=${params.sessionId}&shopId=${params.shopId}&shopName=${params.shopName}`
    return query
  }

  render() {
    const { main, dets, dateStart, dateEnd, params } = this.state
    return (
      <View className={styles.landscapeWrapper} id='landscape-wrapper'>
        <View className={styles.ticketTop}>
          <View>{params.shopName}</View>
          <View className={styles.topRight}>
            {/* <View
              className={styles.checkTicket}
              onClick={this.onAllTicketClick}
            >
              {language.checkAllTickets}
            </View> */}
            <View className={styles.returnBtn} onClick={this.onReturnClick}>
              返回
            </View>
          </View>
        </View>
        <View className={styles.ticketBody}>
          <View className={styles.baseInfo}>
            <View className={styles.baseInfoItem}>
              <View className={styles.itemTitle}>日期范围</View>
              <View>
                {dateStart} - {dateEnd}
              </View>
            </View>
          </View>
          <View className={styles.separateBar}>
            <View className={styles.leftCircle} />
            <View className={styles.line} />
            <View className={styles.rightCircle} />
          </View>
          <View className={styles.listForm}>
            {dets.map((item, index) => (
              <View key={index}>
                <MergeBillList rows={item} />
              </View>
            ))}
          </View>
          <View className={styles.separateLine} />
          <View className={styles.moneyInfo}>
            <View className={styles.moneyItem}>
              合计金额
              <Text className={styles.moneyRed}>{main.totalMoney}元</Text>
            </View>
          </View>
          <View className={styles.separateLine} />
          <View className={styles.detailInfo}>
            <View>
              店铺地址
              <Text className={styles.detail}>{main.shopAddr}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default Index
