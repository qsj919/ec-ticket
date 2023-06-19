import Taro from '@tarojs/taro'
import request from '../utils/request'

let url = '/slb/api.do'
/**
 * 根据id获取店铺数据
 * @param ids 逗号分隔的id字符串
 */
export function fetchShopById(ids: string) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-findSimpleErps',
      jsonParam: {
        ids
      }
    }
  })
}

/**
 * 搜索店铺
 * @param pageNo
 * @param pageSize
 * @param jsonParam.autoCompletion // 搜索联想 1为开启 默认0
 * @param jsonParam.nameLike
 * @param jsonParam.cityCode
 * @param jsonParam.marketId // 三个至少传一个
 */
export function serachShop(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-searchErps',
      pageSize: 20,
      ...params
    }
  })
}

/**
 * 获取店铺基本信息
 */
export function fetchShopInfo(mpErpId: number) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-findErpHome',
      mpErpId
    }
  })
}

/**
 * 获取店铺的商品列表
 * @param pageNo
 * @param pageSize
 * @param mpErpId
 */
export function fetchShopGoodsList(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-searchMpErpDres',
      pageSize: 20,
      haspic: 1, // 1=有图的商品
      ...params
    }
  })
}

/**
 * 向店铺申请开通查看货品的功能
 * @param mpErpId 店铺id
 */
export function applyOpenGoodsData(mpErpId) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-applyViewStyle',
      mpErpId
    }
  })
}

/**
 * 店铺同意开通查看货品
 * @param mpErpId 店铺id
 * @param type 0 - 3 对应 1个月 3 6 全部商品
 */
export function admitOpenGoodsData(params: { mpErpId: number; type: number }) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-authOpenStyle',
      ...params
    }
  })
}

/**
 * 获取申请某店开通查看权限的人
 * @param mpErpId 店铺id
 */
export function checkShopApplyNum(mpErpId) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-applyOpenCnt',
      mpErpId
    }
  })
}

// ec-mp-applyOpenCnt

/**
 * 获取微商城店铺的基础信息
 * @param mallTenantId 微商城店铺id
 */
export function fetchMallInfo(mallTenantId) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-findSsMallById',
      mallTenantId
    }
  })
}

/**
 * 获取省市以及市场列表
 * @param type 0为省市列表，1为批发市场
 * @param cityCode 城市标号，type = 1时必须
 * @param hotNum 热门批发市场数量 默认20
 */
export function fetchCityAndMarkets(params: {
  jsonParam: { type: number; cityCode?: number; hotNum?: number }
}) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-findMarkets',
      ...params
    }
  })
}

/**
 * @param params.sn
 * @param params.epid
 * @param params.billid
 */
export function fetchReplenishmentGoods(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-purBill-spuList',
      ...params
    }
  })
}

// ec-eb-purBill-create
export function createReplenishmentOrder(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-purBill-create',
      ...params
    }
  })
}
// ec-eb-purBill-createV2 多门店
export function createReplenishmentOrderV2(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-purBill-createV2',
      ...params
    }
  })
}

export function fetchShopInfoFromSlh(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-getShopInfo',

      jsonParam: { ...params }
    }
  })
}

/**
 * 邀请开通云单
 * @param params.mpErpId 门店id
 * @param params.dwName 客户名称
 */
export function inviteJoinCloudBill(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-inviteErpOpenMall',
      ...params
    }
  })
}

/**
 * 设置自动上架库存相关设置
 */
export function setGoodsMarketInvStrategy(mpErpId, value) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-setShopMarketStyleInvStrategy',
      mpErpId,
      value
    }
  })
}

export function getGoodsMarketInvStrategy(mpErpId) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-getShopMarketStyleInvStrategy',
      mpErpId
    }
  })
}

export async function fetchVideoPageData(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-shareMpSaleBillTicketV3',
      ...params,
      shortUrl: params.sn
    }
  })
}

export function fetchVideoPageDataByMpErpId(params: {
  mpErpId: string | number
  code?: string
  mpUserId?: number
  iv?: string
  encryptedData?: string
}) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-scanCloudBillShopQrCode',
      ...params
    }
  })
}

/** 获取推荐视频 */
export function fetchVideoShops({
  size = 10,
  refresh = false,
  ...p
}: {
  size: number
  refresh: boolean
}) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-findVideoShops',
      size,
      refresh,
      ...p
    }
  })
}

export function batchScanShop(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-batchScanCloudBillShops',
      ...params
    }
  })
}

/**
 * 获取门店视频
 */
export function fetchShopVideos(mpErpId) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-findShopVideos',
      mpErpId
    }
  })
}

/**
 * 获取门店视频
 */
export function fetchShopVideosForCloudBill(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-findShopVideos',
      ...params
    }
  })
}

/**
 * 上传门店视频
 */
export function uploadShopVideo(jsonParam) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-addShopVideo',
      jsonParam
    }
  })
}

/** 删除门店视频 */
export function deleteShopVideo(id) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-deleteShopVideo',
      id
    }
  })
}

/**
 * 查询saas客户
 * @param params.dwname
 * @param params.mpErpId
 */
export function fetchSLHDwList(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-findDwxxList',
      ...params
    }
  })
}

/**
 * 绑定saas客户
 * @param jsonParam.dwId
 * @param jsonParam.mpErpId
 * @param jsonParam.mpUserId
 */
export function bindSLHDw(jsonParam) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-saveCbUserDwxxLink',
      jsonParam
    }
  })
}

/**
 * 是否允许访客进入云单
 */
export function enableVisitorIn(params) {
  return request({
    data: {
      apiKey: 'ec-mall-enableVisitorIn',
      ...params
    }
  })
}

/**
 * 保存分类
 */
// ec-mall-saveSpuClass
export function saveSpuClassApi(params) {
  return request({
    data: {
      apiKey: 'ec-mall-saveSpuClass',
      ...params
    }
  })
}

export function fetchShopBuyInfo(mpErpId) {
  return request({
    data: {
      apiKey: 'ec-mp-getUserShopBuyData',
      mpErpId
    }
  })
}
