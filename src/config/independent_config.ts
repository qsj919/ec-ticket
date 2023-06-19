// eslint-disable-next-line import/no-commonjs
export default {
  pages: ['pages/index/index'],
  subPackages: [
    {
      root: 'subpackages/cloud_bill',
      pages: [
        'pages/all_goods/index',
        'pages/all_goods_search_view/index',
        'pages/goods_detail/index',
        'pages/goods_detail/goods_detail_new',
        'pages/replenishment/index',
        'pages/replenishment_confirm/index',
        'pages/replenish_success/index',
        'pages/manage/index',
        'pages/single_shop_videos/index',
        'pages/all_goods_category/index',
        'pages/goods_share_collection/index'
      ]
    },
    {
      root: 'subpackages/independent',
      pages: ['pages/mine/index', 'pages/check_before_order/index']
    },
    {
      root: 'subpackages/mine',
      pages: [
        'pages/order_list/index',
        'pages/order_list/order_list_detail/index',
        'pages/bind_phone/index',
        'pages/bind_phone_success/index',
        'pages/auth_phone/index',
        'pages/user_info/index'
      ]
    }
  ],
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['subpackages/cloud_bill']
    },
    'subpackages/cloud_bill/pages/all_goods/index': {
      network: 'all',
      packages: ['subpackages/independent', 'subpackages/mine']
    },
    'subpackages/cloud_bill/pages/goods_detail/index': {
      network: 'all',
      packages: ['subpackages/independent', 'subpackages/mine']
    }
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
    pageOrientation: 'portrait'
  },
  networkTimeout: {
    request: 20000
  },
  requiredPrivateInfos: [
    'getLocation',
    'onLocationChange',
    'startLocationUpdateBackground',
    'chooseAddress'
  ]
}
