import Taro from '@tarojs/taro'
import { Model } from '@@types/dva'
import { getShopList, cancelAttention } from '@api/apiManage'
import { Shop } from '@@types/base'
import { getShopParamVal } from '@api/goods_api_manager'
import { t } from './language'

const order = {
  1: '0',
  2: '1',
  '-1': '2',
  '0': '3'
}

export interface ShopState {
  list: Shop[]
  shopListLoaded: boolean
  searchList: Shop[]
  cloudBillOpenList: Shop[]
  cloudBillCloseList: Shop[]
  /**
   * 存储店铺参数
   */
  shopParams: Map<number, object>
}

const shopModel: Model<ShopState> = {
  namespace: 'shop',
  state: {
    list: [],
    shopListLoaded: false,
    searchList: [],
    cloudBillCloseList: [],
    cloudBillOpenList: [],
    shopParams: new Map()
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    },
    // 标记/取消标记是否为新店铺
    tagShopIsNew(state, { payload }) {
      const { idList, isNew = true } = payload
      const list = state.list.map(shop => {
        const flag = idList.includes(shop.id) && isNew
        return { ...shop, isNew: flag }
      })
      return { ...state, list }
    }
  },
  effects: {
    *fetchShopList({ payload }, { call, put }) {
      const res = yield call(getShopList, payload)
      const shopList: Shop[] = [
        ...(res.data.cloudBillOpenList || []),
        ...(res.data.cloudBillCloseList || [])
      ]
      // shopList.sort((a, b) => {
      //   // 不是商陆花，直接排后面
      //   if (a.saasType !== 1) {
      //     return 1
      //   }
      //   // 根据云单状态来排序
      //   let result = order[String(a.cloudBillFlag)] - order[String(b.cloudBillFlag)]
      //   // 如果状态相同，根据收藏、logo排序
      //   if (result === 0) {
      //     result = (b.showOrder || 0) - (a.showOrder || 0)
      //     if (result === 0) {
      //       result = a.logoUrl ? -1 : 1
      //     }
      //   }
      //   return result
      // })
      yield put({
        type: 'save',
        payload: {
          list: shopList || [],
          shopListLoaded: true,
          cloudBillOpenList: res.data.cloudBillOpenList,
          cloudBillCloseList: res.data.cloudBillCloseList
        }
      })
    },
    *unfollow({ payload }, { call, put }) {
      const res = yield call(Taro.showModal, {
        title: t('unfollowModalTitle'),
        content: t('unfollowModalContent'),
        confirmText: t('confirm'),
        cancelText: t('cancel')
      })
      const { sn, epid, shopid } = payload
      if (res.confirm) {
        yield call(cancelAttention, { sn, epid, shopid, flag: 1 })
        yield put({ type: 'fetchShopList' })
      }
    },
    *fetchShopParams({ payload }, { call, put, select }) {
      const { shopParams } = yield select(state => state.shop)
      const { data } = yield call(getShopParamVal, {
        code: 'order_by_group',
        mpErpId: payload.mpErpId
      })
      const item = shopParams.get(payload.mpErpId)
      if (item) {
        item.order_by_group = data.val
      } else {
        shopParams.set(payload.mpErpId, { order_by_group: data.val })
      }
    }
  }
}

export default shopModel
