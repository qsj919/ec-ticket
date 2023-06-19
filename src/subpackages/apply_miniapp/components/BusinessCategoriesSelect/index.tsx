import Taro from '@tarojs/taro'
import React, { useEffect, useState } from 'react'
import { View, PickerView, PickerViewColumn, Text } from '@tarojs/components'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { SlideDirection } from '@components/SlideContainer/type'
import styles from './index.module.scss'

interface IProps {
  categoriesLevelMap: Map<any, any>
  handleSelected?: (cateOption: ICateOption) => void
  placeholder: string
}

export interface ICateOption {
  // level 1 的分类对象数组
  l1Categories: any[]
  // 当前 level 1 分类对应的子级类目
  corresChilds: any[]
  // 当前 level 1 类目的数组索引
  curL1CateIdx: number
  // 当前 level 2 类目的数组索引
  curL2CateIdx: number
}

export default function BusinessCategoriesSelect(props: IProps) {
  const { categoriesLevelMap, handleSelected, placeholder } = props
  const [visible, setVisible] = useState(false)
  const [cateOption, setCateOption] = useState<ICateOption>({
    l1Categories: [],
    corresChilds: [],
    curL1CateIdx: 0,
    curL2CateIdx: 0
  })

  useEffect(() => {
    const l1Categories: any[] = []
    let corresChilds: any = null
    categoriesLevelMap &&
      categoriesLevelMap.forEach((value, key) => {
        l1Categories.push(key)
        !corresChilds && (corresChilds = value)
      })
    setCateOption({
      l1Categories,
      corresChilds,
      curL1CateIdx: 0,
      curL2CateIdx: 0
    })
  }, [categoriesLevelMap])

  const onChange = e => {
    const l1CateIdx = e.detail.value[0]
    const l2CateIdx = e.detail.value[1]
    if (cateOption.curL1CateIdx != l1CateIdx) {
      let corresChilds
      categoriesLevelMap.forEach((value, key) => {
        if (key.id === cateOption.l1Categories[l1CateIdx].id) {
          corresChilds = value
        }
      })
      setCateOption(prev => {
        return {
          ...prev,
          curL1CateIdx: l1CateIdx,
          curL2CateIdx: 0,
          corresChilds
        }
      })
    }

    if (cateOption.curL2CateIdx !== l2CateIdx) {
      setCateOption(prev => {
        return {
          ...prev,
          curL2CateIdx: l2CateIdx
        }
      })
    }
  }

  const onCancel = () => setVisible(false)

  const onConfirm = () => {
    setVisible(false)
    handleSelected && handleSelected(cateOption)
  }
  return visible ? (
    <SlideContainer direction={SlideDirection.Bottom} visible mask={true} maxHeight={100}>
      <View className={styles.selectmenu}>
        <View className={styles.selectmenu__head}>
          <Text className={styles.selectmenu__cancel} onClick={onCancel}>
            取消
          </Text>
          <Text className={styles.selectmenu__confirm} onClick={onConfirm}>
            确定
          </Text>
        </View>

        <PickerView
          className={styles.selectmenu__content}
          style='width: 100%; height: 300px;'
          value={[cateOption.curL1CateIdx, cateOption.curL2CateIdx]}
          onChange={onChange}
        >
          <PickerViewColumn>
            {cateOption.l1Categories &&
              cateOption.l1Categories.map(category => {
                return <View>{category.name}</View>
              })}
          </PickerViewColumn>
          <PickerViewColumn>
            {cateOption.corresChilds &&
              cateOption.corresChilds.map(category => {
                return <View>{category.name}</View>
              })}
          </PickerViewColumn>
        </PickerView>
      </View>
    </SlideContainer>
  ) : (
    <View onClick={() => setVisible(true)}>
      {placeholder}
    </View>
  )
}
