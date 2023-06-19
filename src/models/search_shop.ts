import { Model } from '@@types/dva'
import { SearchShop, ShopDetail, Goods, MallShop, BaseItem } from '@@types/base'
import { serachShop, fetchShopInfo, fetchShopGoodsList, fetchMallInfo } from '@api/shop_api_manager'
import { GlobalState } from '@@types/model_state'
import Taro from '@tarojs/taro'
import {
  fetchUserSearchHistory,
  deleteUserSearchHistory,
  deleteUserAllSearchHistory
} from '@api/user_api_manager'

const initState = {
  shopList: [] as SearchShop[], // 搜索店铺列表
  shopInfo: ({
    mainClass: []
  } as unknown) as ShopDetail, // 门店的基本信息
  goodsList: [] as Goods[], // 门店的货品列表
  mallData: {} as MallShop,
  relativeShopNames: [] as string[],
  historyWords: [] as BaseItem[],
  noMoreShop: false,
  noMoreGoods: false,
  activeCityCode: -1,
  activeProvinceCode: -1
}

export type SearchShopState = typeof initState

const searchShop: Model<SearchShopState> = {
  namespace: 'searchShop',
  state: initState,
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    },
    resetShop(state) {
      return {
        ...state,
        shopInfo: initState.shopInfo,
        mallData: initState.mallData,
        goodsList: initState.goodsList
      }
    },
    resetShopList(state) {
      return { ...state, shopList: [] }
    }
  },
  effects: {
    *fetchRelativeWords({ payload }, { call, put, select }) {
      const { jsonParam } = payload
      jsonParam.autoCompletion = 1
      const { activeProvinceCode, activeCityCode } = yield select(
        (state: GlobalState) => state.searchShop
      )
      if (activeCityCode !== -1) {
        payload.jsonParam.cityCode = activeCityCode
      }
      if (activeProvinceCode !== -1) {
        payload.jsonParam.provCode = activeProvinceCode
      }
      const { data } = yield call(serachShop, { ...payload, pageNo: 1 })
      yield put({
        type: 'save',
        payload: { relativeShopNames: data.rows.map(item => item.shopName) }
      })
    },
    // *fetchCities({ payload }, { call, put, select }) {
    //   const {
    //     data: { provinces }
    //   } = yield call(fetchCityAndMarkets, { jsonParam: { type: 0 } })
    //   const cityList = provinces.map(item => ({
    //     ...propertyNamesMap(item),
    //     children: item.subList ? item.subList.map(propertyNamesMap) : []
    //   }))
    //   yield put({ type: 'save', payload: { cityList } })
    // },
    *searchShop({ payload }, { call, put, select }) {
      const { pageNo } = payload
      const searchShopState = yield select((state: GlobalState) => state.searchShop)
      if (searchShopState.activeCityCode !== -1) {
        payload.jsonParam.cityCode = searchShopState.activeCityCode
      }
      if (searchShopState.activeProvinceCode !== -1) {
        payload.jsonParam.provCode = searchShopState.activeProvinceCode
      }
      if (pageNo === 1) {
        yield put({ type: 'save', payload: { noMoreShop: false } })
      }
      let res
      try {
        res = yield call(serachShop, { ...payload })
      } catch (e) {
        e._keepThrow = true
        throw e
      }
      const { data } = res
      let shopList
      const noMoreShop = data.rows && data.rows.length === 0
      if (pageNo && pageNo > 1) {
        shopList = [...searchShopState.shopList, ...data.rows]
      } else {
        shopList = data.rows
      }
      yield put({ type: 'save', payload: { shopList, noMoreShop } })
      yield put({ type: 'fetchHistoryWords' })
    },
    *fetchShop({ payload }, { call, put }) {
      Taro.showLoading()
      const { data }: { data: ShopDetail } = yield call(fetchShopInfo, payload.mpErpId)
      yield put({ type: 'save', payload: { shopInfo: data } })
      Taro.hideLoading()
      if (data.saasType !== 1) return
      if (data.openStyleTime > 0 || payload.preview) {
        yield put({ type: 'fetchGoodsList', payload: { mpErpId: data.id, pageNo: 1 } })
      }
      if (data.mallTenantId > 0) {
        const { data: mallData } = yield call(fetchMallInfo, data.mallTenantId)
        yield put({ type: 'save', payload: { mallData } })
      }
    },
    *fetchGoodsList({ payload }, { call, put, select }) {
      const { pageNo } = payload
      const { data } = yield call(fetchShopGoodsList, payload)
      const noMoreGoods = data.rows && data.rows.length === 0
      let goodsList
      if (pageNo && pageNo > 1) {
        let { goodsList: list } = yield select((state: GlobalState) => state.searchShop)
        goodsList = [...list, ...data.rows]
      } else {
        goodsList = data.rows
      }
      yield put({ type: 'save', payload: { goodsList, noMoreGoods } })
    },
    *fetchHistoryWords({ payload }, { call, put, select }) {
      const { data } = yield call(fetchUserSearchHistory, 1)
      const historyWords = data.rows.map(item => ({ label: item.searchContent, value: item.id }))
      yield put({ type: 'save', payload: { historyWords } })
    },
    *deleteHistoryWords({ payload }, { call, put, select }) {
      // const { value } = payload
      const value = payload && payload.value
      if (value) {
        yield call(deleteUserSearchHistory, value)
      } else {
        yield call(deleteUserAllSearchHistory, 1)
      }

      yield put({ type: 'fetchHistoryWords' })
    }
  }
}

function propertyNamesMap(item) {
  return {
    label: item.name,
    value: item.code
  }
}

export default searchShop
