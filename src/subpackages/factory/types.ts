export type FSku = {
  availStockNum: number
  barcode: string
  color: string
  colorId: number
  id: number
  invNum: number
  orderNum: number
  salesNum: number
  size: string
  sizeId: number
  spuId: number
  num?: number
}

type FSpuBase = {
  spuCode: string
  spuId: number
  spuName: string
  availStockNum: number
  brandId: number
  categoryId: number
  flag: number
  invNum: number
  orderNum: number
  price: number
  salesNum: number
  imgUrls: string
}

export interface FSpuApi extends FSpuBase {
  spuCode: string
  spuId: number
  spuName: string
  availStockNum: number
  brandId: number
  categoryId: number
  flag: number
  invNum: number
  orderNum: number
  price: number
  salesNum: number
  skus: FSku[]
}

export interface FSpu extends FSpuBase {
  spuCode: string
  spuId: number
  spuName: string
  availStockNum: number
  brandId: number
  categoryId: number
  flag: number
  invNum: number
  orderNum: number
  price: number
  salesNum: number
  skus: (FSku & { data: (string | number)[][] })[]
  rawSkus: FSku[]
}

export interface OrderListItem {
  billNo: number //	批次
  id: number //	单据ID
  invId: number //	门店ID
  invName: string //	门店名
  opId: number //	操作人ID
  opName: string //	操作人名
  proDate: string //	发生日期
}

export interface OrderDetail {
  id: number
  colorId: number
  colorName: string
  fileUrl: string
  mainId: number
  num: number
  sizeId: number
  sizeName: string
  spuCode: string
  spuId: number
  spuName: string
}
