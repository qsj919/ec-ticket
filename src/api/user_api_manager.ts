import request from '../utils/request'

let url = '/slb/api.do'

/**
 * 微信登录
 * @param params.code 凭证 code 和iv + data 2选1
 * @param params.iv
 * @param params.encryptedData
 */
export function loginByWx(params) {
  let _apiKey = 'ec-eb-loginByApp'
  if (process.env.INDEPENDENT === 'independent' || process.env.INDEPENDENT === 'foodindependent') {
    _apiKey = 'ec-mall-independent-login'
  }
  return request(
    {
      url,
      data: {
        apiKey: _apiKey,
        ...params,
        sessionId: '' // 登陆不需要session
      }
    },
    { slient: true, disableRetry: true }
  )
}

/**
 * 手机号登录
 * @param phone 手机号
 */
export function loginByPhone(phone: string) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-loginByPhone',
      phone
    }
  })
}

/**
 * 获取用户拿货数据
 * 已废弃
 * @param type 0代表7天 1代表30天 默认0
 */
export function fetchBuyGoodsStatistics(type: 0 | 1) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-getGoodsStat',
      type
    }
  })
}

/**
 * 获取session 临时接口 添加于 2019.11.25
 * 服务端去除mpUserId参数,转用sessionId
 * 这个接口是为了兼容历史推送小票
 * @param mpUserId 用户id
 */
export function fetchSession(mpUserId: string) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-loginByMpUserId',
      mpUserId
    }
  })
}

/**
 * 获取用户搜索记录
 * @param params.type 1为店铺搜索
 */
export function fetchUserSearchHistory(params: {
  pageNo?: number
  pageSize?: number
  type: number
  orderByDesc?: boolean
  orderBy?: string
}) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-userSearch-list',
      orderByDesc: true,
      orderBy: 'updatedDate',
      ...params
    }
  })
}

/**
 * 删除用户搜索记录
 * @param params.type 1为店铺搜索
 */
export function deleteUserSearchHistory(id: number) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-userSearch-delete',
      id
    }
  })
}

/**
 * 删除用户所有搜索记录
 * @param params.type 1为店铺搜索
 */
export function deleteUserAllSearchHistory(type: number) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-userSearch-deleteAll',
      type
    }
  })
}

/**
 * 获取用户参数
 */
export function fetchUserParams() {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-param-list'
    }
  })
}

/**
 * 修改用户参数
 * ec-mp-param-save
 * @param params.code
 * @param params.value
 */
export function updateUserParams(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-param-save',
      ...params
    }
  })
}

/**
 * 我授权的用户列表
 * @param params
 */
export function fetchMyAuthUser(params = {}) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-team-myAuthorizeList',
      ...params
    }
  })
}

/**
 * 获取授权详情
 * @param id 关联id
 */
export function fetchAuthDetail(id) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-team-teamUser',
      id
    }
  })
}

/**
 * 我取得的授权列表
 * @param params
 */
export function fetchTheUserAuthedToMe(params = {}) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-team-myJoinTeamUserList',
      ...params
    }
  })
}

/**
 * 取消授权（包括对下的授权，或者对上的被授权）
 * @param id 关联id
 */
export function unlinkAuth(id) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-team-disable',
      id
    }
  })
}

/**
 * 更新授权用户信息
 * @param params
 */
export function updateAuthUser(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-team-updateTeamUser',
      jsonParam: JSON.stringify(params)
    }
  })
}

/**
 * 绑定授权关系
 * @param teamUserId 用户id
 * @param timestamp 用户id
 */
export function applyAuth(teamUserId: string, timestamp: string) {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-team-scanCodeAuthorize',
      teamUserId,
      timestamp
    }
  })
}

/**
 * 用户补货地址
 */
export function fetchUserReplenishmentAddress() {
  return request({
    url,
    data: {
      apiKey: 'ec-eb-purBill-recentAddress'
    }
  })
}

export function updateUserNickNameAndAvatar(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-updateUserInfo',
      ...params
    }
  })
}

/**
 * 广告位
 */
export function ticketQuerySpuByShop(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-ticketQuerySpuByShop',
      ...params
    }
  })
}

/**
 * 用户是否第一次查看首页视频
 */
export function getVideoBrowseHistory(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-needAutoPlayVideo',
      ...params
    }
  })
}

/**
 * 设置用户已经第一次进入了首页视频
 */
export function setVideoBrowseHistory(params) {
  return request({
    url,
    data: {
      apiKey: 'ec-mall-recordUserViewVideo',
      ...params
    }
  })
}

/**
 * 小票详情页，获取蓄客二维码图片
 */
export function getStoreCustomerQrCodeUrl() {
  return request({
    url,
    data: {
      apiKey: 'ec-mp-getStoreCustomerQrCodeUrl'
    }
  })
}

/**
 * 判断当前用户是否为指定门店的员工，是的话进行match
 * @returns
 */
export function authShopStaff(mpErpId: string | number) {
  return request(
    {
      url,
      data: {
        apiKey: 'ec-mall-matchShopStaff',
        mpErpId
      }
    },
    { slient: true }
  )
}
