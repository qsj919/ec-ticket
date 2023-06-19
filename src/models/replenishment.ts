import { Model } from '@@types/dva'
import {
  SkuForBillConfirm,
  SkuForBuy,
  SPUForBillConfirm,
  stockBarItemForBillConfirm,
  SPUForBuy,
  stockBarItem,
  Shop
} from '@@types/base'
import { fetchReplenishmentGoods, createReplenishmentOrderV2 } from '@api/shop_api_manager'
import { fetchUserReplenishmentAddress, ticketQuerySpuByShop } from '@api/user_api_manager'
import { generateHashKey } from '@utils/utils'
import { IGoodsDetail } from '@@types/GoodsType'
import {
  addToCartApi,
  deleteCartGoods,
  getCartGoodsList,
  getStockBarList,
  updateCartGoods,
  updateCartGoodsRem
} from '@api/goods_api_manager'
import messageFeedback from '@services/interactive'
import { debounce, cloneDeep } from 'lodash'
import goodsSvc from '@services/goodsSvc'
import deepCopy from 'deep-copy'
import { spusToSkuTable, getTotal, getTotalInStockBar } from '@utils/dva_helper/map_state_to_props'
import isEqual from 'lodash/isEqual'
import { VIDEO_SCENE } from '@constants/index'

const debounceUpdate = debounce(updateCartGoods, 300)

const initState = {
  lastStockBarReturnData: [],
  stockBarList: [] as stockBarItem[],
  spus: [] as SPUForBuy[],
  spusForBillDetail: [] as SPUForBillConfirm[],
  stockBarForbillDetail: [] as stockBarItemForBillConfirm[],
  stockBarTable: [],
  address: {
    province: '',
    city: '',
    county: '',
    addrDetail: '',
    receiveName: '',
    receivePhone: '',
    advertisement: {}
  },
  // sn: '',
  // epid: '',
  // dwId: -1,
  mpErpId: -1,
  // ownerId: -1,
  billId: '',
  appId: '',
  isStockBarInitGroup: false,
  isGiftCard: false,
  cardPwd: ''
  // tenantId: -1
}

export type ReplenishmentState = typeof initState

const replenishment: Model<ReplenishmentState> = {
  namespace: 'replenishment',
  state: initState,
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    },
    // 更新sku 数量、选中状态
    updateSku(state, { payload }) {
      const { spuIndex, id, ...property } = payload
      return {
        ...state,
        spus: state.spus.map((spu, spuI) => ({
          ...spu,
          skus:
            spuI !== spuIndex
              ? spu.skus
              : spu.skus.map(sku =>
                  sku.id === id
                    ? {
                        ...sku,
                        ...property
                        // num: skuIndex !== index ? sku.num : num
                      }
                    : sku
                )
        }))
      }
    },
    // 更新sku 数量、选中状态
    updateSkuInStockBar(state, { payload }) {
      const { spuIndex, shopIndex, id, ...property } = payload
      return {
        ...state,
        stockBarList: state.stockBarList.map((shop, _shopIndex) => ({
          ...shop,
          spus:
            _shopIndex !== shopIndex
              ? shop.spus
              : shop.spus.map((spu, spuI) => ({
                  ...spu,
                  skus:
                    spuI !== spuIndex
                      ? spu.skus
                      : spu.skus.map(sku =>
                          sku.id === id
                            ? {
                                ...sku,
                                ...property
                              }
                            : sku
                        )
                }))
        }))
      }
    },
    // 选中spu
    checkSpu(state, { payload }) {
      const { index, checked } = payload
      const targetSpu = state.spus[index]
      return {
        ...state,
        spus: state.spus
          .slice(0, index)
          .concat(
            [{ ...targetSpu, skus: targetSpu.skus.map(item => ({ ...item, checked })) }],
            state.spus.slice(index + 1)
          )
      }
    },
    // 选中spu
    checkSpuInStockBar(state, { payload }) {
      const { index, shopIndex, checked } = payload
      const stockBarList = cloneDeep(state.stockBarList)
      stockBarList[shopIndex].spus[index].skus.forEach(item => {
        item.checked = checked
      })
      return {
        ...state,
        stockBarList
      }
    },
    deleteSku(state, { payload }) {
      const { spuIndex, id } = payload
      const targetSpu = state.spus[spuIndex]
      targetSpu.skus = targetSpu.skus.reduce((prev, cur) => {
        id !== cur.id && prev.push(cur)
        return prev
      }, [] as SkuForBuy[])
      return {
        ...state,
        spus: state.spus.slice(0, spuIndex).concat(
          targetSpu.skus.length > 0 ? [{ ...targetSpu }] : [], // 如果sku删完，删掉spu
          state.spus.slice(spuIndex + 1)
        )
      }
    },
    deleteSkuInStockBar(state, { payload }) {
      const { shopIndex, spuIndex, id } = payload
      const targetShop = state.stockBarList[shopIndex]
      const targetSpu = targetShop.spus[spuIndex]
      targetSpu.skus = targetSpu.skus.reduce((prev, cur) => {
        id !== cur.id && prev.push(cur)
        return prev
      }, [] as SkuForBuy[])
      const targetSpus = targetShop.spus.slice(0, spuIndex).concat(
        targetSpu.skus.length > 0 ? [{ ...targetSpu }] : [], // 如果sku删完，删掉spu
        targetShop.spus.slice(spuIndex + 1)
      )
      return {
        ...state,
        stockBarList: state.stockBarList.slice(0, shopIndex).concat(
          targetSpus.length > 0 ? [{ ...targetShop }] : [], // 如果spu删完，删掉targetShop
          state.stockBarList.slice(shopIndex + 1)
        )
      }
    },
    deleteSpuInStockBar(state, { payload }) {
      const { shopIndex, spuIndex } = payload
      const targetShop = state.stockBarList[shopIndex]
      targetShop.spus = targetShop.spus.reduce((prev, cur, curIndex) => {
        spuIndex !== curIndex && prev.push(cur)
        return prev
      }, [] as SPUForBuy[])

      return {
        ...state,
        stockBarList: state.stockBarList.slice(0, shopIndex).concat(
          targetShop.spus.length > 0 ? [{ ...targetShop }] : [], // 如果spu删完，删掉shop
          state.stockBarList.slice(shopIndex + 1)
        )
      }
    },
    deleteChecked(state) {
      const spus = state.spus.reduce((prev, cur) => {
        const skus = cur.skus.filter(sku => !sku.checked)
        if (skus.length > 0) {
          prev.push({ ...cur, skus })
        }
        return prev
      }, [] as SPUForBuy[])
      return {
        ...state,
        spus
      }
    },
    deleteCheckedInStockBar(state) {
      const stockBarList = state.stockBarList.reduce((sprev, scur) => {
        const spus = scur.spus.reduce((prev, cur) => {
          const skus = cur.skus.filter(sku => !sku.checked)
          if (skus.length > 0) {
            prev.push({ ...cur, skus })
          }
          return prev
        }, [] as SPUForBuy[])

        if (spus.length > 0) {
          sprev.push({ ...scur, spus })
        }
        return sprev
      }, [] as stockBarItem[])
      return {
        ...state,
        stockBarList
      }
    },
    toggleAllChecked(state, { payload }) {
      const { checked } = payload
      return {
        ...state,
        spus: state.spus.map(spu => ({
          ...spu,
          skus: spu.skus.map(sku => ({ ...sku, checked: sku.flag === 1 ? checked : sku.checked }))
        }))
      }
    },
    toggleAllCheckedInStockBar(state, { payload }) {
      const { checked } = payload
      const stockBarList = cloneDeep(state.stockBarList)
      stockBarList.forEach(stockBarItem => {
        stockBarItem.spus.forEach(spu => {
          spu.skus.forEach(sku => {
            sku.checked = sku.flag === 1 ? checked : sku.checked
          })
        })
      })
      return {
        ...state,
        stockBarList
      }
    },
    checkShopInStockBar(state, { payload }) {
      const { shopIndex, checked } = payload
      const stockBarList = cloneDeep(state.stockBarList)
      // stockBarList[shopIndex].checked = checked;
      stockBarList[shopIndex].spus.forEach(spu => {
        spu.skus.forEach(sku => {
          sku.checked = sku.flag === 1 ? checked : sku.checked
        })
      })
      return {
        ...state,
        stockBarList
      }
    },
    // 确认下单前，将货品带到确认界面
    confirmGoods(state, { payload }) {
      const {
        goodsDetail,
        spuShowPrice = false,
        shop = { logoUrl: '', shopName: '' }
      }: { goodsDetail: IGoodsDetail; spuShowPrice?: boolean; shop: Shop } = payload
      let spusForBillDetail: SPUForBillConfirm[]
      // 列表页面直接下单
      if (goodsDetail) {
        spusForBillDetail = [
          {
            ...goodsDetail,
            skus: goodsSvc.sortSkusBySize(
              goodsDetail.skus.map(sku => ({
                ...sku,
                styleCode: goodsDetail.code,
                styleName: goodsDetail.name,
                styleImg: goodsDetail.imgUrl,
                price: spuShowPrice ? sku.price : 0,
                originPrice: sku.price
              })),
              state.mpErpId
            )
          }
        ]
      } else {
        console.log(state.spus, 'state.spus===========')
        // 从购物车下单
        spusForBillDetail = state.spus
          .map(spu => {
            const skus = spu.skus.filter(sku => sku.checked)
            return {
              ...spu,
              skus: skus.map(sku => ({
                ...sku,
                price: spuShowPrice ? sku.price : 0,
                originPrice: sku.originPrice || sku.price
              }))
            }
          })
          .filter(spu => spu.skus.length > 0)
      }
      const stockBarForbillDetail = [
        {
          spus: spusForBillDetail,
          mpErpId: state.mpErpId,
          logoUrl: shop.logoUrl,
          shopName: shop.shopName
        }
      ]

      return {
        ...state,
        spusForBillDetail,
        stockBarForbillDetail: stockBarForbillDetail
          .map(stockBarItem => {
            return {
              ...stockBarItem,
              spuTable: spusToSkuTable(stockBarItem.spus),
              totalTable: getTotal(stockBarItem.spus)
            }
          })
          .filter(stockBarItem => {
            return stockBarItem.spuTable.length
          })
      }
    },
    // 确认下单前，将货品带到确认界面
    confirmGoodsInStockBar(state, { payload }) {
      // 从购物车下单
      const stockBarForbillDetail: stockBarItemForBillConfirm[] = state.stockBarList
        .map(stockBarItem => {
          const spus = stockBarItem.spus
            .map(spu => {
              const skus = spu.skus.filter(sku => sku.checked)
              return {
                ...spu,
                skus: skus.map(sku => ({
                  ...sku,
                  price: stockBarItem.spuShowPrice ? sku.price : 0,
                  originPrice: sku.originPrice || sku.price
                }))
              }
            })
            .filter(spu => spu.skus.length > 0)
          return {
            ...stockBarItem,
            spus
          }
        })
        .filter(stockBarItem => stockBarItem.spus.length > 0)

      return {
        ...state,
        stockBarForbillDetail: stockBarForbillDetail
          .map(stockBarItem => {
            return {
              ...stockBarItem,
              spuTable: spusToSkuTable(stockBarItem.spus),
              totalTable: getTotal(stockBarItem.spus)
            }
          })
          .filter(stockBarItem => {
            return stockBarItem.spuTable.length
          })
      }
    },
    updateRemInConfirmPage(state, { payload }) {
      return {
        ...state,
        stockBarForbillDetail: state.stockBarForbillDetail.map(shop => {
          if (shop.mpErpId === payload.mpErpId) {
            shop.spus.forEach(spu => {
              if (spu.id === payload.id) {
                spu.skus = spu.skus.map(sku => ({ ...sku, rem: payload.rem }))
              }
            })
          }
          return shop
        })
      }
    },
    updateRemarkInConfirmPage(state, { payload }) {
      const stockBarForbillDetail = state.stockBarForbillDetail.map(item =>
        item.mpErpId === payload.mpErpId ? { ...item, remark: payload.rem } : item
      )
      return {
        ...state,
        stockBarForbillDetail
      }
    },
    saveStockBarTable(state, { payload }) {
      return {
        ...state,
        stockBarTable: payload.stockBarTable
      }
    }
  },
  effects: {
    *fetchStockBarList({}, { select, put, call }) {
      const { sessionId } = yield select(state => state.user)
      const { lastStockBarReturnData, isStockBarInitGroup } = yield select(
        state => state.replenishment
      )
      if (!sessionId) return
      try {
        let { data }: { data: { rows: stockBarItem[] } } = yield call(getStockBarList)
        // 服务端返回的是sku列表 自行组装成spu -> skus
        // 尺码排序
        // let rows = goodsSvc.sortSkusBySize<SkuForBuy>(data.rows)
        let rows = data.rows
        if (!isEqual(lastStockBarReturnData, rows)) {
          if (!isStockBarInitGroup) {
            yield put({ type: 'handleGroupForStockBar', payload: { skus: rows } })
          }
          yield put({ type: 'save', payload: { lastStockBarReturnData: rows } })
          const stockBarList = rows.map(shop => {
            // 失效货品排后面
            shop.carts.sort((a, b) => b.flag - a.flag)
            // 装成spu
            const spus = shop.carts.reduce<SPUForBuy[]>((spus, sku) => {
              const _spu = spus.find(spu => spu.id === sku.styleId)
              if (_spu) {
                _spu.skus.push({
                  ...sku,
                  price: shop.spuShowPrice === '1' ? sku.price : 0,
                  originPrice: sku.price
                })
              } else {
                spus.push({
                  flag: sku.flag,
                  name: sku.styleName,
                  code: sku.styleCode,
                  imgUrl: sku.styleImg,
                  id: sku.styleId,
                  skus: [
                    {
                      ...sku,
                      price: shop.spuShowPrice === '1' ? sku.price : 0,
                      originPrice: sku.price
                    }
                  ]
                })
              }
              return spus
            }, [])
            return { ...shop, spus }
          })
          yield put({ type: 'save', payload: { stockBarList } })
        }
      } catch (e) {
        throw e
      }
    },
    *fetchCartGoodsList({}, { select, put, call }) {
      const { sessionId } = yield select(state => state.user)
      if (!sessionId) return
      const { mpErpId, shopParams } = yield select(state => state.cloudBill)
      const { mpErpId: cartMpErpId } = yield select(state => state.replenishment)
      try {
        // eslint-disable-next-line
        const options = wx.getEnterOptionsSync()

        const fromVideo = VIDEO_SCENE.includes(options.scene)
        const params = fromVideo ? { appScene: 'channelLive' } : {}
        const { data }: { data: { rows: SkuForBuy[] } } = yield call(getCartGoodsList, {
          mpErpId,
          ...params
        })
        // 服务端返回的是sku列表 自行组装成spu -> skus
        // 尺码排序
        let rows = goodsSvc.sortSkusBySize<SkuForBuy>(data.rows, mpErpId)

        // 失效货品排后面
        rows.sort((a, b) => b.flag - a.flag)
        yield put({ type: 'handleGroupForReplenish', payload: { skus: rows, mpErpId } })
        // 装成spu
        const spus = rows.reduce<SPUForBuy[]>((spus, sku) => {
          const _spu = spus.find(spu => spu.id === sku.styleId)
          if (_spu) {
            _spu.skus.push({
              ...sku,
              price: shopParams.spuShowPrice === '1' ? sku.price : 0,
              originPrice: sku.price
            })
          } else {
            spus.push({
              flag: sku.flag,
              name: sku.styleName,
              code: sku.styleCode,
              imgUrl: sku.styleImg,
              id: sku.styleId,
              skus: [
                {
                  ...sku,
                  price: shopParams.spuShowPrice === '1' ? sku.price : 0,
                  originPrice: sku.price
                }
              ]
            })
          }
          return spus
        }, [])
        yield put({ type: 'save', payload: { spus, mpErpId } })
      } catch (e) {
        // 如果请求新店铺的购物车失败，清空购物车
        if (mpErpId !== cartMpErpId) {
          yield put({ type: 'save', payload: { spus: [] } })
        }
        throw e
      }
    },
    /**
     * 处理购物车的「按手」逻辑
     * @param param0
     * @param param1
     */
    *handleGroupForStockBar({ payload }, { select, put, call, all }) {
      const mpErpIds = payload.skus.map(shop => shop.mpErpId)
      yield all(
        mpErpIds.map(mpErpId => put.resolve({ type: 'shop/fetchShopParams', payload: { mpErpId } }))
      )

      const { shopParams } = yield select(state => state.shop)
      for (let i = 0; i < payload.skus.length; i++) {
        const shop = payload.skus[i]
        let params = shopParams.get(shop.mpErpId)
        if (params) {
          const enableGroup = params.order_by_group === '1'
          if (enableGroup) {
            yield put.resolve({
              type: 'cloudBill/fetchSizeOrder',
              payload: { mpErpId: shop.mpErpId }
            })
          }

          goodsSvc.handleGroupNum(shop.mpErpId, shop.carts, enableGroup, i)
        }
      }

      yield put({ type: 'save', payload: { isStockBarInitGroup: true } })
    },
    /**
     * 处理单门店购物车的「按手」逻辑
     * @param param0
     * @param param1
     */
    *handleGroupForReplenish({ payload }, { select, put, call }) {
      const { shopParams } = yield select(state => state.shop)
      let params = shopParams.get(payload.mpErpId)
      if (!params) {
        yield put.resolve({ type: 'shop/fetchShopParams', payload: { mpErpId: payload.mpErpId } })
      }
      params = shopParams.get(payload.mpErpId)
      if (params) {
        const enableGroup = params.order_by_group === '1'
        goodsSvc.handleGroupNum(payload.mpErpId, payload.skus, enableGroup)
      } else {
        //
      }
    },
    *fetchAddress(_, { call, put }) {
      const { data } = yield call(fetchUserReplenishmentAddress)
      yield put({ type: 'save', payload: { address: data } })
    },
    *addToCart({ payload }, { call, put, select }) {
      const { goodsDetail }: { goodsDetail: IGoodsDetail } = payload
      const { mpErpId, shopParams } = yield select(state => state.cloudBill)
      const jsonParam = goodsDetail.skus.map(sku => {
        const { checked, id, ..._sku } = sku
        const { code, name, imgUrl } = goodsDetail
        return {
          ..._sku,
          styleCode: code,
          styleName: name,
          styleImg: imgUrl,
          price: shopParams.spuShowPrice === '1' ? sku.price : 0,
          originPrice: sku.price
        }
      })
      yield call(addToCartApi, { mpErpId, jsonParam: JSON.stringify(jsonParam) })
      messageFeedback.showToast('加入进货车成功')
      yield put({ type: 'fetchCartGoodsList' })
    },
    *deleteFromCart({ payload }, { call, put, select }) {
      const { id, ids } = payload
      const cartIds = id ? [id] : ids
      yield call(deleteCartGoods, { cartIds })
      if (id) {
        yield put({ type: 'deleteSku', payload })
      } else {
        yield put({ type: 'deleteChecked' })
      }
      yield put({ type: 'fetchCartGoodsList' })
    },
    *deleteFromCartInStockBar({ payload }, { call, put, select }) {
      const { id, ids } = payload
      const cartIds = id ? [id] : ids
      yield call(deleteCartGoods, { cartIds })
      if (id) {
        yield put({ type: 'deleteSkuInStockBar', payload })
      } else {
        yield put({ type: 'deleteCheckedInStockBar' })
      }
      yield put({ type: 'fetchStockBarList' })
    },
    *deleteSpu({ payload }, { call, put, select }) {
      const { ids } = payload
      yield call(deleteCartGoods, { cartIds: ids })
      yield put({ type: 'deleteSpuInStockBar', payload })
      yield put({ type: 'fetchStockBarList' })
    },
    *updateGoodsNumInCart({ payload }, { call, put, select }) {
      // 实时更新本地数据，600毫秒后更新到服务端
      const { spuIndex, ..._payload } = payload
      yield put({ type: 'updateSku', payload })
      yield call(debounceUpdate, { ..._payload })
    },
    *updateGoodsNumInStockBar({ payload }, { call, put, select }) {
      // 实时更新本地数据，600毫秒后更新到服务端
      const { spuIndex, ..._payload } = payload
      yield put({ type: 'updateSkuInStockBar', payload })
      yield call(debounceUpdate, { ..._payload })
    },
    *updateCartGoodsRem({ payload }, { call, put }) {
      const { spuIndex, ..._payload } = payload
      yield put({ type: 'updateSku', payload })
      yield call(updateCartGoodsRem, { ..._payload })
    },
    *updateCartGoodsRemInStockBar({ payload }, { call, put }) {
      const { spuIndex, ..._payload } = payload
      yield put({ type: 'updateSkuInStockBar', payload })
      yield call(updateCartGoodsRem, { ..._payload })
    },
    *confirmGoodsAndGetShopInfo({ payload }, { call, select, put }) {
      const { mpErpId } = yield select(state => state.replenishment)
      const { list } = yield select(state => state.shop)
      let _mpErpId = mpErpId
      if (payload.mpErpId && payload.mpErpId > -1) {
        _mpErpId = payload.mpErpId
      }
      const shop = list.find(sp => sp.id === Number(_mpErpId))
      yield put({ type: 'save', payload: { mpErpId: _mpErpId } })
      yield put({ type: 'confirmGoods', payload: { ...payload, shop } })
    },
    // 补货下单
    *order({ payload }, { call, select, put }) {
      const { address, stockBarForbillDetail, cardPwd }: ReplenishmentState = yield select(
        state => state.replenishment
      )
      // 组装数据
      const shopDetails = stockBarForbillDetail.map(shop => {
        const details = shop.spus.reduce((result, spu) => {
          result.push(
            ...spu.skus
              .filter(sku => sku.checked && sku.num > 0) // 过滤数量不大于0的款
              .map(sku => {
                const { id, ...skuItem } = sku
                const _sku = {
                  ...skuItem,
                  mpErpId: shop.mpErpId,
                  styleCode: spu.code,
                  styleName: spu.name,
                  styleImg: spu.imgUrl,
                  price: skuItem.originPrice || skuItem.price
                }
                if (id) {
                  // 购物车里是id，传给服务端要改成cartId
                  // @ts-ignore
                  _sku.cartId = id
                }
                return _sku
              })
          )
          return result
        }, [] as SkuForBillConfirm[])
        return {
          mpErpId: shop.mpErpId,
          buyerRem: shop.remark ? shop.remark : '',
          details,
          ...(cardPwd ? { giftTicketPassword: cardPwd } : {})
        }
      })

      // 发起请求
      const { data } = yield call(createReplenishmentOrderV2, {
        jsonParam: {
          ...address,
          country: '中国',
          ...payload,
          shopDetails,
          // ownerId,
          // dwId,
          hashKey: generateHashKey()
        }
      })

      const { list } = yield select(state => state.shop)
      const _stockBarForbillDetail = stockBarForbillDetail.map(item => {
        data.rows.forEach(row => {
          if (row.mpErpId === Number(item.mpErpId)) {
            item.orderData = row // billId和type用于成功页
          }
        })
        return item
      })

      yield put({ type: 'save', payload: { stockBarForbillDetail: _stockBarForbillDetail } })
      yield put({ type: 'fetchCartGoodsList' })
      return {
        billId: data.rows[0].billId
      }
    }
  }
}

export default replenishment
