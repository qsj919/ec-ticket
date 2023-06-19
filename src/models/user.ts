import Taro, { ENV_TYPE, getEnv, getLaunchOptionsSync } from '@tarojs/taro'
import { Model } from '@@types/dva'
import {
  fetchUserData,
  verifyPhone,
  checkGrayV2,
  verifyWechatPhone,
  getUserInfo
} from '@api/apiManage'
import { LinkShop } from '@@types/base'
import {
  fetchBuyGoodsStatistics,
  fetchUserParams,
  updateUserParams,
  loginByWx,
  loginByPhone,
  updateUserNickNameAndAvatar,
  authShopStaff
} from '@api/user_api_manager'
import { moneyInShort, urlQueryParse } from '@utils/utils'
import { fetchShopById } from '@api/shop_api_manager'
import navigatorSvc from '@services/navigator'
import dict, { UserParams } from '@constants/dict'
import myLog from '@utils/myLog'
import { setBaseUrl, setCommonParams } from '@utils/request'
import messageFeedback from '@services/interactive'
import { WX_PUBLIC_SCENE, storage, APP_VERSION } from '@constants/index'
import * as Sentry from 'sentry-miniapp'
import config from '@config/config'
import { checkShopStaffAuth, fetchSizeGroupOrder } from '@api/goods_api_manager'
import goodsSvc from '@services/goodsSvc'
import { getAccountInfoSync } from '@utils/cross_platform_api'
import { encryptCode } from '@utils/cryptUtils'

const initialState = {
  productVersion: 'normal' as 'normal' | 'weChatAudit',
  id: -1,
  nickName: '',
  phone: '',
  avatar: '',
  phoneList: [] as string[],
  relativeShopList: [] as string[],
  shopListRelativeToPhone: [] as LinkShop[],
  bindPhoneFail: false,
  sessionId: '',
  sessionKey: '',
  mpUserId: '',
  wxOpenId: '',
  grayFunc: {
    // 与接口中的funcCode参数保持一致
    mobileVerify: 0
  },
  subscribe: '0',
  buyGoodsData: [
    { label: '拿货', value: 0, ringRatio: '0%' },
    { label: '付款', value: 0, ringRatio: '0%' },
    { label: '总数', value: 0, ringRatio: '0%' },
    { label: '件单价', value: 0, ringRatio: '0%' }
  ],
  pushAll: true, //  推送全部小票
  noAuth: false, // 无认证的情况
  logining: getEnv() !== ENV_TYPE.WEB, // 是否登陆中，如果成功过一次则永久为false
  requireFollowPublic: false,
  newStyle: '0',
  mpAppId: config.wxAppId,
  userParams: {
    mp_ticket_bill_push: '1',
    mp_ticket_bill_new_style: '0',
    mp_ticket_bill_use_big_font: '0',
    mp_ticket_push_logis_msg: '1'
  } as UserParams,
  retryGetPhoneNumber: false,
  independentMpErpId: -1
}

export type UserState = typeof initialState

const userModel: Model<UserState> = {
  namespace: 'user',
  state: initialState,
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    }
  },
  effects: {
    *login({ payload }, { call, put, select }) {
      setCommonParams({ appVersion: APP_VERSION })
      myLog.log('effects/login!')
      let refreshSessionOnly = false
      if (payload && payload.refreshSessionOnly) {
        refreshSessionOnly = payload.refreshSessionOnly
      }
      if (!refreshSessionOnly) {
        yield put({ type: 'save', payload: { logining: true } })
      }
      const account = getAccountInfoSync()
      const maAppId = account.miniProgram.appId

      if (payload && payload.phone) {
        const { data } = yield call(loginByPhone, payload.phone)
        yield put({
          type: 'save',
          payload: { sessionId: data.sessionId, subscribe: String(data.extProps.subscribe) }
        })
        yield put({ type: 'onGotSession', sessionId: data.sessionId })
        Taro.switchTab({ url: '/pages/eTicketList/index' })
        yield put({ type: 'save', payload: { logining: false } })
      } else {
        let res, e, code
        try {
          res = yield call(Taro.login)
          if (!res.code) {
            e = new Error(res.errMsg)
          }
        } catch (error) {
          e = error
        }
        if (e) {
          const retryCount = (payload && payload.retryCount) || 1
          if (retryCount < 3) {
            yield put({ type: 'login', payload: { retryCount: retryCount + 1 } })
          } else {
            messageFeedback.showAlert('微信登录失败，请重启小程序重试')
          }
          myLog.error(`微信登录失败: ${e.errMsg}，重试次数${retryCount}`)
          return
        } else {
          code = res.code
        }
        try {
          let res, iv, encryptedData
          // @ts-ignore
          // eslint-disable-next-line no-undef
          const options: getLaunchOptionsSync.Return = wx.getEnterOptionsSync()
          let { mpAppId } = yield select(state => state.user)
          try {
            const res = yield call(Taro.getUserInfo)
            iv = res.iv
            encryptedData = res.encryptedData
          } catch (e) {
            // 未授权
            console.log(e, 'error')
          }
          const commonParams: any = {
            maAppId,
            code: encryptCode(code),
            mpUserId: options.query.mpUserId,
            pubKeyVer: 'V2'
          }
          if (WX_PUBLIC_SCENE.includes(options.scene)) {
            commonParams.mpAppId = options.referrerInfo.appId
            mpAppId = options.referrerInfo.appId
          }
          const { source } = options.query
          let params = { ...commonParams }
          // 来源为短信时
          if (String(source) === '5') {
            params = { ...params, ...options.query }
          }
          if (iv) {
            params = { ...params, iv, encryptedData }
          }
          try {
            res = yield call(loginByWx, { ...params })
          } catch (e) {
            const retryCount = (payload && payload.retryCount) || 1
            if (retryCount < 3) {
              yield put({ type: 'login', payload: { retryCount: retryCount + 1 } })
            } else {
              messageFeedback.showAlert('微信登录失败，请检查网络并重启小程序重试')
            }
            myLog.error(`登录api失败: ${e.errMsg || e.message}，重试次数${retryCount}`)
            return
          }
          const { data } = res
          let requireFollowPublic = false
          if (options.query.q) {
            if (urlQueryParse(decodeURIComponent(options.query.q)).from === 'auth') {
              requireFollowPublic = true
            }
          }
          if (data.sessionId) {
            if (data.extProps.slbBizUrl) {
              setBaseUrl(data.extProps.slbBizUrl)
            }
            Sentry.setUser({ id: data.userId, username: data.userName, wxOpenId: data.wxOpenId })
            yield put({
              type: 'save',
              payload: {
                sessionId: data.sessionId,
                subscribe: String(data.extProps.subscribe),
                mpUserId: data.userId,
                mpAppId,
                phone: data.mobile,
                sessionKey: data.extProps.sessionKey,
                independentMpErpId: data.extProps.mpErpId,
                wxOpenId: data.wxOpenId,
                productVersion: data.productVersion || 'normal'
              }
            })
            yield put({
              type: 'onGotSession',
              sessionId: data.sessionId,
              refreshSessionOnly: payload && payload.refreshSessionOnly
            })
            yield put({ type: 'fetchGrayFunc' })
          } else {
            yield put({
              type: 'save',
              payload: { noAuth: true, logining: false, requireFollowPublic }
            })
          }
        } catch (e) {
          Taro.hideLoading()
        }
      }
    },
    *fetchUserData({ payload }, { call, put, select }) {
      const { sessionId } = yield select(state => state.user)
      // const params = payload || { sessionId }
      const { data } = yield call(fetchUserData, { sessionId })
      const savePayload: any = {
        avatar: data.headimgurl,
        nickName: data.nickName
      }
      // if (data.phone) {
      savePayload.phone = data.phone
      // } else {
      const phoneList = (data.associatePhones && data.associatePhones.split(',')) || []
      const relativeShopList = (data.associateShops && data.associateShops.split(',')) || []
      savePayload.phoneList = phoneList
      savePayload.relativeShopList = relativeShopList
      savePayload.id = data.id
      savePayload.mpUserId = data.id
      // }
      yield put({ type: 'save', payload: savePayload })
      Taro.eventCenter.trigger('FETCH_USER_DATA')
    },
    *verifyPhone({ payload }, { call, put }) {
      const { wechat, from, needRedirect = false, ...params } = payload
      const apiFunction = wechat ? verifyWechatPhone : verifyPhone
      const { data: { rows } = { rows: [] } } = yield call(apiFunction, params)

      // yield put({ type: 'fetchShopListWithPhone', payload: { phone } })
      const ids = rows.join(',')
      yield put.resolve({ type: 'fetchUserData' })
      yield put({ type: 'shop/fetchShopList' })
      if (ids) {
        const { data } = yield call(fetchShopById, ids)
        yield put({ type: 'save', payload: { shopListRelativeToPhone: data.rows } })
        if (from === 'search') {
          navigatorSvc.redirectTo({ url: '/pages/shop_search/index' })
        } else if (needRedirect) {
        } else {
          navigatorSvc.redirectTo({ url: '/subpackages/mine/pages/bind_phone_success/index' })
        }
      } else {
        return true
      }
      Taro.hideLoading()
    },
    *bindPhone({ payload }, { call, put }) {
      const {
        data: { rows }
      } = yield call(verifyWechatPhone, payload)
      return rows
    },
    *getUserInfo({ payload }, { call, put }) {
      const { data } = yield call(getUserInfo, payload)
      return data
    },
    *authShopStaff({ payload }, { call, select }) {
      // try {
      const { phone } = yield select(state => state.user)
      const { mpErpId } = payload
      Taro.hideLoading()
      if (phone) {
        const { data } = yield call(checkShopStaffAuth, { mpErpId, ...payload })
        if (data.staff && data.staff.flag == 0) {
          yield call(authShopStaff, mpErpId)
        }
      } else {
        yield call(authShopStaff, mpErpId)
      }
      // } catch (error) {
      //   messageFeedback.showAlert(error.message)
      // }
    },
    *fetchGrayFunc({ payload }, { call, put }) {
      const { data } = yield call(checkGrayV2, payload)
      // if (data.val === 1) {
      //   Taro.showTabBar()
      // }
      yield put({ type: 'save', payload: { grayFunc: { mobileVerify: data.val } } })
    },
    *fetchBuyGoodsData({ payload }, { call, put, select }) {
      const { type } = payload
      const { data } = yield call(fetchBuyGoodsStatistics, type)
      const buyGoodsData = [
        {
          value: moneyInShort(data.totalSum.val),
          ringRatio: data.totalSum.ringRatio,
          label: '拿货'
        },
        { value: moneyInShort(data.paySum.val), ringRatio: data.paySum.ringRatio, label: '付款' },
        {
          value: `${moneyInShort(data.styleNum.val)}款${moneyInShort(data.totalNum.val)}件`,
          ringRatio: data.totalNum.ringRatio,
          label: '总数'
        },
        {
          value: moneyInShort(data.unitPrice.val),
          ringRatio: data.unitPrice.ringRatio,
          label: '件单价'
        }
      ]
      yield put({ type: 'save', payload: { buyGoodsData } })
    },
    *fetchUserParams(_, { call, put }) {
      const { data } = yield call(fetchUserParams)
      const pushSetting = data.rows.find(item => item.code === dict.mp_ticket_bill_push)
      const newStyleData = data.rows.find(item => item.code === dict.mp_ticket_bill_new_style)
      const userParams = data.rows.reduce((prev, cur) => {
        prev[cur.code] = cur.val
        return prev
      }, {})

      const newStyle = newStyleData ? newStyleData.val : '0'
      yield put({
        type: 'save',
        payload: {
          pushAll: pushSetting ? pushSetting.val === '1' : true,
          newStyle,
          userParams
        }
      })
      Taro.setStorage({ key: storage.USER_PARAMS, data: userParams })
    },
    *updateUserParams({ payload }, { call, put }) {
      yield call(updateUserParams, payload)
      yield put({ type: 'fetchUserParams' })
    },
    *updateNickNameAndAvatar({ payload }, { call, put, select }) {
      const { forceUpdate = true, ...params } = payload
      const { nickName } = yield select(state => state.user)
      if (nickName !== '' && payload.nickName === '微信用户' && !forceUpdate) return
      yield call(updateUserNickNameAndAvatar, { jsonParam: { ...params } })
      yield put({ type: 'fetchUserData' })
    },
    *onGotSession({ sessionId, refreshSessionOnly = false }, { put }) {
      setCommonParams({ sessionId, appVersion: APP_VERSION })
      yield put({ type: 'save', payload: { noAuth: false, logining: false } })
      if (refreshSessionOnly) return
      yield put({ type: 'shop/fetchShopList' })
      yield put({ type: 'fetchUserData' })
      yield put({ type: 'fetchUserParams' })
    }
  }
}

export default userModel
