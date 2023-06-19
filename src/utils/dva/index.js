import { create } from 'dva-core'
// import { createLogger } from 'redux-logger'
import createLoading from './createLoading'

let app
let store
let dispatch

export function createApp(opt) {
  // redux日志
  if (process.env.NODE_ENV === 'development') {
    // opt.onAction = [createLogger()]
  }
  app = create(opt)
  app.use(
    createLoading({
      only: [
        'cloudBill/fetchGoodsList',
        'cloudBill/fetchShopVideos',
        'goodsManage/fetchGoodsList',
        'goodsManage/fetchGoodsDetail',
        'goodsManage/init',
        'goodsManage/selectUserShopViewData',
        'goodsManage/selectUserShopSalesDetails',
        'cloudBill/selectAuditBillList'
        // 'allGoods/searchDresList',
        // 'myOrdersModel/queryMyOrdersList',
        // 'discountmodel/getDiscountList',
        // 'discovery/fetchVideoList',
        // 'shareRelayDtail/getGroupShareFullInfo',
        // 'relayMine/getHistoricalActivity',
        // 'category/getSpuList',
        // 'live/queryLiveRecordList'
      ]
    })
  )

  if (!global.registered) opt.models.forEach(model => app.model(model))
  global.registered = true
  app.start()

  store = app._store
  app.getStore = () => store

  dispatch = store.dispatch

  app.dispatch = dispatch
  return app
}

// export function storeDispatch() {
//   return app.dispatch()
// }

export default {
  createApp,
  getDispatch() {
    return app.dispatch
  },
  getState() {
    return store.getState()
  },
  app
}
