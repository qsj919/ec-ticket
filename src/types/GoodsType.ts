/**
 * @author GaoYuJian
 * @create date 2018-11-19
 * @desc 货品模型
 */

import { PAY_STATUS, REFUND_STATUS } from './base'

export interface ISku {
  id: number
  sizeId: string
  colorId: string
  colorName: string
  sizeName: string
  styleName: string
  styleCode: string
  styleId: number
  price: number
  originPrice?: number
  checked?: boolean
  num: number // 数量
  rem?: string
  invNum?: number // 库存
  /**
   * 按手购买，每组的数量
   */
  numPerGroup?: number
  /**
   * 组数，由客户端控制并在下单时传给服务端
   */
  groupNum?: number
  oneTimeNumLimit?: number
}
export interface ISpu {
  brandName: string
  className: string
  code: string
  codeNum: string
  coverUrl: string
  id: string
  styleId: number
  allImgUrlBig?: string
  allImgUrlBigs: string[]
  imgUrl: string
  imgUrls: string[]
  modelClass: string
  name: string
  price: string
  videoUrl: string
  monthSalesNum: string
  flag?: number // 0可用 1停用
  marketFlag?: number // 0 未上架 1已上架
  checked?: boolean
  hotFlag: number // 1爆款
  viewCount?: string // 浏览量
  invNum?: number // 库存
  lastDate?: string //最后拿货时间
  num?: number //累计拿货数量
  marketDate?: string
  originPrice?: number // 划线价
  useLastPrice?: boolean
  skus?: ISku[]
}

export interface IGoodsClass {
  optime: string
  id: string
  name: string
  delflagname: string // 停用？
  modelClass: string
  showorder: string
  parentid: string
  delflag: string
  parentName: string
  classcode: string
  opstaffName: string // 修改人
}

export interface IGoodsDetailFromApi {
  id: number
  code: string
  name: string
  className: string
  brandName: string
  seasonName: string
  price?: string | number
  imgUrl: string
  imgUrls: string[]
  fileId: string
  coverUrl: string
  videoUrl: string
  monthSalesNum: string
  fabricName: string
  imgUrlBig: string
  allImgUrlBig: string
  allImgUrlBigs: string[][]
  skus: ISku[]
  invNum?: number
  spec1Name: string
  spec2Name: string
  styleId: string
  priceType?: string
  originPrice?: number
  marketFlag: number
}

export interface IGoodsDetail extends IGoodsDetailFromApi {
  medias: Array<{
    url: string
    typeId: number
  }>
  isSkuPrice?: boolean
}

// export interface IColorItem {
//   id: string
//   name: s
// }

export interface IColorSizeItem {
  id: string
  name: string
  num: number
  checked?: boolean
  invNum: number
  price: number
  groupNum?: number
  step?: number
}

export interface OrderBillItem {
  afterSaleTypes: number[] // 1 仅退款，2 退货退款
  billId: number
  nickName: string
  dwName: string
  logoUrl: string
  flagName: string
  proTime: string
  totalNum: number
  totalMoney: number
  styleImg: string
  styleCode: string
  styleName: string
  slhBillNo: string
  userRemark?: string
  payStatus: PAY_STATUS
  refundStatus: REFUND_STATUS
}

export interface OrderBillDetail {
  dwId: number
  dwName: string
  mpLogoUrl: string
  dwPhone: string
  mpNickName: string
  bill: OrderBill
  spus: Array<OrderSpu>
}

export interface OrderBill {
  id: number
  addrDetail: string
  auditFlag: number
  billNo: number
  createdDate: string
  proTime: string
  receiveName: string
  receivePhone: string
  remark: string
  totalMoney: number
  totalNum: number
  updatedDate: string
  unitId: number
  fullAddress: string
  slhBillNo: number
  buyerRem: string
}

export interface OrderSpu {
  styleId: number
  styleImg: string
  styleName: string
  styleCode: string
  price: number
  totalNum: number
  totalMoney: number
  skus: Array<OrderSku>
}

export interface OrderSku {
  id: number
  colorName: string
  num: number
  price: number
  money: string
  sizeName: string
  sizeid: number
  originalNum: number
}
