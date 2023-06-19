/*
 * @Author: YuCHuangZhen
 * @Date: 2021-12-16
 * @Last Modified by: y
 */
import Taro, { pxTransform } from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Text, Image, Canvas, Button, Block, ScrollView } from '@tarojs/components'
import bgImg from '@/images/bg.png'
import { connect } from 'react-redux'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import {
  getOrderDetailList,
  purBillCancel,
  orderAddShoppingCart,
  orderAddShoppingCartSingle,
  getPartSendOrderList,
  updateOrderRefundStatus,
  launchOrderPay,
  confirmReceive,
  fetchExpressTrack
} from '@api/apiManage'
import { getLogisRelativeDate, makeGdocUrlToArray, getTaroParams } from '@utils/utils'
import cn from 'classnames'
import EImage from '@components/EImage'
import { getShopParamVal } from '@api/goods_api_manager'
import navigatorSvc from '@services/navigator'
import backIcon from '@/images/arrow_right_white.png'
import addIcon from '@/images/add.png'
import changeIcon from '@/images/arrow_change.png'
import messageFeedback from '@services/interactive'
import cancelIcon from '@/images/close.png'
import homeIcon from '@/images/home.png'
import angleRight from '@/images/angle_right_gray_40.png'
import defaultShopLogo from '@/images/default_shop.png'
import { PAY_STATUS, REFUND_STATUS } from '@@types/base'
import DeleteIcon from '@/images/delete.png'
import { VIDEO_SCENE } from '@constants/index'
import styles from './detail.module.scss'

type LOGIS_INFO = {
  logisCompName: string
  status: number
  statusName: string
  waybillNo: string
  traces: Array<{
    acceptStation: string
    acceptTime: string
  }>
}

interface State {
  shop: Object
  billData: Array<BillItem>
  styleData: Array<{ styleId: string; data: Array<BillItem> }>
  tableMode: Number
  bottomInfo: Array<{ title: string; value: string }>
  billState: Number
  partSendData: Array<PartSendItem>
  needMask: boolean
  slhBillNo: string
  bill: InfoItem
  timeValue: string
  logisInfo: LOGIS_INFO
  logisIsShow: boolean
  isFromVideo: boolean
  dwName: string
}

interface InfoItem {
  addrDetail: string // ,
  auditFlag: string // 2,
  billNo: string // 25281,
  buyerRem: string // ,
  cityId: string // 0,
  countryId: string // 0,
  countyId: string // 0,
  createdBy: string // 4797,
  createdDate: string // 2021-12-14 10: string //46: string //09,
  deliverFlag: string // 0,
  extProps: string // ,
  flag: string // 1,
  hashKey: string // 202112141046073164797_1989,
  id: string // 24925,
  mpErpId: string // 1989,
  proTime: string // 2021-12-14 10: string //46: string //08,
  provId: string // 0,
  receiveName: string // ,
  receivePhone: string // ,
  slhBillNo: string // 126,
  slhOrderId: string // 10027163549,
  slhOrderType: string // 1,
  totalMoney: string // 756,
  totalNum: string // 4,
  townId: string // 0,
  unitId: string // 4797,
  updatedBy: string // 4797,
  updatedDate: string // 2021-12-16 14: string //12: string //48,
  ver: string // 6
  payStatus: number
  refundStatus: number
}

interface BillItem {
  billId: string // 24925
  colorId: string // 1
  colorName: string // '均色'
  createdBy: string // 4797
  createdDate: string // '2021-12-14 10: string //46: string //09'
  extProps: string // ''
  id: string // 30549
  money: string // 189
  mpErpId: string // 1989
  num: string // 1
  price: string // 189
  rem: string // ''
  sizeId: string // 2
  sizeName: string // 'M'
  styleCode: string // 'r-3782'
  styleId: string // 10023551889
  styleImg: string // 'https: //a01-1256054816.cos.ap-shanghai.myqcloud.com/2020/12/21/905576058651673093-h360.jpg'
  styleName: string // '女装r-3782'
  unitId: string // 4797
  updatedBy: string // 4797
  updatedDate: string // '2021-12-16 14:12:48'
  groupNum?: number
}

interface PartSendItem {
  billId: string //	订单id
  billType: string //	订单类型
  billNo: string //	订单批次号
  proDate: string //	下单时间
  totalNum: string // 总件数
  totalMoney: string //	总金额
  styleImgs: string //	货品图片
  sn: string
  epid: string
}

const mapStateToProps = ({ user, shop, systemInfo, replenishment }: GlobalState) => ({
  phone: user.phone,
  nickName: user.nickName,
  buyGoodsData: user.buyGoodsData,
  avatar: user.avatar,
  firstShop: shop.list[0],
  shopNum: shop.list.length,
  sessionId: user.sessionId,
  statusBarHeight: systemInfo.statusBarHeight,
  gap: systemInfo.gap,
  navigationHeight: systemInfo.navigationHeight,
  screenWidth: systemInfo.screenWidth,
  shopList: shop.list
})
type StateProps = ReturnType<typeof mapStateToProps>
// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class OrderDetailPage extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationStyle: 'custom'
  // }

  // billState = [
  //   {},
  //   { label: '订单未发货', tip: '您可以联系商家报单' },
  //   { label: '订单已发货', tip: '' },
  //   { label: '订单部分发货', tip: '' },
  //   { label: '商家取消订单', tip: '您可以联系商家确认' }
  // ]

  constructor(props) {
    super(props)
    // eslint-disable-next-line
    const options = wx.getEnterOptionsSync()

    const isFromVideo = VIDEO_SCENE.includes(options.scene)
    this.state = {
      billData: [],
      shop: {
        shopName: '',
        shopLogo: ''
      },
      styleData: [],
      tableMode: 1,
      bottomInfo: [],
      billState: 0,
      partSendData: [],
      needMask: false,
      slhBillNo: '-',
      bill: {
        extProps: '{}'
      } as InfoItem,
      timeValue: '',
      logisInfo: {} as LOGIS_INFO,
      logisIsShow: false,
      isFromVideo,
      dwName: '-'
    }
  }

  timer

  componentDidUpdate(prevProps: Readonly<StateProps>): void {
    if (!prevProps.sessionId && this.props.sessionId) {
      this.loadData(getTaroParams(Taro.getCurrentInstance?.()).billId)
    }
  }

  componentDidMount() {
    if (this.props.sessionId) {
      const { billId } = getTaroParams(Taro.getCurrentInstance?.())
      this.loadData(billId)
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  loadData = billId => {
    const shareFlag = getTaroParams(Taro.getCurrentInstance?.()).shareFlag
    getOrderDetailList({ billId: billId, showDwName: shareFlag === '1' }).then(res => {
      Taro.hideLoading()
      const { shopName, shopLogoUrl, details, bill, dwName } = res.data
      if (bill.payStatus === PAY_STATUS.WAITING) {
        if (new Date(bill.payExpireDate).getTime() - new Date().getTime() > 0) {
          this.timer = setInterval(() => {
            let _date = new Date()
            let _payDate = new Date(bill.payExpireDate)
            let _time = _payDate.getTime() - _date.getTime()
            if (_time > 0) {
              let timeDate = new Date(_time)
              this.setState({
                timeValue: `${timeDate.getMinutes()}:${timeDate.getSeconds()}后自动取消`
              })
            } else {
              if (this.timer) {
                this.setState({
                  timeValue: '订单已超时'
                })
                this.loadData(billId)
                clearInterval(this.timer)
              }
            }
          }, 1000)
        }
      }
      this.setState(
        {
          billData: details,
          shop: {
            shopName: shopName,
            shopLogo: shopLogoUrl
          },
          bottomInfo: [
            {
              title: '总数',
              value: bill.totalNum
            },
            {
              title: '总额',
              value: bill.totalMoney
            },
            {
              title: '收货地址',
              value: bill.fullAddress
            },
            {
              title: '备注',
              value: bill.buyerRem
            }
          ],
          slhBillNo: bill.slhBillNo || '-',
          bill: bill,
          dwName
        },
        () => {
          this.classifyByStyle()
          this.setBillState(res.data)
          this.getPartSendOrder()
        }
      )
    })
  }

  getPartSendOrder = () => {
    getPartSendOrderList({ billId: Number(getTaroParams(Taro.getCurrentInstance?.()).billId) }).then(res => {
      if (res.data) {
        const { rows } = res.data
        const { bill } = this.state
        let hasSend = 0
        if (rows) {
          rows.forEach(item => {
            // hasSend = hasSend + Number(item.totalNum)
            if (item.styleImgs) {
              item.styleImgs = item.styleImgs.map(img => {
                return img.split(' ')[0]
              })
            }
          })
          hasSend = rows.length
          //@ts-ignore
          const { totalNum } = bill
          const noSend = Number(totalNum) - hasSend

          this.setState({
            partSendData: rows
          })
        }
      }
    })
  }

  onCancelApply = () => {
    Taro.showLoading({ title: '请稍等...' })
    updateOrderRefundStatus({
      jsonParam: {
        billId: getTaroParams(Taro.getCurrentInstance?.()).billId,
        refundStatus: REFUND_STATUS.CANCEL
      }
    }).then(() => {
      Taro.hideLoading()
      this.loadData(getTaroParams(Taro.getCurrentInstance?.()).billId)
    })
  }

  onPayClick = async () => {
    const { mpErpId, billId } = getTaroParams(Taro.getCurrentInstance?.())
    const { bill } = this.state
    let _this = this
    const _extProps = JSON.parse(bill.extProps)
    let data = { val: '0' }
    if (_extProps.billSrc === 2) {
      data.val = '1'
    } else {
      const { data: _data } = await getShopParamVal({
        mpErpId,
        code: 'order_pay'
      })
      data.val = _data.val
    }

    if (data.val === '1') {
      Taro.showLoading({ title: '请稍等...' })
      launchOrderPay({
        mpErpId,
        billId
      })
        .then(({ data }) => {
          const { bill } = this.state
          const _extProps = JSON.parse(bill.extProps)
          let _params = {
            timeStamp: data.timeStamp.toString(),
            nonceStr: data.nonceStr,
            package: data.package,
            signType: data.signType,
            paySign: data.paySign,
            success(res) {
              Taro.hideLoading()
              _this.loadData(billId)
            },
            fail(res) {
              console.log(`支付fail回调`, res)
              Taro.hideLoading()
            }
          }
          if (_extProps.billSrc === 2) {
            console.log('requestOrderPayment')
            // eslint-disable-next-line
            wx.requestOrderPayment(_params)
          } else {
            console.log('requestPayment')
            // eslint-disable-next-line
            wx.requestPayment(_params)
          }
        })
        .catch(e => {
          Taro.hideLoading()
          return
        })
    }
  }

  renderTopInfo = () => {
    const { billState, bill, timeValue, isFromVideo } = this.state
    const _extProps = JSON.parse(bill.extProps)
    if (billState === -1) {
      return (
        <View className={styles.topInfo}>
          <View className={styles.topInfo__tipSingle}>
            <View className={styles.topInfo__tip__top}>订单已取消</View>
            {/* <View>您可以联系商家确认</View> */}
          </View>
          <View className={styles.topInfo__btn}>
            <View
              onClick={this.addShoppingCart}
              className={styles.topInfo__btn__item}
              style={{ marginRight: '10px' }}
            >
              再补一单
            </View>
          </View>
        </View>
      )
    }
    if (billState === -2) {
      return (
        <View className={styles.topInfo}>
          <View className={styles.topInfo__tip} style={{ justifyContent: 'flex-start' }}>
            <View className={styles.topInfo__tip__top}>商家已取消订单</View>
            <View>您可以联系商家确认</View>
          </View>
          <View className={styles.topInfo__btn}>
            <View
              className={styles.topInfo__btn__item}
              style={{ marginRight: '10px' }}
              onClick={this.addShoppingCart}
            >
              再补一单
            </View>
            {/* <View className={styles.topInfo__btn__item}>取消订货</View> */}
          </View>
        </View>
      )
    }
    if (
      (billState === 0 || billState === 1) &&
      bill.payStatus === PAY_STATUS.SUCCESS &&
      (bill.refundStatus === REFUND_STATUS.APPLY ||
        bill.refundStatus === REFUND_STATUS.DOING ||
        bill.refundStatus === REFUND_STATUS.FAILURE ||
        bill.refundStatus === REFUND_STATUS.REJECT)
    ) {
      return (
        <View className={styles.topInfo}>
          <View className={styles.topInfo__tip} style={{ justifyContent: 'flex-start' }}>
            <View className={styles.topInfo__tip__top}>售后中</View>
            <View>
              {bill.refundStatus === REFUND_STATUS.APPLY ? '等待商家同意退款' : ''}
              {bill.refundStatus === REFUND_STATUS.REJECT
                ? `商家拒绝退款: ${JSON.parse(bill.extProps).refundRejectReason || '无'}`
                : ''}
              {bill.refundStatus === REFUND_STATUS.DOING ? '退款成功，预计1~2个工作日内到账' : ''}
            </View>
          </View>
          <View className={styles.topInfo__btn}>
            <View
              onClick={this.addShoppingCart}
              className={styles.topInfo__btn__item}
              style={{ marginRight: '10px' }}
            >
              再补一单
            </View>
            {bill.payStatus === PAY_STATUS.SUCCESS && bill.refundStatus === REFUND_STATUS.DEFAULT && (
              <View className={styles.topInfo__btn__item} onClick={this.onRefundClick}>
                申请退款
              </View>
            )}
            {bill.refundStatus === REFUND_STATUS.APPLY && (
              <View
                className={styles.topInfo__btn__item}
                style={{ marginRight: '10px' }}
                onClick={this.onCancelApply}
              >
                取消退款
              </View>
            )}
            {/* <View className={styles.topInfo__btn__item}>取消订货</View> */}
          </View>
        </View>
      )
    }
    if (billState === 1) {
      let _orderPay = false
      if (getTaroParams(Taro.getCurrentInstance?.()).orderPay === 'true') {
        _orderPay = true
      }
      return (
        <View className={styles.topInfo}>
          <View className={styles.topInfo__tip}>
            <View className={styles.topInfo__tip__top}>
              {bill.payStatus === PAY_STATUS.WAITING ? '订单未付款' : ''}
              {bill.payStatus === PAY_STATUS.SUCCESS || bill.payStatus === PAY_STATUS.DEFAULT
                ? '订单未发货'
                : ''}
              {bill.payStatus === PAY_STATUS.SUCCESS && (
                <Text className={styles.pay_success}>已付款</Text>
              )}
            </View>
            <View>
              {bill.payStatus === PAY_STATUS.WAITING ? (timeValue ? `${timeValue}` : '') : ''}
              {bill.payStatus === PAY_STATUS.DEFAULT || bill.payStatus === PAY_STATUS.SUCCESS
                ? '您可以联系商家报单'
                : ''}
            </View>
          </View>
          <View className={styles.topInfo__btn}>
            {!isFromVideo && (
              <Button
                className={styles.topInfo__btn__item}
                style={{ marginRight: '10px', height: '31px' }}
                openType='share'
              >
                去报单
              </Button>
            )}
            {bill.payStatus === PAY_STATUS.SUCCESS &&
              (bill.refundStatus === REFUND_STATUS.DEFAULT ||
                bill.refundStatus === REFUND_STATUS.CANCEL) &&
              _extProps.billSrc !== 2 && (
                <View className={styles.topInfo__btn__item} onClick={this.onRefundClick}>
                  申请退款
                </View>
              )}
            {bill.payStatus === PAY_STATUS.DEFAULT && (
              <View className={styles.topInfo__btn__item} onClick={this.cancelBill}>
                取消订货
              </View>
            )}
            {bill.payStatus === PAY_STATUS.WAITING && (
              <View
                className={styles.topInfo__btn__item}
                onClick={this.onPayClick}
                style={{
                  backgroundColor: '#fff',
                  color: '#E62E4D'
                }}
              >
                立即支付
              </View>
            )}
          </View>
        </View>
      )
    }
    if (billState === 2) {
      return (
        <View className={styles.topInfo}>
          <View className={styles.topInfo__tip}>
            <View className={styles.topInfo__tip__top}>订单部分发货</View>
            <View>发货情况请以小票为准</View>
          </View>
          <View className={styles.topInfo__btn}>
            {process.env.INDEPENDENT !== 'independent' &&
              process.env.INDEPENDENT !== 'foodindependent' && (
                <View
                  onClick={this.onLookTicket}
                  className={styles.topInfo__btn__item}
                  style={{ marginRight: '10px' }}
                >
                  查看小票
                </View>
              )}
            <View className={styles.topInfo__btn__item} onClick={this.addShoppingCart}>
              再补一单
            </View>
          </View>
        </View>
      )
    }
    if (billState === 3) {
      return (
        <View className='col aic'>
          <View
            className={styles.topInfo}
            style={{
              paddingBottom:
                process.env.INDEPENDENT === 'independent' ||
                process.env.INDEPENDENT === 'foodindependent'
                  ? '0'
                  : '20px',
              width: '94%'
            }}
          >
            <View className={styles.topInfo__tip}>
              <View className={styles.topInfo__tip__top}>
                订单已发货
                {bill.payStatus === PAY_STATUS.SUCCESS && (
                  <Text className={styles.pay_success}>已付款</Text>
                )}
              </View>
            </View>
            {_extProps.billSrc !== 2 ? (
              <View className={styles.topInfo__btn}>
                {process.env.INDEPENDENT !== 'foodindependent' && (
                  <View
                    className={styles.topInfo__btn__item}
                    onClick={this.onLookTicket}
                    style={{ marginRight: '10px' }}
                  >
                    查看小票
                  </View>
                )}
                <View className={styles.topInfo__btn__item} onClick={this.addShoppingCart}>
                  再补一单
                </View>
              </View>
            ) : (
              <View className={styles.topInfo__btn}>
                <View className={styles.topInfo__btn__item} onClick={this.addShoppingCart}>
                  再补一单
                </View>
                <View
                  className={styles.topInfo__btn__item}
                  style={{
                    backgroundColor: '#fff',
                    color: '#E62E4D',
                    marginLeft: '10px'
                  }}
                  onClick={this.onConfirmReceive}
                >
                  确认收货
                </View>
              </View>
            )}
          </View>
          {_extProps.logisList && (
            <View className={styles.logistics}>
              <Text>
                {_extProps.logisList.length === 1
                  ? `${_extProps.logisList[0].logisProviderName}：${_extProps.logisList[0].logisBillNo}`
                  : `本单包含${_extProps.logisList.length}个包裹`}
              </Text>
              <View className='aic' style='height:100%;' onClick={this.onLogisticsClick}>
                <Text className={styles.show_logis}>查看物流轨迹</Text>
                <Image src={angleRight} className={styles.angle_right} />
              </View>
            </View>
          )}
        </View>
      )
    }
    if (billState === 4) {
      return (
        <View className='col aic'>
          <View
            className={styles.topInfo}
            style={{
              paddingBottom:
                process.env.INDEPENDENT === 'independent' ||
                process.env.INDEPENDENT === 'foodindependent'
                  ? '0'
                  : '20px',
              width: '94%'
            }}
          >
            <View className={styles.topInfo__tipSingle}>
              <View className={styles.topInfo__tip__top}>订单已完成</View>
            </View>
            <View className={styles.topInfo__btn}>
              <View className={styles.topInfo__btn__item} onClick={this.addShoppingCart}>
                再补一单
              </View>
            </View>
          </View>
          {_extProps.logisList && (
            <View className={styles.logistics}>
              <Text>
                {_extProps.logisList.length === 1
                  ? `${_extProps.logisList[0].logisProviderName}：${_extProps.logisList[0].logisBillNo}`
                  : `本单包含${_extProps.logisList.length}个包裹`}
              </Text>
              <View className='aic' style='height:100%;' onClick={this.onLogisticsClick}>
                <Text className={styles.show_logis}>查看物流轨迹</Text>
                <Image src={angleRight} className={styles.angle_right} />
              </View>
            </View>
          )}
        </View>
      )
    }
  }

  renderNumTable = (data: Array<BillItem>) => {
    // 获取颜色header
    let colorHeader: Array<{
      colorName: string
      colorId: string
      sizeNum: Array<string | number>
    }> = []
    const colorMap = new Map()
    data.forEach(item => {
      const key = item.colorId
      const cell = colorMap.get(key)
      let obj = {}
      if (!cell) {
        obj = {
          colorName: item.colorName,
          colorId: item.colorId,
          sizeNum: [`${item.colorName}`]
        }
        colorMap.set(key, obj)
      }
    })
    colorHeader = Array.from(colorMap.values())

    // 获取尺码header
    let sizeHeader: Array<{ sizeName: string; sizeId: string }> = []
    const sizeMap = new Map()
    data.forEach(item => {
      const key = item.sizeId
      const cell = sizeMap.get(key)
      let obj = {}
      if (!cell) {
        obj = {
          sizeName: item.sizeName,
          sizeId: item.sizeId
        }
        sizeMap.set(key, obj)
      }
    })
    sizeHeader = Array.from(sizeMap.values())

    // 获取表格数据
    const tableMap = new Map()

    data.forEach(item => {
      const key = `${item.colorId}_${item.sizeId}`
      let obj = {
        colorName: item.colorName,
        sizeName: item.sizeName,
        colorId: item.colorId,
        sizeId: item.sizeId,
        num: item.num,
        groupNum: item.groupNum
      }
      const cell = tableMap.get(key)
      if (cell) {
        obj.num += cell.num
      }
      tableMap.set(key, obj)
    })

    colorHeader.forEach(color => {
      sizeHeader.forEach(size => {
        const key = `${color.colorId}_${size.sizeId}`
        const cell = tableMap.get(key)
        let num: number | string = 0
        if (cell) {
          if (cell.groupNum && cell.groupNum !== cell.num) {
            num = `${cell.groupNum}手${cell.num}件`
          } else {
            num = cell.num
          }
        }
        color.sizeNum.push(num)
      })
    })

    return (
      <View className={styles.table}>
        <View className={styles.table__sizeHeader}>
          <View className={styles.table__cell} />
          {sizeHeader &&
            sizeHeader.map(size => {
              return (
                <View className={styles.table__cell} key={size.sizeId}>
                  {size.sizeName}
                </View>
              )
            })}
        </View>
        {colorHeader &&
          colorHeader.map(row => {
            const { sizeNum } = row
            return (
              <View className={styles.table__sizeHeader} key={row.colorId}>
                {sizeNum &&
                  sizeNum.map((size, index) => {
                    return (
                      <View className={styles.table__cell} key={`${size}_${index}`}>
                        {size}
                      </View>
                    )
                  })}
              </View>
            )
          })}
      </View>
    )
  }

  renderInfoTable = () => {
    const { billData } = this.state
    const { shopList } = this.props
    const { mpErpId } = getTaroParams(Taro.getCurrentInstance?.())
    const _shop = shopList.find(s => s.id === Number(mpErpId))
    const initArr = [['款号'], ['名称'], ['颜色'], ['尺码'], ['数量'], ['单价'], ['小计']]
    let infoArr = billData.reduce((prev, cur: BillItem, index) => {
      const num =
        cur.groupNum && cur.groupNum !== Number(cur.num) ? `${cur.groupNum}手${cur.num}件` : cur.num
      prev[0].push(cur.styleCode)
      prev[1].push(cur.styleName)
      prev[2].push(cur.colorName)
      prev[3].push(cur.sizeName)
      prev[4].push(num)
      prev[5].push(cur.price)
      prev[6].push(cur.money)
      return prev
    }, initArr)
    if (_shop && _shop.industries) {
      infoArr[0][0] = '货号'
      infoArr.splice(2, 2)
    }
    return (
      billData.length > 0 && (
        <View className={styles.list_new_style}>
          {/* 头部 */}
          {infoArr.map((col, cIndex) => (
            <View key={cIndex} className={styles.list_new_style__col}>
              {col.map((item, _idx) => (
                <View key={_idx} className={styles.list_new_style__col__item}>
                  <Text selectable>{item}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )
    )
  }

  renderBottom = () => {
    const { bottomInfo } = this.state
    return (
      <View className={styles.bottom}>
        {bottomInfo &&
          bottomInfo.map((item: any, index) => {
            return (
              <View className={styles.bottom__item} key={`${index}_${item.value}`}>
                <View style={{ color: '#999', fontSize: '12px' }}>{item.title}</View>
                <View style={{ color: '#333', fontSize: '12px' }}>{item.value}</View>
              </View>
            )
          })}
      </View>
    )
  }

  onLogisClose = () => {
    this.setState({
      logisIsShow: false
    })
  }

  onCopyWayBillNo = () => {
    Taro.setClipboardData({
      data: this.state.logisInfo.waybillNo
    })
  }

  onLogisItemClick = e => {
    const { logisno, logisid } = e.currentTarget.dataset
    Taro.showLoading({
      title: '请稍等...'
    })
    fetchExpressTrack(logisno, logisid)
      .then(({ data }) => {
        Taro.hideLoading()
        this.setState({
          logisInfo: data,
          logisIsShow: true
        })
      })
      .catch(() => Taro.hideLoading())
  }

  renderLogisInfo = () => {
    const { logisInfo, bill } = this.state
    const _extProps = JSON.parse(bill.extProps)
    return (
      <View className={styles.logis_info_mask} onClick={this.onLogisClose}>
        <View className={styles.logis_info_mask__content} onClick={e => e.stopPropagation()}>
          <View className={styles.logis_info_mask__content__header}>
            物流轨迹
            <Image src={DeleteIcon} className={styles.delete_icon} onClick={this.onLogisClose} />
          </View>
          <View className={styles.logis_info_mask__content__loginList}>
            {_extProps.logisList.map((log, index) => (
              <View
                key={log.logisBillNo}
                className={cn(styles.logis_info_mask__content__loginList__item, {
                  [styles['logis_info_mask__content__loginList__item--active']]:
                    log.logisBillNo === logisInfo.waybillNo
                })}
                data-logisno={log.logisBillNo}
                data-logisid={log.logisProviderId}
                onClick={this.onLogisItemClick}
              >
                包裹{index + 1}
              </View>
            ))}
          </View>
          <View className={styles.logis_info_mask__content__info}>
            {logisInfo.logisCompName}：{logisInfo.waybillNo}
            <Text className={styles.logis_info_copy} onClick={this.onCopyWayBillNo}>
              复制
            </Text>
          </View>
          <View className={styles.logis_info_mask__content__logis}>
            {/* <View className={styles.logis_info_mask__content__logis__send}>
              <View className={styles.send_view}>派</View>
              <Text>派送中</Text>
            </View> */}
            {logisInfo.traces.reverse().map(trace => (
              <View key={trace.acceptTime} className={styles.logis_info_mask__content__logis__item}>
                <View className={styles.logis_info_mask__content__logis__item__round}></View>
                <View className={styles.logis_info_mask__content__logis__item__timer}>
                  <Text>{getLogisRelativeDate(trace.acceptTime)}</Text>
                  <Text>{trace.acceptTime.split(' ')[1].substring(0, 5)}</Text>
                </View>
                <View className={styles.logis_info_mask__content__logis__item__content}>
                  {trace.acceptStation}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    )
  }

  renderBottomModal = () => {
    const { partSendData, shop } = this.state
    const { screenWidth } = this.props
    return (
      <ScrollView scrollY style={{ width: screenWidth }} className={styles.bottomModal}>
        <View className={styles.bottomModal__card__header}>
          <View style={{ fontSize: '16px', color: '#999999' }}>选择销售单</View>
          <Image
            onClick={() => {
              this.setState({ needMask: false })
            }}
            src={cancelIcon}
            className={styles.bottomModal__card__header__img}
          ></Image>
        </View>
        {partSendData &&
          partSendData.map((item: PartSendItem) => {
            return (
              <View
                key={item.billId}
                className={styles.bottomModal__card}
                onClick={() => {
                  this.goToCheckDetail(item)
                }}
              >
                <View className={styles.bottomModal__card__top}>
                  <View style={{ fontSize: '15px', color: '#222' }}>{shop.shopName}</View>
                  <View style={{ fontSize: '13px', color: '#999' }}>
                    {item.proDate.split(' ')[0]}
                  </View>
                </View>
                <View className={styles.bottomModal__card__img}>
                  {item.styleImgs &&
                    item.styleImgs.map(img => {
                      return (
                        <Image
                          key={img}
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '8px',
                            marginRight: '4px'
                          }}
                          src={img}
                        ></Image>
                      )
                    })}
                </View>
                <View className={styles.bottomModal__card__bottom}>
                  <View style={{ color: '#999', fontSize: '13px' }}>{`NO.${item.billNo}`}</View>
                  <View
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <View>{`共${item.totalNum}件`}</View>
                    <View style={{ display: 'flex', alignItems: 'center' }}>
                      <View>总金额：￥</View>
                      <View style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {item.totalMoney}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )
          })}
      </ScrollView>
    )
  }

  onShareAppMessage(obj: Taro.ShareAppMessageObject): Taro.ShareAppMessageReturn {
    const { shop, billData } = this.state
    // @ts-ignore
    const billId = billData[0].billId
    const { mpErpId } = getTaroParams(Taro.getCurrentInstance?.())
    return {
      title: `${shop.shopName},您有一份来自云单的订单`,
      path: `/subpackages/mine/pages/order_list/order_list_detail/index?billId=${billId}&shareFlag=1&mpErpId=${mpErpId}`,
      imageUrl: shop.shopLogo
    }
  }

  // 根据款号分类
  classifyByStyle = () => {
    const { billData } = this.state
    const styleMap = new Map()
    const getSkuTotalMoney = item =>
      typeof item.money === 'undefined' ? Number(item.num) * Number(item.price) : Number(item.money)
    billData.forEach((item: BillItem) => {
      const key = item.styleId
      const obj = styleMap.get(key)
      if (!obj) {
        const baseInfo = {
          key: item.id,
          styleImg: makeGdocUrlToArray(item.styleImg),
          styleCode: item.styleCode,
          styleName: item.styleName,
          price: item.price,
          num: Number(item.num),
          totalMoney: getSkuTotalMoney(item)
        }
        styleMap.set(key, {
          baseInfo: baseInfo,
          data: [item]
        })
        return
      }
      const baseInfo = {
        key: item.id,
        styleImg: makeGdocUrlToArray(item.styleImg),
        styleCode: item.styleCode,
        styleName: item.styleName,
        price: item.price,
        num: obj.baseInfo.num + Number(item.num),
        totalMoney: getSkuTotalMoney(item) + Number(obj.baseInfo.totalMoney)
      }
      styleMap.set(key, { baseInfo: baseInfo, data: [...obj.data, item] })
    })
    this.setState({
      styleData: Array.from(styleMap.values())
    })
  }

  setBillState = (data: any) => {
    const { bill } = data
    let { billState } = this.state
    if (bill) {
      const { deliverFlag, flag } = bill
      if (flag < 0) {
        // 订单取消
        billState = flag // -1 客户取消 -2 商家取消
      } else {
        if (deliverFlag === 0) {
          billState = 1 // 未发
        } else if (deliverFlag === 1) {
          billState = 2 // 部分发
        } else if (deliverFlag === 2) {
          billState = 3 //全发
        } else if (deliverFlag === 3) {
          billState = 4
        }
      }
      this.setState({
        billState: billState
      })
    }
  }

  cancelBill = () => {
    messageFeedback.showAlertWithCancel(`确认取消订单？取消后订单将作废`, '', () => {
      purBillCancel(Number(getTaroParams(Taro.getCurrentInstance?.()).billId))
        .then(res => {
          Taro.hideLoading()
          let pages = Taro.getCurrentPages() // 获取当前的页面栈
          let prevPage = pages[pages.length - 2] //  获取上一页面
          prevPage.setData({
            cancelBillFlag: 1 // 设置上一个页面的值
          })
          // messageFeedback.showToast('作废成功')
          // Taro.navigateBack()
          this.loadData(Number(getTaroParams(Taro.getCurrentInstance?.()).billId))
        })
        .catch(err => {
          console.log('err :', err)
        })
    })
  }

  onRefundClick = () => {
    messageFeedback.showAlertWithCancel('已付款订单，需商家同意后退款', '提示', () => {
      Taro.showLoading({ title: '请稍等...' })
      updateOrderRefundStatus({
        jsonParam: {
          billId: getTaroParams(Taro.getCurrentInstance?.()).billId,
          refundStatus: REFUND_STATUS.APPLY
        }
      }).then(() => {
        Taro.hideLoading()
        this.loadData(getTaroParams(Taro.getCurrentInstance?.()).billId)
      })
    })
  }

  addShoppingCart = () => {
    orderAddShoppingCart(Number(getTaroParams(Taro.getCurrentInstance?.()).billId))
      .then(res => {
        Taro.hideLoading()
        messageFeedback.showAlertWithCancel('商品已加入进货车,是否前往进货车？', '', () => {
          if (
            process.env.INDEPENDENT === 'independent' ||
            process.env.INDEPENDENT === 'foodindependent'
          ) {
            Taro.navigateTo({
              url: '/subpackages/cloud_bill/pages/replenishment/index'
            })
          } else {
            Taro.switchTab({
              url: '/pages/stock_bar/index'
            })
          }
        })
      })
      .catch(err => {
        console.log('err :', err)
      })
  }

  addShoppingCartSingle = (item: BillItem) => {
    const { data } = item
    const param: any = {
      mpErpId: `${data[0].mpErpId}`
    }
    const skuArr: any = []
    if (data) {
      data.forEach(sku => {
        const {
          styleId,
          styleCode,
          styleName,
          styleImg,
          sizeId,
          sizeName,
          colorId,
          colorName,
          num,
          price
        } = sku
        const obj = {
          styleId,
          styleCode,
          styleName,
          styleImg,
          sizeId,
          sizeName,
          colorId,
          colorName,
          num,
          price
        }
        skuArr.push(obj)
      })
    }
    param.jsonParam = skuArr
    orderAddShoppingCartSingle(param)
      .then(() => {
        messageFeedback.showToast('添加成功')
        this.props.dispatch({ type: 'replenishment/fetchCartGoodsList' })
      })
      .catch(err => {
        console.log(err)
      })
  }

  onJumpShopClick = () => {
    if (
      process.env.INDEPENDENT === 'independent' ||
      process.env.INDEPENDENT === 'foodindependent'
    ) {
      Taro.navigateTo({
        url: '/subpackages/cloud_bill/pages/replenishment/index'
      })
    } else {
      Taro.switchTab({
        url: '/pages/stock_bar/index'
      })
    }
  }

  onLookTicket = () => {
    const { partSendData } = this.state
    if (partSendData) {
      if (partSendData.length === 1) {
        const item: PartSendItem = partSendData[0]
        const query = `pk=${item.billId}&sn=${item.sn}&epid=${item.epid}&type=${item.billType}`
        navigatorSvc.navigateTo({ url: `/pages/eTicketDetail/landscapeModel?${query}` })
        return
      }
      this.setState({ needMask: true })
    }
  }

  onConfirmReceive = () => {
    Taro.showLoading({
      title: '请稍等...'
    })
    confirmReceive({
      billId: getTaroParams(Taro.getCurrentInstance?.()).billId
    })
      .then(({ data }) => {
        Taro.hideLoading()
        this.loadData(getTaroParams(Taro.getCurrentInstance?.()).billId)
      })
      .catch(() => Taro.hideLoading())
  }

  onLogisticsClick = () => {
    const { bill } = this.state
    const _extProps = JSON.parse(bill.extProps)
    Taro.showLoading({
      title: '请稍等...'
    })
    fetchExpressTrack(_extProps.logisList[0].logisBillNo, _extProps.logisList[0].logisProviderId)
      .then(({ data }) => {
        Taro.hideLoading()
        this.setState({
          logisInfo: data,
          logisIsShow: true
        })
      })
      .catch(() => Taro.hideLoading())
  }

  goToCheckDetail = (item: PartSendItem) => {
    const query = `pk=${item.billId}&sn=${item.sn}&epid=${item.epid}&type=${item.billType}`
    navigatorSvc.navigateTo({ url: `/pages/eTicketDetail/landscapeModel?${query}` })
  }

  render() {
    const { statusBarHeight, navigationHeight, gap, shopList } = this.props
    const {
      shop,
      billData,
      styleData,
      tableMode,
      needMask,
      slhBillNo,
      billState,
      logisIsShow,
      bill,
      dwName
    } = this.state
    let shareFlag = 0
    if (getTaroParams(Taro.getCurrentInstance?.()).shareFlag) {
      shareFlag = Number(getTaroParams(Taro.getCurrentInstance?.()).shareFlag)
    }
    const { mpErpId } = getTaroParams(Taro.getCurrentInstance?.())
    const _shop = shopList.find(s => s.id === Number(mpErpId))
    return (
      <View className={styles.contanier}>
        <Image
          src={bgImg}
          className={cn(styles.bg, {
            [styles['bg_logistics']]:
              (billState === 3 || billState === 4) &&
              (process.env.INDEPENDENT === 'independent' ||
                process.env.INDEPENDENT === 'foodindependent')
          })}
        />
        {needMask && (
          <View
            className={styles.mask}
            onClick={() => {
              this.setState({ needMask: false })
            }}
          ></View>
        )}
        {needMask && this.renderBottomModal()}
        <View className={styles.jump_btn} onClick={this.onJumpShopClick}>
          进货车
        </View>
        {shareFlag != 1 ? (
          <Image
            style={{
              position: 'absolute',
              top: `${statusBarHeight + navigationHeight * 0.5 - 16}px`,
              width: '32px',
              height: '32px',
              left: '20px'
            }}
            src={backIcon}
            onClick={() => {
              Taro.navigateBack()
            }}
          ></Image>
        ) : (
          <Image
            style={{
              position: 'absolute',
              top: `${statusBarHeight + navigationHeight * 0.5 - 16}px`,
              width: '32px',
              height: '32px',
              left: '20px'
            }}
            src={homeIcon}
            onClick={() => {
              if (process.env.INDEPENDENT === 'independent') {
                Taro.redirectTo({ url: '/subpackages/cloud_bill/pages/all_goods/index' })
              } else {
                Taro.switchTab({ url: '/pages/cloud_bill_tab/index' })
              }
            }}
          ></Image>
        )}

        <View
          style={{
            marginTop: `${statusBarHeight}px`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: `${navigationHeight}px`,
            color: 'white',
            fontSize: '17px'
          }}
        >
          {shareFlag != 1 ? '' : '云单订单'}
        </View>
        {shareFlag != 1 && this.renderTopInfo()}
        <ScrollView scrollY>
          <View className={styles.goodsInfo}>
            <View className={styles.goodsInfo__baseInfo}>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Image
                  src={shop.shopLogo || defaultShopLogo}
                  className={styles.goodsInfo__baseInfo__img}
                ></Image>
                <View style={{ fontSize: '22px' }}>{shop.shopName}</View>
              </View>
              <View
                className={styles.goodsInfo__baseInfo__right}
                onClick={() => {
                  this.setState({
                    tableMode: tableMode === 1 ? 0 : 1
                  })
                }}
              >
                切换样式
                <Image src={changeIcon} style={{ width: '16px', height: '16px' }}></Image>
              </View>
            </View>
            {shareFlag === 1 ? (
              <View className={styles.goodsInfo__mainInfo}>
                <View className={styles.goodsInfo__mainInfo__item}>
                  <Text>批次</Text>
                  <Text>{slhBillNo}</Text>
                </View>
                <View className={styles.goodsInfo__mainInfo__item}>
                  <Text>客户</Text>
                  <Text>{dwName}</Text>
                </View>
                <View className={styles.goodsInfo__mainInfo__item}>
                  <Text>日期</Text>
                  <Text>{bill.createdDate ? bill.createdDate.slice(0, 10) : '-'}</Text>
                </View>
              </View>
            ) : (
              <View
                style={{ fontSize: '15px', color: '#333333', paddingBottom: '12px' }}
              >{`批次:${slhBillNo}`}</View>
            )}

            {styleData &&
              styleData.map((item: any) => {
                const { baseInfo, data } = item
                return tableMode === 1 ? (
                  <View
                    key={baseInfo.key}
                    style={{
                      borderRadius: '10px',
                      backgroundColor: '#f9f9f9',
                      padding: '10px',
                      marginBottom: '10px'
                    }}
                  >
                    <View className={styles.goodsInfo__singleInfo}>
                      <View className={styles.goodsInfo__singleInfo__goodImg}>
                        <EImage
                          onClick={() =>
                            Taro.previewImage({
                              urls: Array.isArray(baseInfo.styleImg)
                                ? baseInfo.styleImg
                                : [baseInfo.styleImg]
                            })
                          }
                          src={baseInfo.styleImg}
                        ></EImage>
                      </View>

                      <View className={styles.goodsInfo__singleInfo__info}>
                        <View className={styles.goodsInfo__singleInfo__info__left}>
                          <View>{baseInfo.styleCode}</View>
                          <View>
                            <View>{baseInfo.styleName}</View>
                            {_shop && _shop.industries ? (
                              <View>
                                {data.map(_data => (
                                  <View>
                                    {`￥${_data.price}/${_data.sizeName}`}
                                    <Text style='margin-left:10px'>{`X${_data.num}`}</Text>
                                  </View>
                                ))}
                              </View>
                            ) : (
                              <View>{`￥${baseInfo.price}*${baseInfo.num}`}</View>
                            )}
                          </View>
                        </View>
                        <View className={styles.goodsInfo__singleInfo__info__right}>
                          <View>{baseInfo.totalMoney}</View>
                          {shareFlag != 1 && (
                            <Image
                              style={{ width: '20px', height: '20px' }}
                              src={addIcon}
                              onClick={() => {
                                this.addShoppingCartSingle(item)
                              }}
                            ></Image>
                          )}
                        </View>
                      </View>
                    </View>
                    {_shop && !_shop.industries && this.renderNumTable(data)}
                  </View>
                ) : null
              })}
            {tableMode === 0 ? this.renderInfoTable() : null}
            {this.renderBottom()}
          </View>
        </ScrollView>
        {/* <View style={{ flex: 1 }}></View> */}
        {logisIsShow && this.renderLogisInfo()}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(OrderDetailPage)