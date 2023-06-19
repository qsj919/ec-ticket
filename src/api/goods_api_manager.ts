import { PAGE_SIZE } from '@constants/index'
import request from '@utils/request'
import config from '../config/config'

/**
 * @Description: 获取门店货品列表
 */
export function getShopGoodsList(params) {
  const { hotGoods, ..._params } = params
  // const apiKey = hotGoods ? 'ec-mall-findShopSalesWellSpuList' : 'ec-mall-findShopSpuList'
  return request(
    {
      data: {
        apiKey: 'ec-mall-findShopSpuList',
        pageSize: 10,
        ..._params
      }
    },
    {
      slient: true
    }
  )
}

export function getLastPriceBatch(params) {
  return request(
    {
      data: {
        apiKey: 'ec-mall-findShopSpuPriceList',
        ...params
      }
    },
    {
      slient: true
    }
  )
}

// ec-mall-getShopSpuInfo
/**
 * haole 获取货品详情
 */
export function getShopGoodsDetail(params: {
  epid: string
  sn: string
  shopId: string
  spuId: string
}) {
  return request({
    data: {
      apiKey: 'ec-mall-getShopSpuInfo',
      ...params
    }
  })
}

export function getGoodsClassList(params: { epid: string; sn: string; shopId: string }) {
  return request({
    data: {
      apiKey: 'ec-mall-findShopClassList',
      ...params
    }
  })
}

export function getCartGoodsList(params) {
  return request({
    data: {
      apiKey: 'ec-eb-shoppingCar-list',
      ...params
    }
  })
}

export function getStockBarList() {
  return request({
    data: {
      apiKey: 'ec-eb-shoppingCar-findAllShopCartList'
    }
  })
}

// 加入购物车
export function addToCartApi(params) {
  // ec-eb-shoppingCar-save
  return request({
    data: {
      apiKey: 'ec-eb-shoppingCar-save',
      ...params
    }
  })
}

// 删除购物车货品
export function deleteCartGoods(params: { mpErpId: number; cartIds: number[] }) {
  return request({
    data: {
      apiKey: 'ec-eb-shoppingCar-deleteCartInBatch',
      cartIds: JSON.stringify(params.cartIds)
      // mpErpId: params.mpErpId
    }
  })
}

// 更新购物车货品
export function updateCartGoods(jsonParam: {
  id: number
  num: number
  groupNum?: number
  shopIndex?: number
}) {
  return request({
    data: {
      apiKey: 'ec-eb-shoppingCar-update',
      jsonParam
    }
  })
}

// 更新购物车款号备注
export function updateCartGoodsRem(params: { id: number; rem: string }) {
  return request({
    data: {
      apiKey: 'ec-eb-shoppingCar-updateStyleRem',
      ...params
    }
  })
}

// 获取尺码组排序
export function fetchSizeGroupOrder(mpErpId: string | number) {
  return request({
    data: {
      apiKey: 'ec-mall-findSizeGroup',
      mpErpId
    }
  })
}

// 获取颜色组排序
export function fetchColorGroupOrder(mpErpId: string | number) {
  return request({
    data: {
      apiKey: 'ec-mall-findColorGroup',
      mpErpId
    }
  })
}

/**
 * 下架云单商品
 * @param params
 */
export function takeDownGoodsApi(params: { mpErpId: string; styleIds: string }) {
  return request({
    data: {
      apiKey: 'ec-mall-batchDownFromMall',
      ...params
    }
  })
}

/**
 * 上架云单商品
 * @param params
 */
export function takeUpGoodsApi(params: { mpErpId: string; styleIds: string }) {
  return request({
    data: {
      apiKey: 'ec-mall-batchMarketToMall',
      ...params
    }
  })
}

/**
 * 鉴权：查看当前会话是否有操作权限并获取图片上传地址和mpErpId
 */
export function fetchAuthAndGoodsImgUploadUrl(params) {
  return request({
    data: {
      apiKey: 'ec-mall-checkShopStaffAuth',
      ...params
    }
  })
}

/**
 * 保存图片
 */
export function saveGoodsImage(params: {
  mpErpId: string
  jsonParam: { docIds: string; pk: string }
}) {
  return request({
    data: {
      apiKey: 'ec-mall-updateSpuDocs',
      ...params
    }
  })
}

/**
 * 更新款号图片及视频
 */
export function updateGoodsMedias(params: {
  jsonParam: {
    docIds: string
    pk: string
    mpErpId: string
    fileId?: number // 删除视频时传-1
    videoUrl?: string
    coverUrl?: string
    newDocNum?: number
    failDocNum?: number
  }
}) {
  return request({
    data: {
      apiKey: 'ec-mall-updateSpuDocAndVideo',
      ...params
    }
  })
}

/**
 * 获取货品筛选条件
 */
export function fetchGoodsFilterRule(mpErpId: string) {
  return request({
    data: {
      apiKey: 'ec-mall-findShopSpuFilters',
      mpErpId
    }
  })
}
/**
 * 查询客户类型
 */
export function queryCustomerType(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findCustomerType',
      ...params
    }
  })
}

/**
 * 修改客户类型
 */
export function updateCustomerVisibleType(params: { mpErpId: number; rule: number; val: string }) {
  return request({
    data: {
      apiKey: 'ec-mall-updateCustomerVisibleType',
      ...params
    }
  })
}

/**
 * 修改云单店铺简介信息
 */
export function updateShopInfo(params) {
  return request({
    data: {
      apiKey: 'ec-mall-updateShopIntroduction',
      ...params
    }
  })
}
/**
 * 获取云单店铺信息
 */
export function getShopIntroduction(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getShopIntroduction',
      ...params
    }
  })
}
/**
 * 商品品类三级联动
 */

export function getSpuStdPropType(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getSpuStdPropType',
      ...params
    }
  })
}

/**
 * 获取云单店铺绑定用户列表
 */
export function findErpLinkUsers(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findErpLinkUsers',
      pageSize: 15,
      ...params
    }
  })
}

/**
 * 通知绑定用户店铺开通
 */
export function sendErpOpenMallMsg(params) {
  return request({
    data: {
      apiKey: 'ec-mall-sendErpOpenMallMsg',
      ...params
    }
  })
}

/**
 *  获取店铺二维码
 */
export function getErpQrCodeUrl(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getErpQrCodeUrl',
      ...params
    }
  })
}

/**
 * 获取店铺新款保护天数
 */
export function getShopProtectDays(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getShopProtectDays',
      ...params
    }
  })
}

/**
 * 设置店铺新款保护天数
 */
export function setShopProtectDays(params) {
  return request({
    data: {
      apiKey: 'ec-mall-setShopProtectDays',
      ...params
    }
  })
}

/**
 * 获取店铺参数
 */
export function getShopParamVal(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getShopParamVal',
      ...params
    }
  })
}

/**
 * 店铺参数 无会话版本
 */
//
export function getShopParamValWithSession(params: any) {
  return request({
    data: {
      apiKey: 'ec-mall-getVisitorAuth',
      ...params
    }
  })
}

/**
 * 获取全部店铺参数
 */
export function getAllShopParamsVal(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getAllShopParams',
      ...params
    }
  })
}

/**
 * 获取门店列表
 */
export function findBizShops(param) {
  return request({
    url: config.amktServer,
    data: {
      apiKey: 'ec-mp-biz-findBizShops',
      appCode: 'cloudBill',
      pageSize: 500,
      pageNo: 1,
      mktToken: param.mktToken,
      sessionId: undefined
    }
  })
}

/**
 * 获取门店列表
 */
export function getConnectorAcctTotalRecharge(param) {
  return request({
    url: config.amktServer,
    data: {
      apiKey: 'ec-amkt-acct-getConnectorAcctTotalRecharge',
      mktToken: param.mktToken,
      sessionId: undefined
    }
  })
}

/**
 * 获取云单到期提醒
 */
export function getCloudExpireNoti(params) {
  return request({
    url: config.amktServer,
    data: {
      apiKey: 'ec-amkt-remind-getAppDueRemind',
      appCode: 'cloudBill',
      ...params,
      sessionId: undefined
    }
  })
}

/**
 * 关闭云单到期提醒
 * @appCode
 * @shopId
 */
export function disableCloudExpireNoti(params) {
  return request({
    url: config.amktServer,
    data: {
      apiKey: 'ec-amkt-remind-closeDueRemind',
      appCode: 'cloudBill',
      ...params,
      sessionId: undefined
    }
  })
}

/**
 * 设置店铺参数
 */
export function setShopParamVal(params) {
  return request({
    data: {
      apiKey: 'ec-mall-setShopParamVal',
      ...params
    }
  })
}

/**
 * 查询访问数据
 */
export function getShopViewData(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getShopViewData',
      jsonParam: {
        ...params
      }
    }
  })
}

/**
 * 查询访问客户
 */
export function findShopViewers(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findShopViewers',
      jsonParam: {
        pageSize: 20,
        ...params
      }
    }
  })
}

/**
 * 店铺事件监控
 */
export function monitorShopEvent(params) {
  return request({
    data: {
      apiKey: 'ec-mall-monitorShopEvent',
      jsonParam: {
        ...params
      }
    }
  })
}
/**
 * 客户详情
 */
export function getShopViewerSalesData(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getShopViewerSalesData',
      jsonParam: {
        ...params
      }
    }
  })
}

/**
 * 用户浏览店铺和款号信息
 */
export function findUserShopViewData(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findUserShopViewData',
      pageSize: 20,
      pageNo: params.pageNo,
      jsonParam: {
        ...params
      }
    }
  })
}

/**
 * 获取店铺访客购买明细
 */
export function findUserShopSalesDetails(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findUserShopSalesDetails',
      pagesize: 20,
      ...params
    }
  })
}

/**
 * 保存用户和店铺员工的绑定信息
 */
export function saveUserShopStaffLink(params) {
  return request({
    data: {
      apiKey: 'ec-mall-saveUserShopStaffLink',
      ...params
    }
  })
}

/**
 * 接触用户和店铺员工的绑定信息
 */
export function cancelUserShopStaffLink(params) {
  return request({
    data: {
      apiKey: 'ec-mall-cancelUserShopStaffLink',
      ...params
    }
  })
}

/**
 * 获取店铺员工列表
 */
export function findShopStaffList(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findShopStaffList',
      ...params,
      pagesize: 20
    }
  })
}

/**
 * 获取店铺员工绑定用户列表
 */
export function findShopStaffBindUserList(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findShopStaffBindUserList',
      ...params
    }
  })
}

/**
 * 获取后台限制访问用户列表
 */
export function findShopForbiddenUserList(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findShopForbiddenUserList',
      ...params
    }
  })
}

/**
 * 限制绑定员工访问
 */
export function forbidLinkUserVisit(params) {
  return request({
    data: {
      apiKey: 'ec-mall-forbidLinkUserVisit',
      ...params
    }
  })
}

/**
 * 允许绑定员工访问
 */
export function allowLinkUserVisit(params) {
  return request({
    data: {
      apiKey: 'ec-mall-allowLinkUserVisit',
      ...params
    }
  })
}

/**
 * 设置店铺自动通知配置
 */
export function setAutoNoticeConfig(params) {
  return request({
    data: {
      apiKey: 'ec-mall-setAutoNoticeConfig',
      jsonParam: {
        ...params
      }
    }
  })
}

/**
 * 获取店铺自动通知配置
 */
export function getAutoNoticeConfig(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getAutoNoticeConfig',
      jsonParam: {
        ...params
      }
    }
  })
}

/**
 * 获取客户列表
 */
export function findShopLinkUsers(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findShopLinkUsers',
      pageSize: PAGE_SIZE,
      ...params
    }
  })
}
/** 获取价格展示类型列表
 */
export function findShopPriceTypeList(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findShopPriceTypeList',
      ...params
    }
  })
}

/**
 * 设置爆款
 * @param
 * @params.mpErpId
 * @params.styleIds
 */
export function setTopStyles(params) {
  return request({
    data: {
      apiKey: 'ec-mall-topHotStyles',
      ...params
    }
  })
}

/**
 * 取消爆款
 * @param
 * @params.mpErpId
 * @params.styleIds
 */
export function unsetTopStyles(params) {
  return request({
    data: {
      apiKey: 'ec-mall-cancelHotStyles',
      ...params
    }
  })
}

/**
 * 获取店铺列表
 */
export function checkShopStaffAuth(params) {
  return request({
    data: {
      apiKey: 'ec-mall-checkShopStaffAuth',
      ...params
    }
  })
}
/**
 * 获取浏览趋势数据
 */
export function findShopDailyViewData(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findShopDailyViewData',
      jsonParam: {
        ...params
      }
    }
  })
}

/**
 * 浏览最多列表
 */
export function findShopSpuViewData(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findShopSpuViewData',
      jsonParam: {
        ...params,
        pageSize: 20
      }
    }
  })
}

/**
 * 下单最多列表
 */
export function findShopSpuBuyData(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findShopSpuBuyData',
      jsonParam: {
        ...params,
        pageSize: 20
      }
    }
  })
}

/**
 * 商家查询订单列表
 */
export function findAuditBillList(params) {
  return request({
    data: {
      apiKey: 'ec-eb-purBill-findAuditBillList',
      ...params,
      pageSize: 20
    }
  })
}

/**
 * 获取待确认订单详情
 */
export function getAuditBillDetail(params) {
  return request({
    data: {
      apiKey: 'ec-eb-purBill-getAuditBill',
      ...params
    }
  })
}

/**
 * 商家审核确认订单
 */
export function auditPassPurBill(params) {
  return request({
    data: {
      apiKey: 'ec-eb-purBill-auditPassPurBill',
      jsonParam: {
        ...params
      }
    }
  })
}
/**
 * 商家作废订单
 */
export function auditCancelPurBill(params) {
  return request({
    data: {
      apiKey: 'ec-eb-purBill-auditCancelPurBill',
      ...params
    }
  })
}

/**
 * 查询店铺数据
 */
export function getShopManageData(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getShopManageData',
      ...params
    }
  })
}

/**
 * 获取门店隔离参数
 */
export function getMarketShopIsolate(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getMarketShopIsolate',
      ...params
    }
  })
}

/**
 * 设置门店隔离参数
 */
export function setMarketShopIsolate(params) {
  return request({
    data: {
      apiKey: 'ec-mall-setMarketShopIsolate',
      ...params
    }
  })
}

/**
 * 是否是新用户第一次进入管理端
 */
export function isFirstOpenNeedGuide(params) {
  return request({
    data: {
      apiKey: 'ec-mall-isFirstOpenNeedGuide',
      ...params
    }
  })
}

/**
 * 新用户一键上架货品
 */
export function oneClickMarket(params) {
  return request({
    data: {
      apiKey: 'ec-mall-oneClickMarket',
      ...params
    }
  })
}

/**
 * 获取一键上架货品数量
 */
export function getOneClickMarketSpuCount(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getOneClickMarketSpuCount',
      ...params
    }
  })
}

/**
 *
 */
export function enableOperate(params) {
  return request({
    data: {
      apiKey: 'ec-mall-enableOperate',
      ...params
    }
  })
}

/**
 * 获取货品菊花码
 */
export function getSpuDetailQrCode(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getSpuDetailQrCode',
      ...params
    }
  })
}

/**
 * 客户管理-待审核列表
 */
export function findShopWaitAuditUsers(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findShopWaitAuditUsers',
      pageSize: 20,
      ...params
    }
  })
}

/**
 * 更改客户审核状态
 */
export function updateUserAuditFlag(params) {
  return request({
    data: {
      apiKey: 'ec-mall-updateUserAuditFlag',
      ...params
    }
  })
}

/**
 * 设置客户备注
 */
export function setRemarkForCbUserDwxxLink(params) {
  return request({
    data: {
      apiKey: 'ec-mall-setRemarkForCbUserDwxxLink',
      ...params
    }
  })
}

/**
 * 获取spu上下架记录
 */
export function findSpuMarketLog(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findSpuMarketLog',
      pageSize: 20,
      ...params
    }
  })
}

/**
 * 管理端--保存商品集合
 */
export function saveSpuGroup(params) {
  return request({
    data: {
      apiKey: 'ec-mall-saveSpuGroup',
      ...params
    }
  })
}
/**
 * 管理端--获取商品集合列表
 */
export function findSpuGroupList(params) {
  return request({
    data: {
      apiKey: 'ec-mall-findSpuGroupList',
      ...params
    }
  })
}

/**
 * 管理端--删除商品集合
 */
export function deleteSpuGroup(params) {
  return request({
    data: {
      apiKey: 'ec-mall-deleteSpuGroup',
      ...params
    }
  })
}

/**
 * 管理端--获取小程序分享合集菊花码
 */
export function getSpuGroupQrCode(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getSpuGroupQrCode',
      ...params
    }
  })
}

/**
 * 用户端--获取集合信息
 */
export function getSpuGroup(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getSpuGroup',
      ...params
    }
  })
}

/**
 * 管理端--获取小程序链接
 */
export function getSpuGroupLink(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getSpuGroupLink',
      ...params
    }
  })
}

/**
 * 管理端--获取特价商品列表
 */
export function getSpuActivity(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getSpuActivity',
      ...params
    }
  })
}

/**
 * 管理端--保存特价商品
 */
export function saveSpuActivity(params) {
  return request({
    data: {
      apiKey: 'ec-mall-saveSpuActivity',
      ...params
    }
  })
}

/**
 * 获取门店库存展示参数
 * 0: 当前  1所有
 */
export function getMarketInvSourceApi(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getMarketInvSource',
      ...params
    }
  })
}

/**
 * 设置门店库存展示参数
 * 0: 当前  1所有
 */
export function setMarketInvSourceApi(params) {
  return request({
    data: {
      apiKey: 'ec-mall-setMarketInvSource',
      ...params
    }
  })
}

/**
 * 设置商品类别隐藏/显示
 */
export function setSpuClassHiddenOrShow(params) {
  return request({
    data: {
      apiKey: 'ec-mall-setSpuClassHiddenOrShow',
      ...params
    }
  })
}

/**
 * 设置多单位下单规则
 */
export function setBaseUnitOrderConversion(params) {
  return request({
    data: {
      apiKey: 'ec-mall-setBaseUnitOrderConversion',
      ...params
    }
  })
}
/**
 * 获取多单位下单规则
 */
export function getBaseUnitOrderConversion(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getBaseUnitOrderConversion',
      ...params
    }
  })
}
