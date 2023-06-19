import { ISpu } from '@@types/GoodsType'
import { GoodsManageState } from '@models/goods_manage'
import { createSelector } from 'reselect'
import np from 'number-precision'

const checkedSkusSelector = (state: GoodsManageState) => state.goodsList

export const checkedSpus = createSelector(checkedSkusSelector, spus => {
  // 选中的spu列表，总数量，是否全选
  // return spus.reduce<number[]>((ids, spu) => {
  //   if (spu.checked) {
  //     ids.push(spu.styleId)
  //   }
  //   return ids
  // }, [])
  const checkedSpu = spus.filter(spu => spu.checked)
  const isAllChecked = checkedSpu.length === spus.length
  const checkedSpuIds = checkedSpu.reduce((prev, cur, index) => {
    const dot = index === 0 ? '' : ','
    return prev + dot + cur.styleId
  }, '')
  const checkedSpuLength = checkedSpu.length
  return {
    checkedSpu,
    checkedSpuLength,
    isAllChecked,
    checkedSpuIds
  }
})

// export function getTotal(spus: ISpu[]) {
//   const result = {
//     totalMoney: 0,
//     totalNum: 0,
//     isAllChecked: true,
//     atLeastOneChecked: false,
//     totalSkuNum: 0,
//     totalNumWithoutChecked: 0
//   }
//   if (spus.length === 0) {
//     result.isAllChecked = false
//     return result
//   }
//   return spus.reduce((result, spu) => {
//     // 购物车内总数量
//     result.totalNumWithoutChecked = np.plus(1, result.totalNumWithoutChecked)
//     if (spu.checked) {
//       result.totalNum = np.plus(1, result.totalNum)
//       result.atLeastOneChecked = true
//       result.totalSkuNum++
//     } else {
//       result.isAllChecked = false
//     }
//     return result
//   }, result)
// }
