export class GoodListItem {
  id: string

  specialFlag: number

  hotFlag: number

  name: string

  code: string

  title: string

  pubPrice: number

  afterDiscountPrice: number

  price: string

  tagPrice: number

  groupPersonNum: number

  groupLackNum: number // 还差几人成团

  defaultPrice: number

  viewNum: number

  docId: string

  spuPicUrls: string[]

  picUrls: string[]

  docCdnUrl: string

  docHeader: string

  heightFix: number // 指定高度

  masterClassName: string

  spuInShoppingCartNum?: string

  actId?: string

  sellerTenantId?: string

  clusterCode?: string

  purDetailId?: string

  subTitle?: string

  cardType?: number

  execNum?: number

  rule?: {
    execNum: number
  }

  isProtected: boolean

  // 是否不可见
  video?: {
    videoUrl?: string
    coverUrl?: string
  }

  flag?: number

  typeId?: number

  activity?: {
    // -2 已失效 -1 已删除 0已结束 1未开始 2预热中 3 进行中 4暂停中
    actFlag: number
    actId: number
    // 1 全局营销活动，如限时折扣，限时减免，会员日 2 秒杀 3 拼团 4 直播
    actType: number
    afterDiscountPrice: number
    discountAmount: number
    endDate: string
    startDate: string
    actLabels: string // 活动名称
  }

  salesNum: string

  image: string

  endDate: string

  startDate: string

  countdownDatas: DHMS
}

export type DHMS = {
  day: number
  hour: string
  minute: string
  second: string
  hasEnd: boolean
}

export type LimitDiscountsState = {
  id: string
  startDate: string
  endDate: string
  flag: number
}

export type CategoryState = {
  Items: Array<Items>
  categoryIndex: number
  isFetched: boolean
  goodsItems: Array<GoodListItem>
  serveData: Array<GoodListItem>
  count: number
  hasLoading: boolean
  loadMoreDataVisible: boolean
  priClassId: number
  categoryItems: Array<categoryItems>
  more: boolean
  dataType: Array<categoryItems>
  dataTypeSec: Array<categoryItems>
}

export type Items = {
  hasNext: number // 是否有下级，0 没有 1 有
  id: number
  name: string
  validNum: number
}

export type categoryItems = {
  hasNext: number // 是否有下级，0 没有 1 有
  id: number
  name: string
  classDocId: string
  validNum: number
  subItems: Array<{
    hasNext: number
    id: number
    name: string
    classDocId: string
  }>
}

export class GoodsDetailStatus {
  goodsFabricStatus: number

  goodsBrandStatus: number

  goodsSeasonStatus: number

  goodsInvStatus: number

  goodsWeightStatus: number

  goodsSalesVolumeStatus: number

  goodsMarkedPrice: number

  productCodeStatus: number
}

export class AllGoods {
  queryCondition: {
    pageNo: number
    queryType: number
    searchToken: string
    orderBy: string
    orderByDesc: boolean
    priClassId: string
    className: string
  }

  dresStyleResultList: [GoodListItem]

  count: number

  dispatch: Function

  hasLoading: boolean

  loadMoreDataVisible: boolean

  titleName: string
}

export type MainArryType = {
  name: string
  accode: string
  id: number
}
