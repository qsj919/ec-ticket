import { Model } from '@@types/dva'
import { getShopList, toggleStarShop } from '@api/apiManage'
import { getActiveShop } from './selector'

export interface StatementData {
  activeShopIndex: number
  shopSearchKey: string
}

const appModel: Model<StatementData> = {
  namespace: 'statement',
  state: {
    activeShopIndex: -1,
    shopSearchKey: ''
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    }
  },
  effects: {
    *initShop({ payload = {} }, { put, select }) {
      const { shopId, cb } = payload
      const { list } = yield select(state => state.shop)
      const index = list.findIndex(shop => String(shop.shopid) === shopId)
      const activeShopIndex = index > -1 ? index : 0
      yield put({ type: 'save', payload: { activeShopIndex } })
      cb && cb()
    },
    *toggleStarShop({ payload }, { call, put, select }) {
      const globalState = yield select(state => state)
      const activeShop = getActiveShop(globalState)
      const showOrder = activeShop.showOrder === 1 ? 0 : 1
      if (activeShop) {
        yield call(toggleStarShop, {
          showOrder,
          mpErpId: activeShop.id
        })
        yield put.resolve({
          type: 'shop/fetchShopList'
        })
        const { list } = yield select(state => state.shop)
        let activeShopIndex = list.findIndex(shop => shop.id === activeShop.id)
        if (activeShopIndex === -1) activeShopIndex = 0
        yield put({ type: 'save', payload: { activeShopIndex } })
      }
    },
    *afterUnfollowShop(_, { call, put, select }) {
      yield put.resolve({ type: 'shop/fetchShopList' })
      yield put({ type: 'initShop' })
    }
  }
}

export default appModel
