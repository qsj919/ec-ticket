/*
 * @Author: HuKai
 * @Date: 2019-08-27 08:54:39
 * @Last Modified by: Miao Yunliang
 * @Last Modified time: 2021-12-02 17:26:48
 */
import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Image } from '@tarojs/components'
// import replenishment from '@/images/replenishment.png'

import defaultLogo from '@/images/default_goods.png'
import { t } from '@models/language'
import styles from './mergeBillList.module.scss'
import { detsType } from '../typeConfig'

type PropsType = {
  rows: detsType
}

type StateType = {}

class Index extends Component<PropsType, StateType> {
  static defaultProps = {
    rows: []
  }

  constructor(props) {
    super(props)
  }
  render() {
    const { rows } = this.props
    let sumNum = 0
    rows.forEach(row => {
      sumNum += row.totalNum
      row['sumNum'] = sumNum
    })
    return (
      <View className={styles.listFormWrapper}>
        <View className={styles.listFormTitle}>
          <View className={styles.code}>{t('code')}</View>
          <View className={styles.image}>{t('image')}</View>
          <View className={styles.name}>{t('name')}</View>
          <View className={styles.color}>{t('color')}</View>
          {rows[0].sizeNumArr.map((item, index) => (
            <View className={styles.size} key={index}>
              {item.name}
            </View>
          ))}
          <View className={styles.num}>{t('number')}</View>
          <View className={styles.price}>{t('price')}</View>
          <View className={styles.money}>{t('money')}</View>
        </View>
        {rows.map((item, i) => (
          <View className={styles.listFormRow} key={i}>
            <View className={styles.code}>
              {/* {item.repFlag === 1 && (
                <View className={styles.imgCover}>
                  <Image className={styles.img} src={replenishment} />
                </View>
              )} */}
              <View>{item.code}</View>
            </View>
            <View className={styles.image}>
              <View className={styles.imgCover}>
                <Image className={styles.img} src={item.imgUrl ? item.imgUrl : defaultLogo} />
              </View>
            </View>
            <View className={styles.name}>{item.name}</View>
            <View className={styles.color}>{item.color}</View>
            {item.sizeNumArr.map((ele, j) => (
              <View className={styles.size} key={j}>
                {ele.value}
              </View>
            ))}
            <View className={styles.num}>{item.totalNum}</View>
            <View className={styles.price}>{item.price}</View>
            <View className={styles.money}>{item.totalNum * item.price}</View>
          </View>
        ))}
        <View className={styles.listFormSum}>
          <View className={styles.code}>{t('sum')}</View>
          <View className={styles.image} />
          <View className={styles.name} />
          <View className={styles.color} />
          {rows[rows.length - 1].sumArr.map((item, index) => (
            <View className={styles.size} key={index}>
              {item.value === 0 ? '-' : item.value}
            </View>
          ))}
          <View className={styles.num}>{rows[rows.length - 1].sumNum}</View>
          <View className={styles.price} />
          <View className={styles.money}>
            {rows[rows.length - 1].sumNum * rows[rows.length - 1].price}
          </View>
        </View>
      </View>
    )
  }
}

export default Index
