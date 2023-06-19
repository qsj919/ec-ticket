import Taro from '@tarojs/taro'
import React, { memo, useState, useEffect } from 'react'
import { View, Picker } from '@tarojs/components'
import { ICateOption } from '../BusinessCategoriesSelect'

interface IProps {
  categoriesLevelMap: Map<any, any>
  placeholder: string
  handleSelected?: (cateOption: ICateOption) => void
}

function BusinessCatePicker(props: IProps) {
  const { categoriesLevelMap, placeholder, handleSelected } = props
  const [allCategoriesData, setAllCategoriesData] = useState<any[][]>([[], []])
  const [indexs, setIndexs] = useState([0, 0])
  const onChange = e => {
    const d = e.detail
    let newIndexs = [...indexs]
    if (d.column !== undefined) {
      newIndexs[d.column] = d.value
    } else if (Array.isArray(d.value)) {
      // confirm
      newIndexs = d.value
      if (handleSelected !== undefined) {
        handleSelected({
          l1Categories: allCategoriesData[0],
          corresChilds: allCategoriesData[1][newIndexs[0]],
          curL1CateIdx: newIndexs[0],
          curL2CateIdx: newIndexs[1]
        })
      }
    }
    setIndexs(newIndexs)
  }

  useEffect(() => {
    const newCategoriesData: any[][] = [[], []]
    if (categoriesLevelMap) {
      categoriesLevelMap.forEach((value, key) => {
        newCategoriesData[0].push(key)
        newCategoriesData[1].push(value)
      })
    }
    setAllCategoriesData(newCategoriesData)
  }, [categoriesLevelMap])

  const getL1Categories = () => {
    return allCategoriesData[0].map(c => {
      return c.name
    })
  }

  const getL2Categories = () => {
    const curL1CateChilds = allCategoriesData[1][indexs[0]]
    if (!curL1CateChilds) return []
    return allCategoriesData[1][indexs[0]].map(c => c.name)
  }

  return (
    <Picker
      mode='multiSelector'
      value={indexs}
      range={[getL1Categories(), getL2Categories()]}
      onColumnChange={onChange}
      onChange={onChange}
    >
      <View className='picker'>{placeholder}</View>
    </Picker>
  )
}

export default memo(BusinessCatePicker)
