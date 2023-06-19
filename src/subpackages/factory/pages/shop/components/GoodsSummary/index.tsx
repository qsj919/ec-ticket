import Taro, { eventCenter } from '@tarojs/taro'
import React, { useCallback, useState } from 'react'
import { Block, Image, Text, View } from '@tarojs/components'
import defaultGoods from '@/images/default_goods.png'
import classnames from 'classnames'
import { FSpu } from '@@/subpackages/factory/types'
import styles from './index.module.scss'

type Props = {
  data: FSpu
  onPrintClick(data: FSpu): void
}

export default function GoodsSummary(props: Props) {
  const { data, onPrintClick } = props
  const [tableVisible, setTableVisible] = useState(false)
  const onToggleTableClick = useCallback(() => {
    setTableVisible(v => !v)
  }, [setTableVisible])

  function _onPrintClick() {
    onPrintClick(data)
  }

  return (
    <View className={styles.container}>
      <View className={styles.basic}>
        <Image className={styles.goods_img} src={data.imgUrls || defaultGoods} mode='aspectFit' />
        <View className='jcsb flex1'>
          <View className='flex1 col jcsb'>
            <View>{data.spuCode}</View>
            <View>{data.spuName}</View>
            <View>{`销售 ${data.salesNum} 欠货 ${data.orderNum}`}</View>
            <View>{`库存 ${data.invNum} 可用库存 ${data.availStockNum}`}</View>
          </View>
          <View className='jcsb col' style={{ alignItems: 'flex-end' }}>
            <View className={styles.print_btn} onClick={_onPrintClick}>
              打印条码
            </View>
            <View style={{ padding: '12rpx 0 0 12rpx' }} onClick={onToggleTableClick}>
              <Text>{tableVisible ? '收起' : '展开'}</Text>
              {/* <Image /> */}
            </View>
          </View>
        </View>
      </View>
      {tableVisible && (
        <View className={styles.table}>
          <View className='aic'>
            <View className={styles.col_header}>颜色</View>
            <View className={styles.col_header}>尺寸</View>
            <View className={styles.col_header}>销售</View>
            <View className={styles.col_header}>库存</View>
            <View className={styles.col_header}>可用库存</View>
            <View className={styles.col_header}>欠货</View>
          </View>
          {data.skus.map(spu => (
            <View key={spu.colorId} className={styles.big_row}>
              <View className={styles.col} style={{ lineHeight: `${spu.data.length * 64}rpx` }}>
                {spu.color}
              </View>
              <View className='flex1'>
                {spu.data.map(sku => (
                  <View className='aic'>
                    {sku.map(label => (
                      <View className={styles.col_small}>{label}</View>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

GoodsSummary.options = { addGlobalClass: true }
