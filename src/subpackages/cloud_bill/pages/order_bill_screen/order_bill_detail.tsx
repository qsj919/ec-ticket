import Taro, { startDeviceMotionListening } from '@tarojs/taro'
import React from 'react'
import { View, Image, Text, Input, ScrollView, Block } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import { auditPassPurBill, auditCancelPurBill } from '@api/goods_api_manager'
import { updateOrderRefundStatus } from '@api/apiManage'
import myLog from '@utils/myLog'
import { OrderSku } from '@@types/GoodsType'
import { isWeapp, setNavigationBarTitle } from '@utils/cross_platform_api'
import { round, times } from 'number-precision'
import messageFeedback from '@services/interactive'
import DeleteImg from '@/images/delete_circle_32.png'
import { AFTER_SALE_STATUS, REFUND_STATUS } from '@@types/base'
import closeIcon from '@/images/icon/close_gray_32.png'
import { payStatusDict } from '@@types/dict'
import { findAfterSaleDetailList } from '@api/live_api_manager'
import { getTaroParams } from '@utils/utils'
import dayjs from 'dayjs'
import RightIcon from '../../images/angle_right_gray_40.png'
import PhoneIcon from '../../images/call_phone_icon.png'
import EditIccon from '../../images/edit_icon.png'
import MoneyIcon from '../../images/money_icon.png'
import SelectClerkModel from './components/SelectClerkModel/SelectClerkModel'
import SkusUpdateModel from './components/SkusUpdateModel/SkusUpdateModel'
import './order_bill_detail.scss'
import { getDescByAfterSaleTypes } from './tool'

interface saleDetailItem {
  aftersale_id: number
  complaintOrderIdList: Array<any>
  create_time: string
  detail: {
    styleImg: string
    sizeName: string
    colorName: string
    num: number
    price: number
    styleName: string
    id: number
  }
  media_list: Array<any>
  openid: string
  order_id: number
  orderamt: number
  out_aftersale_id: string
  out_order_id: string
  product_info: any
  refund_pay_detail: { refund_id: string }
  refund_reason: string
  refund_reason_type: number
  return_id: string
  return_info: {
    delivery_id: string
    delivery_name: string
    order_return_time: number
    waybill_id: string
  }
  status: AFTER_SALE_STATUS
  statusDesc: string
  type: number
  typeDesc: string
  update_time: string
  reasonDesc: string
}

interface State {
  editSku: Array<OrderSku>
  skusUpdateModelIsShow: boolean
  staffInfo: {
    id: number
    name: string
  }
  alertIsShow: boolean
  refundValue: string
  saleDetail: Array<saleDetailItem>
  refundViewIsShow: boolean
}

const mapStateToProps = ({ cloudBill, goodsManage, shop }: GlobalState) => {
  const _shop = shop.list.find(s => s.id === goodsManage.mpErpId)
  return {
    orderBillDetail: cloudBill.orderBillDetail,
    shop: _shop,
    staffId: goodsManage.staffInfoH5.id,
    showPhone:
      goodsManage.allowStaffViewClientPhone === '1' ||
      goodsManage.staffInfo.rolename === '总经理' ||
      goodsManage.staffInfo.rolename === '總經理'
  }
}
type StateProps = ReturnType<typeof mapStateToProps>

const PAYTYPE = [
  {
    label: '现金',
    value: 0,
    key: 'cash'
  },
  {
    label: '刷卡',
    value: 0,
    key: 'card'
  },
  {
    label: '汇款',
    value: 0,
    key: 'remit'
  },
  {
    label: '微信',
    value: 0,
    key: 'finpayWeixinpay'
  },
  {
    label: '支付宝',
    value: 0,
    key: 'finpayAlipay'
  },
  {
    label: '扫码付',
    value: 0,
    key: 'mobilepay'
  }
]

enum AfterSaleType {
  MoneyAndGoods = '退货退款',
  Goods = '收货',
  Money = '退款'
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class OrderBillDetail extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationBarTitleText: '订单详情'
  // }

  state = {
    editSku: [] as OrderSku[],
    skusUpdateModelIsShow: false,
    alertIsShow: false,
    staffInfo: {
      id: -1,
      name: ''
    },
    refundValue: '',
    saleDetail: [] as saleDetailItem[],
    refundViewIsShow: false
  }

  editIndex: number
  prevSkuNum: number

  cash: string
  card: string
  remit: string
  finpayWeixinpay: string
  finpayAlipay: string
  mobilepay: string
  skuPrice: string

  componentDidMount() {
    Taro.eventCenter.on('USE_CLERK', this.eventCenterCLerk)
    Taro.eventCenter.on('UPDATE_BIND', this.eventUpdateBind)
    this.props.dispatch({
      type: 'goodsManage/selectShopStaffList',
      payload: {
        curpageno: 1,
        noBindFlag: false
      }
    })
    this.props.dispatch({ type: 'goodsManage/selectShopLinkUsers' })
    this.props.dispatch({
      type: 'goodsManage/selectShopViewers',
      payload: { pageNo: 1 }
    })
  }

  componentDidShow() {
    setNavigationBarTitle('订单详情')
  }

  eventUpdateBind = () => {
    const { params } = Taro.getCurrentInstance?.()
    if (params.billId) {
      this.props.dispatch({
        type: 'cloudBill/selectAuditBillDetail',
        payload: {
          billId: params.billId
        }
      })
    }
  }

  eventCenterCLerk = staffInfo => {
    this.setState({
      staffInfo
    })
  }

  goUseClerk = () => {
    Taro.navigateTo({
      url: '/subpackages/cloud_bill/pages/use_clerk_screen/index'
    })
  }

  onEditClick = e => {
    const { index } = e.currentTarget.dataset
    this.editIndex = index
    this.setState({
      editSku: this.props.orderBillDetail.spus[index].skus.map((s, _i) => ({
        ...s
      })),
      skusUpdateModelIsShow: true
    })
  }

  onSkusCancelClick = () => {
    this.setState({
      skusUpdateModelIsShow: false
    })
  }
  onSkusSaveClick = () => {
    if (!!this.skuPrice) {
      this.setState(
        prevState => {
          return {
            editSku: prevState.editSku.map(sku => ({
              ...sku,
              price: Number(this.skuPrice)
            }))
          }
        },
        () => {
          this.props.dispatch({
            type: 'cloudBill/updateEditSkus',
            payload: {
              skus: this.state.editSku,
              index: this.editIndex,
              skuPrice: this.skuPrice
            }
          })
        }
      )
    } else {
      this.props.dispatch({
        type: 'cloudBill/updateEditSkus',
        payload: {
          skus: this.state.editSku,
          index: this.editIndex
        }
      })
    }
    this.onSkusCancelClick()
  }

  onActionClick = (type, index) => {
    this.setState(prevState => {
      prevState.editSku[index].num =
        type === 'plus'
          ? prevState.editSku[index].num + 1 > prevState.editSku[index].originalNum
            ? prevState.editSku[index].originalNum
            : prevState.editSku[index].num + 1
          : prevState.editSku[index].num - 1 < 0
          ? 0
          : prevState.editSku[index].num - 1
      return {
        editSku: [...prevState.editSku]
      }
    })
  }

  onPriceInput = value => {
    this.skuPrice = value
  }

  onPriceBlur = value => {
    this.skuPrice = value
    this.setState(prevState => {
      return {
        editSku: prevState.editSku.map(sku => ({
          ...sku,
          price: Number(this.skuPrice)
        }))
      }
    })
  }

  onPayInput = e => {
    const {
      detail: { value },
      currentTarget: {
        dataset: { key }
      }
    } = e
    this[key] = value
  }

  onCancelOrderClick = e => {
    e.stopPropagation()
    messageFeedback.showAlertWithCancel(
      '确认作废该订单?',
      '提示',
      () => {
        Taro.showLoading({ title: '请稍等...', mask: true })
        this.props.dispatch({
          type: 'cloudBill/clearOrderBillList'
        })
        auditCancelPurBill({
          billId: this.props.orderBillDetail.bill.id
        })
          .then(res => {
            Taro.hideLoading()
            Taro.eventCenter.trigger('ORDER_ACTION', { type: 'voided' })
            Taro.navigateBack()
          })
          .catch(e => {
            Taro.hideLoading()
            myLog.log(`商户作废订单失败${e}`)
          })
      },
      () => {}
    )
  }

  onMobileClick = () => {
    Taro.makePhoneCall({
      phoneNumber: this.props.orderBillDetail.dwPhone
    })
  }

  onHeadImageClick = () => {
    const {
      dwId,
      bill: { unitId }
    } = this.props.orderBillDetail
    if (dwId > 0) {
      Taro.navigateTo({
        url: `/subpackages/cloud_bill/pages/my_client_detail/index?dwId=${dwId}&mpUserId=${unitId}&listType=1&fromOrder=1`
      })
    }
  }

  onDealRefundOrder = () => {
    Taro.showLoading({ title: '请稍等...', mask: true })
    findAfterSaleDetailList({
      billId: this.props.orderBillDetail.bill.id
    })
      .then(({ data }) => {
        Taro.hideLoading()
        this.setState({
          saleDetail: data.rows,
          refundViewIsShow: true
        })
      })
      .catch(() => {
        Taro.hideLoading()
      })
  }

  onConfirmRefund = () => {
    messageFeedback.showAlertWithCancel('是否同意退款', '提示', () => {
      Taro.showLoading({ title: '请稍等...', mask: true })
      updateOrderRefundStatus({
        jsonParam: {
          billId: this.props.orderBillDetail.bill.id,
          refundStatus: REFUND_STATUS.DOING
        }
      })
        .then(() => {
          Taro.hideLoading()
          messageFeedback.showAlert('退款成功，预计1~2个工作日内到账', '提示', '好的', () => {
            Taro.eventCenter.trigger('ORDER_ACTION', { type: 'refund' })
            Taro.navigateBack()
          })
        })
        .catch(() => {
          Taro.hideLoading()
        })
    })
  }
  onCancelRefund = () => {
    this.setState({
      alertIsShow: true
    })
  }

  onRefundValueSave = () => {
    if (!this.state.refundValue) {
      messageFeedback.showToast('请输入拒绝原因')
      return
    }
    Taro.showLoading({ title: '请稍等...', mask: true })
    updateOrderRefundStatus({
      jsonParam: {
        billId: this.props.orderBillDetail.bill.id,
        refundStatus: REFUND_STATUS.REJECT,
        rejectReason: this.state.refundValue
      }
    }).then(() => {
      Taro.hideLoading()
      Taro.eventCenter.trigger('ORDER_ACTION', { type: 'voided' })
      Taro.navigateBack()
    })
  }

  onRefundValueCancel = () => {
    this.setState({
      refundValue: '',
      alertIsShow: false
    })
  }

  onRemarkInput = e => {
    this.setState({
      refundValue: e.detail.value
    })
  }

  onClearInput = () => {
    this.setState({
      refundValue: ''
    })
  }

  onConfirmClick = e => {
    e.stopPropagation()
    const {
      state: {
        staffInfo: { id }
      },
      cash,
      card,
      remit,
      finpayWeixinpay,
      finpayAlipay,
      mobilepay
    } = this
    const {
      orderBillDetail: { bill, spus }
    } = this.props
    let details: Array<OrderSku> = []
    let totalMoney: number = 0
    spus.forEach(spu => {
      ;(totalMoney += spu.skus.reduce((prev, cur) => {
        return prev + cur.price * cur.num
      }, 0)),
        (details = [...details, ...spu.skus])
    })
    let totalNum: number = details.reduce((prev, cur) => {
      return prev + cur.num
    }, 0)

    const ownerId = id !== -1 ? id : this.props.staffId || undefined

    const jsonParam = {
      ownerId,
      cash,
      card,
      remit,
      finpayWeixinpay,
      finpayAlipay,
      mobilepay,
      bill: {
        id: bill.id,
        totalNum,
        totalMoney: round(totalMoney, 3)
      },
      details: details.map(detail => {
        return {
          id: detail.id,
          num: detail.num,
          price: round(detail.price, 3),
          flag: detail.num === 0 ? -1 : undefined
        }
      })
    }
    let isNotDeleteAllSku: boolean =
      jsonParam.details.filter(sku => typeof sku.flag === 'undefined').length > 0
    if (isNotDeleteAllSku) {
      Taro.showLoading({ title: '请稍等...', mask: true })
      auditPassPurBill(jsonParam)
        .then(({ code }) => {
          Taro.hideLoading()
          this.props.dispatch({
            type: 'cloudBill/clearOrderBillList'
          })
          if (code === 0) {
            messageFeedback.showAlert(
              '订单已确认，已生成销售订单/销售单',
              '提示',
              '我知道了',
              () => {
                Taro.eventCenter.trigger('ORDER_ACTION', { type: 'confirm' })
                //成功
                Taro.navigateBack()
              }
            )
          } else {
          }
        })
        .catch(e => {
          Taro.hideLoading()
          myLog.log(`商户订单修改失败${e}`)
        })
    } else {
      messageFeedback.showAlert('不能删除全部款')
    }
  }

  refreshSaleDetail = () => {
    Taro.showLoading({ title: '请稍等...' })
    findAfterSaleDetailList({
      billId: this.props.orderBillDetail.bill.id
    })
      .then(({ data }) => {
        Taro.hideLoading()
        this.setState({
          saleDetail: data.rows
        })
      })
      .catch(() => {
        Taro.hideLoading()
      })
  }

  onRefundFailClick = (e, type: AfterSaleType) => {
    const { _id } = e.currentTarget.dataset
    let modalContent = ''
    let confirmText = '拒绝'
    switch (type) {
      case AfterSaleType.Money:
        modalContent = '确认拒绝退款？'
        confirmText = '拒绝退款'
        break
      case AfterSaleType.MoneyAndGoods:
        modalContent = '确认拒绝退款退货？'
        confirmText = '拒绝退货'
        break
      case AfterSaleType.Goods:
        modalContent = '确认拒绝退款？'
        confirmText = '拒绝退款'
        break
    }
    Taro.showModal({
      title: '操作提醒',
      content: modalContent,
      confirmText,
      success: res => {
        if (res.confirm) {
          Taro.showLoading({
            title: '请稍等...'
          })
          updateOrderRefundStatus({
            jsonParam: {
              billId: this.props.orderBillDetail.bill.id,
              refundStatus: REFUND_STATUS.REJECT,
              billDetailId: _id
            }
          })
            .then(() => {
              Taro.hideLoading()
              this.refreshSaleDetail()
            })
            .catch(() => {
              Taro.hideLoading()
            })
        }
      }
    })
  }

  onRefundSuccessClick = (e, type: AfterSaleType) => {
    const { _id } = e.currentTarget.dataset
    let modalContent = ''
    let confirmText = '同意'
    switch (type) {
      case AfterSaleType.Money:
        modalContent = '确认同意退款？\n\r 同意后订单金额将返还给客户'
        confirmText = '同意退款'
        break
      case AfterSaleType.MoneyAndGoods:
        modalContent = '确认同意退货退款请求？\n\r 同意后请等待客户退货'
        confirmText = '同意退货'
        break
      case AfterSaleType.Goods:
        modalContent = '确认收货？\n\r 确认后订单金额将返还给客户'
        confirmText = '确认收货'
        break
    }

    Taro.showModal({
      title: '操作提醒',
      content: modalContent,
      confirmText,
      success: res => {
        if (res.confirm) {
          Taro.showLoading({
            title: '请稍等...',
            mask: true
          })
          updateOrderRefundStatus({
            jsonParam: {
              billId: this.props.orderBillDetail.bill.id,
              refundStatus: REFUND_STATUS.DOING,
              billDetailId: _id
            }
          })
            .then(() => {
              Taro.hideLoading()
              this.refreshSaleDetail()
            })
            .catch(() => {
              Taro.hideLoading()
            })
        }
      }
    })
  }

  onRefundClose = () => {
    this.setState({
      refundViewIsShow: false
    })
  }

  renderBottom = (auditFlag, slhBillNo, totalNum, totalMoney, refundStatus, billSrc, payStatus) => {
    const payLabel = payStatusDict[payStatus] || ''
    const afterSaleTypes =
      getTaroParams(Taro.getCurrentInstance?.()) && getTaroParams(Taro.getCurrentInstance?.()).afterSaleTypes
        ? JSON.parse(getTaroParams(Taro.getCurrentInstance?.()).afterSaleTypes)
        : []
    const afterSaleDesc = getDescByAfterSaleTypes(afterSaleTypes)
    const afterSaleClose = afterSaleTypes.includes(3)
    return (
      <View className='bottom_view'>
        {auditFlag === 1 && (
          <View className='cover_view'>
            <View>
              <View>
                总计：{totalNum}件 <Text style='color: #FF5050'>¥{totalMoney}</Text>
              </View>
              {payLabel.length > 0 && <View className='bottom_view_pay_status'>{payLabel}</View>}
            </View>

            <View style={{ display: 'flex' }}>
              <View className='bottom_view_actionDisable' onClick={this.onCancelOrderClick}>
                作废
              </View>
              <View className='bottom_view_action' onClick={this.onConfirmClick}>
                确认
              </View>
            </View>
          </View>
        )}
        {(auditFlag === 2 || auditFlag === 0) && refundStatus === REFUND_STATUS.DEFAULT && (
          <View className='bottom_view_confiremed'>
            {payLabel.length > 0 && <View className='bottom_view_pay_status'>{payLabel}</View>}
            <View className='bottom_view_container'>
              <View className='skus_sum'>
                <View>批次：{slhBillNo}</View>
                <View>
                  总计：{totalNum}件 <Text style='color: #FF5050'>¥{totalMoney}</Text>
                </View>
              </View>
            </View>

            {auditFlag === 2 && <View className='bottom_view_actionDisable'>已确认</View>}
          </View>
        )}
        {auditFlag === 3 && (
          <View className='bottom_view_confiremed'>
            <View>
              总计：{totalNum}件 <Text style='color: #FF5050'>¥{totalMoney}</Text>
            </View>
            <View className='bottom_view_actionDisable'>已作废</View>
          </View>
        )}
        {(refundStatus === REFUND_STATUS.APPLY || afterSaleClose) && (
          <View className='cover_view'>
            <View className='aic'>
              {/* <Image src={MoneyIcon} className='money_icon' /> 
               <Text>客户申请退款</Text> */}
              <View className='skus_sum'>
                <View>批次：{slhBillNo}</View>
                <View>
                  总计：{totalNum}件 <Text style='color: #FF5050'>¥{totalMoney}</Text>
                  {payStatus === 3 && <Text className='pay_status'>已支付</Text>}
                </View>
              </View>
            </View>
            {billSrc === 2 ? (
              <View
                className={
                  afterSaleClose ? 'bottom_view_actionDisable' : 'bottom_view_action_refund'
                }
                onClick={this.onDealRefundOrder}
              >
                {afterSaleDesc} {afterSaleClose ? '' : '>'}
              </View>
            ) : (
              // <View className='bottom_view_actionDisable' onClick={this.onDealRefundOrder}>
              //   处理售后
              // </View>
              <View style={{ display: 'flex' }}>
                <View className='bottom_view_actionDisable' onClick={this.onConfirmRefund}>
                  同意退款
                </View>
                <View className='bottom_view_action' onClick={this.onCancelRefund}>
                  拒绝退款
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    )
  }

  renderGoodsView = (spu, index, auditFlag) => {
    const { styleImg, styleName, styleCode, skus, price, id, rem, totalMoney: spuTotalMoney } = spu
    let skuTotalNum: number = skus.reduce((prev, cur) => {
      return prev + cur.num
    }, 0)
    let totalMoney = String(round(Number(times(skuTotalNum, String(round(Number(price), 4)))), 3))
    const { shop } = this.props
    return (
      <View className='goods_view' key={id}>
        <View className='goods_info'>
          <View className='goods_info__image'>
            <Image src={styleImg} className='goods_info__image' mode='aspectFill' />
          </View>
          <View className='goods_info__code'>
            <View style={{ display: 'flex' }}>
              <Text className='style_name'>{styleName}</Text>
              <Text className='style_code'>{styleCode && `#${styleCode}`}</Text>
            </View>
            <View className='style_money'>
              {/* {`${skuTotalNum}${shop && !shop.industries ? '件' : ''}x${String(
                round(Number(price), 4)
              )}元`} */}
              数量：{skuTotalNum}
            </View>
          </View>
          <View className='goods_info__billMoney'>
            合计:
            {spuTotalMoney || totalMoney}
          </View>
          {auditFlag === 1 && (
            <Image
              src={EditIccon}
              className='edit_icon'
              data-index={index}
              onClick={this.onEditClick}
            />
          )}
        </View>
        {skus.map(sku => (
          <View key={id} className='skus'>
            <View className='skus_sku__view'>
              <View className='spot'></View>
              <View className='sku'>
                {shop && shop.industries ? '数量' : `${sku.colorName}/${sku.sizeName}`}
              </View>
            </View>
            <View className='skus_price'>{`${String(round(Number(sku.price), 4))}*${
              sku.num
            }=${String(round(Number(times(sku.num, sku.price)), 3))}元`}</View>
          </View>
        ))}
        {rem && (
          <View className='remark_view'>
            <Text className='remark_view_input'>备注：{rem}</Text>
            {/* <Input placeholder='备注：显示SPU备注' className='remark_view_input' /> */}
          </View>
        )}
      </View>
    )
  }

  renderSkuCell = (item: saleDetailItem) => {
    let agree_refund = [11, 13, 21]
    return (
      <View className='sku_cell'>
        <View className='sku_cell_desc'>
          <View className='sku_cell_desc_title'>
            <Image src={MoneyIcon} className='sku_cell_desc_title_icon'></Image>
            {`用户申请${item.typeDesc}`}
          </View>
          <View className='sku_cell_desc_label'>{`申请原因：${item.reasonDesc}`}</View>
          <View className='sku_cell_desc_label'>{`申请时间：${dayjs(
            Number(item.create_time)
          ).format('YYYY-MM-DD')}`}</View>
        </View>
        <View className='sku_cell__top'>
          <Image
            className='sku_cell__top__goodsImage'
            mode='aspectFill'
            src={
              item.detail.styleImg.includes(',')
                ? item.detail.styleImg.split(',')[0]
                : item.detail.styleImg
            }
          />
          <View className='sku_cell__top__goodsInfo'>
            <View className='sku_cell__top__goodsInfo__name'>{item.detail.styleName}</View>
            <View className='sku_cell__top__goodsInfo__label'>
              {item.detail.colorName} {item.detail.sizeName}
            </View>
            <View className='sku_cell__top__goodsInfo__label'>
              {item.detail.num}件 x {item.detail.price}元
            </View>
            {/* <View className='refund_value'>
              <Text className='refund_value__status'>{item.typeDesc}</Text>
              <Text className='refund_value__results'>{item.statusDesc}</Text>
            </View> */}
          </View>
        </View>
        <View className='sku_cell__bottom'>
          {/* {item.status !== 2 && item.status !== AFTER_SALE_STATUS.WAITING_TAKE_DELIVERY && (
            <View className='sku_cell__bottom__results aic jcc'>
              {item.status === 4 || item.status === 5 ? '已拒绝' : ''}
              {agree_refund.includes(item.status) ? '已同意' : ''}
            </View>
          )} */}
          <View className='sku_cell__bottom__status__desc'>{item.statusDesc}</View>
          <View className='sku_cell__bottom__action'>
            {(item.status === 2 || item.status === 23) && (
              <View
                className='sku_cell__bottom__action__refund aic jcc'
                data-_id={item.detail.id}
                onClick={e => {
                  this.onRefundFailClick(
                    e,
                    item.status === AFTER_SALE_STATUS.WAITING_TAKE_DELIVERY
                      ? AfterSaleType.Goods
                      : item.status === 23
                      ? AfterSaleType.MoneyAndGoods
                      : AfterSaleType.Money
                  )
                }}
              >
                拒绝
              </View>
            )}
            {(item.status === 2 || item.status === 23) && (
              <View
                className='sku_cell__bottom__action__agree aic jcc'
                data-_id={item.detail.id}
                onClick={e =>
                  this.onRefundSuccessClick(
                    e,
                    item.status === 23 ? AfterSaleType.MoneyAndGoods : AfterSaleType.Money
                  )
                }
              >
                {`同意${item.status === 23 ? '退货' : ''}退款`}
              </View>
            )}
            {item.status === AFTER_SALE_STATUS.WAITING_TAKE_DELIVERY && (
              <Block>
                <View
                  className='sku_cell__bottom__action__refund aic jcc'
                  data-_id={item.detail.id}
                  onClick={e => this.onRefundFailClick(e, AfterSaleType.Goods)}
                >
                  拒绝
                </View>
                <View
                  className='sku_cell__bottom__action__agree aic jcc'
                  data-_id={item.detail.id}
                  onClick={e => this.onRefundSuccessClick(e, AfterSaleType.Goods)}
                >
                  确认收货
                </View>
              </Block>
            )}
          </View>
        </View>
      </View>
    )
  }

  renderRefundView = () => {
    const { saleDetail } = this.state
    return (
      <View className='refund_view__mask' onClick={this.onRefundClose}>
        <View className='refund_view__mask__content' onClick={e => e.stopPropagation()}>
          <View className='refund_view__mask__content__header aic jcc'>
            处理售后
            <Image
              src={closeIcon}
              onClick={this.onRefundClose}
              className='refund_view__mask__content__header__close'
            />
          </View>
          <View className='refund_view__mask__content__scroll'>
            {saleDetail.map(item => this.renderSkuCell(item))}
          </View>
        </View>
      </View>
    )
  }

  copyText = text => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({ title: '复制收货信息成功', icon: 'none' })
      }
    })
  }

  render() {
    const {
      orderBillDetail: {
        mpLogoUrl,
        mpNickName,
        dwName,
        dwPhone,
        bill: {
          fullAddress,
          auditFlag,
          createdDate,
          slhBillNo,
          refundStatus,
          extProps,
          payStatus,
          proTime,
          deliverFlag,
          billNo,
          receiveName,
          receivePhone,
          totalMoney: billTotalMoney,
          id,
          buyerRem
        },
        spus
      },
      showPhone
    } = this.props
    const { userRemark = '' } = getTaroParams(Taro.getCurrentInstance?.())
    const {
      skusUpdateModelIsShow,
      editSku,
      staffInfo,
      alertIsShow,
      refundValue,
      refundViewIsShow
    } = this.state
    let totalNum: number = spus.reduce((prev, cur) => {
      return prev + cur.totalNum
    }, 0)
    let totalMoney: number = round(
      spus.reduce((prev, cur) => {
        return prev + cur.totalMoney
      }, 0),
      3
    )
    console.log('spus', spus)
    let _extProps
    if (extProps) {
      _extProps = JSON.parse(extProps)
    } else {
      _extProps = {}
    }

    // 发货时间
    let deliverTime = proTime
    if (
      _extProps &&
      _extProps.logisList &&
      _extProps.logisList[0] &&
      _extProps.logisList[0].logisCreatedDate
    ) {
      // 有物流信息则使用物流发货时间
      deliverTime = _extProps.logisList[0].logisCreatedDate
    }

    // 发货状态
    let deliverDesc = ''
    let deliverMarkClassName = 'dot '
    if (deliverFlag === 2 || deliverFlag === 3) {
      deliverDesc = '已发货'
      deliverMarkClassName += 'green_mark'
    } else if (deliverFlag === 1) {
      deliverDesc = '部分发货'
      deliverMarkClassName += 'yellow_mark'
    } else if (deliverFlag === 0) {
      deliverDesc = '未发货'
      deliverMarkClassName += 'red_mark'
    }

    let phone = dwPhone
    if (phone && !showPhone) {
      phone = '****'
    }

    let receiveInfoArr: string[] = []
    if (receiveName) {
      receiveInfoArr.push(receiveName)
    }
    if (receivePhone) {
      receiveInfoArr.push(receivePhone)
    }
    receiveInfoArr.push(fullAddress || '')
    const receiveInfo = receiveInfoArr.join('，')

    let _billTotalMoney = typeof billTotalMoney === 'number' ? billTotalMoney : totalMoney

    return (
      <View style={{ display: 'flex', flexDirection: 'column' }}>
        <ScrollView scrollY={!skusUpdateModelIsShow} className='order_bill_detail_container'>
          <View className='user_view'>
            <View
              className='user_view_information'
              style={{
                borderBottom: auditFlag === 1 ? '1px solid #EEEEEE' : 'none'
              }}
            >
              <View className='headImage' onClick={this.onHeadImageClick}>
                <Image
                  src={mpLogoUrl}
                  style={{ width: '100%', height: '100%' }}
                  mode='aspectFill'
                />
              </View>
              <View className='infor'>
                <View className='name'>{userRemark || mpNickName}</View>
                <View className='slh_info'>{dwName && `商陆花档案: ${dwName}`}</View>
                <View className='mobile' onClick={this.onMobileClick}>
                  <Text>{phone}</Text>
                  {dwPhone && showPhone && <Image className='phone_icon' src={PhoneIcon} />}
                </View>
              </View>
              <Image src={RightIcon} onClick={this.onHeadImageClick} className='right_icon' />
            </View>
            {auditFlag === 1 && (
              <View className='user_view_clerk'>
                <SelectClerkModel
                  title='店员'
                  onItemClick={this.goUseClerk}
                  placeholderTitle={staffInfo.name || '选择店员'}
                />
              </View>
            )}
          </View>

          <View>{spus.map((spu, index) => this.renderGoodsView(spu, index, auditFlag))}</View>
          <View className='orderDetail_view'>
            <View className='orderDetail_view_date'>
              <Text className='label_content'>日期</Text>
              <Text className='date_content'>{createdDate.split(' ')[0]}</Text>
            </View>
            <View className='orderDetail_view_receive_info'>
              <View className='label_content'>收货信息:</View>
              <View className='info_content'>
                <View className='info_content_main'>
                  {(receiveName || receivePhone) && (
                    <View>{`${receiveName || ''}  ${receivePhone || ''}`}</View>
                  )}
                  <View>{fullAddress || ''}</View>
                </View>
                <View className='info_content_copy' onClick={() => this.copyText(receiveInfo)}>
                  复制
                </View>
              </View>
            </View>
            {/* <View className='shipping_address'>
              <View>
                <Text className='label_content'>收货地址：</Text>
              </View>
              <View className='shipping_content'>
                <View>{fullAddress || ''}</View>
              </View>
            </View> */}
            <View className='shipping_address'>
              <View>
                <Text className='label_content'>发货状态：</Text>
              </View>
              <View className='shipping_content'>
                <View className='shipping_content_deliver_status'>
                  <View className={deliverMarkClassName}></View>
                  {deliverDesc}
                </View>
              </View>
            </View>
            <View className='shipping_address'>
              <View>
                <Text className='label_content'>发货时间：</Text>
              </View>
              <View className='shipping_content'>
                <View>{deliverTime || ''}</View>
              </View>
            </View>
            {(_extProps.billSrc === 1 || _extProps.billSrc === 2) && (
              <View className='shipping_address'>
                <View>
                  <Text className='label_content'>业务单号：</Text>
                </View>
                <View className='shipping_content'>
                  <View>{_extProps.billSrc === 1 ? billNo : id}</View>
                </View>
              </View>
            )}
            <View className='shipping_address'>
              <View style={{ flexShrink: 0 }}>
                <Text className='label_content'>客户备注：</Text>
              </View>
              <View className='shipping_content'>
                <View>{buyerRem}</View>
              </View>
            </View>
          </View>

          {!skusUpdateModelIsShow && auditFlag === 1 && (
            <View className='pay_infomation_view'>
              <View className='pay_type_item' style='border: none'>
                <View className='pay_type_item_label'>付款信息</View>
                <View className='pay_type_item_value' style='font-size:14px;color: #999;'>
                  客户未付款请不填写
                </View>
              </View>
              {PAYTYPE.map(pay => {
                return (
                  <View key={pay.key} className='pay_type_item'>
                    <View className='pay_type_item_label'>{pay.label}</View>
                    <Input
                      className='pay_input'
                      data-key={pay.key}
                      onInput={this.onPayInput}
                      placeholderStyle='color: #cdcdcd'
                      // value={pay.value.toString()}
                      placeholder='请输入'
                      style={{ color: `${pay.value ? '#FF5050' : '#FF5050'}` }}
                    />
                  </View>
                )
              })}
            </View>
          )}
        </ScrollView>
        {skusUpdateModelIsShow && auditFlag === 1 && (
          <SkusUpdateModel
            skus={editSku}
            onCancelClick={this.onSkusCancelClick}
            onSaveClick={this.onSkusSaveClick}
            onActionClick={this.onActionClick}
            onPriceUpdate={this.onPriceInput}
            onPriceBlur={this.onPriceBlur}
          />
        )}
        {!skusUpdateModelIsShow &&
          this.renderBottom(
            auditFlag,
            slhBillNo,
            totalNum,
            _billTotalMoney,
            refundStatus,
            _extProps.billSrc,
            payStatus
          )}
        {alertIsShow && (
          <View className='refund_remark_view'>
            <View className='alert_input_view'>
              <View className='alert_input_view__header'>拒绝原因</View>
              <View className='alert_input_view__input'>
                <Input
                  placeholder='请输入拒绝原因'
                  className='alert_input_view__input___com'
                  onInput={this.onRemarkInput}
                  value={refundValue}
                  focus={alertIsShow}
                />
                {refundValue && (
                  <Image
                    src={DeleteImg}
                    onClick={this.onClearInput}
                    className='alert_input_view__input___delete'
                  />
                )}
              </View>
              <View className='alert_input_view__action'>
                <View className='alert_input_view__action'>
                  <View
                    className='alert_input_view__action__cancel'
                    onClick={this.onRefundValueCancel}
                  >
                    取消
                  </View>
                  <View
                    className='alert_input_view__action__confirm'
                    onClick={this.onRefundValueSave}
                  >
                    提交
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
        {refundViewIsShow && this.renderRefundView()}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(OrderBillDetail)