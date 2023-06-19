import notificationIcon from '@/images/statement/statement_icon.png'
import bindPhone from '@/images/bind_phone.png'
// import bindPhoneBg from '@/images/bind_phone_noti_bg.png'
// import search from '@/images/special/notification_search.png'
// import searchBg from '@/images/special/notification_search_bg.png'
import follow from '@/images/special/notification_follow.png'
import activityIcon from '@/images/special/notification_act.png'

const bindPhoneBg = 'https://gdoc02a.hzecool.com/2020/10/29/867384032357515784.png'
const DEFAULT = {
  title: '提示',
  button: '立即查看'
}

export const NOTIFICATION = {
  // STATEMENT: {
  //   ...DEFAULT,
  //   title: '新的对账单 更好更简单',
  //   content: '介四里没有用过的船新版本！',
  //   button: '立即查看',
  //   icon: notificationIcon
  // },
  BIND_PHONE: {
    ...DEFAULT,
    title: '还有小票看不到？',
    content: '绑定手机号，获取更多拿货店铺',
    button: '立即绑定',
    icon: bindPhone,
    // background: `url(${bindPhoneBg})`,
    color: 'white',
    theme: '#FCA222'
  },
  // BIND_PHONE_FROM_SCAN: {
  //   ...DEFAULT,
  //   title: '无法查看全部小票',
  //   content: '绑定手机号，查看全部小票',
  //   button: '立即绑定',
  //   icon: bindPhone,
  //   background: `url(${bindPhoneBg})`,
  //   color: 'white',
  //   theme: '#FCA222'
  // },
  // SEARCH: {
  //   ...DEFAULT,
  //   icon: search,
  //   title: '可以搜索店铺啦～',
  //   content: '找店！追新款！点我！！',
  //   button: '立即前往',
  //   theme: '#F2503D',
  //   color: 'white',
  //   background: `url(${searchBg})`
  // },
  // FOLLOW: {
  //   ...DEFAULT,
  //   icon: follow,
  //   title: '点击查看所有小票',
  //   content: '已有65.3万商家查看',
  //   background: 'linear-gradient(to right, #FF8F82, #FF8080)',
  //   color: 'white',
  //   theme: '#F2503D',
  //   button: '不再提醒'
  // },
  ACTIVITY: {
    ...DEFAULT,
    icon: activityIcon,
    title: '活动',
    content: '活动内容',
    button: '不再提醒',
    background: 'linear-gradient(135deg, #FFF2D0 0%, #FFE0A3 100%)',
    color: '#FF9500',
    theme: '#999'
  }
}
