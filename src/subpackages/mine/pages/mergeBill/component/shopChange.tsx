/*
 * @Author: HuKai
 * @Date: 2019-09-10 11:00:56
 * @Last Modified by: Miao Yunliang
 */
import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, ScrollView, Image } from '@tarojs/components'
import defaultLogo from '@/images/default_shop.png'

import styles from './shopChange.module.scss'

type PropsType = {
  shopId: string
  dataList: Array<{
    shopName: string
    logoUrl: string
    flag: number
    id: number
  }>
  onConfirm: Function
  onCancel: Function
}
type StateType = {
  isCheck: number
  shopItem: {}
}
export default class Index extends Component<PropsType, StateType> {
  static defaultProps = {
    dataList: []
  }
  constructor(props) {
    super(props)
    let index = 0
    for (let i = 0; i < props.dataList.length; i++) {
      const item = props.dataList[i]
      if (item.shopid == props.shopId) {
        index = i
        break
      }
    }
    this.state = {
      isCheck: index,
      shopItem: props.dataList[index]
    }
  }

  onMaskClick = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  shopItemClick = (item, index) => {
    this.setState({ shopItem: item, isCheck: index })
  }
  render() {
    const { isCheck, shopItem } = this.state
    const { dataList, onConfirm, onCancel } = this.props
    return (
      <View className={styles.modalWrapper} onTouchMove={this.onMaskClick}>
        <View className={styles.modal} />
        <View className={styles.body}>
          <View className={styles.list}>
            {dataList.length > 0 ? (
              <ScrollView scrollY className={styles.scrollView}>
                {dataList.map((item, index) => {
                  return (
                    <View
                      key={item.id}
                      className={styles.shopItem}
                      onClick={this.shopItemClick.bind(this, item, index)}
                    >
                      <View className={styles.shopInfo}>
                        <Image
                          src={item.logoUrl ? item.logoUrl : defaultLogo}
                          className={styles.shopLogo}
                        />
                        <View>{item.shopName}</View>
                      </View>
                      {isCheck === index && (
                        <View className={styles.check}>
                          <View className='at-icon at-icon-check'></View>
                        </View>
                      )}
                    </View>
                  )
                })}
              </ScrollView>
            ) : (
              <View className={styles.noData}>暂无数据</View>
            )}
          </View>
          <View className={styles.btns}>
            <View
              className={styles.cancle}
              onClick={() => {
                onCancel()
              }}
            >
              取 消
            </View>
            <View
              className={styles.confirm}
              onClick={() => {
                onConfirm(shopItem)
              }}
            >
              确 定
            </View>
          </View>
        </View>
      </View>
    )
  }
}
