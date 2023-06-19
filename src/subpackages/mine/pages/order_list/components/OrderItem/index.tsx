import Taro from '@tarojs/taro'
import React, { PureComponent }  from 'react'
import { View, Image, Text } from '@tarojs/components'
import defaultShopLogo from '@/images/default_shop.png'
import { PAY_STATUS } from '@@types/base'

import './index.scss'

interface OrderItem {
  billId: number
  logoUrl: string
  shopName: string
  flagName: string
  totalNum: string
  totalMoney: string
  proTime: string
  payStatus: number
  styleImg: string
  extProps: string
}

interface Props {
  item: OrderItem
  index: number
  orderPay?: boolean
  onItemClick: (i: OrderItem) => void
  addShoppingCart: (billId: number) => void
  orderCancel: (billId: number) => void
  onPayPropsClick?: (billId: number, mpErpId: number) => void
}

export default class OrderItemView extends React.PureComponent<Props> {
  static defaultProps = {
    item: {
      details: {
        sub: []
      }
    },
    orderPay: false
  }

  onClick = () => {
    const { onItemClick, item } = this.props
    onItemClick && onItemClick(item)
  }

  orderCancel = e => {
    const { orderCancel } = this.props
    e.stopPropagation()
    orderCancel(this.state.item.billId)
  }

  addShoppingCart = e => {
    const { addShoppingCart } = this.props
    e.stopPropagation()
    addShoppingCart(this.state.item.billId)
  }

  onPayClick = e => {
    e.stopPropagation()
    this.props.onPayPropsClick &&
      this.props.onPayPropsClick(this.state.item.billId, this.state.item.mpErpId)
  }

  render() {
    const { item, orderPay } = this.props
    let _extProps
    if (item.extProps) {
      _extProps = JSON.parse(item.extProps)
    }
    return (
      <View key={item.billno} onClick={this.onClick} className='item'>
        <View className='item__header'>
          {process.env.INDEPENDENT !== 'independent' && (
            <View className='item__header__left'>
              <Image className='item__header__left__img' src={item.logoUrl || defaultShopLogo} />
              <Text className='item__header__left__text'>{item.shopName}</Text>
            </View>
          )}
          <Text className='item__header__status'>{item.flagName}</Text>
        </View>
        <View className='item__img'>
          {item.styleImg &&
            item.styleImg.map(img => (
              <Image src={img} className='item__img__item' mode='aspectFill' key={img} />
            ))}
        </View>
        <View className='item__total'>
          共{item.totalNum}件 总金额: <Text>¥</Text>
          <Text>{item.totalMoney}</Text>
        </View>
        <View className='item__bottom'>
          <Text className='item__bottom__text'>{item.proTime && item.proTime.split(' ')[0]}</Text>
          <View className='aic'>
            {item.flag >= 0 &&
              item.deliverFlag === 0 &&
              item.payStatus !== PAY_STATUS.WAITING &&
              (_extProps.billSrc === 0 || (_extProps.billSrc === 1 && orderPay)) && (
                <View className='item__bottom__button' onClick={this.orderCancel}>
                  取消订货
                </View>
              )}
            <View className='item__bottom__button' onClick={this.addShoppingCart}>
              再补一单
            </View>
          </View>
          {item.payStatus === PAY_STATUS.WAITING && item.flag >= 0 && orderPay && (
            <View className='item__bottom__button' onClick={this.onPayClick}>
              立即支付
            </View>
          )}
        </View>
      </View>
    )
  }
}
