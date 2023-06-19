export type Bill = {
  billId: number //	订单id
  billNo: number //	批次号
  sn: string // 	企业sn
  epid: string // 	账套id
  shopId: string // 	店铺id
  shopName: string // 	店铺名称
  shopLogo: string // 	门店logo
  flagName: string // 	状态
  proDate: string //	下单时间
  totalNum: number // 	总件数
  totalMoney: number // 	总金额
  imgUrls: string[] //	货品图片
  dwName: string
  dwname: string
}

export type ShopBillListItem = Array<
  Pick<Bill, 'shopId' | 'shopName' | 'shopLogo'> & {
    bills: Bill[]
  }
>

export type BillListItem = {
  prodate: string
  month: number
  day: number
  shops: ShopBillListItem
}

export type DateBillListItem = {
  key: string // ${year}-${month}
  title: string // 标题，当年取月，次年则为年 + 月
  total: number // 门店数
  totalNum: number // 单据数
  totalMoney: number // 金额
  data: BillListItem[]
}

export type EsDresGoods = {
  styleId: number
  styleName: string
  styleCode: string
  sn: string
  shopid: string
  epid: string
  shopName: string
  shopLogo: string
  proDate: string
  totalNum: number
  totalMoney: number
  imgUrl: string
  saleNum: number
}
