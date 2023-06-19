import Taro from '@tarojs/taro'
import React, { PureComponent }  from 'react'
import { View, Text, Image } from '@tarojs/components'
import {
  mainType,
  fieldConfigType,
  VerifyDet,
  GlobalUserParams
} from '@pages/eTicketDetail/typeConfig'
import { t } from '@models/language'
import classnames from 'classnames'
import {
  getPayMethods,
  getBalance,
  getOthetrInfo,
  getQrcodes,
  isTempBill
} from '../../pages/eTicketDetail/helper'
import styles from './index.module.scss'

interface Props {
  main: mainType
  fieldConfig: fieldConfigType
  saasType: number
  qrUrl: string
  type: string
  renderNotDeliver: JSX.Element
  renderVerifyDets: JSX.Element
  verifys: VerifyDet[]
  config: GlobalUserParams
  useBigFont: boolean
}

export default class DetailInfoViewFromShare extends React.PureComponent<Props> {
  static defaultProps = {
    main: {},
    fieldConfig: {},
    verifys: [],
    config: {},
    useBigFont: true
  }

  onQrClick = (qr: { preview?: boolean; url: string }) => {
    Taro.previewImage({ urls: [qr.url] })
  }

  render() {
    const { qrUrl, main, fieldConfig, saasType, type, verifys, config, useBigFont } = this.props
    const isSale = main.totalNum + main.backNum !== 0
    const isBack = main.backNum !== 0
    const renderScore = typeof main.compScore !== 'undefined' && config.printClientScore === '1'
    const payMethods = getPayMethods(main)
    const balanceArray = getBalance(main, fieldConfig, saasType, verifys.length > 0)
    const otherInfo = getOthetrInfo(main)
    const qrcodes = getQrcodes(main, Number(saasType) === 1 || type === '1' ? qrUrl : '')
    const payString = payMethods.reduce((prev, cur) => {
      prev = `${prev}${t(cur.method)}：${cur.money}  `
      return prev
    }, '')
    const balanceString = balanceArray.reduce<string>((prev, cur) => {
      prev = `${prev}${cur.label}：${cur.value}  `
      return prev
    }, '')
    const scoreString = `本单积分：${main.billScore}  累计积分：${main.compScore}`
    const diffString =
      config.printDiffDeliverNum === '1' && main.diffDeliverNum && main.diffDeliverNum > 0
        ? `(欠${main.diffDeliverNum})`
        : ''
    const notShowMoney = isTempBill(main) && fieldConfig.tempbillShowAmount !== '1'
    const notShowNum = isTempBill(main) && fieldConfig.tempbillShowNum !== '1'
    const moneyString = notShowMoney ? '' : `¥${main.totalMoney + main.backMoney}`
    const numString = notShowNum ? '' : `${main.totalNum + main.backNum}${diffString}`
    return (
      <View className={styles.wrapper}>
        <View className={styles.line}>
          {isSale && <Text selectable>{`销售：${numString}    ${moneyString}`}</Text>}
          {isBack && (
            <Text selectable>{`  退货：${notShowNum ? '' : main.backNum}    ${
              notShowMoney ? '' : `¥${main.backMoney}`
            }`}</Text>
          )}
          {main.actMoney && main.actMoney !== 0 && <Text>{`   活动优惠：-¥${main.actMoney}`}</Text>}
          {main.coupMoney && main.coupMoney !== 0 && (
            <Text>{`   优惠券：-¥${main.coupMoney}`}</Text>
          )}
          {!notShowMoney && (
            <Text
              className={useBigFont && styles['big-font']}
              selectable
            >{`  总额：¥${main.totalMoney}`}</Text>
          )}
        </View>
        {this.props.renderVerifyDets}
        {!notShowMoney && (
          <View className={classnames(styles.line, styles['line--money'])}>
            <Text selectable>{payString}</Text>
            {type === '1' && <Text selectable>{balanceString}</Text>}
            {renderScore && <Text selectable>{scoreString}</Text>}
          </View>
        )}
        {this.props.renderNotDeliver}
        {String(main.invalidFlag) !== '9' && (
          <View className={styles.line}>
            <Text selectable>{`备注：${main.rem}`}</Text>
          </View>
        )}
        {!!main.createdDate && (
          <View className={styles.line}>
            <Text selectable>{`开单时间：${main.createdDate}`}</Text>
          </View>
        )}
        <View className={styles.others}>
          {otherInfo.map((item, idx) => (
            <View key={idx}>
              <Text selectable>{`${item.label ? item.label + '：' : ''}${item.value}`}</Text>
            </View>
          ))}
        </View>

        <View className={styles.qrcodes}>
          {qrcodes.map(qr => (
            <View
              key={qr.url}
              className={styles.qrcodes__qrcode}
              onClick={() => this.onQrClick(qr)}
            >
              <Image src={qr.url} className={styles.qrcodes__qrcode__img} showMenuByLongpress />
              <View>{qr.label}</View>
            </View>
          ))}
        </View>
      </View>
    )
  }
}
