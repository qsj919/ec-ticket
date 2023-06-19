/*
 * @Author: HuKai
 * @Date: 2019-09-03 15:47:05
 * @Last Modified by: Miao Yunliang
 * @Last Modified time: 2021-07-09 15:36:35
 */
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import NP from 'number-precision'
import sha256 from 'crypto-js/hmac-sha256'
import md5 from 'crypto-js/md5'
import { debounce, throttle } from 'lodash'
import * as Sentry from 'sentry-miniapp'
import messageFeedback from '@services/interactive'
import dva from './dva'

export function getOneDate(time?: string | number): string {
  let date
  if (time) {
    date = new Date(time)
  } else {
    date = new Date()
  }
  const dateY = date.getFullYear()
  const dateM = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)
  const dateD = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate()
  return `${dateY}-${dateM}-${dateD}`
}

export function getDateTime(): string {
  const date = new Date()
  const dateY = date.getFullYear()
  const dateM = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)
  const dateD = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate()
  const dateH = date.getHours() >= 10 ? date.getHours() : '0' + date.getHours()
  const dateMM = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes()
  const dateS = date.getSeconds() >= 10 ? date.getSeconds() : '0' + date.getSeconds()
  return `${dateY}-${dateM}-${dateD} ${dateH}:${dateMM}:${dateS}`
}

export function getMonthLast(monthDate) {
  const dateArr = monthDate.split('-')
  const month = dateArr[1]
  const nextMonthFirstDay = new Date(dateArr[0], month, 1).valueOf()
  const oneDay = 1000 * 60 * 60 * 24
  return new Date(nextMonthFirstDay - oneDay)
}

export function isChinaPhoneNumber(phone: string) {
  return /^(?:\+?86)?1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[01356789]\d{2}|4(?:0\d|1[0-2]|9\d))|9[189]\d{2}|6[567]\d{2}|4[579]\d{2})\d{6}$/.test(
    phone
  )
}

/**
 * 计算两个日期相差天数
 * @param dateStart  yyyy-mm-dd
 * @param dateEnd yyyy-mm-dd
 * @returns {number}  相差天数
 */
export function daysDiff(dateStart: dayjs.ConfigType): number {
  let start = dayjs(dateStart)
  let end = dayjs()
  return end.diff(start, 'day')
}

export function getRelativeDate(date: string) {
  const target = dayjs(date).format('YYYY-MM-DD')
  const today = dayjs()
  if (target === today.format('YYYY-MM-DD')) {
    return '今天'
  } else if (target === today.subtract(1, 'day').format('YYYY-MM-DD')) {
    return '昨天'
  } else {
    return target
  }
}
export function getLogisRelativeDate(date: string) {
  const target = dayjs(date).format('YYYY-MM-DD')
  const today = dayjs()
  if (target === today.format('YYYY-MM-DD')) {
    return '今天'
  } else if (target === today.subtract(1, 'day').format('YYYY-MM-DD')) {
    return '昨天'
  } else {
    let _date = new Date(date)
    return `${_date.getMonth() + 1}月${
      _date.getDate() < 10 ? `0${_date.getDate()}` : _date.getDate()
    }日`
  }
}

export function formatDateWithWeekDay(date: string) {
  const dateInMD = dayjs(date).format('MM-DD')
  const dateInMDInZh = dateInMD.replace('-', '月') + '日'
  return `${dateInMDInZh} ${getWeekday(date)}`
}

export function formatDateForTicket(date: string) {
  const dateInMD = dayjs(date).format('MM-DD')
  return `${dateInMD}`
}

/**
 * 获取一个日期是星期几
 * @param date 日期
 */
export function getWeekday(date: string) {
  const day = dayjs(date).day()
  const dayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  return dayMap[day]
}

/**
 * 获取过去指定天数的起始，截止日期
 * @param target 天数
 */
export function getTargerPastDays(target: number | string) {
  const days = Number(target) || 0
  const startDate = dayjs()
    .subtract(days, 'day')
    .format('YYYY-MM-DD')
  const endDate = dayjs().format('YYYY-MM-DD')

  return {
    startDate,
    endDate
  }
}

export function getMoneyPrefix(n: number | string, minsOnly = false) {
  n = Number(n)
  if (n > 0 && !minsOnly) {
    return '+'
  } else if (n < 0) {
    return '-'
  } else {
    return ''
  }
}

/**
 * 精简金额显示
 * 大于100000显示10.xx万 保留2位
 * @param money 金额
 */
export function moneyInShort(money: number | string = 0) {
  money = Number(money)
  if (Math.abs(money - 0) < 100000) {
    return money
  } else {
    return NP.round(NP.divide(money, 10000), 2) + '万'
  }
}

/**
 * 隐藏手机号中间4位数
 * @param phone 手机号
 */
export function hidePhoneNumber(phone: string) {
  return phone.replace(/^(\d{3})\d{4}(\d+)/, '$1****$2')
}

/**
 * 判断一个对象或者数组是否为空
 * @param p 参数
 */
export function isArrayOrObjectEmpty(p: object | any[]) {
  // if (Array.isArray(p) && p.length === 0)
  const isArrayEmpty = Array.isArray(p) && p.length === 0
  const isObjectEmpty = typeof p === 'object' && Object.getOwnPropertyNames(p).length === 0
  return isArrayEmpty || isObjectEmpty
}

export function dateFormat(val: string, line?: number) {
  let day
  dayjs.locale('zh-cn')
  const date = dayjs(val)
  const currentDay = dayjs()
    .hour(0)
    .minute(0)
    .second(0)
  const dayDiff = currentDay.diff(date, 'day', true)
  // const isSameDay = current.diff(date, 'days') === 0 && current.get('days') === date.get('days')
  // const isDayBefore = current.diff(date, 'days') <= 1 && current.get('year') === date.get('year')
  const time = date.format('HH:mm')
  if (dayDiff < 0) {
    day = '今天'
  } else if (dayDiff >= 0 && dayDiff <= 1) {
    day = '昨天'
  } else {
    day = date.format('M月DD日')
  }
  if (line === 0) {
    return day
  } else {
    return time
  }
  // return `${day}\n\r${time}`
}

export function urlQueryParse(url: string) {
  let queryString = url
  if (url.includes('?')) {
    queryString = url.split('?')[1]
  }
  const result: { [key: string]: string } = {}
  queryString.split('&').forEach(pair => {
    const [key, value] = pair.split('=')
    if (key) {
      result[key] = value
    }
  })

  return result
}

export function addUrlQuery(url: string, query: { [key: string]: string | number }) {
  let urlWithoutQuery = url
  let q = {}
  if (url.includes('?')) {
    urlWithoutQuery = url.split('?')[0]
    q = urlQueryParse(url)
  }

  urlWithoutQuery += '?'

  const _query = { ...q, ...query }
  Object.keys(_query).forEach(key => {
    let str = `&${key}`
    if (_query[key]) {
      str += `=${_query[key]}`
    }
    urlWithoutQuery += str
  })

  /**
   *  由于遍历时统一添加的「&k=v」，这里去除第一个&
   */
  urlWithoutQuery = urlWithoutQuery.replace('?&', '?')

  return urlWithoutQuery
}

export function objectParseToUrlQuery(obj: object) {
  const keys = Object.keys(obj)
  let result = ''
  keys.forEach(k => {
    result += `&${k}=${obj[k]}`
  })

  return result.substring(1)
}

export function generateHashKey() {
  return dayjs().format(`YYYYMMDDHHmmssSSS${dva.getState().user.mpUserId}`)
}

// export function detailApiEncode(params: { sn: string; pk: string; epid: string }) {
//   const sign = `${params.sn}-${params.epid}-${params.pk}`
//   const sha256String = sha256(sign, '813b2010-079d-4e88-ba3b-4b39cc46fe2f').toString()
//   return md5(sha256String).toString()
// }

export function getCurrentDateNumber() {
  return dayjs().format('YYYYMMDDHHmmss')
}

export const debounceCaptureException = debounce((er: Error) => {
  Sentry.captureException(er)
}, 200)

export function formatDate(date: string, format?: string) {
  return dayjs(date).format(format)
}
// 获取某年某月有多少天
export function getDaysInOneMonth(year, month) {
  month = parseInt(month, 10)
  const day = new Date(year, month, 0)
  let days: Array<string> = []
  for (let i = 1; i <= day.getDate(); i++) {
    days.push(i < 10 ? '0' + i : i.toString())
  }
  return days
}

export function daysDistance(date) {
  let date1 = Date.parse(dayjs(date).format('YYYY-MM-DD'))
  let today = Date.parse(dayjs().format('YYYY-MM-DD'))
  let ms = Math.abs(today - date1)
  return ms / (24 * 3600 * 1000)
}

export function getDateLabel(date) {
  if (date) {
    const day = parseInt(daysDistance(date).toString())
    const month = parseInt((day / 30).toString())
    const year = parseInt((month / 12).toString())
    if (day === 0) {
      return '今天拿货'
    }
    if (day === 1) {
      return '昨天拿货'
    }
    if (day > 30) {
      if (month > 12) {
        return `${year}年前拿货`
      }
      return `${month}月前拿货`
    }
    return `${day}天前拿货`
  } else {
    return ''
  }
}

export function getVieoList(videos, goodsVideoList) {
  let list = []
  let goodsIndex = 0
  let videoIndex = 0
  let index = 0
  let _goodsVideoList = goodsVideoList.map(g => ({ ...g })).reverse()
  while (list.length < videos.length + _goodsVideoList.length) {
    if (index % 2 === 0) {
      if (_goodsVideoList[goodsIndex]) {
        list.push({ ..._goodsVideoList[goodsIndex], fromFlag: 1 })
        goodsIndex++
      } else {
        list.push({ ...videos[videoIndex], fromFlag: 0 })
        videoIndex++
      }
    } else {
      if (videos[videoIndex]) {
        list.push({ ...videos[videoIndex], fromFlag: 0 })
        videoIndex++
      } else {
        list.push({ ..._goodsVideoList[goodsIndex], fromFlag: 1 })
        goodsIndex++
      }
    }
    index++
  }
  return list
}

// 比对版本号
export function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

export function makeGdocUrlToArray(url: string) {
  const isGdoc1 = url.includes('gdoc01a')
  const isGdoc2 = url.includes('gdoc02a')
  if (isGdoc1 || isGdoc2) {
    const newUrl = url.replace(/gdoc0(\d)a/, function(match, p) {
      const n = p > 1 ? 1 : 2
      return `gdoc0${n}a`
    })
    // 优先使用gdoc02
    const result = [newUrl, url]
    if (isGdoc2) {
      result.reverse()
    }

    return result
  }

  return [url]
}

/**
 * 兼容处理路由可能为null
 * @params instance 路由
 */
export function getTaroParams(instance): any {
  let params = {};
  let ins = instance || Taro.getCurrentInstance();
  try {
    if(ins && ins.router) {
       params = ins.router.params
    } else {  // 如果获取不到，从历史路由中获取
      let pages = Taro.getCurrentPages(); 
      let thisPage = pages[pages.length - 1]; 
      if(thisPage && thisPage.options) {
        params = thisPage.options;
      }
    }
  } catch (err) { console.log(err)}
  return params || {};
}
