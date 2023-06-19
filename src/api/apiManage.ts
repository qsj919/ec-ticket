/*
 * @Author: HuKai
 * @Date: 2019-08-26 14:57:21
 * @Last Modified by: Miao Yunliang
 */
import { getWxConfigUrl } from '@services/url'
import { getRequestBaseUrl } from '@utils/cross_platform_api'
import { PAGE_SIZE } from '@constants/index'
import { decryptDetailAPi } from '@utils/cryptUtils'
import Taro from '@tarojs/taro'
import dva from '@utils/dva'
import myLog from '@utils/myLog'
// import { detailApiEncode } from '@utils/utils'
import request from '../utils/request'
import config from '../config/config'

let url = '/slb/api.do'

// ec-shareMpSaleBillTicketPreview
/**
 * @Description: 获取小票详情预览页面数据
 * @param pk 单据id
 * @param sn 编号
 * @param epid 账套id
 * @param saasType 1/2代标示
 * @param phone 手机号
 */
export function getETicketDetailPreview(params: object) {
  return request({
    // url: `${baseUrl}/slb/api.do`,
    url,
    data: {
      apiKey: 'ec-shareMpSaleBillTicketPreview',
      ...params
    }
  })
}

/**
 * @Description: 获取款号拿货统计
 * @param sn 编号
 * @param epid 账套id
 * @param styleid 款号id
 * @param sessionId 公众号用户id
 */

export function getGoodsDetail(params: object) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-dresStyleSaleTicket',
      ...params
    }
  })
}

/**
 * @Description: 解绑/恢复 微信用户与门店的绑定状态
 * @param sn 编号
 * @param epid 账套id
 * @param shopid 款号id
 * @param sessionId 公众号用户id
 * @param flag 绑定状态 0 绑定， 1 解绑
 */
export function cancelAttention(params: object) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-updateMpUserLinkFlag',
      ...params
    }
  })
}
/**
 * @Description: 获取保存二维码
 * @param billid 单据id
 * @param epid 账套id
 * @param sn 编号
 * @param type 单据类型 1 销售单 2 销售订单
 */
export function getMpQrcode(params: object) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-getQrcode',
      ...params
    }
  })
}

/**
 * @Description: 获取小票列表
 * @param sessionId	公共号用户id
 * @param sn 编号
 * @param epid	账套id
 * @param shopid	门店id
 * @param pageOffset	偏移记录数
 * @param pageRows	查询记录数
 */
export function getETicketList(params: object) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-shareBillList',
      pageRows: 20,
      search_count: 1,
      ...params
    }
  })
}

/**
 *
 * @param params 参数
 * @param {number} params.pageSize
 * @returns
 */
export function getUnionTicketList(params: {
  searchKey?: string
  prodateGte?: string
  prodateLte?: string
  pageSize?: number
  pageNo?: number
}) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-findEsShareBillList',
      pageSize: PAGE_SIZE,
      ...params
    }
  })
}

/**
 *
 * @param params 参数
 * @param {number} params.pageSize
 * @returns
 */
export function getEsDresList(params: { searchKey?: string; orderBy?: string; pageNo: number }) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-findEsDresList',
      pageSize: 20,
      orderByDesc: true,
      ...params
    }
  })
}

/**
 * @Description: 拿货汇总统计
 * @param sessionId	公共号用户id
 * @param sn 编号
 * @param epid	账套id
 * @param shopid	门店id
 * @param prodate1	发生日期从
 * @param prodate2	到
 * @param charttype	1 款号,2 类别, 3 颜色, 4 尺码
 * @param pageOffset	偏移记录数
 * @param pageRows	查询记录数
 */
export function getETicketStatic(params: object) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-shareBillStatic',
      pageRows: 20,
      ...params
    }
  })
}

/**
 * @Description: 获取订单列表
 * @param sessionId	公共号用户id
 */
export function getOrderList(params: object) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-purBill-list',
      pageSize: 20,
      ...params
    }
  })
}
/**
 * @Description: 用户作废订单
 * @param sessionId	公共号用户id
 */
export function purBillCancel(billId: number) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-purBill-cancel',
      billId
    }
  })
}
/**
 * @Description: 用户作废订单
 * @param sessionId	公共号用户id
 */
export function orderAddShoppingCart(billId: number) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-purBill-addShoppingCart',
      billId
    }
  })
}

/**
 * @Description: 用户作废订单
 * @param sessionId	公共号用户id
 */
export function orderAddShoppingCartSingle(params: any) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-shoppingCar-save',
      ...params
    }
  })
}

/**
 * @Description: 获取订单详情
 * @param billId	id
 */
export function getOrderDetailList(params: object) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-purBill-get',
      pageSize: 20,
      ...params
    }
  })
}

/**
 * @Description: 获取订单详情
 * @param billId	id
 */
export function getPartSendOrderList(params: object) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-purBill-findDeliverBillList',
      // pageSize: 20,
      ...params
    }
  })
}

/**
 * @Description: 获取订单统计数据
 * @param billId	id
 */
export function getOrderListNum() {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-purBill-getUserBillData'
    }
  })
}

/**
 * @Description: 获取门店列表
 * @param sessionId	公共号用户id
 */
export function getShopList(params?: object) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-findErpShopList',
      ...params
    }
  })
}
/**
 * @Description: 获取门店列表
 * @param sessionId	公共号用户id
 */
export function getTodayShopList(params?: object) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-findCloudBillShopMarketData',
      pageSize: 20,
      ...params
    }
  })
}

/**
 * @Description: 获取多单合并小票
 * @param sn 编号
 * @param epid 账套id
 * @param shopid 门店id
 * @param sessionId 公众号用户id
 * @param prodate1	开始时间
 * @param prodate2	结束时间
 */

export function getMergeBillData(params: object) {
  return request({
    // url: `${baseUrl}/slb/api.do`,
    url,
    data: {
      apiKey: 'ec-mp-shareMergeSaleBillTicket',
      ...params
    }
  })
}

/**
 * 获取微信JS-SDK wx.config接口所需参数
 */
export function getWXConfigParams() {
  return request({
    url: config.wxmpServer,
    data: {
      apiKey: 'ec-weixin-mp-sign',
      appId: config.wxAppId,
      url: getWxConfigUrl() ? getWxConfigUrl() : document.URL.split('#')[0]
    }
  })
}

/**
 * @description 对账单——头部汇总数据
 * @param  sessionId	string
 * @param sn	string	是	编号
 * @param epid	string	是	账套id
 * @param shopId	string	是	slh店铺id
 * @param startDate	string	是	开始日期 yyyy-MM-dd
 * @param endDate	string	是	结束日期 yyyy-MM-dd
 */
export function getStatementCommon(params: object) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-ticketAccountCheckCommon',
      ...params
    }
  })
}

/**
 * @description 对账单——按明细
 * @param  sessionId	string
 * @param sn	string	是	编号
 * @param epid	string	是	账套id
 * @param shopId	string	是	slh店铺id
 * @param startDate	string	是	开始日期 yyyy-MM-dd
 * @param endDate	string	是	结束日期 yyyy-MM-dd
 * @returns {lstSalesByDetail: [] , lstBackByDetail: []} 2个列表，进货 & 退货
 */
export function getStatementByDetail(params: object) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-ticketAccountCheckByDetail',
      ...params
    }
  })
}

/**
 * @description 对账单——按单据
 * @param  sessionId	string
 * @param sn	string	是	编号
 * @param epid	string	是	账套id
 * @param shopId	string	是	slh店铺id
 * @param startDate	string	是	开始日期 yyyy-MM-dd
 * @param endDate	string	是	结束日期 yyyy-MM-dd
 * @param searchType	int	是	搜索类型 0=全部单据 1=欠款单据 2=已结清单据
 */

export function getStatementByReceipt(params: object) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-ticketAccountCheckByBill',
      ...params
    }
  })
}

/**
 * 重命名店铺名称
 * @param params 参数
 * @param params.sessionId	long	是	用户id
 * @param params.mpErpId	long	是	小票店铺id
 * @param params.shopName	string	是	店铺名称, 取消设置时设置空字符
 */
export function renameShopName(params: object) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-userShop-setShopName',
      ...params
    }
  })
}

/**
 * 修改店铺置顶状态
 * @param params 参数
 * @param params.sessionId	long	是	用户id
 * @param params.mpErpId	long	是	小票店铺id
 * @param params.showOrder	string	是	1=设置星标. 0=取消星标
 */
export function toggleStarShop(params: object) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-userShop-setShowOrder',
      ...params
    }
  })
}

/**
 * 发送短信验证码
 * @param phone 手机号
 */
export function sendSmsCode(phone: number | string) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-sendCode',
      phone
    }
  })
}

/**
 * 验证手机号
 * @param params.sessionId 用户id
 * @param params.phone 手机号
 * @param params.captcha 验证码
 */
export function verifyPhone(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-verifyCode',
      ...params
    }
  })
}

/**
 * 微信绑定手机号 会重试2次
 * @param params.iv 加密算法的初始向量
 * @param params.encryptedData 加密数据
 *
 */
export function verifyWechatPhone(params) {
  let { retryCount = 0, ..._params } = params
  // const { user } = dva.getState()
  return Taro.checkSession()
    .then(() => {
      myLog.log('sessionKey未过期，发起绑定请求')

      return request(
        {
          url,
          data: {
            apiKey: 'ec-mp-bindWxAppPhone',
            ..._params
          }
        },
        { slient: retryCount >= 2 }
      )
    })
    .catch(() => {
      retryCount += 1
      myLog.log(`sessionKey失效 重新登陆，重试次数${retryCount}`)
      if (retryCount <= 2) {
        return dva
          .getDispatch()({ type: 'user/login', payload: { refreshSessionOnly: true } })
          .then(() => {
            verifyWechatPhone({ ...params, retryCount })
          })
        // .then(() => {
        //   return dva.getDispatch()({
        //     type: 'user/save',
        //     payload: {
        //       retryGetPhoneNumber: true
        //     }
        //   })
        // })
      }
    })
}

/**
 * @deprecated
 * 根据手机号查找关联店铺
 * @param params.phone 手机号
 * @param params.sessionId 用户id
 */
export function queryShopListByPhone(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-findShopsByPhone',
      ...params
    }
  })
}

/**
 * @deprecated  服务端自己调
 * 关联用户和店铺
 * @param params.links 店铺列表
 * @param params.sessionId 用户id
 */
// export function combineUserAndShops(params: {
//   sessionId: string
//   links: Array<{ mpErpId: number; dwId: number; dwOrigId: number }>
// }) {
//   return request({
//     url,
//     data: {
//       apiKey: 'ec-mp-saveShopDwxxLinks',
//       ...params
//     }
//   })
// }

/**
 * 查询用户数据
 * @param params.sessionId 用户id
 */
export function fetchUserData(params: { sessionId: string }) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-getUserById',
      ...params
    }
  })
}

/**
 * 查询是否为某功能的灰度用户
 * @param params.sessionId 用户id
 * @param params.funcCode 功能编码
 */
export function checkGray(params: { sessionId: string; funcCode: string }) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-checkGray',
      ...params
    },
    hideErrorMessage: true
  })
}
/**
 * 查询是否为某功能的灰度用户
 * @param params.sessionId 用户id
 * @param params.funcCode 功能编码
 */
export function checkGrayV2(params: { sessionId: string; funcCode: string }) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-checkGrayV2',
      ...params
    },
    hideErrorMessage: true
  })
}

/**
 * 反馈接口
 */
export function feedbackWithDing(feedback: string) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-feedback',
      feedback
    }
  })
}

/**
 * 获取省市列表
 * @param parentCode 为0时返回省份列表
 */
export function fetchProvinceAndCity(parentCode = 0, hotCity = 0) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-getAddressCodes',
      parentCode,
      hotCity
    }
  })
}

/**
 * 获取物流商列表
 */
export function fetchExpressProvider() {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-logis-provider-list',
      pageSize: 0,
      cap: 1
    }
  })
}

/**
 * 获取物流商列表
 */
export function findExpressProviderByNumber(number: string) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-logis-autoNumber',
      number // 单号
    }
  })
}

/**
 * 订阅物流轨迹
 * @param number 单号
 * @param company 公司名
 */
export function combineExpress(
  number: string | number,
  logisCompId: string | number,
  { pk, epid, sn }
) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-logis-subscribe',
      billId: pk,
      epid,
      sn,
      number,
      logisCompId
      // jsonParam: {
      //   number,
      //   company
      // }
    }
  })
}

/**
 * 查询物流轨迹
 * @param number 单号
 */
export function fetchExpressTrack(number: string | number, providerId: string) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-logis-getTrackInfo',
      number,
      providerId
    }
  })
}

/**
 * 获取图片下载地址
 * @param params {sn , epid, styleids}
 */
export function fetchImageUrls(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-findStyleDoc',
      ...params
    }
  })
}

/**
 * 获取抽奖活动详情
 */
export function fetchActivityDetail(activityId: number | string) {
  return request({
    url,
    data: {
      apiKey: 'ec-activity-getActivityInfo',
      activityId
    }
  })
}

/**
 * 参与抽奖
 */
export function joinPrizeActivity(activityId: number | string) {
  return request({
    url,
    data: {
      apiKey: 'ec-activity-drawPrize',
      activityId
    }
  })
}

/**
 * 获取活动中奖记录
 */
export function fetchPrizeRecord(activityId: number | string) {
  return request({
    url,
    data: {
      apiKey: 'ec-activity-findUserWinPrizeRecs',
      activityId
    }
  })
}

export function getTxCloudSign() {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-getTxCloudSign'
    }
  })
}

export function recordVideoPlay(params) {
  return request(
    {
      url,
      data: {
        apiKey: 'ec-mall-recordUserViewVideo',
        ...params
      }
    },
    { slient: true }
  )
}

/**
 * 开启云单
 */
export function openToBiz(mpErpId, mktToken) {
  return request({
    url: config.amktServer,
    data: {
      apiKey: 'ec-mp-cloudBill-openToBiz',
      bizShopIds: mpErpId,
      flag: 1,
      needMarket: 0,
      mktToken,
      sessionId: undefined
    }
  })
}

/**
 * 获取用户最后一次进入管理端的店铺
 */
export function getLastEnterShop() {
  return request({
    data: {
      apiKey: 'ec-mall-getLastEnterShop'
    }
  })
}

/**
 * 检查手机号是否和老板端一致
 */
export function checkPhoneNumberWithBoss(params) {
  let url = 'https://hzdev.hzdlsoft.com/confc/wx/biz/bossCheck'
  if (process.env.PRODUCT_ENVIRONMENT === 'product') {
    url = 'https://cc.hzecool.com:7580/confc/wx/biz/bossCheck'
  }
  return request({
    url: url,
    data: {
      ...params
    }
  })
}

/**
 * 消息推送检查是否已授权
 */
export function checkBossPublicAuth(params) {
  let url = 'https://hzdev.hzdlsoft.com/confc/wx/biz/bossCheckFlag'
  if (process.env.PRODUCT_ENVIRONMENT === 'product') {
    url = 'https://cc.hzecool.com:7580/confc/wx/biz/bossCheckFlag'
  }
  return request({
    url: url,
    data: {
      ...params
    }
  })
}

/**
 * 日营业报表
 */
export function getDailyReportData(params, cid) {
  let url = `https://optest.hzecool.com/slh/api.do?_cid=${cid}`
  if (process.env.PRODUCT_ENVIRONMENT === 'product') {
    url = `https://op.hzecool.com/slh/api.do?_cid=${cid}`
  }
  return request({
    url,
    data: {
      apiKey: 'ec-getDailyReportData',
      ...params
    }
  })
}

export function getRegisterMerchantParam(params) {
  return request({
    data: {
      apiKey: 'ec-mall-getRegisterMerchantParam',
      ...params
    }
  })
}

/**
 * 获取支付参数
 */
export function launchOrderPay(params) {
  return request({
    data: {
      apiKey: 'ec-mall-launchOrderPay',
      ...params
    }
  })
}

/**
 * 更新退款状态
 */
export function updateOrderRefundStatus(params) {
  return request({
    data: {
      apiKey: 'ec-mall-updateOrderRefundStatus',
      ...params
    }
  })
}

/**
 * 查询订单支付状态
 */
export function getSimple(params) {
  return request({
    data: {
      apiKey: 'ec-eb-purBill-getSimple',
      ...params
    }
  })
}

/**
 * 保存 领取小票
 */
export function ticketLink(params) {
  return request({
    data: {
      apiKey: 'ec-slb-ticket-link',
      ...params
    }
  })
}

/*
 * 视频号订单确认收货
 */
export function confirmReceive(params) {
  return request({
    data: {
      apiKey: 'ec-mall-confirmReceive',
      ...params
    }
  })
}

/*
 * 用户截图事件
 */
export function reportScreenCapture(params) {
  return request(
    {
      data: {
        apiKey: 'ec-mp-buryPointForTicketScreenShot',
        ...params
      }
    },
    { slient: true }
  )
}

/**
 * 用户申请开店记录
 */
export function createRecord(params) {
  return request({
    data: {
      apiKey: 'ec-mp-req-createRecord',
      ...params
    }
  })
}

/**
 * 食品版礼品卡兑换
 */
export function giftTicketGetMat(params) {
  return request({
    data: {
      apiKey: 'ec-slb-getGiftTicketMat',
      ...params
    }
  })
}
/**
 * ec-mp-getUserInfo
 */

export function getUserInfo(params) {
  return request({
    data: {
      apiKey: 'ec-mp-getUserInfo',
      ...params
    }
  })
}
