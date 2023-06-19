import { Model } from '@@types/dva'
import { IGoodsClass, IGoodsDetail, IGoodsDetailFromApi, ISku, ISpu } from '@@types/GoodsType'
import { Shop, BizShop } from '@@types/base'
import { GlobalState } from '@@types/model_state'
import { getTxCloudSign, getLastEnterShop } from '@api/apiManage'
import {
  getGoodsClassList,
  getShopGoodsList,
  getShopGoodsDetail,
  fetchSizeGroupOrder,
  takeDownGoodsApi,
  takeUpGoodsApi,
  fetchGoodsFilterRule,
  fetchAuthAndGoodsImgUploadUrl,
  queryCustomerType,
  updateCustomerVisibleType,
  updateShopInfo,
  getShopIntroduction,
  getSpuStdPropType,
  findErpLinkUsers,
  getErpQrCodeUrl,
  updateGoodsMedias,
  getShopProtectDays,
  setShopProtectDays,
  getShopParamVal,
  findBizShops,
  getConnectorAcctTotalRecharge,
  setShopParamVal,
  getShopViewData,
  findShopViewers,
  monitorShopEvent,
  getShopViewerSalesData,
  findUserShopViewData,
  findUserShopSalesDetails,
  findShopLinkUsers,
  findShopPriceTypeList,
  checkShopStaffAuth,
  findShopStaffList,
  getShopManageData,
  getMarketShopIsolate,
  setMarketShopIsolate,
  findShopWaitAuditUsers,
  getSpuActivity,
  getMarketInvSourceApi,
  setMarketInvSourceApi,
  getAllShopParamsVal,
  getCloudExpireNoti
} from '@api/goods_api_manager'
import {
  deleteShopVideo,
  fetchShopVideos,
  getGoodsMarketInvStrategy,
  setGoodsMarketInvStrategy,
  uploadShopVideo
} from '@api/shop_api_manager'
import { PAGE_SIZE } from '@constants/index'
import { isWeb } from '@utils/cross_platform_api'
import { authShopStaff } from '@api/user_api_manager'

const shopParamsMap = {
  spu_default_price_type: 'shopDefaulPriceType',
  spu_show_price: 'spuShowPrice',
  trade_component_status: 'tradeComponentStatus',
  spu_show_sold_out: 'shopShowSoldOut',
  order_pay: 'orderPay',
  allow_staff_view_client_phone: 'allowStaffViewClientPhone'
}

const initState = {
  sn: -1,
  epid: -1,
  shopId: -1,
  // 如果没有mpErpId 则为试用情况，传以上3参数
  mpErpId: -1,
  spuId: -1,
  goodsList: [] as ISpu[],
  manageHotList: [] as ISpu[],
  manageNewList: [] as ISpu[],
  manageSpecialList: [] as ISpu[],
  description: '',
  specialId: 0,
  newListLength: -1,
  pageNo: 1,
  goodsDetail: {
    code: '',
    name: '',
    price: 0,
    className: '',
    brandName: '',
    seasonName: '',
    allImgUrlBig: '',
    fileId: '',
    skus: [] as ISku[]
  } as IGoodsDetail,
  staffInfoH5: {
    id: '',
    name: '',
    roleName: ''
  },
  specialGoodsDetail: {} as IGoodsDetailFromApi,
  docUploadUrl: '',
  shopAddress: '', // 门店简介店铺地址
  appName: '', //safePostMeaasge 客户端产品名称
  classList: [] as { codeName: string; codeValue: number; spuCount: number; hidden: boolean }[],
  marketInvStrategy: '0', // 0无关 1显示售罄 2自动下架,
  sign: '', // 腾讯云签名
  userList: [] as {
    delflag: string
    flag: string
    id: string
    modelClass: string
    name: string
    opstaffName: string
    optime: string
    sid: string
  }[],
  rule: -1,
  levelList: {} as {
    rows: Array<{
      flag: string
      id: string
      name: string
      namepy: string
      parentId: string
      propTypeList: Array<any>
      showOrder: string
    }>
  },
  shopInfo: {
    activityNames: {}
  } as {
    coverUrls: string
    address: string
    coverType: number
    categoryName: string
    areaCode: string
    style: string
    phone: string
    firstCategoryId: number
    secondCategoryId: number
    thirdCategoryId: number
    wxQrUrl: string
    wxCode: string
    bannerUrls: string
    activityNames: { [key: number]: string }
    // videos: { videoUrl: string; coverUrl?: string }[]
  },
  videos: [] as { id: number; videoUrl: string; coverUrl?: string }[],
  linkUsers: {
    rows: [],
    total: ''
  } as {
    total: string
    rows: Array<{
      avatar: string
      nickName: string
      mpUserId: number
      remark?: string
    }>
  },
  erpQrCode: '',
  shopName: '',
  shopProtectDays: 0,
  spuShowPrice: '',
  groupBuy: '',
  shopShowSpu: '',
  shopShowSoldOut: '',
  shopVisitorAuth: '',
  autoAuditOrder: '',
  orderPay: '',
  myClientViewData: {} as {
    todayCount: number
    totalCount: number
    waitAuditCount: number
  },
  viewDataViewers: [] as {
    dwId: number
    dwName: string
    logo: string
    mpUserId: number
    nickName: string
    viewDate: string
    viewTime: string
    shopBlackUser: string
    priceType: string
  }[],
  todayViewerCount: '***',
  todayBillCount: '***',
  marketSpuCount: '***',
  independentType: 0,
  saasProductType: -1,
  independentAppId: '',
  viewerSalesData: [] as { title: string; value: number }[],
  userShopViewData: [] as {
    bizNum: number
    eventNum: number
    proDate: string
    styles: Array<{
      code: string
      imgUrl: string
      id: number
    }>
  }[],
  shopSalesDetails: [] as {
    billno: string
    stylename: string
    stylecode: string
    num: string
    total: string
    imgUrl: Array<string>
  }[],
  staffInfo: {} as {
    flag: number
    name: string
    rolename: string
    id: number
  },
  shopLogoUrl: '',
  isHotUnbound: false,
  myClientList: [] as {
    dwId: number
    dwName: string
    dwPhone: string
    logo: string
    mpUserId: number
    nickName: string
    phone: string
    viewTime: string
    shopBlackUser: string
    viewDate: string
    priceType: string
  }[],
  priceTypeList: [] as {
    delflag: string
    flagname: string
    id: string
    name: string
    sid: string
  }[],
  shopDefaulPriceType: '',
  hotSaleFlag: '',
  shopList: [] as {
    shopName: string
    sn: number
    shopid: number
    epid: number
    id: number
  }[],
  stafflist: [] as {
    depname: string
    id: number
    name: string
    rolename: string
    mobile: string
  }[],
  lastEnterShop: {} as Shop,
  bizShops: [] as BizShop[],
  buyShopNum: 0,
  shopIsolate: '', // 门店隔离参数
  providerList: [] as { id: string; name: string }[],
  seasonList: [] as { id: string; name: string }[],
  brandList: [] as { id: string; name: string }[],
  shopFilterList: [] as { id: string; name: string }[],
  clientAuditList: [] as {
    mpUserId: number
    nickName: string
    logo: string
    viewDate: string
    viewTime: string
    auditFlag: number
  }[],
  useGoodsSpus: [] as ISpu[],
  merchantParams: {
    appId: '',
    bizLine: '',
    bizSn: '',
    callbackUrl: '',
    merchantList: [],
    storeId: '',
    token: '',
    merchantId: '',
    bindFlag: 0
  },
  marketInvSource: '0', // 库存来源参数
  tradeComponentStatus: '0', // 视频号交易组件开通状态
  enableApplyIndependent: false,
  mktToken: '',
  cloudExpireInfo: {
    remindFlag: 0, //提醒标识 0不提醒 1提醒 2 临近过期
    overdueFlag: 0 // 0未过期 1 已过期
  } as {
    remindFlag: number //提醒标识 0不提醒 1提醒
    dueDate?: string //到期时间
    diffDays?: number //差几天到期
    overdueFlag: number
  },
  allowStaffViewClientPhone: '1'
}

export type GoodsManageState = typeof initState

let fetchTask

const goodsManageModel: Model<GoodsManageState> = {
  namespace: 'goodsManage',
  state: initState,
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    },
    resetGoods(state) {
      return {
        ...state,
        goodsDetail: { ...initState.goodsDetail }
      }
    },
    resetList(state) {
      return {
        ...state,
        goodsList: [],
        pageNo: 1
      }
    },
    addPageNo(state) {
      return { ...state, pageNo: state.pageNo + 1 }
    },
    addGoods(state, { payload }) {
      return {
        ...state,
        goodsList: [...state.goodsList, ...payload.goodsList]
      }
    },
    updateSpuChecked(state, { payload }) {
      const {
        styleId,
        name,
        checked
      }: { styleId: number; checked: boolean; name: string } = payload
      return {
        ...state,
        goodsList: state.goodsList.map(spu =>
          spu.styleId === styleId ? { ...spu, checked } : { ...spu }
        )
      }
    },
    updateCheckedSpu(state, { payload }) {
      return {
        ...state,
        goodsList: state.goodsList.map(spu => (spu.checked ? { ...spu, ...payload } : { ...spu }))
      }
    },
    checkeAllGoods(state, { payload = {} }) {
      const { checked = true } = payload
      return {
        ...state,
        goodsList: state.goodsList.map(spu => ({ ...spu, checked }))
      }
    },
    checkePartGoods(state, { payload }) {
      const { styleIds = [] } = payload
      return {
        ...state,
        goodsList: state.goodsList.map(spu => ({ ...spu, checked: styleIds.includes(spu.styleId) }))
      }
    },
    removeGoods(state, { payload }) {
      const { styleIds } = payload
      const _styleIds = styleIds.split(',')
      return {
        ...state,
        goodsList: state.goodsList.reduce<ISpu[]>((prev, cur) => {
          if (!_styleIds.includes(String(cur.styleId))) {
            prev.push(cur)
          }
          return prev
        }, [])
      }
    },
    resetModel() {
      return {
        ...initState
      }
    },
    updateGoodsImageLocal(state, { payload }) {
      return {
        ...state,
        goodsList: state.goodsList.map(goods => ({
          ...goods,
          imgUrl: Number(payload.spuId) === Number(goods.id) ? payload.url : goods.imgUrl,
          imgUrls: Number(payload.spuId) === Number(goods.id) ? [payload.url] : goods.imgUrls
        }))
      }
    },
    updateShopinfoLocal(state, { payload }) {
      const { mpErpId, videos, ...info } = payload
      return {
        ...state,
        shopInfo: { ...state.shopInfo, videos: JSON.parse(videos), ...info }
      }
    },
    deleteVideoLocal(state, { payload }) {
      return {
        ...state,
        videos: state.videos.filter(v => v.id !== payload.id)
      }
    },
    updateClientShopBlackUser(state, { payload }) {
      return {
        ...state,
        viewDataViewers: state.viewDataViewers.map(u => ({
          ...u,
          shopBlackUser: payload.mpUserId === u.mpUserId ? payload.val : u.shopBlackUser
        })),
        myClientList: state.myClientList.map(v => ({
          ...v,
          shopBlackUser: payload.mpUserId === v.mpUserId ? payload.val : v.shopBlackUser
        }))
      }
    },
    updateClientPriceType(state, { payload }) {
      let _key = 'priceType'
      let _value = payload.priceType
      if (payload.type === 'remark') {
        _key = 'remark'
        _value = payload.remark
      }
      return {
        ...state,
        viewDataViewers: state.viewDataViewers.map(u => ({
          ...u,
          [_key]: payload.mpUserId === u.mpUserId ? _value : u[_key]
        })),
        myClientList: state.myClientList.map(v => ({
          ...v,
          [_key]: payload.mpUserId === v.mpUserId ? _value : v[_key]
        }))
      }
    },
    updateLocalViewers(state, { payload }) {
      const { mpUserId, dwId, dwName } = payload
      const _mpUserId = Number(mpUserId)
      return {
        ...state,
        viewDataViewers: state.viewDataViewers.map(v => ({
          ...v,
          dwId: v.mpUserId === _mpUserId ? dwId : v.dwId,
          dwName: v.mpUserId === _mpUserId ? dwName : v.dwName
        })),
        myClientList: state.myClientList.map(v => ({
          ...v,
          dwId: v.mpUserId === _mpUserId ? dwId : v.dwId,
          dwName: v.mpUserId === _mpUserId ? dwName : v.dwName
        }))
      }
    },
    resetDetail(state) {
      return {
        ...state,
        goodsDetail: initState.goodsDetail
      }
    },
    resetShopInfo(state) {
      return {
        ...state,
        shopInfo: { ...initState.shopInfo }
      }
    },
    clearUserDetailData(state) {
      return {
        ...state,
        viewerSalesData: [],
        userShopViewData: [],
        shopSalesDetails: []
      }
    },
    resetIsHotUnboundTrue(state) {
      return {
        ...state,
        isHotUnbound: true
      }
    },
    resetIsHotUnboundFalse(state) {
      return {
        ...state,
        isHotUnbound: false
      }
    },
    updateAuditFlag(state, { payload }) {
      return {
        ...state,
        clientAuditList: state.clientAuditList.map(item => ({
          ...item,
          auditFlag: item.mpUserId === payload.mpUserId ? payload.auditFlag : item.auditFlag
        }))
      }
    },
    clearShareGoods(state) {
      return {
        ...state,
        manageHotList: [],
        manageNewList: [],
        useGoodsSpus: []
      }
    },
    addUseGoods(state, { payload }) {
      return {
        ...state,
        useGoodsSpus: [...state.useGoodsSpus, { ...payload.good }]
      }
    }
  },
  effects: {
    *init({ payload }, { call, put, select }) {
      yield put({
        type: 'save',
        payload: { mpErpId: -1, ...payload, pageNo: 1, goodsList: [] }
      })
      yield put.resolve({ type: 'fetchAuthAndDocUrl', payload })
      const { mpErpId, staffInfo } = yield select(state => state.goodsManage)
      if (mpErpId) {
        if (staffInfo.flag !== 1) {
          //
          const data = yield call(authShopStaff, mpErpId)
          yield put.resolve({ type: 'fetchAuthAndDocUrl', payload })
        }

        yield put({ type: 'fetchGoodsMarketStrategy' })
        // yield put({ type: 'fetchGoodsList' })
        yield put({ type: 'fetchClassList' })
        yield put({ type: 'fetchShopVideos' })
        yield put({ type: 'fetchTXCloudSign' })
        yield put({ type: 'selectShopParamSpuShowInv' })
      }
    },
    *cloudBillInitShopParam({ payload }, { call, put, select }) {
      const { mpUserId } = yield select(state => state.user)
      yield put({ type: 'selectShopParamSpuShowInv', payload: { ...payload } })
      yield put({ type: 'selectShopParamShopSlodOut', payload: { ...payload } })
      yield put({ type: 'selectShopParamPay', payload: { ...payload } })
      yield put({
        type: 'selectShopParamSpuShowPrice',
        payload: { ...payload, erpParamFirst: false, mpUserId }
      })
      yield put({
        type: 'fetchGoodsMarketStrategy',
        payload: { ...payload }
      })
    },
    *fetchTXCloudSign(_, { call, put }) {
      const { data } = yield call(getTxCloudSign)
      yield put({ type: 'save', payload: { sign: data.sign } })
    },
    *fetchClassList(_, { call, put, select }) {
      const { mpErpId, pageNo } = yield select(state => state.goodsManage)

      const { data } = yield call(fetchGoodsFilterRule, mpErpId)
      const classList = data.classList.map(d => ({
        codeName: d.name,
        codeValue: d.id,
        spuCount: d.spuCount,
        hidden: d.hidden,
        parentid: d.parentid
      }))
      yield put({
        type: 'save',
        payload: {
          classList,
          brandList: data.brandList,
          providerList: data.providerList,
          seasonList: data.seasonList,
          shopFilterList: data.shopList
        }
      })
    },
    *fetchGoodsMarketStrategy({ payload }, { call, put, select }) {
      const { mpErpId: _mpErpId } = yield select(state => state.goodsManage)
      let mpErpId = _mpErpId
      if (payload && payload.mpErpId) {
        mpErpId = payload.mpErpId
      }
      const { data } = yield call(getGoodsMarketInvStrategy, mpErpId)
      yield put({ type: 'save', payload: { marketInvStrategy: data.val } })
    },
    *setShopGoodsMarketStrategy({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(setGoodsMarketInvStrategy, mpErpId, payload.value)
      yield put({ type: 'fetchGoodsMarketStrategy' })
    },
    *fetchGoodsList({ payload = {} }, { cancel, fork, call, put, select }) {
      if (fetchTask) {
        yield cancel(fetchTask)
      }

      fetchTask = yield fork(function*() {
        const {
          loadMore = false,
          styleNameLike,
          type = 7, // 默认查已上架
          marketOptimeBegin,
          marketOptimeEnd,
          classId,
          hotType,
          styleIdsNotIn = undefined
        } = payload
        if (loadMore) {
          yield put({ type: 'addPageNo' })
        } else {
          yield put.resolve({ type: 'save', payload: { pageNo: 1, goodsList: [] } })
        }
        const { mpErpId, pageNo, sn, epid, shopId }: GoodsManageState = yield select(
          state => state.goodsManage
        )
        // const classId = currentClass ? currentClass.id : undefined
        let diffObject = {}
        const jsonParam = {
          classId,
          styleNameLike,
          marketOptimeBegin,
          marketOptimeEnd,
          hotType,
          ...payload,
          styleIdsNotIn: styleIdsNotIn ? styleIdsNotIn : undefined
        }
        // 区分是否是预览的情况
        if (mpErpId > 0) {
          diffObject = { type, mpErpId }
        } else {
          diffObject = { type, sn, epid, shopId }
        }
        const { data } = yield call(getShopGoodsList, {
          pageNo,
          pageSize: PAGE_SIZE,
          jsonParam: { ...jsonParam, ...diffObject },
          styleNameLike
        })
        const reducerType = loadMore ? 'addGoods' : 'save'
        yield put({ type: reducerType, payload: { goodsList: data.rows } })
      })
    },
    *fetchManageHotGoods({ payload }, { call, put, select }) {
      const { mpErpId, sn, epid, shopId } = yield select(state => state.goodsManage)
      let diffObject = {}
      if (mpErpId > 0) {
        diffObject = { type: 7, mpErpId }
      } else {
        diffObject = { type: 7, sn, epid, shopId }
      }
      const { data } = yield call(getShopGoodsList, {
        pageNo: 1,
        pageSize: payload.pageSize,
        jsonParam: { ...diffObject, hotType: 1 }
      })
      yield put({
        type: 'save',
        payload: {
          manageHotList: data.rows
        }
      })
    },
    *fetchManageSpecialGoods({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const params = {
        pageSize: 300,
        pageNo: 1,
        type: 10,
        mpErpId,
        ...payload
      }
      const { data } = yield call(getSpuActivity, params)
      if (data) {
        yield put({
          type: 'save',
          payload: {
            manageSpecialList: data.spuList,
            description: data.description,
            specialId: data.id
          }
        })
      }
    },
    *fetchManageNewGoods({ payload }, { call, put, select }) {
      const { mpErpId, sn, epid, shopId } = yield select(state => state.goodsManage)
      const { slhMarketDateBegin, slhMarketDateEnd } = payload
      let diffObject = {}
      if (mpErpId > 0) {
        diffObject = { type: 7, mpErpId }
      } else {
        diffObject = { type: 7, sn, epid, shopId }
      }
      const jsonParam = {
        slhMarketDateBegin,
        slhMarketDateEnd
      }
      const { data } = yield call(getShopGoodsList, {
        pageNo: 1,
        pageSize: payload.pageSize,
        jsonParam: { ...diffObject, ...jsonParam }
      })
      yield put({
        type: 'save',
        payload: {
          manageNewList: data.rows,
          newListLength: data.rows.length
        }
      })
    },
    *fetchGoodsDetail({ payload }, { call, put, select }) {
      const { mpErpId, sn, epid, shopId } = yield select(state => state.goodsManage)
      let params = {}
      let jsonParams = {}
      if (mpErpId > 0) {
        jsonParams = { mpErpId }
      } else {
        params = { sn, epid }
        jsonParams = { shopId }
      }
      const { data }: { data: IGoodsDetailFromApi } = yield call(getShopGoodsDetail, {
        ...params,
        jsonParam: {
          ...jsonParams,
          styleId: payload.spuId
        }
      })
      const { allImgUrlBig = '', videoUrl = '', skus = [] } = data
      // 将sku价格设置为spu价格，sku会没价格，暂不考虑同款不同价的情况
      const _skus = skus.map(sku => ({ ...sku, price: data.price || 0, num: 0 }))
      let medias: { url: string; typeId: number; coverUrl?: string }[] = []
      if (allImgUrlBig) {
        medias = allImgUrlBig.split(',').map(url => ({ url, typeId: 1 }))
      }
      if (videoUrl) {
        medias.unshift({ url: videoUrl, typeId: 3, coverUrl: data.coverUrl })
      }
      const { isSpecial = false } = payload
      if (isSpecial) {
        yield put({
          type: 'save',
          payload: {
            specialGoodsDetail: { ...data }
          }
        })
      } else {
        yield put({
          type: 'save',
          payload: {
            spuId: payload.spuId,
            goodsDetail: { ...data, medias, skus: _skus }
          }
        })
      }
      return Promise.resolve(data)
    },
    // 下架货品
    *takeDownGoods({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      yield call(takeDownGoodsApi, { mpErpId, styleIds: payload.styleIds })
      yield put({ type: 'removeGoods', payload: { styleIds: payload.styleIds } })
    },
    // 上架货品
    *takeUpGoods({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      yield call(takeUpGoodsApi, { mpErpId, styleIds: payload.styleIds })
      yield put({ type: 'removeGoods', payload: { styleIds: payload.styleIds } })
    },
    // 获取上传图片的地址，同时有一个鉴权的逻辑
    // 如果鉴权成功，则会返回mpErpId
    *fetchAuthAndDocUrl({ payload }, { call, put, select }) {
      // const { sn, epid, shopId } = yield select(state => state.goodsManage)
      const { data } = yield call(fetchAuthAndGoodsImgUploadUrl, { ...payload })
      const params = {
        docUploadUrl: data.docUrls[0],
        mpErpId: data.mpErpId,
        shopName: data.shopName,
        staffInfo: data.staff,
        shopLogoUrl: data.logoUrl,
        shopList: data.bindErps
      }
      if (isWeb()) {
        // web下拿不到准确的staffinfo 会从h5链接上传递过来
        delete params.staffInfo
      }
      yield put({
        type: 'save',
        payload: params
      })
    },
    *updateGoodsMedias({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { docIds, ...videoInfo } = payload
      const _docIds = docIds.join(',')
      yield call(updateGoodsMedias, {
        jsonParam: { mpErpId, docIds: _docIds, ...videoInfo }
      })
    },
    //查询客户类型
    *selectUserType({ payload }, { call, put, select }) {
      const res = yield call(queryCustomerType, {
        ...payload
      })
      yield put({ type: 'save', payload: { userList: res.data.list } })
      yield put({ type: 'save', payload: { rule: res.data.rule } })
    },
    *updateUserType({ payload }, { call, put, select }) {
      yield call(updateCustomerVisibleType, { ...payload })
    },
    //修改店铺简介信息
    *updataShopProfileInformation({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      yield call(updateShopInfo, { mpErpId, ...payload })
      yield put({ type: 'updateShopinfoLocal', payload })
    },
    //查询店铺信息
    *selelctShopProfileInformation({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const res = yield call(getShopIntroduction, { mpErpId, ...payload })
      yield put({ type: 'save', payload: { shopInfo: res.data, shopAddress: res.data.address } })
      return res.data
    },
    //获取三级联动数据
    *selectSpuStdPropType({ payload }, { call, put }) {
      const res = yield call(getSpuStdPropType)
      yield put({ type: 'save', payload: { levelList: res.data } })
    },
    *fetchShopVideos({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(fetchShopVideos, mpErpId)
      yield put({ type: 'save', payload: { videos: data.rows } })
    },
    *deleteShopVideo({ payload }, { call, put, select }) {
      yield call(deleteShopVideo, payload.id)
      yield put({ type: 'deleteVideoLocal', payload })
    },
    *uploadShopVideo({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      yield call(uploadShopVideo, { mpErpId, ...payload })
      yield put({ type: 'fetchShopVideos' })
    },
    *selectErpLinkUsers({ payload = {} }, { call, put, select }) {
      const { mpErpId, linkUsers } = yield select(state => state.goodsManage)
      const { pageNo = 1 } = payload
      const { data } = yield call(findErpLinkUsers, { mpErpId, pageNo })
      const _data = pageNo === 1 ? data : { ...data, rows: [...linkUsers.rows, ...data.rows] }
      yield put({ type: 'save', payload: { linkUsers: _data } })
    },
    *selectShopLinkUsers({ payload = { pageNo: 1 } }, { call, put, select }) {
      const { mpErpId, myClientList } = yield select(state => state.goodsManage)
      const { pageNo, searchKey } = payload
      const { data } = yield call(findShopLinkUsers, { pageNo, jsonParam: { mpErpId, searchKey } })
      const _myClientList = pageNo === 1 ? data.rows : [...myClientList, ...data.rows]
      yield put({
        type: 'save',
        payload: { myClientList: _myClientList }
      })
      return _myClientList
    },
    *selectErpQrCodeUrl({}, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getErpQrCodeUrl, { mpErpId })
      yield put({ type: 'save', payload: { erpQrCode: data.val } })
    },
    *selectShopProtectDays({}, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getShopProtectDays, { mpErpId })
      yield put({ type: 'save', payload: { shopProtectDays: data.val } })
    },
    *updateShopProtectDays({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      yield call(setShopProtectDays, { mpErpId, ...payload })
    },
    *selectShopParamStaffViewClientPhone({ payload = {} }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getShopParamVal, {
        mpErpId,
        code: 'allow_staff_view_client_phone',
        ...payload
      })
      yield put({ type: 'save', payload: { allowStaffViewClientPhone: data.val } })
    },
    *selectShopParamSpuShowInv({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getShopParamVal, { mpErpId, code: 'spu_show_inv', ...payload })
      yield put({ type: 'save', payload: { shopShowSpu: data.val } })
    },
    *selectShopParamShopSlodOut({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getShopParamVal, {
        mpErpId,
        code: 'spu_show_sold_out',
        ...payload
      })
      yield put({ type: 'save', payload: { shopShowSoldOut: data.val } })
    },
    *selestShopParamVisitorAuth({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getShopParamVal, {
        mpErpId,
        code: 'visitor_auth',
        ...payload
      })
      yield put({ type: 'save', payload: { shopVisitorAuth: data.val } })
    },
    *selectShopDefaulPriceType({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getShopParamVal, {
        mpErpId,
        code: 'spu_default_price_type',
        ...payload
      })
      yield put({ type: 'save', payload: { shopDefaulPriceType: data.val } })
      return data.val
    },
    *selectShopHotSale({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getShopParamVal, {
        mpErpId,
        code: 'system_recommend_hot_spu',
        ...payload
      })
      yield put({ type: 'save', payload: { hotSaleFlag: data.val } })
      return data.val
    },
    *selectShopParamSpuShowPrice({ payload }, { call, put, select }) {
      // 价格展示参数可单客户设置  erpParamFirst  true:店铺优先 false:用户优先
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getShopParamVal, { mpErpId, code: 'spu_show_price', ...payload })
      yield put({ type: 'save', payload: { spuShowPrice: data.val } })
      yield put({ type: 'cloudBill/saveShopParams', payload: { spuShowPrice: data.val } })
    },
    *selectShopParamTradeComponentStatus({ payload }, { call, put, select }) {
      // 价格展示参数可单客户设置  erpParamFirst  true:店铺优先 false:用户优先
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getShopParamVal, {
        mpErpId,
        code: 'trade_component_status',
        ...payload
      })
      yield put({ type: 'save', payload: { tradeComponentStatus: data.val } })
      yield put({ type: 'cloudBill/saveShopParams', payload: { tradeComponentStatus: data.val } })
    },
    *selectShopGroupBuyVal({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getShopParamVal, { mpErpId, code: 'order_by_group' })
      yield put({ type: 'save', payload: { groupBuy: data.val } })
      yield put({ type: 'cloudBill/saveShopParams', payload: { groupBuy: data.val } })
    },
    *updateShopParamVal({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { code } = yield call(setShopParamVal, { mpErpId, ...payload })
      if (payload.code === 'auto_audit_order') {
        yield put({ type: 'selectShopParamAutoAuditOrder' })
      }
      if (payload.code === 'order_pay' && code < 0) {
        return Promise.reject()
      }
    },
    *batchSelectAllShopParams({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getAllShopParamsVal, { mpErpId })
      let obj: { [key: string]: boolean } = {}

      Object.keys(data).forEach(key => {
        if (shopParamsMap[key]) {
          obj[shopParamsMap[key]] = data[key]
        }
      })

      yield put({ type: 'save', payload: { ...obj } })
      yield put({ type: 'cloudBill/saveShopParams', payload: { ...obj } })
    },
    *selectShopViewers({ payload }, { call, put, select }) {
      const { mpErpId, viewDataViewers } = yield select(state => state.goodsManage)
      const { data } = yield call(findShopViewers, { mpErpId, ...payload })
      let list: Array<{
        dwId: number
        logo: string
        mpUserId: number
        nickName: string
        viewDate: string
        viewTime: string
      }> = []
      if (payload.pageNo === 1) {
        list = data.rows
      } else {
        list = [...viewDataViewers, ...data.rows]
      }
      yield put({
        type: 'save',
        payload: {
          viewDataViewers: list
        }
      })
    },
    *updataUserJurisdiction({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      yield call(setShopParamVal, { mpErpId, ...payload })
      yield put({ type: 'updateClientShopBlackUser', payload })
    },
    *getShopViewData({}, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getShopViewData, { mpErpId })
      yield put({ type: 'save', payload: { myClientViewData: data } })
    },
    *insertMonitorShopEvent({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      yield call(monitorShopEvent, { mpErpId, ...payload })
    },
    *selectShopViewerSalesData({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getShopViewerSalesData, { ...payload, mpErpId })
      let viewerSalesData = [] as { title: string; value: number }[]
      if (Object.keys(data).length > 3) {
        viewerSalesData = [
          { title: '浏览云单/次', value: data.viewShopNum },
          { title: '浏览商品/次', value: data.viewSpuNum },
          { title: '下单数/次', value: data.orderNum },
          { title: '购买次数/次', value: data.slhBuyCount },
          { title: '购买频率/月', value: data.slhMonthRate },
          { title: '客单价/元', value: data.slhAvgPrice }
        ]
      } else {
        viewerSalesData = [
          { title: '浏览云单/次', value: data.viewShopNum },
          { title: '浏览商品/次', value: data.viewSpuNum },
          { title: '下单数/次', value: data.orderNum }
        ]
      }
      yield put({ type: 'save', payload: { viewerSalesData } })
    },
    *selectUserShopViewData({ payload }, { call, put, select }) {
      const { mpErpId, userShopViewData } = yield select(state => state.goodsManage)
      const { data } = yield call(findUserShopViewData, { ...payload, mpErpId })
      yield put({
        type: 'save',
        payload: {
          userShopViewData: payload.pageNo !== 1 ? [...userShopViewData, ...data.rows] : data.rows
        }
      })
    },
    *selectUserShopSalesDetails({ payload }, { call, put, select }) {
      const { mpErpId, shopSalesDetails } = yield select(state => state.goodsManage)
      const { data } = yield call(findUserShopSalesDetails, { ...payload, mpErpId })
      let arr = data.rows.map(item => {
        return {
          ...item,
          imgUrl: item.imgUrl && item.imgUrl.split(',')
        }
      })
      yield put({
        type: 'save',
        payload: {
          shopSalesDetails: payload.curpageno !== 1 ? [...shopSalesDetails, ...arr] : arr
        }
      })
    },
    *selectShopPriceTypeList({ paylaod }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(findShopPriceTypeList, { mpErpId })
      yield put({ type: 'save', payload: { priceTypeList: data.rows } })
      return data.rows
    },
    *selectShopStaffAuth({ payload }, { call, put, select }) {
      try {
        const { mpErpId } = yield select(state => state.goodsManage)
        const { data, code } = yield call(checkShopStaffAuth, { mpErpId, ...payload })
        if (code === 0) {
          yield put({ type: 'save', payload: { shopList: data.bindErps } })
          return Promise.resolve({ staff: data.staff, mpErpId })
        } else {
          return Promise.reject()
        }
      } catch (e) {
        return Promise.reject()
      }
    },
    *selectShopStaffList({ payload }, { call, put, select }) {
      const { mpErpId, stafflist } = yield select(state => state.goodsManage)
      const { data } = yield call(findShopStaffList, { mpErpId, ...payload })
      if (payload.curpageno === 1) {
        yield put({ type: 'save', payload: { stafflist: data.rows } })
      } else {
        yield put({ type: 'save', payload: { stafflist: [...stafflist, ...data.rows] } })
      }
    },
    *selectShopParamAutoAuditOrder({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getShopParamVal, {
        mpErpId,
        code: 'auto_audit_order',
        ...payload
      })
      yield put({ type: 'save', payload: { autoAuditOrder: data.val } })
      // yield put({ type: 'cloudBill/saveShopParams', payload: { autoAuditOrder: data.val } })
    },
    *selectShopParamPay({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getShopParamVal, {
        mpErpId,
        code: 'order_pay',
        ...payload
      })
      yield put({ type: 'save', payload: { orderPay: data.val } })
      yield put({ type: 'cloudBill/saveShopParams', payload: { orderPay: data.val } })
    },
    *findBizShops({ payload }, { call, put, select }) {
      const { data } = yield call(findBizShops, {
        ...payload
      })
      yield put({ type: 'save', payload: { bizShops: data.rows || [] } })
    },
    *getConnectorAcctTotalRecharge({ payload }, { call, put, select }) {
      const { data } = yield call(getConnectorAcctTotalRecharge, {
        ...payload
      })
      yield put({ type: 'save', payload: { buyShopNum: data.val } })
    },
    *selectShopManageData({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getShopManageData, { mpErpId })
      yield put({
        type: 'save',
        payload: {
          todayViewerCount: data.todayViewerCount,
          todayBillCount: data.todayBillCount,
          marketSpuCount: data.marketSpuCount,
          independentType: data.independentType || 0,
          saasProductType: data.saasProductType || -1,
          independentAppId: data.independentAppId || '',
          enableApplyIndependent: data.enableApplyIndependent,
          mktToken: data.mktToken
        }
      })

      if (data.saasProductType !== 40) {
        // 食品版暂不支持续费
        yield put({ type: 'fetchCloudExpire' })
      }
    },
    *fetchCloudExpire({}, { call, put, select }) {
      const { shopId, mktToken } = yield select(state => state.goodsManage)
      const { data } = yield call(getCloudExpireNoti, { shopId, mktToken })
      yield put({ type: 'save', payload: { cloudExpireInfo: data } })
    },
    *selectLastEnterShop(_, { call, put }) {
      const { data } = yield call(getLastEnterShop)
      yield put({
        type: 'save',
        payload: {
          lastEnterShop: data
        }
      })
    },
    *selectMarketShopIsolate({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getMarketShopIsolate, { mpErpId })
      yield put({
        type: 'save',
        payload: {
          shopIsolate: data.val
        }
      })
    },
    *updateMarketShopIsolate({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      yield call(setMarketShopIsolate, { ...payload, mpErpId })
    },
    *selectMarketInvSource({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(getMarketInvSourceApi, { mpErpId })
      yield put({
        type: 'save',
        payload: {
          marketInvSource: data.val
        }
      })
    },
    *updateMarketInvSource({ payload }, { call, put, select }) {
      const { mpErpId } = yield select(state => state.goodsManage)
      const { data } = yield call(setMarketInvSourceApi, { ...payload, mpErpId })
      yield put({
        type: 'save',
        payload: {
          marketInvSource: payload.value
        }
      })
      yield put({ type: 'selectMarketInvSource' })
    },
    *selectShopWaitAuditUsers({ payload }, { call, put, select }) {
      const { data } = yield call(findShopWaitAuditUsers, { ...payload })
      const { clientAuditList } = yield select(state => state.goodsManage)
      yield put({
        type: 'save',
        payload: {
          clientAuditList: payload.pageNo === 1 ? data.rows : [...clientAuditList, ...data.rows]
        }
      })
    }
  }
}

export default goodsManageModel
