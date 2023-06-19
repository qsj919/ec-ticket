// /**
//  * @author GaoYuJian
//  * @create date 2019-02-13
//  * @desc
//  */

// import { createSelector } from 'reselect'
// import { GoodsPropsFiled } from '@@types/GoodsType'
// // import doc from '@utils/doc'
// import i18n from '@@/i18n'

// // import { State, GoodsActivity } from '../subpackages/cloud_bill/pages/goods_detail/type'
// import numUtl from '@utils/num'

// import noImage from '../../images/no_image.png'

// const goodsDetailSelector = (state: State) => state
// const goodsSelector = (state: State) => state.goods
// const skuItemsSelector = (state: State) => state.skuItems
// const activeColorSelector = (state: State) => state.activeColor
// const activeColorNameSelector = (state: State) => state.activeColorName
// const maxLimitedSkuNumSelector = (state: State) => state.limitedItemsNum
// const activeSizeSelector = (state: State) => state.activeSize
// const activeSizeNameSelector = (state: State) => state.activeSizeName

// const activeSkuSelector = createSelector(
//   goodsSelector,
//   skuItemsSelector,
//   activeColorSelector,
//   activeSizeSelector,
//   activeSizeNameSelector,
//   activeColorNameSelector,
//   (goods, skuItems, color, size, activeSizeName, activeColorName) => {
//     let isSplitSpu = false
//     if (goods) {
//       const { spu } = goods
//       if (spu.sizeSplitFlag === 2 || spu.colorSplitFlag === 2) {
//         isSplitSpu = true
//       }
//     }
//     const skuItem = skuItems.find(
//       item =>
//         (item.colorId === color && item.sizeId === size) ||
//         (item.sizeName === activeSizeName && item.colorName === activeColorName && isSplitSpu)
//     )
//     return skuItem && { ...skuItem }
//   }
// )

// const sizeItemsSelector = createSelector(
//   goodsSelector,
//   skuItemsSelector,
//   activeColorSelector,
//   activeColorNameSelector,
//   maxLimitedSkuNumSelector,
//   activeSizeSelector,
//   activeSizeNameSelector,
//   (goods, skuItems, activeColor, activeColorName, limitedItemsNum, activeSize, activeSizeName) => {
//     if (goods) {
//       const { spu } = goods
//       let isLimitActivity = false
//       let isGroupBuy = false
//       if (goods && goods.activity) {
//         const { activity } = goods
//         isLimitActivity = activity.actType === 1 && activity.actFlag === 3
//         isGroupBuy = activity.actType === 3 && activity.actFlag === 3
//       }
//       const stockNumFlag = isLimitActivity || isGroupBuy
//       if (spu.sizeSplitFlag === 2 || spu.colorSplitFlag === 2) {
//         let sizeNameStr = spu.splitSpec1
//         if (spu.sizeSplitFlag !== 2) {
//           sizeNameStr = spu.spec1Names
//         }
//         return (sizeNameStr || '').split(',').map(sizeName => {
//           let num = 0
//           let stockNum = 0
//           let groupNum = 0
//           let maxValidNum = 0
//           let soldOutFlag = 0
//           const completeBuy =
//             goods.activity && goods.activity.completeBuy ? goods.activity.completeBuy : 0
//           const skuItem = skuItems.find(
//             item => item.colorName === activeColorName && item.sizeName === sizeName
//           )
//           if (skuItem) {
//             num = skuItem.num ? skuItem.num : 0
//             stockNum = skuItem.stockNum
//             groupNum = skuItem.groupNum ? skuItem.groupNum : 0
//             maxValidNum = stockNumFlag
//               ? goods.activity.limitNum - completeBuy - limitedItemsNum
//               : skuItem.stockNum
//             soldOutFlag = skuItem.soldOutFlag
//           }
//           return {
//             id: 9999,
//             name: sizeName,
//             num,
//             groupNum,
//             stockNum,
//             maxValidNum,
//             active: sizeName === activeSizeName,
//             disabled: false,
//             soldOutFlag
//           }
//         })
//       }

//       if (goods.spu.spec1IdList) {
//         return spu.spec1IdList.map(sizeId => {
//           let num = 0
//           let stockNum = 0
//           let groupNum = 0
//           let maxValidNum = 0
//           let disabled = false
//           let soldOutFlag = 0
//           const completeBuy =
//             goods.activity && goods.activity.completeBuy ? goods.activity.completeBuy : 0

//           const skuItem = skuItems.find(
//             item => item.colorId === activeColor && item.sizeId === sizeId
//           )

//           if (skuItem) {
//             num = skuItem.num ? skuItem.num : 0
//             stockNum = skuItem.stockNum
//             groupNum = skuItem.groupNum ? skuItem.groupNum : 0
//             soldOutFlag = skuItem.soldOutFlag
//             maxValidNum = stockNumFlag
//               ? goods.activity.limitNum - completeBuy - limitedItemsNum
//               : skuItem.stockNum
//           }

//           const currentSizeItems = skuItems.filter(item => item.sizeId === sizeId)
//           // 当前尺码对应所有颜色的总库存
//           const totalNum = currentSizeItems.reduce((total, sku) => {
//             total += sku.stockNum
//             return total
//           }, 0)

//           if (!((stockNumFlag && goods.activity.limitNum > 0) || totalNum > 0)) {
//             disabled = true
//           }
//           const allowShelvesWhenInventoryLessThanZero = spu.noStockValidFlag
//           if (allowShelvesWhenInventoryLessThanZero === 1) {
//             disabled = false
//           }
//           return {
//             id: sizeId,
//             name: spu.ecCaption.spec1Ids[sizeId],
//             num,
//             groupNum,
//             stockNum,
//             maxValidNum,
//             active: sizeId === activeSize,
//             disabled,
//             soldOutFlag
//           }
//         })
//       }

//       return []
//     } else {
//       return []
//     }
//   }
// )

// const colorItemsSelector = createSelector(goodsDetailSelector, goodsDetail => {
//   if (goodsDetail && goodsDetail.goods) {
//     const { spu } = goodsDetail.goods
//     if (spu.colorSplitFlag === 2) {
//       if (spu.splitSpec2) {
//         return spu.splitSpec2.split(',').map(colorName => {
//           let num = 0
//           for (const item of goodsDetail.skuItems) {
//             if (item.colorName === colorName) {
//               num += item.num
//             }
//           }
//           return {
//             id: '9999',
//             name: colorName,
//             num,
//             active: colorName === goodsDetail.activeColorName
//           }
//         })
//       }
//       return []
//     }
//     if (spu.spec2IdList) {
//       return spu.spec2IdList.map(colorId => {
//         let num = 0
//         for (const item of goodsDetail.skuItems) {
//           if (item.colorId === colorId) {
//             num += item.num
//           }
//         }
//         return {
//           id: colorId,
//           name: spu.ecCaption.spec2Ids[colorId],
//           num,
//           active: colorId === goodsDetail.activeColor
//         }
//       })
//     } else {
//       return []
//     }
//   } else {
//     return []
//   }
// })

// const getTotal = createSelector(goodsDetailSelector, goodsDetail => {
//   let num = 0
//   let sum = 0
//   let groupNum = 0
//   if (goodsDetail) {
//     const { skuItems, goods, isGroupBuy } = goodsDetail
//     for (const item of skuItems) {
//       if (goods) {
//         let lastPrice
//         if (goods.spu) {
//           lastPrice = goods.spu.lastPrice
//         }
//         let price =
//           (goods &&
//             goods.activity &&
//             (goods.activity.actType === 1 || goods.activity.actType === 7) &&
//             goods.activity.actFlag === 3) ||
//           isGroupBuy
//             ? item.afterDiscountPrice
//             : item.price
//         if (lastPrice) {
//           if (price > lastPrice) {
//             price = lastPrice
//           }
//         }
//         num += item.num
//         sum += item.num * price
//       }
//     }

//     if (goods && getSizeMode(goodsDetail) === 'kid') {
//       if (goods.spu.spec2IdList) {
//         goods.spu.spec2IdList.forEach(colorId => {
//           // eslint-disable-next-line eqeqeq
//           const item = skuItems.find(skuItem => skuItem.colorId == colorId)
//           if (item) {
//             groupNum += item.num
//           }
//         })
//       }
//     }
//   }
//   return {
//     num: numUtl.toFixed(num, 2),
//     sum: numUtl.toFixed(sum, 2),
//     groupNum: numUtl.toFixed(groupNum, 2)
//   }
// })

// function getSizeMode(goodsDetail) {
//   let mode: 'normal' | 'group' | 'kid' = 'normal'
//   if (goodsDetail.goods) {
//     if (goodsDetail.goods.spu.salesWayId === 1) {
//       mode = 'group'
//     } else if (goodsDetail.goods.spu.salesWayId === 2 || goodsDetail.goods.spu.salesWayId === 3) {
//       mode = 'kid'
//     }
//   }
//   return mode
// }

// const spuRemSelector = createSelector(goodsDetailSelector, goodsDetail => {
//   return goodsDetail ? goodsDetail.spuRem : ''
// })

// const goodsActivitySelector = createSelector(goodsSelector, goods => {
//   let result = GoodsActivity.Normal
//   if (goods && goods.activity) {
//     const { activity } = goods
//     if (activity.actFlag === 3) {
//       switch (activity.actType) {
//         case 1:
//           result = GoodsActivity.Limit
//           break
//         case 2:
//           result = GoodsActivity.SecKill
//           break
//         case 3:
//           result = GoodsActivity.Group
//           break
//         case 4:
//         case 7:
//           result = GoodsActivity.Live
//           break
//         default:
//           result = GoodsActivity.Normal
//       }
//     } else if (activity.actFlag === 2) {
//       switch (activity.actType) {
//         case 1:
//           result = GoodsActivity.LimitPre
//           break
//         case 3:
//           result = GoodsActivity.GroupPre
//           break
//         default:
//           result = GoodsActivity.Normal
//       }
//     }
//   }
//   return result
// })

// const goodsBannerMediasSelector = createSelector(goodsSelector, goods => {
//   if (goods && goods.spu.ecCaption && goods.spu.ecCaption.docContent) {
//     const { spu } = goods
//     if (spu.ecCaption.docContent && spu.ecCaption.docContent.length > 0) {
//       return spu.ecCaption.docContent
//         .map(content => {
//           if (content.typeId === 1) {
//             return {
//               typeId: content.typeId,
//               url: content.docCdnUrl ? content.docCdnUrl.org : doc.originDocURL(content.docId),
//               docId: content.docId
//             }
//           } else {
//             return {
//               typeId: content.typeId,
//               url: content.videoUrl,
//               coverUrl: content.coverUrl,
//               docId: content.docId
//             }
//           }
//         })
//         .sort((item1, item2) => item2.typeId - item1.typeId)
//     } else {
//       return [{ url: noImage, typeId: 1, docId: '' }]
//     }
//   } else {
//     return []
//   }
// })

// const displaySelector = createSelector(goodsDetailSelector, getSizeMode, (goodDetail, sizeMode) => {
//   const { goods } = goodDetail
//   if (!goods) return true
//   return !((goods.spu.addSpuType === 1 || goods.spu.skuSpecialFlag === 1) && sizeMode !== 'kid')
// })

// const limitNumSelector = createSelector(
//   goodsDetailSelector,
//   goodsActivitySelector,
//   (goodDetail, goodsActivity) => {
//     const { goods } = goodDetail
//     if (!goods) return 0
//     if (goodsActivity > GoodsActivity.PreEndFlag) {
//       return goods.activity ? goods.activity.limitNum : 0
//     }
//     return 0
//   }
// )

// const disableStepperSelector = createSelector(
//   goodsDetailSelector,
//   activeSkuSelector,
//   goodsActivitySelector,
//   limitNumSelector,
//   (goodDetail, activeSku, goodsActivity, limitNum) => {
//     let disabled = false
//     let completeBuy = 0
//     const { goods } = goodDetail
//     if (!goods) return true
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     const noStockValidFlag = goods.spu.noStockValidFlag
//     if (activeSku) {
//       disabled =
//         (activeSku.groupNum > 1
//           ? activeSku.stockNum < activeSku.groupNum
//           : activeSku.stockNum <= 0) && noStockValidFlag === 0
//       if (activeSku.soldOutFlag === 1) {
//         disabled = true
//       }
//     }
//     const isInActivity = goodsActivity > GoodsActivity.PreEndFlag
//     if (isInActivity) {
//       completeBuy = goods.activity.completeBuy
//     }
//     return isInActivity && limitNum > 0 ? limitNum === completeBuy : disabled
//   }
// )
// const goodsBannerImagesSelector = createSelector(goodsBannerMediasSelector, medias =>
//   medias.filter(item => item.typeId === 1)
// )

// const goodsParamsSelector = createSelector(goodsDetailSelector, goodsDetail => {
//   const propsFiled: GoodsPropsFiled[] = []
//   let goodsParamsIntro = ''
//   const goodsParamsArray: {
//     label: string
//     value: string | Array<string>
//   }[] = []
//   if (goodsDetail.goods) {
//     const { goods } = goodsDetail
//     const {
//       goodsBrandStatus,
//       goodsFabricStatus,
//       goodsSeasonStatus,
//       productCodeStatus
//     } = goodsDetail.goodsDetail
//     const priClassId = goods.spu.ecCaption ? goods.spu.ecCaption.classIds : ''
//     const brandId = goods.spu.ecCaption ? goods.spu.ecCaption.brandId : ''
//     const fabric = goods.spu.ecCaption ? goods.spu.ecCaption.fabric : ''
//     const season = goods.spu.ecCaption ? goods.spu.ecCaption.season : ''
//     let params = {}
//     if (productCodeStatus === 1) {
//       goodsParamsArray.push({
//         label: i18n.t._('code'),
//         value: goods.spu.code
//       })
//       goodsParamsIntro += `${i18n.t._('code')} · ${i18n.t._('category')}`
//     }
//     if (priClassId && priClassId.length) {
//       if (typeof priClassId !== 'string') {
//         priClassId.forEach((item, index) => {
//           params = {
//             label: index === 0 ? i18n.t._('category') : '',
//             value: item
//           }
//           // @ts-ignore
//           goodsParamsArray.push(params)
//         })
//       }
//     }
//     if (goods.spu.virtualFlag !== 1 && goodsDetail.goodsDetail.goodsWeightStatus === 1) {
//       goodsParamsArray.push({
//         label: i18n.t._('weight'),
//         value: goods.spu.weightStr
//       })
//       goodsParamsIntro += ` · ${i18n.t._('weight')}`
//     }
//     if (goodsBrandStatus) {
//       goodsParamsArray.push({ label: i18n.t._('brand'), value: brandId })
//       goodsParamsIntro += ` · ${i18n.t._('brand')}`
//     }
//     if (goodsFabricStatus && goodsFabricStatus === 1 && fabric) {
//       goodsParamsArray.push({ label: i18n.t._('fabric'), value: fabric })
//       goodsParamsIntro += ` · ${i18n.t._('fabric')}`
//     }
//     if (goodsSeasonStatus && goodsSeasonStatus === 1 && season) {
//       goodsParamsArray.push({ label: i18n.t._('session'), value: season })
//       goodsParamsIntro += ` · ${i18n.t._('session')}`
//     }
//     if (goodsParamsIntro.startsWith(' · ')) {
//       goodsParamsIntro = goodsParamsIntro.substr(3, goodsParamsIntro.length - 3)
//     }
//     propsFiled.forEach(item => {
//       goodsParamsArray.push({
//         label: item.propFiledNameCaption,
//         value: item.propFiledValueCaption
//       })
//       goodsParamsIntro += ` · ${item.propFiledNameCaption}`
//     })
//   }

//   return {
//     goodsParamsIntro,
//     goodsParamsArray
//   }
// })

// export default {
//   sizeItemsSelector,
//   colorItemsSelector,
//   getTotal,
//   getSizeMode,
//   activeSkuSelector,
//   skuItemsSelector,
//   spuRemSelector,
//   displaySelector,
//   limitNumSelector,
//   disableStepperSelector,
//   goodsActivitySelector,
//   goodsBannerMediasSelector,
//   goodsBannerImagesSelector,
//   goodsParamsSelector
// }
