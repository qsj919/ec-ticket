/*
 * @Author: HuKai
 * @Date: 2019-08-27 08:54:39
 * @Last Modified by: Miao Yunliang
 */
// eslint-disable-next-line
import React, { Component, ComponentType } from 'react'
// import QRCode from 'qrcode'
import Taro, { pxTransform } from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Text, Image } from '@tarojs/components'
import deepCopy from 'deep-copy'
import NP from 'number-precision'
import classNames from 'classnames'
import { getTaroParams } from '@utils/utils'
import replenishment from '@/images/replenishment.png'
import defaultShopLogo from '@/images/default_shop.png'
import defaultLogo2 from '@/images/default_goods.png'
import ecool from '@/images/ecool.png'
import left from '@/images/left.png'
import right from '@/images/right.png'
import weChatShare from '@/images/we_chat_share.png'
import caret from '@/images/caret_down_gray_32.png'
import { modalHelper } from '../../utils/helper'
import { getOneDate, getDateTime } from '../../utils/utils'
import { getETicketDetailPreview } from '../../api/apiManage'

import styles from '../eTicketDetail/landscapeModel.module.scss'

/* eslint-disable */
import {
  mainType,
  goodsItemType,
  fieldConfigType,
  sameCodeObjArrType,
  detsType
} from '../eTicketDetail/typeConfig'

import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { storage } from '../../constants'
import { t } from '@models/language'
import i18next from 'i18next'
import playIcon from '@/images/icon/play_140.png'
import colors from '../../style/colors'

type StateType = {
  showTip: boolean
  params: {
    shopName: string
    sessionId: string
    mpUserId: string
    shopId: string
    epid: string
    pk: string
    sn: string
    type: string
    phone: string
    saasType: string
  }
  showTopBtn: string
  source: string
  showGuideModal: boolean
  showGoodsDetail: boolean
  showQrCode: boolean
  modalHeight: number
  main: mainType
  dets: Array<detsType>
  sameCodeObjArr: sameCodeObjArrType
  fieldConfig: fieldConfigType
  goodsItem: goodsItemType
  ticket: string
  qrUrl: string
  shopFlag: boolean
  ticketList: Array<{
    billno: string
    prodate: string
    totalmoney: string
    totalnum: string
    dwname: string
    seller: string
    mainid: number
    billid: string
  }>
  denyFlag: number
  isVideoVisible: boolean
  videoSrc: string
  videoPoster: string
  imgs: string[]
}
interface TicketDetailPage {
  state: StateType
  props: StateProps & DefaultDispatchProps
}

const NOTIFICATION_HEIGHT = 160

type StateProps = ReturnType<typeof mapStateToProps>

const mapStateToProps = ({ user }: GlobalState) => ({
  showPhoneEntry:
    user.grayFunc.mobileVerify === 1 && user.id !== -1 && !user.phone && user.subscribe === '1',
  // showPhoneEntry: user.grayFunc.mobileVerify === 1,
  userLoaded: user.id !== -1,
  relativeShopList: user.relativeShopList,
  subscribe: user.subscribe
})

class TicketDetailPage extends Component {
  windowHeight: number
  historyTicketTop: number = 999 // 底部历史小票的顶部距离页面顶部距离
  isBrowseTicketList = false // 是否划到了历史小票，并上传埋点
  isScrollTicketList = false // 滚动了小票
  trackStatemen = false
  trackPhone = false
  mpErpId: string
  config = {
    navigationBarTitleText: '小票详情'
  }
  constructor(props) {
    super(props)
    const params = getTaroParams(Taro.getCurrentInstance?.())
    this.state = {
      showTip: false,
      params: {
        shopName: '',
        sessionId: params.sessionId,
        mpUserId: params.mpUserId,
        shopId: '',
        epid: params.epid,
        pk: params.pk,
        sn: params.sn,
        type: params.type, // 2订货 1拿货
        phone: params.phone,
        saasType: params.saasType
      },
      showTopBtn: params.showTopBtn,
      source: params.source,
      showGuideModal: false,
      showQrCode: false,
      showGoodsDetail: false,
      modalHeight: 0,
      main: {
        compId: 0,
        shopLogoUrl: '',
        billNo: '',
        ownerName: '',
        compName: '',
        proDate: '',
        rem: '',
        cash: 0,
        lastBalance: 0,
        balance: 0,
        totalMoney: '',
        accountNo: '',
        accountName: '',
        shareDate: '',
        remit: 0,
        remitName: '',
        card: 0,
        cardName: '',
        weiXinPay: 0,
        aliPay: 0,
        storedValueCost: 0,
        debt: 0,
        agency: 0,
        billQRCodeContent: '',
        shopAddr: '',
        shopPhone: '',
        shopMobile: '',
        invalidFlag: '0',
        mobilePay: 0,
        totalNum: 0
      },
      dets: [],
      sameCodeObjArr: [],
      fieldConfig: {
        showImage: '',
        showLastBalance: '',
        showLastTimeBalance: '',
        showSecondSale: '',
        showSerialNumber: '',
        showThisBalance: ''
      },
      goodsItem: {
        imgUrl: '',
        code: '',
        name: '',
        price: '',
        color: '',
        size: '',
        num: '',
        totalSmall: '',
        proDate: '',
        saleNum: '',
        saleSum: '',
        backNum: '',
        backSum: '',
        showRepFlag: false,
        list: []
      },
      ticket: '',
      qrUrl: '',
      shopFlag: false,
      ticketList: [],
      denyFlag: 0,
      isVideoVisible: false,
      videoSrc: '',
      videoPoster: '',
      imgs: []
    }
  }

  componentDidMount() {
    i18next.on('languageChanged', () => {
      this.forceUpdate()
    })
    i18next.changeLanguage('zh')
    this.initPageData()
  }

  initPageData = async () => {
    const { subscribe } = this.props
    const {
      params: { pk, sn, epid, sessionId, type, mpUserId, saasType, phone },
      source
    } = this.state
    const params = {
      type,
      pk,
      sn,
      epid,
      sessionId,
      source,
      subscribe,
      mpUserId,
      saasType,
      phone
    }
    const _showTip = localStorage.getItem(storage.STATEMENT_2_LINE_NOTIFICATION)
    this.setState({ showTip: _showTip !== '1' && subscribe === '1' })
    const res = await getETicketDetailPreview(params)

    const main = res.data.main
    const dets = res.data.dets
    const sizeGroups = res.data.sizeGroups
    const sizeGroupsMap = res.data.sizeGroupsMap
    const qrCode = res.data.qrCode
    this.mpErpId = res.data.mpErpId
    let fieldConfig = {}
    // 通过获取参数，配置页面上展示的内容，没有配置默认展示所有
    if (res.data.shareConfig.fieldConfig) {
      fieldConfig = JSON.parse(res.data.shareConfig.fieldConfig)
    } else {
      fieldConfig = {
        showImage: '1',
        showLastBalance: '1',
        showLastTimeBalance: '1',
        showSecondSale: '1',
        showSerialNumber: '1',
        showThisBalance: '1'
      }
    }
    const arr: any = []

    // 对货品分类，同样code的货品放到一个数组中，生成一个新数组
    while (dets.length > 0) {
      let showRepFlag = false
      const sameCodeArr: any = []
      for (let i = dets.length - 1; i >= 0; i--) {
        const item = dets[i]
        if (item.code === dets[0].code && item.price === dets[0].price) {
          if (item.repFlag) {
            showRepFlag = true
          }
          sameCodeArr.unshift(item)
          dets.splice(i, 1)
        }
      }
      sameCodeArr[0]['showRepFlag'] = showRepFlag
      arr.push(sameCodeArr)
    }
    main.proDate = getOneDate(main.proDate)
    main['shareDate'] = getDateTime()
    const detsArr: any = []

    // 循环生成同code商品的总手数跟数量
    const sameCodeObjArr: any = []

    // 对同code中相同颜合并处理
    arr.forEach(arrItem => {
      const obj = {
        code: arrItem[0].code,
        name: arrItem[0].name,
        imgUrl: arrItem[0].imgUrl,
        allImgUrlBig: arrItem[0].allImgUrlBig,
        price: arrItem[0].price,
        flag: arrItem[0].flag,
        tenantSpuId: arrItem[0].tenantSpuId,
        repFlag: arrItem[0].repFlag,
        showRepFlag: arrItem[0].showRepFlag
      }
      // 同色的总数跟总手数
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

      const sameColorArr: any = []
      let sizeMapObj: any = {}
      let sizeMapGroupObj: any = {}
      const tmpSizeMapObj: any = {}

      // 获取sizeGroups
      if (sizeGroupsMap) {
        let temSizeGroupId = 0
        const temSizeGroupArr: any = []
        for (let i = 0; i < arrItem.length; i++) {
          const ele = arrItem[i]
          if (!sizeGroupsMap[ele.sizeGroupId]) {
            // 如果没有对应sizeGroupId的sizeGroupsMap，就要手动添加
            temSizeGroupId = ele.sizeGroupId
            temSizeGroupArr.push({ name: ele.size, id: ele.sizeId })
            tmpSizeMapObj[ele.sizeId] = ele.size
          } else {
            sizeMapGroupObj[ele.sizeGroupId] = sizeGroupsMap[ele.sizeGroupId]
          }
        }
        if (temSizeGroupArr.length > 0) {
          sizeMapGroupObj[temSizeGroupId] = temSizeGroupArr
          // 把货品中的尺码手动添加到新的尺码集合中
          sizeMapObj = { ...sizeMapObj, ...tmpSizeMapObj }
        }
      }
      // 把所有尺码都合并到一起，以及没有在尺码组返回的尺码
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
          flag: arrItem[0].flag,
          imgUrl: arrItem[0].imgUrl,
          allImgUrlBig: arrItem[0].allImgUrlBig,
          sizeGroupId: arrItem[0].sizeGroupId,
          sizeNumMap,
          repFlag: arrItem[0].repFlag,
          showRepFlag: arrItem[0].showRepFlag,
          price: arrItem[0].price,
          tenantSpuId: arrItem[0].tenantSpuId,
          sizeNumArr: [],
          sizeMapGroupObj: deepCopy(sizeMapGroupObj),
          sizeMap: deepCopy(sizeMapObj),
          sumArr: [],
          sizeMapArr: [],
          totalNum: 0,
          videoUrl: arrItem[0].videoUrl,
          coverUrl: arrItem[0].coverUrl
        }
        // 生成合计数据
        const sumArr: any = []
        let sizeMapArr: any = []
        for (const key in tempArrItem.sizeMapGroupObj) {
          if (tempArrItem.sizeMapGroupObj.hasOwnProperty(key)) {
            const item = tempArrItem.sizeMapGroupObj[key]
            sizeMapArr = [...sizeMapArr, ...item]
          }
        }
        for (const key in tempArrItem.sizeMap) {
          if (tempArrItem.sizeMap.hasOwnProperty(key)) {
            let num = 0
            for (let j = 0; j < arrItem.length; j++) {
              const item = arrItem[j]
              if (key === item.sizeId) {
                num += item.num
              }
            }
            sumArr.push({
              name: key,
              value: num
            })
          }
        }
        tempArrItem.sumArr = deepCopy(sumArr)
        tempArrItem.sizeMapArr = deepCopy(sizeMapArr)
        // 把数据综合到一个arr
        for (let i = arrItem.length - 1; i >= 0; i--) {
          if (tempArrItem.colorId === arrItem[i].colorId) {
            const key = tempArrItem.sizeMap[arrItem[i].sizeId]
            if (tempArrItem.sizeNumMap[key]) {
              tempArrItem.sizeNumMap[key] += arrItem[i].num
            } else {
              tempArrItem.sizeNumMap[key] = arrItem[i].num
            }
            tempArrItem.totalNum += arrItem[i].num
            if (arrItem[i].repFlag === 1) {
              tempArrItem.repFlag = arrItem[i].repFlag
            }
            arrItem.splice(i, 1)
          }
        }
        sameColorArr.unshift(tempArrItem)
      }
      let sameCodeSizeObj: any = {}
      sameColorArr.forEach(item => {
        sameCodeSizeObj = { ...sameCodeSizeObj, ...item.sizeNumMap }
        // 同颜色列表的数据
        item.sizeNumArr = []
        if (item.sizeMapArr.length > 0) {
          for (let i = 0; i < item.sizeMapArr.length; i++) {
            const sizeMapArrItem = item.sizeMapArr[i]
            const obj = {
              name: sizeMapArrItem.name,
              value: item.sizeNumMap[sizeMapArrItem.name] || '-'
            }
            item.sizeNumArr.push(obj)
          }
        } else {
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
        }
      })
      const sameColorTempItem = sameColorArr[sameColorArr.length - 1]
      // 生成列表表头
      const tableListHeader: any = []
      for (let i = 0; i < sameColorTempItem.sizeNumArr.length; i++) {
        const sizeNumArrItem = sameColorTempItem.sizeNumArr[i]
        Object.getOwnPropertyNames(sameCodeSizeObj).forEach(key => {
          if (key == sizeNumArrItem.name) tableListHeader.push(sizeNumArrItem)
        })
      }
      sameColorArr[sameColorArr.length - 1]['tableListHeader'] = tableListHeader
      // 通过表头过滤每种颜色不需要的尺码
      for (let i = 0; i < sameColorArr.length; i++) {
        const sameColorItem = sameColorArr[i]
        const newSizeNumArr: any = []
        for (let j = 0; j < tableListHeader.length; j++) {
          const tableListItem = tableListHeader[j]
          for (let k = 0; k < sameColorItem.sizeNumArr.length; k++) {
            const sizeNumItem = sameColorItem.sizeNumArr[k]
            if (tableListItem.name === sizeNumItem.name) {
              newSizeNumArr.push(sizeNumItem)
            }
          }
        }
        sameColorItem.sizeNumArr = newSizeNumArr
      }
      detsArr.push(sameColorArr)
    })
    params['shopId'] = main.shopId
    params['shopName'] = main.printHead || main.shopName

    if (String(main.invalidFlag) === '1') {
      modalHelper.open()
    }
    main.paysum = NP.plus(
      main.cash,
      main.card,
      main.weiXinPay,
      main.aliPay,
      main.agency,
      main.remit
    )
    this.setState({
      main,
      params,
      dets: detsArr,
      sameCodeObjArr: sameCodeObjArr,
      fieldConfig
    })
    // QRCode.toDataURL(qrCode)
    //   .then(url => {
    //     this.setState({ qrUrl: url }, () => {
    //       // 需要等url生成img之后才能获得div的完整高度
    //       const query = Taro.createSelectorQuery().in(Taro.getCurrentInstance().page)
    //       query
    //         .select('#landscape-wrapper')
    //         .boundingClientRect((rect: NodesRef.BoundingClientRectCallbackResult[]) => {
    //           this.setState({
    //             modalHeight: rect.height,
    //             showGuideModal: true
    //           })
    //         })
    //         .exec()
    //     })
    //   })
    //   .catch(err => {
    //     console.error(err)
    //   })
  }

  getQuery = () => {
    const { params } = this.state
    const { subscribe } = this.props
    const query = `pk=${params.pk}&sn=${params.sn}&epid=${params.epid}&sessionId=${params.sessionId}&shopId=${params.shopId}&shopName=${params.shopName}&subscribe=${subscribe}&type=${params.type}`
    return query
  }

  render() {
    const { subscribe } = this.props
    const {
      showTopBtn,
      showGuideModal,
      main,
      params,
      dets,
      sameCodeObjArr,
      fieldConfig,
      qrUrl
    } = this.state
    // const showTip = false
    const renderDets = dets.slice(0, 1)
    const hasMore = dets.length > 1
    return (
      <View className={styles.landscapeWrapper} id='landscape-wrapper'>
        <View className={styles.ticketTop} style={{ marginTop: 0 }}>
          <View className={styles.topLeft}>
            <Image
              className={styles.shopLogoUrl}
              src={main.shopLogoUrl ? main.shopLogoUrl : defaultShopLogo}
            />
            <View className={styles.shopTitle}>{params.shopName}</View>
          </View>
          {showTopBtn !== 'false' && (
            <View className={classNames(styles.topRight, styles[`topRight--${params.type}`])}>
              {subscribe !== '1' && (
                <View
                  className={
                    showGuideModal && subscribe !== '1' ? styles.saveQrCodeHide : styles.saveQrCode
                  }
                >
                  {t('saveTicket')}
                </View>
              )}
            </View>
          )}
        </View>
        <View className={styles.baseInfo}>
          <View className={styles.baseInfoItem}>
            <View className={styles.itemTitle}>{t('batch')}</View>
            <View className={styles.itemBot}>{main.billNo ? main.billNo : '-'}</View>
          </View>
          <View className={styles.baseInfoItem}>
            <View className={styles.itemTitle}>{t('client')}</View>
            <View className={classNames(styles.itemBot, styles['itemBot--highlight'])}>
              {main.compName ? main.compName : '-'}
            </View>
          </View>
          <View className={styles.baseInfoItem}>
            <View className={styles.itemTitle}>{t('clerk')}</View>
            <View className={styles.itemBot}>{main.ownerName ? main.ownerName : '-'}</View>
          </View>
          <View className={styles.baseInfoDate}>
            <View className={styles.itemTitle}>{t('date')}</View>
            <View className={styles.itemBot}>{main.proDate ? main.proDate : '-'}</View>
          </View>
        </View>
        <View className={styles.listForm}>
          {renderDets.map((item, index) => (
            <View
              key={index}
              className={styles.listItem}
              style={{ marginBottom: hasMore ? 0 : pxTransform(22) }}
            >
              <View className={styles.listTop}>
                {fieldConfig.showImage === '1' && (
                  <View>
                    {typeof item[0].videoUrl === 'string' && item[0].videoUrl !== '' ? (
                      <View style={{ position: 'relative' }}>
                        <Image
                          mode='aspectFill'
                          className={styles.itemImgCover}
                          src={item[0].coverUrl ? item[0].coverUrl : defaultLogo2}
                        />
                        <Image className={styles.play_btn} src={playIcon} />
                      </View>
                    ) : (
                      <Image
                        mode='aspectFill'
                        className={styles.itemImgCover}
                        src={item[0].imgUrl ? item[0].imgUrl : defaultLogo2}
                      />
                    )}
                  </View>
                )}

                <View className={styles.listTopRight}>
                  <View
                    className={styles.goodsInfo}
                    style={{ flex: item[0].flag !== 2 && item.length < 2 ? 1 : '0 0 60%' }}
                  >
                    <View className={styles.goodsInfoTop}>
                      <View className={styles.goodsTopLeft}>
                        {fieldConfig.showSecondSale === '1' && item[0].showRepFlag && (
                          <Image className={styles.iconCover} src={replenishment} />
                        )}
                        <View className={styles.goodsCode}>
                          {item[0].code}
                          {item[0].flag !== 2 && item.length < 2 && <Text>/{item[0].name}</Text>}
                        </View>
                      </View>
                      <View className={styles.goodsTopRight}>
                        ￥
                        <View className={styles.itemTotalPrice}>
                          {NP.times(sameCodeObjArr[index].sumNum, sameCodeObjArr[index].price)}
                        </View>
                      </View>
                    </View>
                    {(item.length > 1 || item[0].flag === 2) && (
                      <View className={styles.goodsName}>{item[0].name}</View>
                    )}
                    <View className={styles.goodsPrice}>
                      ￥
                      <Text className={styles.priceNum}>
                        {/* 这里删掉了件 */}
                        {item[0].price} × {sameCodeObjArr[index].sumNum}
                      </Text>
                    </View>
                  </View>
                  {/* {item[0].flag !== 2 && (
                    <View
                      className={styles.itemShareDetail}
                      style={item.length > 1 ? { top: '30px' } : { top: '' }}
                    >
                      <Image src={weChatShare} className={styles.img} />
                      <View>{t('share')}</View>
                    </View>
                  )} */}
                  {item[0].flag !== 2 && item.length < 2 && (
                    <View
                      className={classNames(styles.goodsInfoTable, {
                        [styles['goodsInfoTable--no_image']]: fieldConfig.showImage !== '1'
                      })}
                    >
                      <View className={styles.tableHeader}>
                        <View className={styles.tableHeaderCellFirst} />
                        {item[item.length - 1].sizeNumArr.map((sizeNumItem, index) => (
                          <View className={styles.tableHeaderCell} key={index}>
                            {sizeNumItem.name}
                          </View>
                        ))}
                      </View>
                      {item.map((ele, index) => (
                        <View className={styles.tableRow} key={index}>
                          <View className={styles.tableCellFirst}>{ele.color}</View>
                          {ele.sizeNumArr.map((eleSizeNumItem, index) => (
                            <View className={styles.tableCell} key={index}>
                              {eleSizeNumItem.value}
                            </View>
                          ))}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
              {/* {item[0].flag !== 2 && item.length > 1 && (
                <View className={styles.listTable}>
                  <View className={styles.tableHeader}>
                    <View className={styles.tableHeaderCellFirst} />
                    {item[item.length - 1].sizeNumArr.map((sizeNumItem, index) => (
                      <View className={styles.tableHeaderCell} key={index}>
                        {sizeNumItem.name}
                      </View>
                    ))}
                  </View>
                  {item.map((ele, index) => (
                    <View className={styles.tableRow} key={index}>
                      <View className={styles.tableCellFirst}>{ele.color}</View>
                      {ele.sizeNumArr.map((eleSizeNumItem, index) => (
                        <View className={styles.tableCell} key={index}>
                          {eleSizeNumItem.value}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              )} */}
            </View>
          ))}
          {hasMore && (
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image style={{ width: pxTransform(32), height: pxTransform(32) }} src={caret} />
              查看更多
            </View>
          )}
          <View className={styles.listBot}>
            <View className={styles.total}>
              <View>{t('totalNum')}</View>
              <View className={styles.totalBot}>
                {main.totalNum}
                {t('unit')}
              </View>
            </View>
            <View className={styles.total}>
              <View>{t('totalMoney')}</View>
              <View className={styles.totalBot}>
                {main.totalMoney}
                {t('rmb')}
              </View>
            </View>
          </View>
        </View>

        <View className={styles.moneyInfo}>
          <View className={styles.moneyItem}>
            本单支付
            <Text className={styles.money}>
              {main.paysum}
              {t('rmb')}
            </Text>
          </View>
          {fieldConfig.showThisBalance === '1' && (
            <View className={styles.moneyItem}>
              {main.balance >= 0 ? t('balancePlus') : t('balanceMinus')}
              <Text className={styles.money}>
                {Math.abs(main.balance)}
                {t('rmb')}
              </Text>
            </View>
          )}
          {fieldConfig.showLastTimeBalance === '1' && (
            <View className={styles.moneyItem}>
              {main.lastBalance - main.balance >= 0
                ? t('lastTimeBalancePlus')
                : t('lastTimeBalanceMinus')}
              <Text className={styles.money}>
                {Math.abs(NP.minus(main.lastBalance, main.balance))}
                {t('rmb')}
              </Text>
            </View>
          )}
          {fieldConfig.showLastBalance === '1' && (
            <View className={styles.moneyItem}>
              {main.lastBalance >= 0 ? t('lastBalancePlus') : t('lastBalanceMinus')}
              <Text className={styles.money}>
                {Math.abs(main.lastBalance)}
                {t('rmb')}
              </Text>
            </View>
          )}
        </View>
        <View
          className={styles.qrCodeImage}
          style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
        >
          <Image
            className={styles.qrCodeCover}
            src={qrUrl}
            style={{ width: pxTransform(240), height: pxTransform(240) }}
          />
          <View style={{ color: colors.themeColor, fontWeight: 500 }}>
            点击图片，分享到微信，微信中长按识别二维码获取电子小票
          </View>
        </View>
        {/* <View className={styles.companyInfo}>
          <Image src={ecool} className={styles.companyLogo} />
          <View className={styles.companyTel}>
            <Image src={left} className={styles.telLeft} />
            <View>400 677 0909</View>
            <Image src={right} className={styles.telRight} />
          </View>
        </View> */}
      </View>
    )
  }
}

export default connect(mapStateToProps)(TicketDetailPage) as ComponentType
