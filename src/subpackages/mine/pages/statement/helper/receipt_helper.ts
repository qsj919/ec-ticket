import { minus, plus } from 'number-precision'
import cashIcon from '@/images/statement/cash.png'
import walletIcon from '@/images/statement/wallet.png'
import aliPayIcon from '@/images/statement/ali_pay.png'
import wechatPayIcon from '@/images/statement/wechat_pay.png'
import mutilPayIcon from '@/images/statement/multi_pay.png'
import agencyIcon from '@/images/statement/agency.png'
import remitIcon from '@/images/statement/remit.png'
import payIcon from '@/images/statement/pay.png'
import refundIcon from '@/images/statement/refund.png'
import payBackIcon from '@/images/statement/pay_back.png'
import rechargeIcon from '@/images/statement/recharge.png'
import debtIcon from '@/images/statement/debt.png'
import onlinePayIcon from '@/images/statement/online_pay.png'
import otherPayIcon from '@/images/statement/other.png'
import storeValue from '@/images/statement/store_value.png'
import { ReceiptData } from '..'

export function getPayMethods(data: ReceiptData) {
  const allPayMethods = [
    'cash',
    'card',
    'remit',
    'agency',
    'alipay',
    'weixinpay',
    'mobilePay',
    'storeValue'
  ] // 现金、银行卡、汇款、代理、支付宝、微信、在线支付、储值支付
  const payMethods = allPayMethods.filter(method => data[method] > 0)
  const payMethodsWithAmount = payMethods.map(item => ({
    label: item,
    value: data[item]
  }))
  // 已知所有支付方式的支付金额
  const paySum = payMethodsWithAmount.reduce((prev, cur) => {
    return plus(prev, cur.value)
  }, 0)
  // 若实际支付金额大于已知，多出来的金额则为其他方式支付
  if (data.paysum - paySum > 0) {
    payMethodsWithAmount.push({ label: 'other', value: minus(data.paysum, paySum) })
  }
  return payMethodsWithAmount.sort((a, b) => b.value - a.value)
}

export function getPayMethodIcon(method: string) {
  switch (method) {
    case 'cash':
      return cashIcon
    case 'alipay':
      return aliPayIcon
    case 'weixinpay':
      return wechatPayIcon
    case 'card':
      return walletIcon
    case 'agency':
      return agencyIcon
    case 'remit':
      return remitIcon
    case 'storeValue':
      return storeValue
    case 'mobilePay':
      return onlinePayIcon
    case 'other':
      return otherPayIcon
    default:
      return mutilPayIcon
  }
}

export function getReceiptTypeIcon(data: ReceiptData) {
  switch (data.mainType) {
    // 依次对应 充值，结清，欠款，退款，支付
    case 1:
      return rechargeIcon
    case 2:
      return payIcon
    case 3:
      return debtIcon
    case 4:
      return refundIcon
    case 5:
      return payBackIcon
  }
}
