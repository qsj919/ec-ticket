/*
 * @Author: HuKai
 * @Date: 2019-09-09 09:25:01
 * @Last Modified by: HuKai
 * @Last Modified time: 2019-09-11 19:26:54
 */
export type languageType = {
  eticket: string
  checkAllTickets: string
  batch: string
  client: string
  clerk: string
  date: string
  orderMoney: string
  balancePlus: string
  balanceMinus: string
  lastTimeBalancePlus: string
  lastTimeBalanceMinus: string
  lastBalancePlus: string
  lastBalanceMinus: string
  rem: string
  operator: string
  tel: string
  account: string
  shareDate: string
  goodsDetail: string
  goodsRecord: string
  firstTime: string
  saleNum: string
  saleSum: string
  backNum: string
  backSum: string
  code: string
  image: string
  name: string
  price: string
  money: string
  color: string
  number: string
  sum: string
  statisticsTickets: string
  cash: string
  remit: string
  card: string
  weiXinPay: string
  aliPay: string
  storedValueCost: string
  debt: string
  agency: string
  totalMoney: string
  totalNum: string
  qrCode: string
  size: string
  subtotal: string
  numDetail: string
  groupNum: string
}

export type mainType = {
  billNo: string
  ownerName: string
  compName: string
  proDate: string
  rem: string
  cash: number
  remit: number
  card: number
  weiXinPay: number
  aliPay: number
  storedValueCost: number
  debt: number
  agency: number
  lastBalance: number
  balance: number
  totalMoney: string
  shopAddr: string
  accountNo: string
  shareDate: string
  accountName: string
  ticketQrcode1: string
  ticketQrcode2: string
  ticketQrcode3: string
  ticketTopic1: string
  ticketTopic2: string
  ticketTopic3: string
  billQRCodeContent: string
  bottomTips: string
  lastBillBalance: number
  accountNo2: string
  accountName2: string
  accountNo3: string
  accountName3: string
  accountNo4: string
  accountName4: string
  accountNo5: string
  accountName5: string
  accountNo6: string
  accountName6: string
  shopPhone: string
}

export type detsType = Array<{
  imgUrl: string
  code: string
  name: string
  price: number
  color: string
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
  sumArr: Array<{
    value: number
  }>
  sumNum: number
  showRepFlag: string
}>

export type goodsItemType = {
  imgUrl: string
  code: string
  name: string
  price: string
  color: string
  size: string
  num: string
  totalSmall: string
  saleNum: string
  saleSum: string
  backNum: string
  backSum: string
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
}

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
