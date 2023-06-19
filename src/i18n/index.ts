import object from '@utils/object'
import locales from './locales'

export enum Language {
  en = 'en',
  zhcn = 'zhcn'
}

export default class T {
  locale: string

  static t: T = new T('zh')

  constructor(locale: string) {
    if (locale) {
      this.locale = this.ecI18n(locale)
    }
  }

  ecI18n(lang) {
    let i18n: string
    switch (lang) {
      case 'zh':
      case 'zh_CN':
      case 'zh_TW':
      case 'zh_HK':
        i18n = 'zhcn'
        break
      case 'en':
        i18n = 'en'
        break
      default:
        i18n = 'en'
    }
    return i18n
  }

  _(line: string, value?: {}): any {
    const { locale } = this
    let string = line
    if (locale && locales(value)[locale] && locales(value)[locale][line]) {
      string = locales(value)[locale][line]
    }

    return string
  }

  multiple(lines: string[]): any {
    const { locale } = this
    let string = ''
    for (const line of lines) {
      if (locale && locales()[locale] && locales()[locale][line]) {
        string = string + locales()[locale][line]
      }
    }
    return string
  }

  static byCn(cnStrIn, value?: {}) {
    if (this.t.locale === 'zh' || this.t.locale === 'zh_CN') {
      return cnStrIn
    }
    const key = object.findKey(locales().zhcn, cnStrIn)
    if (key) {
      return this.t._(key) || cnStrIn
    } else {
      return cnStrIn
    }
  }

  static isEn() {
    return this.t.locale === 'en'
  }
}
