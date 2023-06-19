/*
 * @Author: GaoYuJian
 * @Date: 2019-10-12 15:36:06
 * @Last Modified by: Miao Yunliang
 * @Desc 埋点事件
 */

/**
 * 事件id
 */
const events = {
  share: 'share', // 分享
  ticketList: 'ticketList', // 小票列表
  ticketListSearch: 'ticketListSearch', // 小票搜索
  ticketDetail: 'ticket_detail', // 小票详情
  statistics: 'statistics', // 统计汇总
  unbind: 'unbind', // 解除门店绑定
  mergeBill: 'mergeBill', // 小票汇总
  viewTicketHistory: 'viewTicketHistory', // 用户看到了详情页的小票历史
  scrollTicketHistory: 'scrollTicketHistory', // 用户在详情页滚动了小票
  statement: 'statement',
  bothStatementAndList: 'bothStatementAndList', // 同时进了2个页面
  tab: 'tab',
  mine: 'mine',
  notification: 'notification',
  notificationClick: 'notification_click',
  notificationSearch: 'notification_search',
  phoneAppeared: 'phoneAppeared',
  phoneClicked: 'phoneClicked',
  shopSearch: 'search_shop',
  shopSearchPhoneClick: 'search_phone_click',
  shopSearchAddressClick: 'search_address_click',
  // 以下为微信事件
  downloadImages: 'download_images',
  downloadImageClick: 'download_image_click',
  downloadAllImagesClick: 'download_all_image_click',
  navigateToMicroMall: 'navigate_to_micro_mall',
  replenishSuccess: 'replenish_success',
  ticketDetailTopRightButton: 'ticket_detail_top_right_button',
  followGuideDisplayed: 'follow_guide_displayed',
  followGuideClick: 'follow_guide_click',
  disableFollowGuide: 'disable_follow_guide',
  showAd: 'show_ad',
  getPhoneNumberInTicketDetail: 'get_phone_number_in_detail',
  showWxQrCodeInHome: 'show_wx_qr_code_in_home',
  joinPrizeActivity: 'join_prize_activity',
  getThePrize: 'click_get_the_prize',
  darkMode: 'dark_mode',
  inviteOpenCloudClick: 'invite_open_cloud_click',
  enterCloudBillClick: 'enter_cloud_bill_click',
  enterReplenishmentClick: 'enter_replenishment_click',
  listDateTabClick: 'list_date_tab_click',
  timeout: 'timeout',
  screenCapture: 'screen_capture',
  jumpToShopDiary: 'jump_to_shop_diary',
  // trackExpress: 'track_express',
  // enterImageDownload: 'enter_image_download',

  // 小票聚合查询微信事件
  downloadImageInvitationClick: 'download_image_invitation_click', // 拿货相册页点击邀请
  downloadImageDownloadClick: 'download_image_download_click', // 拿货相册页点击下载
  ticketHomeGoodsRepClick: 'ticket_home_goods_rep_click', // 小票首页商品点击补货
  ticketHomeGoodsDownloadClick: 'ticket_home_goods_download_click', // 小票首页商品点击下载
  ticketHomeGoodsClick: 'ticket_home_goods_click', // 小票首页点击商品
  ticketHomeTabClickGoods: 'ticket_home_tab_click_goods', // 小票首页点击商品tab
  ticketHomeTabClickTicket: 'ticket_home_tab_click_ticket', // 小票首页点击小票tab
  ticketSearchTabClickGoods: 'ticket_search_tab_click_goods', // 搜索页点击商品tab
  ticketSearchTabClickTicket: 'ticket_search_tab_click_ticket', // 搜索页点击小票tab
  ticketSearchClick: 'ticket_search_click', // 搜索页面点击搜索
  allShopsShopClick: 'all_shops_shop_click', // 全部门店页面头像点击
  allShopsSearchClick: 'all_shops_search_click', // 点击全部门店页面搜索按钮
  eTicketListSearchClick: 'e_ticket_list_search_click', // 点击搜索按钮
  goodsClick: 'goods_click', // 点击商品进入相册
  goodsAlbumTabClick: 'goods_album_tab_click', // 点击拿货相册Tab
  selectByMonthClick: 'select_by_month_click', // 点击按月选择
  selectByDayClick: 'select_by_day_click', // 点击按日选择
  useDateCancel: 'use_date_cancel', // 点击取消按钮
  useDateConfirm: 'use_date_confirm', // 点击确认按钮
  useDateClick: 'use_date_click', // 点击筛选时间按钮
  allTicketsClick: 'all_tickets_click', // 点击全部小票
  allShopsClick: 'all_shops_click', // 点击全部头像
  shopClick: 'shop_click', // 点击顶部店铺头像
  landAllTicketClick: 'land_all_ticket_click', // 小票详情点击全部小票

  // 货品分享埋点事件
  goodsShareIndexShareClick: 'goods_share_index_share_click', // 历史分享点击分享按钮
  goodsShareMinischeme: 'goods_share_minischeme',
  goodsShareMinicard: 'goods_share_minicard',
  goodsShareSave: 'goods_share_save',
  goodsShareEditClick: 'goods_share_edit_click',
  goodsShareCustomClick: 'goods_share_custom_click',
  goodsShareHotClick: 'goods_share_hot_click',
  goodsShareNewClick: 'goods_share_new_click',
  manageShareClick: 'manage_share_click'
}

export default events

/**
 * 事件参数
 */
export const eventParams = {
  normal: 'normal',
  public: 'public', // 通过公众号推送进入
  share: 'share' // 通过分分析进入页面
}

export enum StatementSource {
  public = 'public',
  details = 'details',
  notification = 'notification'
}

export const trackCookieName = {
  statement: 'statement_enter',
  ticketList: 'ticket_list_enter',
  bothStatementAndListUploaded: 'track_statement_and_ticket'
}

// export const tabEventParmas = {
//   ticketList: 'ticketlist',
//   mine: 'mine',
//   statement: 'statement'
// }

// export const notificationParams = {
//   phone: 'phone',
//   statement: 'statement'
// }
