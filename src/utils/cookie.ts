import { isWeb } from '@constants/index'
import dayjs from 'dayjs'
import { getRequestBaseUrl } from './cross_platform_api'

const host = getRequestBaseUrl()

export function setCookie(name: string, value: string, expires, path = '/', domain = host) {
  if (isWeb) {
    document.cookie = `${name}=${value}; path=${path}; domain=${domain}; expires=${expires}`
  }
}

// 设置在本日24时就过期的cookie
export function setCookieExpiredInDay(name: string, value: string) {
  const today = dayjs()
    .add(1, 'day')
    .format('YYYY-MM-DD')
  const expires = dayjs(today).toString()
  setCookie(name, value, expires)
}

export function getCookie(name: string) {
  if (isWeb) {
    const regexp = new RegExp(`(?:(?:^|.*;\\s*)${name}\\s*\\=\\s*([^;]*).*$)|^.*$`)
    return document.cookie.replace(regexp, '$1')
  }
}
