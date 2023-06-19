/**
 * @author GaoYuJian
 * @create date 2019-02-13
 * @desc
 */

import { BaseItem } from '@@types/base'
import { IColorSizeItem, IGoodsDetail } from '@@types/GoodsType'
import { CloudBillState } from '@models/cloud_bill'
import { GoodsManageState } from '@models/goods_manage'
import goodsSvc from '@services/goodsSvc'
import { createSelector } from 'reselect'

// const goodsDetailSelector = (state: IGoodsDetail) => state
// const goodsSelector = (state: IGoodsDetail) => state.goodsa
const mpErpIdSelector = (state: CloudBillState) => state.mpErpId
const skuItemsSelector = (state: CloudBillState) => state.goodsDetail.skus
const activeColorSelector = (state: CloudBillState) => state.activeColor
const goodsParamsSelector = (state: CloudBillState) => {
  const result: BaseItem[] = []
  const { goodsDetail } = state
  // if (goodsDetail.brandName) {
  //   result.push({ label: '品牌', value: goodsDetail.brandName })
  // }
  if (goodsDetail.className) {
    result.push({ label: '类别', value: goodsDetail.className })
  }
  if (goodsDetail.fabricName) {
    result.push({ label: '材质', value: goodsDetail.fabricName })
  }
  if (goodsDetail.seasonName) {
    result.push({ label: '季节', value: goodsDetail.seasonName })
  }
  return result
}

const colorItemsSelector = createSelector(
  skuItemsSelector,
  activeColorSelector,
  (skus, colorId) => {
    return skus.reduce<Array<IColorSizeItem>>((result, sku) => {
      const colorItem = result.find(colorItem => colorItem.id === sku.colorId)
      if (colorItem) {
        colorItem.num += sku.num
      } else {
        result.push({
          id: sku.colorId,
          name: sku.colorName,
          num: sku.num,
          checked: sku.colorId === colorId,
          invNum: sku.invNum
        })
      }
      return result
    }, [])
  }
)

const activeColorItemSelector = createSelector(
  colorItemsSelector,
  activeColorSelector,
  (colorItems, colorId) => {
    return colorItems.find(colorItem => colorItem.id === colorId)
  }
)

const sizeItemsSelector = createSelector(
  skuItemsSelector,
  activeColorSelector,
  mpErpIdSelector,
  (skus, colorId, mpErpId) => {
    return goodsSvc.sortSkusBySize(
      skus
        .filter(sku => sku.colorId === colorId)
        .map(sku => ({
          sizeId: sku.sizeId,
          id: sku.sizeId,
          name: sku.sizeName,
          num: sku.num,
          invNum: sku.invNum,
          price: sku.price,
          groupNum: sku.numPerGroup,
          step: sku.oneTimeNumLimit || 0
        })),
      mpErpId
    )
  }
)

const goodsSoldOutSelector = createSelector(skuItemsSelector, skus => {
  return skus.every(sku => sku.invNum < 1)
})

export default {
  goodsParamsSelector,
  sizeItemsSelector,
  colorItemsSelector,
  activeColorItemSelector,
  skuItemsSelector,
  goodsSoldOutSelector
}
