// 列表项
import Taro from '@tarojs/taro'
import React from 'react'
import { Text, View, Image } from '@tarojs/components'
import { OrderBillItem } from '@@types/GoodsType'
import OrderBill from './OrderBill'
import './OrderBillList.scss'

type Props = {
  data: Array<OrderBillItem>
  onItemClick?: (billId: number, userRemark: string, afterSaleTypes: string) => void
  showPayStatus?: boolean
}

type State = {}

export default class OrderBillList extends React.PureComponent<Props, State> {
  static defaultProps = {
    data: []
  }

  render() {
    const { data, showPayStatus } = this.props
    return (
      <View className='order_bill_list_container'>
        {data.map(bill => (
          <OrderBill
            showPayStatus={showPayStatus}
            onBillClick={this.props.onItemClick}
            key={bill.billId}
            orderBill={bill}
          />
        ))}
      </View>
    )
  }
}
