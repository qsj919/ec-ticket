import { createSelector } from 'reselect'
import { GlobalState } from '@@types/model_state'

const statementSelector = (state: GlobalState) => state.statement
const shopListSelector = (state: GlobalState) => state.shop.list
const shopSearchKeySelector = (state: GlobalState) => state.statement.shopSearchKey
export const getActiveShop = createSelector(
  statementSelector,
  shopListSelector,
  shopSearchKeySelector,
  (statement, shopList, key) => {
    // return shopList[statement.activeShopIndex]
    const _shopList = shopList.filter(shop => {
      if (key) {
        return shop.shopName.includes(key)
      }
      return true
    })

    return _shopList[statement.activeShopIndex]
  }
)

export const shopFilteredList = (state: GlobalState) => {
  const list = state.shop.list
  const key = state.statement.shopSearchKey
  return list.filter(shop => {
    if (key) {
      return shop.shopName.includes(key)
    }
    return true
  })
}
