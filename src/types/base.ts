import { StandardProps } from '@tarojs/components/types/common'

export interface BaseItem {
  label: string
  value: number | string
}

export interface ActiveItem extends BaseItem {
  active?: boolean
}

export interface Sku {
  dwfdname: string
  flag: number
  colorid: number
  dwxxid: number
  num: number
  matname: string
  discount: number
  groupnum: number
  remark: string
  sizename: string
  colorname: string
  total: number
  price: number
  prodate: string
  styleId: number
  shopname: string
  stylename: string
  dwname: string
  rem: string
  realprice: number
  billno: string
  stylecode: string
  imgThumbUrl: string
  styleType: number // 9为特殊货品
}

interface BaseShop {
  id: number
  shopid: number
  logoUrl: string
  sn: number
  shopName: string
}

export enum CLOUD_BILL_FLAG {
  never = -1,
  close,
  open,
  expire
}

export interface Shop {
  id: number
  logoUrl: string
  shopName: string
  shopid: number
  epid: string
  sn: string
  saasType: number // 1 2代表1 2代
  showOrder?: number // 1表示置顶
  erpName: string
  mpErpId: string
  dwId: number
  addr: string
  isNew?: boolean // 新店标识
  mineErp: number //  1是 0 不是，是别人授权而来
  mallTenantId?: number
  mallWxApppId?: string
  cloudBillFlag: CLOUD_BILL_FLAG
  phone: string
  buyNum?: number
  lastBuyDate?: string
  bindFlag?: number
  industries?: boolean // 是否为全行业 参数
  independentType?: number
  independentAppId?: string
}

export interface BizShop {
  bizShopId: number
  bizStatus: number
  delFlag: number
  name: string
  pubDelayDay: number
  subscribe: {
    subscribeFlag: number
    expiredDate: string
  }
}

export interface ICloudShop extends Shop {
  marketInfo: {
    details: {
      code: string
      id: number
      imgUrls: string[]
      name: string
    }[]
    marketDate: string
    marketNum: number
  }
}

export interface ActiveShop extends Shop {
  active?: boolean
}

export interface LinkShop extends Shop {
  linkFlag: number
  dwOrigId: number
}

export interface SearchShop {
  addr: string
  city: string
  id: number
  logoUrl: string
  mallTenantId: number
  marketName: string
  shopName: string
  shopid: number
  sn: string
  phone: string
  newDres7: number
  newDres30: number
  latitude: number
  longitude: number
}

export interface ShopDetail extends BaseShop {
  mainClass: string[]
  mallTenantId: number // 0 代表未开通微商城
  cityCode: number
  latitude: number
  longitude: number
  erpName: string
  addr: string
  marketId: number
  formatAddr: string
  openStyleTime: number // 0 不允许查看店铺商品
  saasType: number
}

export interface Goods {
  code: string
  name: string
  fileOrgUrl: string
  fileUrl: string
  firstFileUrl: string
  firstFileOrgUrl: string
}

//  微商城店铺
export interface MallShop {
  shopName: string //	店铺名
  shopLogoDoc: string //	店铺logo doc
  shopLogoOrg: string //	店铺logo 原图地址，可能没有
  shopCodeDoc: string //	店铺二维码docId，可能没有
  shopCodeOrg: string //	店铺二维码原图地址，可能没有
}

export interface SPUForBuy {
  skus: SkuForBuy[]
  name: string
  code: string
  imgUrl: string
  flag: number
  // imgUrlBig: string
  // allImgUrlBig: string
  id: number
}

export interface stockBarItem {
  spus: SPUForBuy[]
  shopName: string
  checked?: boolean
  carts?: SkuForBuy[]
}

export interface SkuForBuy {
  price: number
  checked?: boolean
  sizeId: string
  colorId: string
  colorName: string
  sizeName: string
  styleId: number
  num: number
  id: number // 购物车id
  styleCode: string
  styleName: string
  styleImg: string
  rem?: string
  flag: number
  groupNum?: number
  originPrice?: number
}

export interface stockBarItemForBillConfirm {
  spus: SPUForBillConfirm[]
  shopName?: string
  logoUrl?: string
  spusForBillDetail?: SPUForBillConfirm[]
  spuShowPrice?: number
  mpErpId: number
  totalTable?: { totalNum: number; totalMoney: number }
  orderData?: {}
}

export interface SPUForBillConfirm {
  name: string
  code: string
  imgUrl: string
  // imgUrlBig: string
  // allImgUrlBig: string
  id: number
  skus: SkuForBillConfirm[]
  flag: number
}

export interface SkuForBillConfirm {
  originPrice?: number
  price: number
  checked?: boolean
  sizeId: string
  colorId: string
  colorName: string
  sizeName: string
  styleId: number
  num: number
  id?: number // 购物车id
  styleCode: string
  styleName: string
  styleImg: string
  rem?: string
  flag: number
  /**
   * 按手购买，每组的数量
   */
  numPerGroup?: number
  /**
   * 组数，由客户端控制并在下单时传给服务端
   */
  groupNum?: number
}

export enum EmptyViewStatus {
  Custom,
  NetworkError, // 网络
  Loading = 3,
  Empty,
  Error, // 业务错误
  Null
}

interface InfoItem {
  label?: string
  image?: string
}

export type EmptyViewProps = {
  type: EmptyViewStatus // 自定义 | 网络异常 | 商品已下架 | 数据加载中 | 没有数据
  className?: string
  style?: StandardProps['style']
  customInfo?: InfoItem
  networkErrorInfo?: InfoItem
  errorInfo?: InfoItem
  loadingInfo?: InfoItem
  emptyInfo?: InfoItem
  buttonLabel?: string
  onButtonClick?: () => void
  buttonStyle?: string
  imageStyle?: string
  needShowButton?: boolean
  viewStyle?: string
  isBigImg?: number
  tabIndex?: number
}

export enum ColorSizeModeFromType {
  GoodsList = 'GoodsList', // 货品列表
  GoodsDetail = 'GoodsDetail' // 商品详情
}

// 云单状态,
export enum ICloudBill {
  noPermission = -1, // 用户无权限
  close, // 商家关闭
  replenishment, // 仅补货
  all // 完全放开
}

// 云单店铺绑定用户状态
export enum ScanError {
  SUCCESS = 0, // 正常状态
  NONE_USER = 2, // 无用户
  NONE_VIDEO = 3, //无视频
  NONE_NICKNAME = 4, // 无昵称
  NONE_PHONE = 5, // 无手机号
  NONE_NICKNAME_AND_PHONE = 6 // 无手机号 && 无昵称
}

export type FilterOptionItem = {
  codeName: string
  codeValue: number
  isSelected?: boolean
}
//选择可见客户
export type UserRangeType = {
  typeList?: Array<{
    delflag: string
    flag: string
    id: string
    modelClass: string
    name: string
    opstaffName: string
    optime: string
    sid: string
  }>
  onRangeItemClick?: (id: number) => void
  onTypeItemClick?: (id: Array<{}>, obj: any) => void
}
export type FilterOption = {
  /**
   * tag: 普通标签 range: 输入区间(如价格区间)
   */
  type: 'tag' | 'range'
  multipleSelect: boolean
  typeName: string
  typeValue: number
  /**
   * type=range时  items[0]: startValue, items[1]: endValue, items[2]: startPlaceHolder, items[3]: endPlaceHolder
   */
  items: FilterOptionItem[] | string[]
}

export type FilterUpdateOption = {
  typeValue: number
  items?: FilterOptionItem[] | string[]
  isRemove?: boolean
  position: number
}

export enum GoodsFilterType {
  class = 20,
  hot
}

export enum CloudSource {
  SCAN = 'scan', // 小票二维码
  PUBLIC = 'public', // 公众号
  TICKET_LIST = 'ticket_list', // 小票列表
  TICKET_DETAIL = 'ticket_detail', // 小票详情
  CLOUD_TAB = 'cloud_tab', // 云单tab
  UNKNOWN = 'unknown',
  VIDEO = 'video'
}

export enum CloudVideoSource {
  MINI_QR = 'mini_qr',
  TICKET_QR = 'ticket_qr',
  PUBLIC_NOTI = 'public_noti',
  PUBLIC_TICKET = 'public_ticket',
  UNKNOWN = 'unknown'
}

export enum CloudEventPage {
  DETAIL = 'detail',
  VIDEO = 'video',
  GOODS = 'goods'
}

export interface IVideoBase {
  videoUrl: string
  coverUrl: string
  srcUrl: string
}

export interface IVideoWithShop extends IVideoBase {
  /** 店铺信息 */
  logoUrl: string
  sn: string
  addr: string
  shopName: string
  shopid: number
  epid: string
  mpErpId: number
  bindFlag: number // 0 or 1
  videoId: number
  phone: string
  cloudBillFlag: CLOUD_BILL_FLAG
}

export interface IVideo extends IVideoBase {
  id: number
  mpErpId: number
  fileId: string
}

export enum PAY_STATUS {
  DEFAULT = 0, // 初始状态
  WAITING = 1, // 待支付
  DOING = 2, // 支付中
  SUCCESS = 3, // 支付成功
  FAILURE = 4 // 支付失败
}

export enum REFUND_STATUS {
  DEFAULT = 0, // 初始状态
  APPLY = 1, // 申请退款
  DOING = 2, // 退款中 || 商家同意退款
  SUCCESS = 3, // 退款成功
  FAILURE = 4, //退款失败
  REJECT = 5, //拒绝退款
  CANCEL = 6 //取消退款
}

/**
 * 售后状态
 */
export enum AFTER_SALE_STATUS {
  CANCEL = 1, // 用户取消售后申请
  PROCESSING = 2, // 商家处理退款中
  REJECT_REFUND = 4, // 商家拒绝退款
  REJECT_RETURN = 5, // 商家拒绝退货
  WAITING_RETURN = 6, // 待用户退货
  CLOSE,
  WAITING_TAKE_DELIVERY, // 待商家收货
  REFUND = 11, // 平台退款中
  REFUND_SUCCESS = 13,
  PLATFORM_REFUND_PROCESSING = 21, // 平台处理退款申请中
  RETURN_PROCESSING = 23, // 商家处理退货请求中
  PLATFORM_RETURN_PROCESSING, // 平台处理退货申请中
  PLATFORM_REFUND_FAILED // 平台退款失败
}

export type LIVE_GOODS = {
  auditData: string
  auditFlag: number
  catId: number
  createdBy: number
  createdDate: string
  flag: number
  id: number
  imgData: string
  invType: number
  listFlag: number
  livePrice: number
  mpErpId: number
  realPrice: number
  styleCode: string
  styleId: number
  styleName: string
  updatedBy: number
  updatedDate: string
  invNum: number
  priceType: number
}

export enum LIVE_ACTION_TYPE {
  DOWN = 0,
  UPDATE = 1,
  EDIT = 2,
  UP = 3,
  ASYNC = 4,
  DELETE = 5
}

export enum LIVE_AUDIT_FLAG {
  DEFAULT = 0,
  // 审核中
  AUDITING = 1,
  // 成功
  SUCCESS = 10,
  // 失败
  FAILURE = -1
}

export enum LIVE_STATUS {
  AUDITING = 0,
  SUCCESS = 1,
  FAIL = 2,
  NOTAUDIT = 3
}

export const LIVE_SCENE = [1175, 1176, 1177, 1191, 1195]
