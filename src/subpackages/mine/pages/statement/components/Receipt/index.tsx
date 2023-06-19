import Taro from '@tarojs/taro'
import React, { useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import classNames from 'classnames'
import { getMoneyPrefix } from '@utils/utils'
import { minus } from 'number-precision'
import styles from './receipt.module.scss'
import { ReceiptData } from '../..'
import { getPayMethods, getPayMethodIcon, getReceiptTypeIcon } from '../../helper/receipt_helper'

// 支付方式以及金额、拿货/退货金额、件数、结余、批次

interface Props {
  data: ReceiptData
  onReceiptClick: (id: number) => void
}

const { windowHeight } = Taro.getSystemInfoSync()

export default function Receipt({ data, onReceiptClick }: Props) {
  const pays = getPayMethods(data)
  const payIcon = getPayMethodIcon(pays.length === 1 ? pays[0].label : '')

  const [isPayMethodsVisible, changePayMethodsVisible] = useState(false)

  const [angleDirection, setAngleDirection] = useState('down')

  function toggleVisible() {
    changePayMethodsVisible(visible => !visible)
  }

  function onPayClick(e) {
    e.stopPropagation()
    if (pays.length > 1) {
      const { y } = e
      if (windowHeight >= 2 * y) {
        // top
        setAngleDirection('up')
      } else {
        // down
        setAngleDirection('down')
      }
      toggleVisible()
    }
  }

  function onItemClick() {
    if (data.mainType === 1) {
      return
    }
    onReceiptClick(data.billId)
  }

  const balance = minus(data.paysum || 0, data.totalsum || 0)
  const rightText = `${getMoneyPrefix(balance)}¥${Math.abs(balance)}`
  return (
    <View className={styles.container} onClick={onItemClick}>
      <Image className={styles.tag} src={getReceiptTypeIcon(data)} />
      <View className={styles.content}>
        <View className={classNames(styles['content__column'], styles['content__column--total'])}>
          <Text className={styles.billno}>NO.{data.billno}</Text>
          <View className={styles.total}>{`${getMoneyPrefix(data.totalsum, true)}¥${Math.abs(
            data.totalsum
          )}/${data.totalnum}件`}</View>
        </View>
        {pays.length > 0 && (
          <View
            className={classNames(styles['content__column'], styles['content__column--pay'])}
            onClick={onPayClick}
          >
            <View className={styles.pay}>
              <Image className={styles.pay__sign} src={payIcon} />
              <Text className={styles.pay__amount}>¥{data.paysum}</Text>
            </View>
            {isPayMethodsVisible && (
              <View
                className={classNames(styles.multi_pay, styles[`multi_pay--${angleDirection}`])}
              >
                {pays.map(pay => (
                  <View className={styles.pay} key={pay.label}>
                    <Image className={styles.pay__sign} src={getPayMethodIcon(pay.label)} />
                    <Text className={styles.pay__amount}>¥{pay.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        <View
          className={classNames(styles['content__column'], styles['content__column--balance'], {
            [styles['content__column--in']]: data.paysum > data.totalsum,
            [styles['content__column--out']]: data.paysum < data.totalsum
          })}
        >
          {balance === 0 ? <Text className={styles.text}>已结清</Text> : rightText}
        </View>
      </View>
      {isPayMethodsVisible && <View className={styles.mask} onTouchStart={toggleVisible} />}
    </View>
  )
}

Receipt.defaultProps = {
  data: {}
}
