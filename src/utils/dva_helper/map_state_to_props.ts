import { SPUForBillConfirm, SPUForBuy, stockBarItemForBillConfirm } from '@@types/base'
import { ReplenishmentState } from '@models/replenishment'
import { plus, times, round } from 'number-precision'
import { createSelector } from 'reselect'

const checkedSkusSelector = (state: ReplenishmentState) => state.spus
const checkedStockBarListSelector = (state: ReplenishmentState) => state.stockBarList

export const checkedSkuIds = createSelector(checkedSkusSelector, spus => {
  return spus.reduce<number[]>((ids, spu) => {
    spu.skus.forEach(sku => {
      if (sku.checked) {
        ids.push(sku.id)
      }
    })
    return ids
  }, [])
})
export const checkedSkuIdsInStockBar = createSelector(checkedStockBarListSelector, stockBarList => {
  return stockBarList.reduce<number[]>((ids, stockBarItem) => {
    stockBarItem.spus.forEach(spu => {
      spu.skus.forEach(sku => {
        if (sku.checked) {
          ids.push(sku.id)
        }
      })
    }, [])
    return ids
  }, [])
})

/**
 *
 * @param spus 款
 */
export function getTotal(spus: SPUForBillConfirm[]) {
  const result = {
    totalMoney: 0,
    totalNum: 0, // 选中款的总数量
    isAllChecked: true,
    atLeastOneChecked: false, //
    totalSkuNum: 0, // 选中款的总款数
    totalNumWithoutChecked: 0 // 总数量
  }
  if (spus.length === 0) {
    result.isAllChecked = false
    return result
  }
  let hasUnCheked = false
  spus.forEach(spu => {
    spu.skus.forEach(sku => {
      // 购物车内总数量
      result.totalNumWithoutChecked = plus(sku.num, result.totalNumWithoutChecked)
      if (sku.checked) {
        result.atLeastOneChecked = true
      }
      // 不一定有flag字段
      if (sku.flag === 1 || !sku.hasOwnProperty('flag')) {
        if (sku.checked) {
          result.totalNum = plus(sku.num, result.totalNum)
          result.totalMoney = round(plus(result.totalMoney, times(sku.num, sku.price)), 3)
          result.totalSkuNum++
        } else {
          hasUnCheked = true
        }
      } else {
        // result.isAllChecked = false
      }
    })
  })
  result.isAllChecked = result.atLeastOneChecked && !hasUnCheked // 有选中的商品 并且 没有未选中的商品
  return result
}
export function getTotalInStockBar(
  stockBarList: stockBarItemForBillConfirm[],
  isGiftCard?: boolean
) {
  const result = {
    totalMoney: 0,
    totalNum: 0, // 选中款的总数量
    isAllChecked: true,
    atLeastOneChecked: false, //
    totalSkuNum: 0, // 选中款的总款数
    totalNumWithoutChecked: 0 // 总数量
  }
  if (stockBarList.length === 0) {
    result.isAllChecked = false
    return result
  }
  let hasUnCheked = false
  stockBarList.forEach(stockBarItem => {
    stockBarItem.spus.forEach(spu => {
      spu.skus.forEach(sku => {
        // 购物车内总数量
        result.totalNumWithoutChecked = plus(sku.num, result.totalNumWithoutChecked)
        if (sku.checked) {
          result.atLeastOneChecked = true
        }
        // 不一定有flag字段
        if (sku.flag === 1 || !sku.hasOwnProperty('flag')) {
          if (sku.checked) {
            result.totalNum = plus(sku.num, result.totalNum)
            result.totalMoney = round(plus(result.totalMoney, times(sku.num, sku.price)), 3)
            result.totalSkuNum++
          } else {
            hasUnCheked = true
          }
        } else {
          // result.isAllChecked = false
        }
      })
    })
  })
  result.isAllChecked = result.atLeastOneChecked && !hasUnCheked // 有选中的商品 并且 没有未选中的商品
  if (isGiftCard) {
    result.totalMoney = 0
  }
  return result
}

export function spusToSkuTable(spus: SPUForBillConfirm[]) {
  return spus
    .map(spu => {
      const [sizes, colors, nums] = spu.skus.reduce(
        (result, sku) => {
          const [s, c, n] = result
          if (sku.checked && sku.num > 0) {
            let sizeIndex = s.findIndex(_s => _s.sizeId === sku.sizeId)
            if (sizeIndex === -1) {
              s.push({ sizeId: sku.sizeId, sizeName: sku.sizeName })
              sizeIndex = s.length - 1
            }
            let colorIndex = c.findIndex(_c => _c.colorId === sku.colorId)
            if (colorIndex === -1) {
              c.push({ colorId: sku.colorId, colorName: sku.colorName })
              colorIndex = c.length - 1
            }

            /**
             * 有组数，并且组数与数量不匹配
             */
            const skuNumDesc =
              sku.groupNum && sku.groupNum !== sku.num
                ? `${sku.groupNum}手${sku.num}件`
                : `${sku.num}件`
            n.push({ sizeIndex, colorIndex, num: sku.num, price: sku.price, numDesc: skuNumDesc })
          }
          return result
        },
        [[], [], []] as [
          { sizeId: string; sizeName: string }[],
          { colorId: string; colorName: string }[],
          { sizeIndex: number; colorIndex: number; num: number; price: number; numDesc: string }[]
        ]
      )

      const sizeLine = ['', ...sizes.map(size => size.sizeName)]
      const colorLines = colors.map((color, index) => {
        const r = new Array(sizes.length + 1).fill('-')
        r[0] = color.colorName
        nums.forEach(numObj => {
          if (numObj.colorIndex === index) {
            r[numObj.sizeIndex + 1] = numObj.numDesc
          }
        })
        return r
      })

      const { totalNum, totalMoney } = nums.reduce(
        (result, n) => {
          result.totalNum = plus(result.totalNum, n.num)
          result.totalMoney = round(plus(result.totalMoney, times(n.num, n.price)), 3)
          return result
        },
        { totalNum: 0, totalMoney: 0 }
      )

      let _skus = spu.skus.map(sku => ({
        price: sku.price,
        sizeName: sku.sizeName,
        num: sku.num
      }))

      return {
        id: spu.id,
        name: spu.name,
        code: spu.code,
        imgUrl: spu.imgUrl,
        totalNum,
        totalMoney,
        table: [sizeLine, ...colorLines],
        rem: spu.skus[0].rem,
        skus: _skus
      }
    })
    .filter(spu => spu.table[0].length > 1)
}
