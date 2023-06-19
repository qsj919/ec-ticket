/*
 * @Author: HuKai
 * @Date: 2019-09-09 09:25:01
 * @Last Modified by: Miao Yunliang
 */
// export type languageType = {
//   eticket: string
//   checkAllTickets: string
//   batch: string
//   client: string
//   clerk: string
//   date: string
//   orderMoney: string
//   balancePlus: string
//   balanceMinus: string
//   lastTimeBalancePlus: string
//   lastTimeBalanceMinus: string
//   lastBalancePlus: string
//   lastBalanceMinus: string
//   rem: string
//   operator: string
//   tel: string
//   account: string
//   shareDate: string
//   goodsDetail: string
//   goodsRecord: string
//   firstTime: string
//   saleNum: string
//   saleSum: string
//   backNum: string
//   backSum: string
//   code: string
//   image: string
//   name: string
//   price: string
//   money: string
//   color: string
//   number: string
//   sum: string
//   statisticsTickets: string
//   cash: string
//   remit: string
//   card: string
//   weiXinPay: string
//   aliPay: string
//   storedValueCost: string
//   debt: string
//   agency: string
//   totalMoney: string
//   totalNum: string
//   qrCode: string
//   size: string
//   subtotal: string
//   numDetail: string
//   groupNum: string
// }

export type mainType = {
  shopLogoUrl: string
  billNo: string
  ownerName: string
  compName: string
  compId: number
  compPhone: string
  compAddr: string
  proDate: string
  createdDate: string
  rem: string
  mobilePay: number
  cash: number
  remit: number
  remitName: string
  card: number
  cardName: string
  weiXinPay: number
  aliPay: number
  storedValueCost: number
  debt: number
  agency: number
  lastBalance: number
  verifySum: number
  balance: number
  totalMoney: number
  actMoney: number // 优惠金额
  coupMoney: number // 优惠券金额
  totalNum: number
  shareDate: string
  accountNo: string
  accountNo2?: string
  accountNo3?: string
  accountNo4?: string
  accountNo5?: string
  accountNo6?: string
  accountName: string
  accountName2?: string
  accountName3?: string
  accountName4?: string
  accountName5?: string
  accountName6?: string
  billQRCodeContent: string // 本小票二维码
  qrComment?: string // 本小票二维码备注
  shopAddr: string
  shopAddrs: string[]
  shopPhone: string
  shopMobile: string
  invalidFlag: string // 1作废
  logisNo: string
  providerId: string
  billScore: number
  compScore?: number
  ownerId: number
  backNum: number
  backMoney: number
  printFooter?: string
  bottomTips?: string
  ticketQrcode1?: string // 二维码图片url
  ticketQrcode2?: string
  ticketQrcode3?: string
  ticketContent1?: string // 二维码内容
  ticketContent2?: string
  ticketContent3?: string
  ticketTopic1?: string // 二维码描述
  ticketTopic2?: string
  ticketTopic3?: string
  diffDeliverNum?: number
  needShowOldPrice: boolean
  orderSource: number
  deliverDtoList: { billId: string; billNo: string }[]
  spec1Name: string // 默认颜色
  spec2Name: string // 默认尺码
  /**
   * 诊断信息 医药行业only
   */
  mainCondDscr?: string
  /**
   * 调入门店名 连锁调拨单
   */
  targetShopName?: string
}

export type GlobalUserParams = {
  printClientScore: string
  salesPrintMatName: string
  salesPrintDetRem: string
  shareBillShowDiscount: string // 显示折扣
  printDiffDeliverNum: string // 是否显示欠货
  ignoreColorSize: string // 不展示颜色尺码
  enableStockBatch: string // 是否启用库存批次功能
}

export type VerifyDet = {
  balance: number
  balanceType: number
  billNO: string
  num: number
  proDate: number
}

export type NotDeliverDet = {
  code: string
  color: string
  name: string
  num: number
  price: number
  realPrice: number
  size: string
  deliverNum: number
  diffDeliverNum: number
}

export type detsType = Array<{
  videoUrl?: string
  coverUrl: string
  imgUrl: string
  imgUrls: string[]
  code: string
  name: string
  price: number
  color: string
  flag: number
  size: string
  num: number
  totalSmall: number
  money: string
  repFlag: number
  totalNum: number
  groupNum: number
  sizeMap: {}
  sizeNumMap: {}
  sizeNumArr: Array<{
    name: string
    value: number
  }>
  tableListHeader: Array<{
    name: string
    value: number
  }>
  sumArr: Array<{
    value: number
  }>
  sumNum: number
  showRepFlag: boolean
  realPrice: number
  stdprice1: number
  unit: string
  prodDate: string
  spec?: string
  chrgitmLv?: string
}>

export type RawDetsType = {
  allImgUrlBig: string
  code: string
  color: string
  colorId: number
  coverUrl: string
  detId: number
  flag: number
  imgUrl: string
  imgUrlBig: string
  name: string
  num: number
  price: number
  realPrice: number
  repFlag: number
  stdprice1: number
  size: string
  sizeGroupId: number
  sizeId: number
  tenantSpuId: number
  unit: string
  videoUrl: string
  remark: string
  diffDeliverNum: number
  deliverFinishFlag?: number // 2欠货已终结
  prodDate: string
  spec?: string
  chrgitmLv?: string
}

export type goodsItemType = {
  imgUrl: string
  code: string
  name: string
  price: string
  color: string
  size: string
  num: string
  totalSmall: string
  proDate: string
  saleNum: string
  saleSum: string
  backNum: string
  backSum: string
  showRepFlag: boolean
  list: Array<{
    prodate: string
    num: string
    total: string
  }>
}

export type fieldConfigType = {
  showImage: string
  showLastBalance: string
  showLastTimeBalance: string
  showSecondSale: string
  showSerialNumber: string
  showThisBalance: string
  tempbillShowAmount: string
  tempbillShowNum: string
  showCode: string
}

export type sameCodeObjArrType = Array<{
  code: string
  imgUrl: string
  name: string
  numDetail: string
  price: number
  sumGroup: number
  sumNum: number
  repFlag: number
  realPrice: number
  discount: number
  totalSmall?: number
}>

export type childModeDetsType = Array<{
  code: string
  imgUrl: string
  name: string
  numDetail: string
  price: number
  sumGroup: number
  sumNum: number
  repFlag: number
}>

export interface GoodsParmas {
  className?: string // 类别
  fabricName?: string // 材质
  seasonName?: string // 季节
  themeName?: string // 风格
}
