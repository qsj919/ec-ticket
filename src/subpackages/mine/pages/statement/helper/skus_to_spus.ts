import { Sku } from '@@types/base'
import { plus } from 'number-precision'

export function skusToSpus(skus: Array<Sku>) {
  // 先找到相同spu的款
  // 然后根据尺码来分组
  // 以尺码组中的顺序，各自颜色取数量
  // 返回的是一个三位数组 spu => spu的尺码表
  // 0: (3) ["颜色/尺码", "S", "M"]
  // 1: (3) ["红色", 2, 2]
  // 2: (3) ["大红", 3, 0]
  const spus = skus.reduce((prev, cur) => {
    const id = cur.styleId || cur.styleid
    if (prev[id]) {
      prev[id].push(cur)
    } else {
      prev[id] = [cur]
    }
    return prev
  }, {} as { [key: string]: Sku[] })

  return Object.keys(spus).map(key => {
    const spu = spus[key]
    const spuInfo = spu.reduce(
      (prev, cur) => {
        prev.total = plus(prev.total, cur.total)
        prev.num = plus(prev.num, cur.num)
        return prev
      },
      {
        total: 0,
        num: 0
      }
    )
    const sizes = [...new Set(spu.map(item => item.sizename))]
    const colors = [...new Set(spu.map(item => item.colorname))]
    const colorWithNumbers = colors.map(color => {
      const nums = sizes.map(size => {
        return spu.reduce((prev, cur) => {
          if (cur.colorname === color && cur.sizename === size) {
            return prev + Number(cur.num) || 0
          } else {
            return prev
          }
        }, 0)
      })
      return [color, ...nums]
    })

    return {
      skus: [['颜色/尺码', ...sizes], ...colorWithNumbers],
      name: spu[0].stylename,
      code: spu[0].stylecode,
      styleType: spu[0].styleType,
      imgThumbUrl: spu[0].imgThumbUrl || '',
      ...spuInfo
    }
  })
}
