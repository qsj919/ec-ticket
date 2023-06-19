/**
 * @author GaoYuJian
 * @create date 2018-11-25
 * @desc
 */

import NP from 'number-precision'

/**
 * 保留小数位数
 * @param num
 * @param digit 保留小数位数
 */
function toFixed(num: number, digit: number = 2): number {
  return NP.round(num, digit)
}

/**
 * 判断是否为非NaN, Finite的数字
 * @param num
 * @return {boolean}
 */
function isNumber(num: number | string): boolean {
  // 是否包含空格
  if (`${num}`.includes(' ')) {
    return false
  }
  if (typeof num === 'string') {
    num = Number(num)
  }
  return typeof num === 'number' && !Number.isNaN(num) && Number.isFinite(num)
}

// function getNumByDevideUnit(num: string) {
//   const number = parseFloat(num)
//   if (number > 10000) {
//     return `${(number / 10000).toFixed(2)}万`
//   }
//   return number > 0 ? number.toString() : '0'
// }

const numberUtils = {
  toFixed,
  isNumber,
  plus: NP.plus,
  minus: NP.minus,
  divide: NP.divide,
  times: NP.times,
  strip: NP.strip
  // getNumByDevideUnit
}

export default numberUtils
