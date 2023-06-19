import dayjs from 'dayjs'
import { Bill, BillListItem, DateBillListItem, ShopBillListItem } from './types'

export function transformBillToDateGroup(bills: Bill[], base: DateBillListItem[] = []) {
  const result: DateBillListItem[] = [...base]

  bills.forEach(bill => {
    const date = new Date(bill.proDate.replace(/-/g, '/'))
    const dateKey = `${date.getFullYear()}/${date.getMonth() + 1}`
    const title =
      date.getFullYear() === new Date().getFullYear()
        ? `${date.getMonth() + 1}月`
        : `${date.getFullYear()}年${date.getMonth() + 1}月`
    const dateGroup = result.find(g => g.key === dateKey)
    const shopItem = {
      shopId: bill.shopId,
      shopName: bill.shopName,
      shopLogo: bill.shopLogo,
      epid: bill.epid,
      sn: bill.sn,
      bills: [bill]
    }
    const dateItem = {
      prodate: bill.proDate,
      month: date.getMonth() + 1,
      day: date.getDate(),
      shops: [shopItem]
    }
    const groupItem = {
      title,
      key: dateKey,
      data: [dateItem],
      total: 0,
      totalMoney: 0,
      totalNum: 0
    }
    if (dateGroup) {
      const dateTarget = dateGroup.data.find(r => r.prodate === bill.proDate)
      if (dateTarget) {
        const shopTarget = dateTarget.shops.find(shop => shop.shopId === bill.shopId)
        if (shopTarget) {
          shopTarget.bills = [...shopTarget.bills, bill]
        } else {
          dateTarget.shops = [...dateTarget.shops, shopItem]
        }
      } else {
        dateGroup.data = [...dateGroup.data, dateItem]
      }
    } else {
      result.push(groupItem)
    }
  })

  return [...result]
}

export function transformBillToShopGroup(bills: Bill[], base: ShopBillListItem = []) {
  const result: ShopBillListItem = [...base]
  bills.forEach(bill => {
    const shopTarget = result.find(shop => shop.shopId === bill.shopId)
    if (shopTarget) {
      shopTarget.bills.push({ ...bill, proDate: bill.proDate.split(' ')[0] })
    } else {
      result.push({
        shopId: bill.shopId,
        shopName: bill.shopName,
        shopLogo: bill.shopLogo,
        bills: [{ ...bill, proDate: bill.proDate.split(' ')[0] }]
      })
    }
  })

  return result
}

export function updateDateGroupSumData(
  data: DateBillListItem[],
  sumData: { billCount: number; month: string; totalMoney: number; shopNum: number }[] = []
) {
  let start = 0
  // reverse以下是因为月份数据从旧到新，而不是新的在前面。
  sumData.reverse().forEach(sum => {
    const date = dayjs(sum.month)
    const dateKey = `${date.get('year')}/${date.get('month') + 1}`
    for (let i = start; i < data.length; i++) {
      const d = data[i]
      if (d.key === dateKey) {
        d.total = sum.shopNum
        d.totalMoney = sum.totalMoney
        d.totalNum = sum.billCount
        start = i
        break
      }
    }
  })
}
