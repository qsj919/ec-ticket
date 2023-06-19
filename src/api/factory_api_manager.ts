import { PAGE_SIZE } from '@constants/index'
import request from '@utils/request'

/**
 * 判断用户类型 0下游客户 1厂商
 * @param params sn epid shopid
 * @returns
 */
export function fetchUserType(params) {
  return request({
    data: {
      apiKey: 'ec-mp-checkScanUserIdentity',
      ...params
    }
  })
}

/**
 * 获取厂商下游客户
 * @param searchKey 搜索字段
 */
export function fetchDownStreamShop(searchKey?: string) {
  return request({
    data: {
      apiKey: 'ec-mp-findProviderErpShopList',
      searchKey
    }
  })
}

/**
 * 获取某下游客户的款号列表
 * @param params
 * @param params.jsonParam.mpErpId
 * @param params.jsonParam.marketDateBegin
 * @param params.jsonParam.marketDateEnd
 * @param params.jsonParam.keyWordsLike
 */
export function fetchDownStreamSpuList(params) {
  return request({
    data: {
      apiKey: 'ec-mp-provider-findSpuList',
      pageSize: PAGE_SIZE,
      ...params
    }
  })
}

/**
 * 获取某下游客户的订单列表
 * @param params
 * @param params.jsonParam.mpErpId
 * @param params.jsonParam.proDataGte 起始时间
 * @param params.jsonParam.proDataLte 终止时间
 */
export function fetchDownStreamOrderList(params) {
  return request({
    data: {
      apiKey: 'ec-mp-provider-findBillList',
      pageSize: PAGE_SIZE,
      ...params
    }
  })
}

/**
 * 获取某下游客户的订单明细
 * @param params
 * @param params.mpErpId
 * @param params.jsonParam.billId 起始时间
 */
export function fetchDownStreamOrderDetail(params) {
  return request({
    data: {
      apiKey: 'ec-mp-provider-getBillDetail',
      // pageSize: PAGE_SIZE,
      ...params
    }
  })
}

/**
 *
 * @param printNo 打印机编号
 * @returns
 */
export function setPrintConfig(printNo: string) {
  return request({
    data: {
      apiKey: 'ec-mp-provider-setPrintConfig',
      printNo
    }
  })
}

/**
 * 打印指定sku条码
 * @param params
 * @param params.mpErpId
 * @param params.jsonParam {array}
 * @param params.jsonParam.styleid
 * @param params.jsonParam.colorid
 * @param params.jsonParam.num
 * @param params.jsonParam.sizeid
 */
export function printBarCodeBySkus(params) {
  return request({
    data: {
      apiKey: 'ec-mp-provider-printBarcodeByMat',
      ...params
    }
  })
}

/**
 * 打印订单中sku条码
 * @param params
 * @param params.mpErpId
 * @param params.billId
 */
export function printBarCodeByOrder(params) {
  return request({
    data: {
      apiKey: 'ec-mp-provider-printBarcodeByBill',
      ...params
    }
  })
}

/**
 * 获取厂商打印机编号
 * @returns
 */
export function fetchPrintConfig() {
  return request({
    data: {
      apiKey: 'ec-mp-provider-getPrintConfig'
    }
  })
}

/**
 * 获取店铺颜色尺码组
 * @param mpErpId 店铺id
 */
export function fetchColorSizeGroup(mpErpId) {
  return request({
    data: {
      apiKey: 'ec-mall-findColorAndSizeGroup',
      mpErpId
    }
  })
}
