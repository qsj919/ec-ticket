import { Model } from '@@types/dva'
import {
  IGoodsClass,
  IGoodsDetail,
  IGoodsDetailFromApi,
  ISku,
  ISpu,
  OrderBillItem,
  OrderBillDetail,
  OrderSpu
} from '@@types/GoodsType'
import { GlobalState } from '@@types/model_state'
import {
  CloudEventPage,
  CloudSource,
  CLOUD_BILL_FLAG,
  ICloudBill,
  IVideo,
  IVideoWithShop,
  Shop
} from '@@types/base'
import {
  getGoodsClassList,
  getShopGoodsList,
  getShopGoodsDetail,
  fetchSizeGroupOrder,
  fetchGoodsFilterRule,
  findAuditBillList,
  getAuditBillDetail,
  getShopParamVal,
  getLastPriceBatch
} from '@api/goods_api_manager'
import { ALL_GOODS_PAGE_SIZE, ALL_GOODS_TAB_ITEM } from '@constants/index'
import goodsSvc from '@services/goodsSvc'
import messageFeedback from '@services/interactive'
import navigatorSvc from '@services/navigator'
import trackSvc from '@services/track'
import {
  batchScanShop,
  fetchShopVideosForCloudBill,
  fetchVideoPageData,
  fetchVideoPageDataByMpErpId,
  fetchVideoShops
} from '@api/shop_api_manager'
import NP, { plus, round } from 'number-precision'
import myLog from '@utils/myLog'

const PREVIEW_TYPE = 4

const initState = {
  sn: -1,
  epid: -1,
  shopId: -1,
  // 如果没有mpErpId 则为试用情况，传以上3参数
  mpErpId: -1,
  spuId: -1,
  goodsList: [] as ISpu[],
  goodsListTotal: 0,
  boughtGoodsList: [] as ISpu[],
  goodsSearchList: [] as ISpu[], // 搜索列表，防止和货品列表冲突
  goodsListNew: [] as ISpu[],
  toDayNewGoodsList: [] as ISpu[],
  shopGoodsListTop10: [] as ISpu[],
  goodsListPreview: [] as ISpu[],
  hotGoodsListTop40: [] as ISpu[],
  hotSettingGoodsList: [] as ISpu[], // 店家设置的爆款
  hotSettingGoodsListPageNo: 1,
  hotSettingGoodsListFinished: false,
  pageNo: 1,
  searchPageNo: 1,
  classList: [] as { codeName: string; codeValue: number; hidden: boolean }[],
  orderKey: '',
  order: '',
  goodsDetail: {
    code: '',
    name: '',
    price: 0,
    className: '',
    brandName: '',
    seasonName: '',
    spec1Name: '',
    spec2Name: '',
    skus: [] as ISku[]
  } as IGoodsDetail,
  activeColor: null as string | null,
  activeSize: null as string | null,
  colorSizeVisible: false,
  /** 视频页面 */
  videoPageData: {
    /** 小票信息，从推送进来则没有 */
    totalSum: 0,
    totalNum: 0,
    type: 1,
    billid: '',
    /** 店铺信息 */
    logoUrl:
      'https://a01-1256054816.cos.ap-shanghai.myqcloud.com/2021/04/25/996142194249695748.jpg',
    sn: '',
    addr: '',
    shopName: '',
    shopid: 0,
    epid: '',
    pageType: -1, // 1小票 2视频页
    mpErpId: -1,
    bindFlag: 1,
    cloudBillFlag: CLOUD_BILL_FLAG.open,
    /** 视频页相关 */
    videoId: -1,
    videoUrl: '',
    scanError: -1, // （0-正常 1-用户识别错误 2-无手机号 3-店铺无视频）,
    mpUserId: -1,
    coverUrl: ''
  },
  videoList: [] as IVideoWithShop[],
  videos: [] as IVideo[],
  goodsVideoList: ([] as IVideo[] & []) as ISpu[],
  noMoreVideos: false,
  shopInfo: null as Shop | null,
  // 店铺参数
  shopParams: {
    spuShowPrice: '0', // 是否显示价格
    shopBlackUser: '0',
    orderPay: '0'
  },
  attentionGuidanceIsShow: true,
  newGoodsShopList: [],
  marketInfo: { marketDate: '' },
  isFromOrder: false,
  orderBeConfirm: -1,
  orderBillListBeConfirmed: [] as OrderBillItem[],
  orderBillListBeConfirm: [] as OrderBillItem[],
  orderBillListVoided: [] as OrderBillItem[],
  orderBillListRefund: [] as OrderBillItem[],
  orderBillDetail: {
    bill: {
      auditFlag: -1,
      fullAddress: '',
      createdDate: '',
      slhBillNo: -1,
      buyerRem: ''
    },
    spus: [] as OrderSpu[]
  } as OrderBillDetail,
  recentlyUpGoodDay: '', // 店铺最近一次上新的时间
  goodsError: {
    label: '',
    isError: false
  }
}

export type CloudBillState = typeof initState

const cloudBillModel: Model<CloudBillState> = {
  namespace: 'cloudBill',
  state: initState,
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    },
    saveSearch(state, { payload }) {
      return { ...state, ...payload }
    },
    saveShopParams(state, { payload }) {
      return {
        ...state,
        shopParams: { ...state.shopParams, ...payload }
      }
    },
    resetGoods(state) {
      return {
        ...state,
        colorSizeVisible: false,
        goodsDetail: { ...initState.goodsDetail }
      }
    },
    resetVideoData(state) {
      return {
        ...state,
        videoPageData: { ...initState.videoPageData }
      }
    },
    addVideoList(state, { payload }) {
      return {
        ...state,
        videoList: [...state.videoList, ...payload.list],
        noMoreVideos: payload.list.length < 10
      }
    },
    addPageNo(state) {
      return { ...state, pageNo: state.pageNo + 1 }
    },
    addSearchPageNo(state) {
      return { ...state, searchPageNo: state.searchPageNo + 1 }
    },
    addHotSettingGoodsListPageNo(state) {
      return { ...state, hotSettingGoodsListPageNo: state.hotSettingGoodsListPageNo + 1 }
    },
    addGoods(state, { payload }) {
      return {
        ...state,
        goodsList: [...state.goodsList, ...payload.goodsList]
      }
    },
    addSearchGoods(state, { payload }) {
      return {
        ...state,
        goodsSearchList: [...state.goodsSearchList, ...payload.goodsSearchList]
      }
    },
    resetSkuNum(state) {
      return {
        ...state,
        goodsDetail: {
          ...state.goodsDetail,
          skus: state.goodsDetail.skus.map(s => ({ ...s, num: 0 }))
        }
      }
    },
    updateSkuNum(state, { payload }) {
      const { id, name, num }: { id: string; num: number; name: string } = payload
      return {
        ...state,
        goodsDetail: {
          ...state.goodsDetail,
          skus: state.goodsDetail.skus.map(sku => {
            if (sku.colorId === state.activeColor && sku.sizeId === id) {
              if (sku.numPerGroup && sku.numPerGroup > 1) {
                return { ...sku, groupNum: num, num: NP.times(num, sku.numPerGroup) }
              } else {
                return { ...sku, num }
              }
            } else {
              return { ...sku }
            }
          })
        }
      }
    },
    updateSpuRem(state, { payload }) {
      const { rem } = payload
      return {
        ...state,
        goodsDetail: {
          ...state.goodsDetail,
          skus: state.goodsDetail.skus.map(sku => {
            return { ...sku, rem }
          })
        }
      }
    },
    updateGoodsListTotal(state, { payload }) {
      const { total = 0 } = payload
      return {
        ...state,
        goodsListTotal: total
      }
    },
    resetModel() {
      return {
        ...initState
      }
    },
    resetShopRelative(state) {
      return {
        ...state,
        goodsList: [],
        classList: [],
        // videos: [],
        shopInfo: null,
        boughtGoodsList: [],
        colorSizeVisible: false
        // goodsVideoList: []
      }
    },
    resetAttention(state) {
      return {
        ...state,
        attentionGuidanceIsShow: false
      }
    },
    addMarketInfo(state, { payload }) {
      const { marketInfo } = payload
      return {
        ...state,
        marketInfo
      }
    },
    resetIsFromOrderFalse(state) {
      return {
        ...state,
        isFromOrder: false
      }
    },
    resetIsFromOrderTrue(state) {
      return {
        ...state,
        isFromOrder: true
      }
    },
    updateEditSkus(state, { payload }) {
      const { skus, index } = payload
      return {
        ...state,
        orderBillDetail: {
          ...state.orderBillDetail,
          spus: state.orderBillDetail.spus.map((s, _index) => {
            if (_index === Number(index)) {
              let totalNum = skus.reduce((prev, cur) => {
                return prev + cur.num
              }, 0)
              if (!!payload.skuPrice) {
                return {
                  ...s,
                  price: payload.skuPrice,
                  totalNum,
                  totalMoney: totalNum * payload.skuPrice,
                  skus: skus.map(s => ({ ...s }))
                }
              }
              return {
                ...s,
                totalNum: skus.reduce((prev, cur) => {
                  return prev + cur.num
                }, 0),
                totalMoney: totalNum * s.price,
                skus: skus.map(s => ({ ...s }))
              }
            }
            return {
              ...s
            }
          })
        }
      }
    },
    clearOrderBillList(state) {
      return {
        ...state,
        orderBillListBeConfirmed: [],
        orderBillListBeConfirm: [],
        orderBillListVoided: []
      }
    }
  },
  effects: {
    *resetCloud(_, { put }) {
      yield put({ type: 'resetModel' })
      yield put({ type: 'goodsManage/resetShopInfo' })
    },
    *fetchVideoPageData({ payload }, { call, put, select }) {
      const { data } = yield call(fetchVideoPageData, payload)
      yield put({ type: 'save', payload: { videoPageData: data, mpErpId: data.mpErpId } })
      // 是为了把刚绑定的店铺更新进来
      yield put({ type: 'shop/fetchShopList' })
    },
    *fetchVideoPageDataByMpErpId({ payload }, { call, put, select }) {
      const { data } = yield call(fetchVideoPageDataByMpErpId, payload)
      yield put({ type: 'save', payload: { videoPageData: data, mpErpId: data.mpErpId } })
      yield put({ type: 'shop/fetchShopList' })
    },
    *fetchVideoList({ payload }, { call, put, select }) {
      const apiFunc = payload.mpErpIds ? batchScanShop : fetchVideoShops
      const { data } = yield call(apiFunc, payload)
      yield put({ type: 'addVideoList', payload: { list: data.rows } })
    },
    *init({ payload }, { call, put, select }) {
      yield put({
        type: 'save',
        payload: {
          mpErpId: -1,
          ...payload,
          pageNo: 1,
          classIndex: -2,
          goodsList: [],
          classList: [],
          videos: [],
          shopInfo: null
        }
      })
      const { cloudType = ICloudBill.all, cloudSource = CloudSource.UNKNOWN, mpErpId } = payload
      yield put({ type: 'goodsManage/cloudBillInitShopParam', payload: { mpErpId } })
      yield put({ type: 'initGoodsCart', payload: { mpErpId } })
      yield put({ type: 'fetchShopVideos', payload: { pageNo: 1 } })
      yield put({ type: 'fetchVideoGoodsList', payload: { pageNo: 1 } })
      yield put({ type: 'selectShopBlackUser' })
      if (cloudType === ICloudBill.all)
        yield put({ type: 'fetchGoodsList', payload: { lastPrice: true } })
      yield put({ type: 'fetchSizeOrder' })
      yield put({ type: 'fetchClassList' })
      yield put({ type: 'shop/fetchShopParams', payload: { mpErpId } })
      const { list } = yield select(state => state.shop)
      const { shopInfo } = yield select(state => state.cloudBill)
      const shop: Shop = list.find(l => Number(l.id) === Number(mpErpId)) || shopInfo
      if (shop) {
        const { sn, epid, shopid } = shop
        trackSvc.trackToBigData({
          sn,
          epid,
          shop: shopid,
          data: [{ key: 'enter_cloud', value: 1 }],
          tag: { source: cloudSource, page: CloudEventPage.GOODS }
        })
      }
    },
    *initGoodsCart({ payload }, { call, put, select }) {
      const { mpUserId } = yield select(state => state.user)
      yield put.resolve({
        type: 'goodsManage/selectShopParamSpuShowPrice',
        payload: { mpErpId: payload.mpErpId, erpParamFirst: false, mpUserId }
      })
      yield put({ type: 'replenishment/fetchCartGoodsList' })
    },
    // 尺码顺序
    *fetchSizeOrder({ payload = {} }, { call, select, put }) {
      const { mpErpId } = yield select(state => state.cloudBill)
      const _mpErpId = payload.mpErpId || mpErpId
      const { data } = yield call(fetchSizeGroupOrder, _mpErpId)
      goodsSvc.saveSizeOrder(data.rows || [], _mpErpId)
    },
    *showColorSizeInList({ payload }, { call, put }) {
      const { spuId, ...goodsDetail } = payload
      yield put({
        type: 'save',
        payload: { colorSizeVisible: true, goodsDetail: { ...goodsDetail, skus: [] } }
      })

      yield put({ type: 'fetchGoodsDetail', payload: { spuId } })
    },
    *fetchClassList(_, { call, put, select }) {
      const { mpErpId, pageNo } = yield select(state => state.cloudBill)
      const { data } = yield call(fetchGoodsFilterRule, mpErpId)
      const classList = data.classList
        .map(d => ({
          codeName: d.name,
          codeValue: d.id,
          hidden: d.hidden
        }))
        .filter(item => !item.hidden)
      yield put({ type: 'save', payload: { classList } })
    },
    *fetchHotBySetting({ payload }, { call, put, select }) {
      if (payload.loadMore) {
        yield put({ type: 'addHotSettingGoodsListPageNo' })
        const { hotSettingGoodsListPageNo, hotSettingGoodsList }: CloudBillState = yield select(
          state => state.cloudBill
        )
        const { data, code } = yield call(getShopGoodsList, {
          pageNo: hotSettingGoodsListPageNo,
          pageSize: 20,
          jsonParam: { type: 2, hotType: 1 },
          mpErpId: payload.mpErpId
        })
        const params: any = {}
        if (data.rows.length === 0) {
          params.hotSettingGoodsListFinished = true
        }
        params.hotSettingGoodsList = [
          ...hotSettingGoodsList,
          ...data.rows.filter(g => g.hotFlag === 1)
        ]
        yield put({
          type: 'save',
          payload: params
        })
      } else {
        const { data, code } = yield call(getShopGoodsList, {
          pageNo: 1,
          pageSize: 20,
          jsonParam: { type: 2, hotType: 1 },
          mpErpId: payload.mpErpId
        })
        yield put({
          type: 'save',
          payload: {
            hotSettingGoodsListPageNo: 1,
            hotSettingGoodsListFinished: data.rows.length === 0,
            hotSettingGoodsList: data.rows.filter(g => g.hotFlag === 1)
          }
        })
      }
    },
    *fetchHotGoodsListTop40({ payload }, { call, put, select }) {
      let type = 2
      const { mpErpId, sn, epid, shopId }: CloudBillState = yield select(state => state.cloudBill)
      let diffObject = {}
      if (mpErpId > 0 || payload.mpErpId) {
        diffObject = { type, mpErpId: mpErpId > 0 ? mpErpId : payload.mpErpId }
      } else {
        diffObject = { type: PREVIEW_TYPE, sn, epid, shopId }
      }
      const { data, code } = yield call(getShopGoodsList, {
        pageNo: 1,
        pageSize: 40,
        jsonParam: { ...diffObject }
      })
      yield put({
        type: 'save',
        payload: {
          hotGoodsListTop40: data.rows
        }
      })

      yield put({
        type: 'batchUpdateLastPrice',
        payload: {
          listName: 'hotGoodsListTop40',
          styleIds: data.rows.map(s => s.styleId).join(',')
        }
      })
    },
    *fetchVideoGoodsList({ payload }, { call, put, select }) {
      const { mpErpId, sn, epid, shopId, goodsVideoList } = yield select(state => state.cloudBill)
      const { pageNo } = payload
      let type = 1
      let diffObject = {}
      if (mpErpId > 0) {
        diffObject = { type, mpErpId }
      } else {
        diffObject = { type: PREVIEW_TYPE, sn, epid, shopId }
      }
      const res = yield call(getShopGoodsList, {
        pageNo,
        pageSize: 20,
        jsonParam: { ...diffObject, onlyVideo: true }
      })
      yield put({
        type: 'save',
        payload: {
          goodsVideoList: pageNo === 1 ? res.data.rows : [...goodsVideoList, ...res.data.rows]
        }
      })
    },
    *fetchGoodsList({ payload = {} }, { call, put, select }) {
      const {
        loadMore = false,
        styleNameLike,
        type = 9,
        marketOptimeBegin,
        marketOptimeEnd,
        classId,
        fetchShopGoodsListTop10 = false,
        orderBy,
        lastPrice = false
      } = payload
      if (loadMore) {
        yield put({ type: 'addPageNo' })
      } else {
        yield put.resolve({ type: 'save', payload: { pageNo: 1 } })
      }
      const { mpErpId, pageNo, classList, sn, epid, shopId }: CloudBillState = yield select(
        state => state.cloudBill
      )
      let diffObject = {}
      const jsonParam = {
        classId,
        styleNameLike,
        marketOptimeBegin,
        marketOptimeEnd,
        orderBy
      }
      // 区分是否是预览的情况
      if (mpErpId > 0) {
        diffObject = { type, mpErpId }
      } else {
        diffObject = { type: PREVIEW_TYPE, sn, epid, shopId }
      }

      let _data = { rows: [] }
      try {
        const { data, code } = yield call(getShopGoodsList, {
          pageNo,
          pageSize: ALL_GOODS_PAGE_SIZE,
          jsonParam: { ...jsonParam, ...diffObject }
        })
        // _data = data

        const reducerType = loadMore ? 'addGoods' : 'save'
        if (fetchShopGoodsListTop10) {
          if (code === 0) {
            yield put({ type: 'save', payload: { shopGoodsListTop10: data.rows } })
            return Promise.resolve()
          } else {
            return Promise.reject()
          }
        } else {
          if (type === ALL_GOODS_TAB_ITEM.ALL_GOODS && !loadMore) {
            let times = data.rows.map(item => new Date(item.marketDate.split(' ')[0]).getTime())
            const _date = new Date(Math.max(...times))
            const dateY = _date.getFullYear()
            const dateM =
              _date.getMonth() + 1 >= 10 ? _date.getMonth() + 1 : '0' + (_date.getMonth() + 1)
            const dateD = _date.getDate() >= 10 ? _date.getDate() : '0' + _date.getDate()
            yield put({
              type: 'save',
              payload: { recentlyUpGoodDay: `${dateY}-${dateM}-${dateD}` }
            })
          }
          yield put({
            type: reducerType,
            payload: { goodsList: data.rows.map(d => ({ ...d, useLastPrice: !lastPrice })) }
          })
          const styleIds = data.rows.map(s => s.styleId).join(',')
          if (lastPrice) {
            yield put({
              type: 'batchUpdateLastPrice',
              payload: { styleIds, listName: 'goodsList' }
            })
          }
        }
        yield put({ type: 'updateGoodsListTotal', payload: { total: data.total } })
      } catch (e) {
        //
        return Promise.reject()
      }
    },
    *batchUpdateLastPrice({ payload }, { call, put, select }) {
      let { styleIds, listName } = payload
      const { mpErpId }: CloudBillState = yield select(state => state.cloudBill)
      const goodsList = yield select(state => {
        console.log(state.cloudBill[listName], state.cloudBill, listName)
        return state.cloudBill[listName]
      })

      if (!styleIds) return
      try {
        const { data: lastPriceData } = yield call(getLastPriceBatch, { mpErpId, styleIds })
        const lastPriceList = lastPriceData.dataList || []
        if (lastPriceList.length > 0) {
          const firstIndex = goodsList.findIndex(
            good => good.styleId === Number(lastPriceList[0].styleId)
          )

          const g = goodsList.map((spu, index) => {
            const _index = index - firstIndex
            if (_index > -1) {
              const lastPriceItem = lastPriceData.dataList[_index]
              if (Number(lastPriceItem.styleId) === spu.styleId) {
                spu.useLastPrice = true
                spu.price = lastPriceItem.price
              }
            }
            return {
              ...spu
            }
          })

          yield put({ type: 'save', payload: { [listName]: g } })
        }
      } catch (e) {
        myLog.error(`上次价获取失败：${e.message}`)
        yield put({
          type: 'save',
          payload: { goodsList: goodsList.map(good => ({ ...good, useLastPrice: true })) }
        })
      }
    },
    *fetchBoughtGoodsList({ payload }, { call, put, select }) {
      const { mpErpId, sn, epid, shopId, boughtGoodsList }: CloudBillState = yield select(
        state => state.cloudBill
      )
      const { pageNo, orderBy } = payload
      let diffObject = {}
      const jsonParam = {
        orderBy
      }
      // 区分是否是预览的情况
      if (mpErpId > 0) {
        diffObject = { type: 3, mpErpId }
      } else {
        diffObject = { type: 3, sn, epid, shopId }
      }
      try {
        const { data, code } = yield call(getShopGoodsList, {
          pageNo,
          pageSize: ALL_GOODS_PAGE_SIZE,
          jsonParam: { ...diffObject, ...jsonParam }
        })
        if (code === 0) {
          yield put({
            type: 'save',
            payload: {
              boughtGoodsList: pageNo === 1 ? data.rows : [...boughtGoodsList, ...data.rows]
            }
          })
          return Promise.resolve()
        } else {
          return Promise.reject()
        }
      } catch (e) {
        return Promise.reject()
      }
    },
    *fetchGoodsSearchList({ payload = {} }, { call, put, select }) {
      const { loadMore = false, styleNameLike, type = 1 } = payload
      if (loadMore) {
        yield put({ type: 'addSearchPageNo' })
      } else {
        yield put.resolve({ type: 'saveSearch', payload: { searchPageNo: 1 } })
      }
      const { mpErpId, searchPageNo, sn, epid, shopId }: CloudBillState = yield select(
        state => state.cloudBill
      )
      let diffObject = {}
      const jsonParam = {
        styleNameLike,
        type: PREVIEW_TYPE
      }
      // 区分是否是预览的情况
      if (mpErpId > 0) {
        diffObject = { type, mpErpId }
      } else {
        diffObject = { type: PREVIEW_TYPE, sn, epid, shopId }
      }
      try {
        const { data } = yield call(getShopGoodsList, {
          pageNo: searchPageNo,
          pageSize: ALL_GOODS_PAGE_SIZE,
          jsonParam: {
            ...jsonParam,
            ...diffObject
          }
        })
        const reducerType = loadMore ? 'addSearchGoods' : 'saveSearch'
        yield put({ type: reducerType, payload: { goodsSearchList: data.rows } })
      } catch (e) {
        return Promise.reject(e)
      }
    },
    *fetchGoodsListToDayNew({ payload }, { call, put, select }) {
      const { marketOptimeBegin, marketOptimeEnd, pageNo, type = 1 } = payload
      const { mpErpId }: CloudBillState = yield select(state => state.cloudBill)
      let diffObject = { type, mpErpId }
      const jsonParam = {
        marketOptimeBegin,
        marketOptimeEnd,
        pageNo
      }
      try {
        const { data, code } = yield call(getShopGoodsList, {
          jsonParam: { ...jsonParam, ...diffObject }
        })
        if (code === 0) {
          const { goodsListNew } = yield select(state => state.cloudBill)
          if (pageNo === 1) {
            yield put({ type: 'save', payload: { goodsListNew: data.rows } })
          } else {
            yield put({ type: 'save', payload: { goodsListNew: [...goodsListNew, ...data.rows] } })
          }
          return Promise.resolve(data.count)
        } else {
          return Promise.reject()
        }
      } catch (e) {
        return Promise.reject()
      }
    },
    *fetchGoodsListPreview({ payload }, { call, put, select }) {
      const { mpErpId, pageNo, classList, sn, epid, shopId }: CloudBillState = yield select(
        state => state.cloudBill
      )
      const { data } = yield call(getShopGoodsList, {
        pageNo: 1,
        pageSize: 20,
        jsonParam: { mpErpId, type: 1, ...payload }
      })
      yield put({ type: 'save', payload: { goodsListPreview: data.rows } })
    },
    *clearGoodsList({}, { put }) {
      yield put({ type: 'save', payload: { goodsList: [] } })
    },
    *clearGoodsListNew({}, { put }) {
      yield put({ type: 'save', payload: { goodsListNew: [] } })
    },
    *onClassClick({ payload }, { put }) {
      yield put({ type: 'save', payload: { ...payload, pageNo: 1 } })
      yield put({ type: 'fetchGoodsList', payload: { lastPrice: true } })
    },
    *fetchGoodsDetail({ payload }, { call, put, select }) {
      const { shopParams } = yield select(state => state.shop)
      const { mpErpId, sn, epid, shopId } = yield select(state => state.cloudBill)
      yield put({ type: 'save', payload: { goodsError: { isError: false } } })
      /**
       * 每次都请求一下按手参数，视频号中的小程序页面会常驻内存，不会重新加载
       */
      if (!payload.isIgnoreGroupNum) {
        try {
          yield put.resolve({ type: 'shop/fetchShopParams', payload: { mpErpId } })
        } catch (e) {
          // ignore
        }
      }

      let params = {}
      let jsonParams = {}
      if (mpErpId > 0) {
        jsonParams = { mpErpId }
      } else {
        params = { sn, epid }
        jsonParams = { shopId }
      }
      let data
      try {
        const { data: resData }: { data: IGoodsDetailFromApi } = yield call(getShopGoodsDetail, {
          ...params,
          jsonParam: {
            ...jsonParams,
            styleId: payload.spuId,
            appScene: payload.appScene
          }
        })
        data = resData
        if (resData.marketFlag === 0) {
          throw new Error('该商品已下架，去别处看看吧～')
        }
      } catch (e) {
        yield put({ type: 'save', payload: { goodsError: { isError: true, label: e.message } } })
        return
      }

      const { allImgUrlBigs = '', videoUrl = '', skus, glFileUrl } = data
      const shopParam = shopParams.get(mpErpId)
      const enableGroup = shopParam && shopParam.order_by_group === '1'
      // 将sku价格设置为spu价格，sku会没价格，暂不考虑同款不同价的情况
      const _skus = skus.map(sku => ({
        ...sku,
        price: sku.price || data.price || 0,
        num: 0,
        numPerGroup: enableGroup ? sku.numPerGroup : undefined
      }))
      const invNum = skus.reduce((prev, cur) => {
        const invNum = cur.invNum && cur.invNum > 0 ? cur.invNum : 0
        return prev + invNum
      }, 0)
      let isSkuPrice = true
      let minPrice = 0
      let maxPrice = 0
      const skusPriceSet = new Set(_skus.map(sku => Number(sku.price)))
      if (skusPriceSet.size === 1) {
        isSkuPrice = false
        minPrice = [...skusPriceSet.values()][0]
        maxPrice = minPrice
      } else {
        // isSkuPrice
        minPrice = Math.min(...skusPriceSet)
        maxPrice = Math.max(...skusPriceSet)
      }
      const price = isSkuPrice ? `${minPrice}-${maxPrice}` : minPrice
      let medias: { url: string[] | string; typeId: number; coverUrl?: string }[] = []
      if (allImgUrlBigs) {
        medias = allImgUrlBigs.map(url => ({ url, typeId: 1 }))
      }
      if (videoUrl) {
        medias.unshift({ url: videoUrl, typeId: 3, coverUrl: data.coverUrl })
      }
      // 临时业务代码，3d演示
      // let modelUrl = ''
      // const {id} = goodsDetail
      // // if (mpErpId\":117243,\"styleId\":127686796)
      if (Number(mpErpId) === 117243) {
        if (Number(payload.spuId) === 127686796) {
          medias.unshift({
            url: 'https://webdoc.hzecool.com/webCdn/weapp/ec-ticket/PegasusTrail_28m.glb',
            typeId: 99
          })
        } else if (Number(payload.spuId) === 127677532) {
          medias.unshift({
            url: 'https://webdoc.hzecool.com/webCdn/weapp/ec-ticket/PegasusTrail_2m.glb',
            typeId: 99
          })
        }
      }

      if (glFileUrl) {
        medias.unshift({
          url: glFileUrl,
          typeId: 99
        })
      }

      yield put({
        type: 'save',
        payload: {
          spuId: payload.spuId,
          goodsDetail: { ...data, medias, skus: _skus, invNum, isSkuPrice, price: price },
          activeColor: skus[0].colorId
        }
      })
      const { forDownloadImage = false } = payload
      if (forDownloadImage) {
        yield put({
          type: 'imageDownload/save',
          payload: { sourceData: [{ ...data, tenantSpuId: data.styleId }] }
        })
      }
    },
    *onColorSizeConfirm({ payload }, { call, put, select }) {
      const { type } = payload
      const { goodsDetail, shopParams, mpErpId }: CloudBillState = yield select(
        state => state.cloudBill
      )
      const skus = goodsDetail.skus
        .filter(sku => sku.num > 0)
        .map(item => ({ ...item, checked: true }))
      if (skus.length === 0) {
        messageFeedback.showToast('请选择商品')
        return
      }
      const _goodsDetail = {
        ...goodsDetail,
        skus
      }
      if (type === 'buy') {
        yield put({
          type: 'replenishment/confirmGoodsAndGetShopInfo',
          payload: {
            goodsDetail: _goodsDetail,
            spuShowPrice: shopParams.spuShowPrice === '1',
            mpErpId
          }
        })
        navigatorSvc.navigateTo({
          url: '/subpackages/cloud_bill/pages/replenishment_confirm/index'
        })
      } else {
        // 加入购物车
        yield put({ type: 'replenishment/addToCart', payload: { goodsDetail: _goodsDetail } })
      }
      yield put({ type: 'save', payload: { colorSizeVisible: false } })
      yield put({ type: 'resetSkuNum' })
    },
    *fetchImageUrls({ payload }, { put, select }) {
      const { mpErpId, goodsDetail }: CloudBillState = yield select(state => state.cloudBill)
      yield put({
        type: 'imageDownload/fetchImageUrls',
        payload: { mpErpId, styleIds: payload ? payload._id : goodsDetail.id }
      })
    },
    *fetchShopVideos({ payload }, { call, put, select }) {
      const { mpErpId, videos } = yield select(state => state.cloudBill)
      const { data } = yield call(fetchShopVideosForCloudBill, {
        mpErpId,
        ...payload,
        pageSize: 20
      })
      yield put({
        type: 'save',
        payload: { videos: payload.pageNo === 1 ? data.rows : [...videos, ...data.rows] }
      })
    },
    *selectAuditBillList({ payload }, { call, put, select }) {
      const { auditFlag, mpErpId, pageNo, searchKey, type, slhBillNo } = payload
      const {
        orderBillListBeConfirmed,
        orderBillListBeConfirm,
        orderBillListVoided,
        orderBillListRefund
      } = yield select(state => state.cloudBill)
      const { data, code } = yield call(findAuditBillList, {
        auditFlag,
        mpErpId,
        pageNo,
        searchKey,
        type,
        slhBillNo
      })
      if (code === 0) {
        if (auditFlag === 1) {
          yield put({
            type: 'save',
            payload: {
              orderBillListBeConfirmed:
                pageNo === 1 ? data.rows : [...orderBillListBeConfirmed, ...data.rows],
              orderBeConfirm: data.total
            }
          })
        }
        if (auditFlag === 2) {
          yield put({
            type: 'save',
            payload: {
              orderBillListBeConfirm:
                pageNo === 1 ? data.rows : [...orderBillListBeConfirm, ...data.rows]
            }
          })
        }
        if (auditFlag === 3) {
          yield put({
            type: 'save',
            payload: {
              orderBillListVoided: pageNo === 1 ? data.rows : [...orderBillListVoided, ...data.rows]
            }
          })
        }
        if (type === 5) {
          yield put({
            type: 'save',
            payload: {
              orderBillListRefund: pageNo === 1 ? data.rows : [...orderBillListRefund, ...data.rows]
            }
          })
        }
      }
    },
    *selectAuditBillDetail({ payload }, { call, put, select }) {
      const { billId } = payload
      const { code, data } = yield call(getAuditBillDetail, { billId })
      if (code === 0) {
        let spus = [] as OrderSpu[]
        data.details.forEach(goods => {
          const spu = spus.filter(spu => spu.styleId === goods.styleId)[0]
          const spuIndex = spus.findIndex(spu => spu.styleId === goods.styleId)
          if (typeof spu !== 'undefined' && !!spu && spu.styleId === goods.styleId) {
            spus[spuIndex].skus.push({
              ...goods,
              originalNum: goods.num
            })
          } else {
            spus = [
              ...spus,
              {
                ...goods,
                skus: [
                  {
                    ...goods,
                    originalNum: goods.num
                  }
                ]
              }
            ]
          }
        })
        yield put({
          type: 'save',
          payload: {
            orderBillDetail: {
              dwId: data.dwId,
              dwName: data.dwName,
              mpNickName: data.mpNickName,
              mpLogoUrl: data.mpLogoUrl,
              dwPhone: data.dwPhone,
              bill: { ...data.bill },
              spus: spus.map(s => {
                let totalNum = s.skus.reduce((prev, cur) => {
                  return prev + cur.num
                }, 0)

                let totalMoney = s.skus.reduce((prev, cur) => {
                  return plus(prev, Number(cur.money))
                }, 0)

                return {
                  ...s,
                  totalNum,
                  totalMoney: round(totalMoney, 4) || s.totalMoney
                }
              })
            }
          }
        })
        return Promise.resolve()
      } else {
        return Promise.reject()
      }
    },
    *selectShopBlackUser({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.cloudBill)
      const { mpUserId } = yield select(state => state.user)
      const _payload = {
        mpErpId,
        mpUserId,
        erpParamFirst: false,
        code: 'shop_black_user'
      }
      const { data } = yield call(getShopParamVal, { ..._payload })
      yield put({
        type: 'saveShopParams',
        payload: {
          shopBlackUser: data.val
        }
      })
    }
  }
}

export default cloudBillModel
