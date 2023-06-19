import NP from 'number-precision'
import { getOneDate } from '@utils/utils'
import { t } from '@models/language'
import { mainType, fieldConfigType, VerifyDet, NotDeliverDet, GlobalUserParams } from './typeConfig'

export function getPayMethods(main: mainType) {
  // const result: = []

  const allMethods = [
    'cash',
    'remit',
    'card',
    'weiXinPay',
    'mobilePay',
    'aliPay',
    'storedValueCost',
    'debt',
    'agency'
  ]

  return allMethods.reduce<{ method: string; money: string | number }[]>((prev, cur) => {
    const money = String(main[cur])
    if (money !== '0' && money !== 'undefined') {
      prev.push({ method: cur, money })
    }
    return prev
  }, [])
}

export function getBalance(
  main: mainType,
  fieldConfig: fieldConfigType,
  saasType: number,
  showVerifySum: boolean
) {
  const result: { label: string; value: number }[] = []
  if (String(main.invalidFlag) === '9') {
    // 挂单不打印余额欠款
    return result
  }
  if (showVerifySum) {
    result.push({ label: '本次核销', value: Math.abs(main.verifySum) })
  }

  // 本单余额 / 欠款
  if (fieldConfig.showThisBalance === '1') {
    const label = main.balance >= 0 ? t('balancePlus') : t('balanceMinus')
    result.push({ label, value: Math.abs(main.balance) })
  }

  // 上次余额 / 欠款
  if (fieldConfig.showLastTimeBalance === '1') {
    const label =
      main.lastBalance - main.balance >= 0 ? t('lastTimeBalancePlus') : t('lastTimeBalanceMinus')
    const value = Math.abs(
      NP.minus(
        main.lastBalance,
        Number(saasType) !== 1 && main.storedValueCost !== 0
          ? main.balance - main.storedValueCost
          : main.balance
      )
    )
    result.push({ label, value })
  }

  // 累计余额 / 欠款
  if (fieldConfig.showLastBalance === '1') {
    const label = main.lastBalance >= 0 ? t('lastBalancePlus') : t('lastBalanceMinus')
    result.push({ label, value: Math.abs(main.lastBalance) })
  }

  return result
}

export function getOthetrInfo(main: mainType) {
  let phone = main.shopPhone || main.shopMobile
  if (main.shopPhone && main.shopMobile) {
    phone = `${main.shopPhone}  /  ${main.shopMobile}`
  }
  const result: { label?: string; value: string }[] = [
    { label: t('address'), value: main.shopAddr },
    { label: t('contactNumber'), value: phone }
  ]
  const array = [0, 1, 2, 3, 4, 5]
  array.forEach(idx => {
    const order = idx === 0 ? '' : idx + 1
    if (main['accountNo' + order]) {
      result.push({
        label: t('account'),
        value: main['accountName' + order] + main['accountNo' + order]
      })
    }
  })

  // 提醒
  if (main.printFooter) {
    result.push({ value: main.printFooter })
  }
  // 特别提醒
  if (main.bottomTips) {
    result.push({ value: main.bottomTips })
  }
  return result
}

export function getAccountInfo(main: mainType) {
  const result: { label?: string; accountName: string; accountNo: string }[] = []
  const array = [0, 1, 2, 3, 4, 5]
  array.forEach(idx => {
    const order = idx === 0 ? '' : idx + 1
    if (main['accountNo' + order]) {
      result.push({
        label: t('account') + order,
        // value: main['accountName' + order] + main['accountNo' + order]
        accountName: main['accountName' + order],
        accountNo: main['accountNo' + order]
      })
    }
  })

  return result
}

export function getQrcodes(main: mainType, qrUrl?: string) {
  const result: { url: string; label: string }[] = []
  const array = [1, 2, 3]
  array.forEach(idx => {
    const url = main['ticketQrcode' + idx]
    if (url) {
      result.push({ url, label: main['ticketTopic' + idx] })
    }
  })

  if (qrUrl && String(main.invalidFlag) !== '9') {
    result.push({ url: qrUrl, label: main.qrComment || '' })
  }

  return result
}

export function getVerifyArray(verifys: VerifyDet[]) {
  const initArray = [['核销批次'], ['发生日期'], ['类型'], ['金额'], ['数量']]
  const sum = {
    debt: 0,
    pay: 0
  }
  const _verify = verifys.reduce<Array<Array<string | number>>>((prev, cur, index) => {
    let type = ''
    if (cur.balance > 0) {
      type = '余额/退款'
      sum.pay += cur.balance
    } else {
      if (cur.balanceType === 2) {
        type = '代收'
      } else {
        type = '欠款'
      }
      sum.debt += cur.balance
    }
    prev[0].push(cur.billNO)
    prev[1].push(getOneDate(cur.proDate))
    prev[2].push(type)
    prev[3].push(Math.abs(cur.balance))
    prev[4].push(String(cur.num))

    return prev
  }, initArray)

  return {
    verifys: _verify,
    sum
  }
}

export function getNotDeliverDets(
  dets: NotDeliverDet[],
  fieldConfig: fieldConfigType,
  config: GlobalUserParams
) {
  // const { rawDets, fieldConfig, config } = this.state
  const initArray = [['序号'], ['款号'], ['名称'], ['颜色'], ['尺码'], ['总数'], ['已发'], ['未发']]
  const detsArray = dets.reduce<Array<Array<string | number>>>((prev, cur, index) => {
    prev[0].push(String(index + 1))
    prev[1].push(cur.code)
    prev[2].push(cur.name)
    prev[3].push(cur.color)
    prev[4].push(cur.size)
    prev[5].push(cur.num)
    prev[6].push(cur.deliverNum)
    prev[7].push(cur.diffDeliverNum)

    return prev
  }, initArray)

  let deleteCount = 0

  // 不显示序号
  if (fieldConfig.showSerialNumber !== '1') {
    detsArray.splice(0, 1)
    deleteCount++
  }

  // 不显示名称
  if (config.salesPrintMatName !== '1') {
    detsArray.splice(2 - deleteCount, 1)
    deleteCount++
  }

  // 不显示颜色尺码
  if (config.ignoreColorSize === '1') {
    detsArray.splice(3 - deleteCount, 2)
    deleteCount += 2
  }

  return detsArray
}

export function isTempBill(main: mainType) {
  return String(main.invalidFlag) === '9'
}
