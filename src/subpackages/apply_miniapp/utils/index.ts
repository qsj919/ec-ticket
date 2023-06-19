/**
 * 
 * @param categories 微信可设置的所有类目数组 https://developers.weixin.qq.com/doc/oplatform/openApi/OpenApiDoc/miniprogram-management/category-management/getAllCategories.html
 * @returns 
 *  businessCategoriesIdMap Map: id -> 类目obj
 *  businessCategoryLevelMap Map: 父级类目obj -> 子级类目数组obj
 */
export const getCategoriesLevelMap = categories => {
  const businessCategoriesIdMap = new Map()
  categories.forEach(category => {
    businessCategoriesIdMap.set(category.id, category)
  })

  const businessCategoryLevelMap = new Map()
  categories.forEach(category => {
    if (category.level == 1 && category.children && category.children.length !== 0) {
      const curCategoryChildArr: any[] = []
      category.children.forEach(childId => {
        const curChildCate = businessCategoriesIdMap.get(childId)
        if (curChildCate) {
          curCategoryChildArr.push(curChildCate)
        }
      })
      businessCategoryLevelMap.set(category, curCategoryChildArr)
    }
  })

  return {
    businessCategoriesIdMap,
    businessCategoryLevelMap
  }
}
