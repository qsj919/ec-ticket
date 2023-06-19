import request from '../utils/request'
import config from '../config/config'

/**
 * 添加审核商品
 */
export function addGoods(params) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-addGoods',
      jsonParam: {
        ...params
      }
    }
  })
}

/**
 * 更新视频号直播商品   --改价
 */
export function updateGoods(params) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-updateGoods',
      jsonParam: {
        ...params
      }
    }
  })
}

/**
 * 上架视频号直播商品
 */
export function listingGoodsparams(params) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-listingGoods',
      jsonParam: {
        ...params
      }
    }
  })
}

/**
 * 下架视频号直播商品
 */
export function delistingGoods(params) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-delistingGoods',
      jsonParam: {
        ...params
      }
    }
  })
}

/**
 * 删除视频号直播商品
 */
export function deleteGoods(params) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-deleteGoods',
      jsonParam: {
        ...params
      }
    }
  })
}

/**
 * 查询视频号直播商品列表
 */
export function findGoodsList(params) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-findGoodsList',
      pageSize: 20,
      ...params
    }
  })
}

/**
 * SPU接口调用
 */
export function spuApiInvoke(params) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-spuApiInvoke',
      ...params
    }
  })
}

/**
 * 订单接口调用
 */
export function orderApiInvoke(params) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-orderApiInvoke',
      ...params
    }
  })
}

/**
 * 完成订单任务
 */
export function orderApiFinish(params) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-orderApiFinish',
      ...params
    }
  })
}

/**
 * 发货/售后，接口调用
 */
export function deliveryAfterSaleApiInvoke(params) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-deliveryAfterSaleApiInvoke',
      ...params
    }
  })
}

/**
 * 视频号场景申请
 */
export function applyScene(params) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-applyScene',
      ...params
    }
  })
}

/**
 * 获取接入状态
 */
export function registerCheck(params) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-registerCheck',
      ...params
    }
  })
}

/**
 * 获取商品类目
 */
export function findCategoryList(params) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-findCategoryList',
      ...params
    }
  })
}

/**
 * 视频号售后单详情列表
 */
export function findAfterSaleDetailList(params) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-findAfterSaleDetailList',
      ...params
    }
  })
}

/**
 * 修改商家地址
 */
export function editMerchantAddr(params) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-updateAccountInfo',
      ...params
    }
  })
}

/**
 * 获取小程序二维码
 */
interface IGetOrderApiInvokeQrCodeUrlParams {
  mpErpId: number | string
}
export function getOrderApiInvokeQrCodeUrl(params: IGetOrderApiInvokeQrCodeUrlParams) {
  return request({
    data: {
      apiKey: 'ec-mall-trade-getOrderApiInvokeQrCodeUrl',
      ...params
    }
  })
}

/**
 * 获取全国省市区数据
 */
export function getRegionCodeAll() {
  return request({
    url: config.confc,
    data: {
      apiKey: 'ec-config-dictCode-getRegionCodeAll'
    }
  })
}
