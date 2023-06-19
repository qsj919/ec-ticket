// eslint-disable-next-line import/no-commonjs
export default {
  pages: [
    'pages/index/index',
    'pages/eTicketList/index',
    'pages/cloud_bill_tab/index',
    'pages/stock_bar/index',
    'pages/mine/index',
    'pages/eTicketDetail/landscapeModel',
    'pages/cloud_bill_landpage/index'
    // 'pages/download_image/index'
    // 'pages/bind_phone_poster/index',
    // 'pages/eTicketDetail/ticketShareDetail',
    // 'pages/ticket_detail_for_snapshot/index',

    // 'pages/shop_search/index'
    // 'pages/shop/index',
    // 'pages/invite_open_poster/index',
    // 'pages/map/index'
  ],
  // resizable: true,
  subPackages: [
    {
      root: 'subpackages/mine',
      pages: [
        'pages/setting/index',
        'pages/mergeBill/index',
        'pages/mergeBill/mergeBill',
        'pages/shop_list/index',
        'pages/statistics/index',
        'pages/order_ticket_list/index',
        'pages/bind_phone/index',
        'pages/bind_phone_success/index',
        'pages/auth_phone/index',
        'pages/trial/index',
        'pages/store_operation_data_report/index',
        'pages/statement/index',
        'pages/order_list/index',
        'pages/order_list/order_list_detail/index',
        'pages/ticket_report/index',
        'pages/url_switch/index',
        'pages/user_info/index'
      ]
    },
    {
      root: 'subpackages/packages_detail',
      pages: ['pages/express_track/index', 'pages/combine_express/index']
    },
    {
      root: 'subpackages/functional',
      pages: [
        'pages/download_image/index',
        'pages/fail/no_ticket',
        'pages/auth/index',
        'pages/auth_detail/index',
        'pages/auth_history/index',
        'pages/activity/index',
        'pages/prize_record/index',
        'pages/pub_web/index',
        'pages/image_share/index'
      ]
    },
    {
      root: 'subpackages/cloud_bill',
      pages: [
        'pages/cloud_bill_renew_h5/index',
        'pages/cloud_bill_pay/index',
        'pages/goods_share_index/index',
        'pages/goods_share_edit/index',
        'pages/all_goods/index',
        'pages/all_goods_category/index',
        'pages/all_goods_search_view/index',
        'pages/goods_detail/index',
        'pages/goods_detail/goods_detail_new',
        'pages/replenishment/index',
        'pages/replenishment_confirm/index',
        'pages/replenish_success/index',
        'pages/goods_manage/index',
        'pages/goods_edit/index',
        'pages/bill/index',
        'pages/manage/index',
        'pages/goods_market_rule/index',
        'pages/user_manage/index',
        'pages/shop_video/index',
        'pages/video_edit/index',
        'pages/single_shop_videos/index',
        'pages/goods_edit_list/index',
        'pages/new_protection/index',
        'pages/goods_setting/index',
        'pages/video_player_page/index',
        'pages/my_client/index',
        'pages/my_client_detail/index',
        'pages/my_client_detail_nodata/index',
        'pages/staff_detail/index',
        'pages/automatic_notification/index',
        'pages/order_bill_screen/index',
        'pages/order_bill_screen/order_bill_detail',
        'pages/use_clerk_screen/index',
        'pages/cloud_bill_guide_h5/index',
        'pages/cloud_bill_amkt_h5/index',
        'pages/audit_client/index',
        'pages/use_goods/index',
        'pages/goods_share_collection/index',
        'pages/groups_detail/index',
        'pages/category_manage/index',
        'pages/category_manage/category_sort'
      ]
    },
    {
      root: 'subpackages/factory',
      pages: [
        'pages/index/index',
        'pages/shop/index',
        'pages/order_detail/index',
        'pages/print/index'
      ]
    },
    // {
    //   root: 'subpackages/ar',
    //   pages: [
    //     // 'pages/index/index',
    //     'pages/goods_detail/index'
    //   ]
    // },
    {
      root: 'subpackages/ticket',
      pages: [
        'pages/ticket_home/index',
        'pages/ticket_search/index',
        'pages/all_shops/index',
        'pages/boss_authentication/index'
      ]
    },
    {
      root: 'subpackages/manage',
      pages: [
        'pages/store_profile/index',
        'pages/shop_address/index',
        'pages/shop_wx_code/index',
        'pages/goods_detail_manage/index',
        'pages/shop_manage/index',
        'pages/shop_special_goods/index',
        'pages/shop_hot_goods/index',
        'pages/merchant_params/index',
        'pages/merchant_wallet/index',
        'pages/shop_home_banner/index'
      ]
    },
    {
      root: 'subpackages/ticket_detail',
      pages: ['pages/eTicketDetail/landscapeModel']
    },
    {
      root: 'subpackages/live',
      pages: [
        'pages/create_live/index',
        'pages/live_goods_manage/index',
        'pages/live_index/index',
        'pages/live_guide/index',
        'pages/perfect_address/index'
      ]
    },
    {
      root: 'subpackages/apply_miniapp',
      pages: ['pages/index/index', 'pages/img_cropper/index', 'pages/independent_abs/index']
    }
    // {
    //   root: 'subpackages/cloud_bill_manage',
    //   pages: [
    //     'pages/goods_manage/index',
    //   ]
    // }
  ],
  preloadRule: {
    'pages/eTicketDetail/landscapeModel': {
      network: 'all',
      packages: ['subpackages/functional', 'subpackages/ticket_detail']
    },
    'subpackages/cloud_bill/pages/replenish_success/index': {
      network: 'all',
      packages: ['subpackages/mine']
    },
    'pages/cloud_bill_tab/index': {
      network: 'all',
      packages: ['subpackages/cloud_bill']
    },
    'pages/eTicketList/index': {
      network: 'all',
      packages: ['subpackages/ticket', 'subpackages/ticket_detail']
    },
    'subpackages/cloud_bill/pages/goods_manage/index': {
      network: 'all',
      packages: ['subpackages/manage']
    }
  },
  tabBar: {
    list: [
      {
        pagePath: 'pages/cloud_bill_tab/index',
        text: '云单',
        iconPath: 'assets/images/tabbar/cloud_bill.png',
        selectedIconPath: 'assets/images/tabbar/cloud_bill_selected.png'
      },
      {
        pagePath: 'pages/eTicketList/index',
        text: '小票',
        iconPath: 'assets/images/tabbar/ticket.png',
        selectedIconPath: 'assets/images/tabbar/ticket_selected.png'
      },
      // {
      //   pagePath: 'pages/statement/index',
      //   text: '对账单',
      //   iconPath: 'assets/images/tabbar/statement.png',
      //   selectedIconPath: 'assets/images/tabbar/statement_selected.png'
      // },
      {
        pagePath: 'pages/stock_bar/index',
        text: '进货车',
        iconPath: 'assets/images/tabbar/stock_bar.png',
        selectedIconPath: 'assets/images/tabbar/stock_bar_selected.png'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/images/tabbar/mine.png',
        selectedIconPath: 'assets/images/tabbar/mine_selected.png'
      }
    ],
    color: '#666',
    selectedColor: '#FF3337',
    backgroundColor: '#fff',
    borderStyle: 'white'
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

