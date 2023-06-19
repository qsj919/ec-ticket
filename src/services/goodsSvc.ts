import i18n from '@@/i18n'
import { ISku } from '@@types/GoodsType'
import { updateCartGoods } from '@api/goods_api_manager'
import dva from '@utils/dva'

interface ISizeOrder {
  code: string
  extra1: string
  id: string
  name: string
  num: string
  opstaffName: string
  optime: string
  parentid: string
  parenttypeid: string // 排序字段
  sid: string
}

interface ISizeItem {
  sizeId?: string
  id?: string
}

class GoodsSvc {
  private sizeOrder: { [key: string | number]: ISizeOrder[] } = {}

  saveSizeOrder(order: ISizeOrder[], mpErpId: string) {
    this.sizeOrder[mpErpId] = order
  }

  sortSkusBySize<T extends ISizeItem>(skus: T[], mpErpId: string | number): T[] {
    const sizeOrder = this.sizeOrder[mpErpId] || []
    const _skus = skus.map(sku => {
      const orderItem = sizeOrder.find(o => String(o.sid) === String(sku.sizeId))
      const order = orderItem ? orderItem.parenttypeid : '0'
      return {
        ...sku,
        order
      }
    })

    _skus.sort((a, b) => Number(a.order) - Number(b.order))

    return _skus.map(({ order, ...sku }) => ({ ...sku }))
  }

  /**
   * 更新购物车内货品的「手数」
   * 主要分为2种情况：
   * 1. 参数开启，购物车内货品没有手数信息
   * 2. 参数关闭，购物车内货品却有手数信息
   * @param mpErpId 店铺id
   * @param skus 款
   * @param groupEnable 是否开启按组开单
   * @returns 款
   */
  handleGroupNum = (
    mpErpId: string,
    skus: (ISku & { id: number })[],
    groupEnable: boolean,
    shopIndex?: number
  ) => {
    const sizes = this.sizeOrder[mpErpId]
    let shouldUpdateCart = false
    if (sizes && groupEnable) {
      // 参数开启
      skus.forEach(sku => {
        const sizeItem = sizes.find(o => String(o.sid) === String(sku.sizeId))
        const numPerGroup = sizeItem ? Number(sizeItem.num) : 1
        /**
         * 手数大于1 && 购物车内的sku无手数
         * 或者
         * 当前的数量除以手数不等于每手数量
         */
        if (
          (numPerGroup > 1 && !sku.groupNum) ||
          (sku.groupNum && sku.num / sku.groupNum !== numPerGroup)
        ) {
          sku.groupNum = sku.num
          sku.num = sku.groupNum * numPerGroup
          updateCartGoods({ id: sku.id, num: sku.num, groupNum: sku.groupNum, shopIndex })
          shouldUpdateCart = true
        }
      })
    } else if (!groupEnable) {
      skus.forEach(sku => {
        if (sku.groupNum && sku.groupNum >= 1) {
          sku.num = sku.groupNum
          sku.groupNum = 0
          shouldUpdateCart = true
          updateCartGoods({ id: sku.id, num: sku.num, groupNum: sku.groupNum, shopIndex })
        }
      })
    }
    if (shouldUpdateCart) {
      if (typeof shopIndex === 'number') {
        dva.getDispatch()({ type: 'replenishment/fetchStockBarList' })
      } else {
        dva.getDispatch()({ type: 'replenishment/fetchCartGoodsList' })
      }
    }
  }
}

export default new GoodsSvc()
