import i18n, { Language } from '@@/i18n'
import num from '@utils/num'

// deprecated use sliceString instead
// export function sliceStringOver5(s?: string | number) {
//   if (s === undefined) {
//     return ''
//   }
//   s = s.toString()
//   if (s.length > 5) {
//     return `${s.slice(0, 4)}...`
//   } else {
//     return s
//   }
// }

export function sliceString(s?: string | number, maxLength: number = 10) {
  if (s === undefined) {
    return ''
  }
  s = s.toString()
  if (s.length >= maxLength) {
    return `${s.slice(0, maxLength - 1)}...`
  } else {
    return s
  }
}

export function padStart(s: string | number, length: number, padS: string) {
  let result = ''
  s = s.toString()
  if (s.length >= length) {
    result = s
  } else {
    for (let i = 0; i < length - s.length; i++) {
      result += padS
    }
    result += s
  }

  return result
}

// deprecated use sliceString instead
// export function transformText(text: string) {
//   if (text.length > 7) {
//     return `${text.substring(0, 6)}...`
//   } else {
//     return text
//   }
// }

// 中文折扣转英文off
// export function discountToOff(execNum: number) {
//   if (!execNum) {
//     return ''
//   }
//   let execNumStr = ''
//   if (i18n.t.locale === Language.en) {
//     execNumStr = `${num.toFixed(10 - execNum, 2) * 10}%`
//   } else {
//     execNumStr = execNum.toString()
//   }
//   return execNumStr
// }

// http 转换成 https
export function httpToHttps(str: string) {
  if (!str) {
    return ''
  }
  if (str.startsWith('http:')) {
    return str.replace('http', 'https')
  }
  return str
}
