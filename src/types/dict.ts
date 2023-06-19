import { PAY_STATUS, REFUND_STATUS } from './base'

export const payStatusDict = {
  [PAY_STATUS.DEFAULT]: '',
  [PAY_STATUS.WAITING]: '待支付',
  [PAY_STATUS.DOING]: '支付中',
  [PAY_STATUS.SUCCESS]: '已支付',
  [PAY_STATUS.FAILURE]: '支付失败'
}

export const reFundStatusDict = {
  [REFUND_STATUS.DEFAULT]: '',
  [REFUND_STATUS.APPLY]: '待处理',
  [REFUND_STATUS.DOING]: '退款中',
  [REFUND_STATUS.REJECT]: '拒绝退款',
  [REFUND_STATUS.SUCCESS]: '退款完成'
}
