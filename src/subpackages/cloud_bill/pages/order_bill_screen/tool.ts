/**
 * 用于根据 AfterSaleTypes 数组获得对应描述
 */
enum AfterSaleTypesDesc {
  all = '客户申请退款、退款退货',
  goodsAndMoney = '客户申请退款退货',
  money = '客户申请退款',
  close ='售后关闭'
}
export const getDescByAfterSaleTypes = afterSaleTypes => {
  const defaultText = ''
  if(!afterSaleTypes) return defaultText
  if(afterSaleTypes.includes(1) && afterSaleTypes.includes(2) && afterSaleTypes.length !== 3) {
    return AfterSaleTypesDesc.all
  } else if(afterSaleTypes.length === 1) {
    if(afterSaleTypes[0] === 1) {
      return AfterSaleTypesDesc.money
    }else if(afterSaleTypes[0] === 2) {
      return AfterSaleTypesDesc.goodsAndMoney
    }
    return AfterSaleTypesDesc.close
  }
  return defaultText
}
