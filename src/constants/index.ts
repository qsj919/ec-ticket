import { getEnv, ENV_TYPE } from '@tarojs/taro'

export const storage = {
  STATEMENT_NOTIFICATION: 'yk:statement_notification',
  STATEMENT_2_LINE_NOTIFICATION: 'yk:statement_2_line_notification',
  DISABLE_FOLLOW_GUIDE_NOTIFICATION: 'yk:disable_ticket_detail_follow_guide',
  USER_PARAMS: 'yk:ticket:user_params',
  DISABLE_ACTIVITY_NOTIFICATION_1: 'yk:disabl_activity_notification_1',
  VIDEO_PAGE_GUIDE: 'yk:video_guide',
  VIDEO_GESTURE_GUIDE: 'yk:video_gesture_guide',
  NO_NOTIFICATION_IMAGE: 'yk:no_notification_image',
  DIS_NEW_TICKET_GUIDE: 'yk:dis_new_ticket_guide',
  NO_FIRST_GOTO_VIDEO_BAR: 'yk:no_first_goto_video_bar',
  IMAGE_LOAD_MODE: 'yk:image_load_mode',
  OPEN_SHOP_TIME: 'yk:open_shop_time',
  H5_MOMENTS_SHARE_TIP: 'yk:h5_moment_share_tip'
}

export const EVENT_CENTER = {
  CLOUD_BILL_SHARE: 'cloudBillShare'
}

export const PAGE_SIZE = 20

export const ALL_GOODS_PAGE_SIZE = 20

export const isWeb = getEnv() === ENV_TYPE.WEB
/**
 * 对应git tag版本需要加5，即AppVersion4.0.0对应9.0.0的tag
 */
export const APP_VERSION = '4.8.5'

// 公众号profile页小程序列表、自定义菜单、模版消息、文章、文章广告、下发的小程序卡片
export const WX_PUBLIC_SCENE = [1020, 1035, 1043, 1058, 1067, 1074]
// 公众号单页模式
export const WX_MOMENTS_SCENE = 1154

export enum ALL_GOODS_TAB_ITEM {
  NEW,
  ALL = 1,
  HOT = 2,
  BUY = 3,
  STORE = -1,
  VIDEO = 4,
  ALL_GOODS = 9,
  SPECIAL = 10
}

// 1-正常 2-爆款 3-买过 4-预览

export const ALL_GOODS_TAB_DATA = [
  { label: '视频', value: ALL_GOODS_TAB_ITEM.VIDEO },
  { label: '全部', value: ALL_GOODS_TAB_ITEM.ALL },
  { label: '新品', value: ALL_GOODS_TAB_ITEM.NEW },
  { label: '爆款', value: ALL_GOODS_TAB_ITEM.HOT },
  { label: '买过', value: ALL_GOODS_TAB_ITEM.BUY }
]

export const ALL_GOODS_TAB_DATA_NEW = [
  { label: '全部', value: ALL_GOODS_TAB_ITEM.ALL_GOODS },
  { label: '上新', value: ALL_GOODS_TAB_ITEM.NEW },
  { label: '爆款', value: ALL_GOODS_TAB_ITEM.HOT },
  { label: '特价', value: ALL_GOODS_TAB_ITEM.SPECIAL }
]

export const MAX_VIDEO_DURATION = 60

export const MAX_GOODS_VIDEO_DURATION = 30

export const VIDEO_SCENE = [1175, 1176, 1177, 1195]

export const isIndependent =
  process.env.INDEPENDENT === 'foodindependent' || process.env.INDEPENDENT === 'independent'
