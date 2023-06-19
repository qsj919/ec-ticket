// 列表项
import Taro from '@tarojs/taro'
import React from 'react'
import { Text, View, Image } from '@tarojs/components'
import { OrderBillItem } from '@@types/GoodsType'
import { PAY_STATUS } from '@@types/base'
import { payStatusDict, reFundStatusDict } from '@@types/dict'
import './OrderBill.scss'
import { getDescByAfterSaleTypes } from '../../tool'

type Props = {
  orderBill: OrderBillItem
  onBillClick?: (billId: number, userRemark: string, afterSaleTypes: string) => void
  showPayStatus?: boolean
}

type State = {}

export default class OrderBill extends React.PureComponent<Props, State> {
  static defaultProps = {
    orderBill: {},
    showPayStatus: false
  }

  onItemClick = () => {
    this.props.onBillClick &&
      this.props.onBillClick(
        this.props.orderBill.billId,
        this.props.orderBill.userRemark || '',
        JSON.stringify(this.props.orderBill.afterSaleTypes)
      )
  }

  render() {
    const {
      orderBill: {
        billId,
        nickName,
        dwName,
        logoUrl,
        flagName,
        proTime,
        totalNum,
        totalMoney,
        styleImg,
        styleCode,
        styleName,
        slhBillNo,
        userRemark,
        payStatus,
        refundStatus,
        afterSaleTypes = []
      },
      showPayStatus
    } = this.props

    let payLabel = payStatusDict[payStatus] || ''
    let refundLabel = reFundStatusDict[refundStatus] || ''
    const desc = getDescByAfterSaleTypes(afterSaleTypes)
    const afterSaleClose = afterSaleTypes.includes(3)
    return (
      <View className='order_bill_container' key={billId} onClick={this.onItemClick}>
        <View className='order_bill_container_header'>
          <View className='nickNameView'>
            <Image mode='aspectFill' src={logoUrl} className='headImage' />
            <Text className='nickName'>{userRemark || nickName}</Text>
            <Text className='dwName'>{dwName && `(${dwName})`}</Text>
          </View>
          <Text className='order_timer'>{proTime && proTime.split(' ')[0]}</Text>
        </View>
        <View className='order_bill_container_content'>
          <View className='goods_image_view'>
            <Image mode='aspectFill' className='goodsImage' src={styleImg} />
          </View>
          <View className='goods_information'>
            <Text>{styleName}</Text>
            <Text className='goods_code'>#{styleCode}</Text>
          </View>
        </View>
        <View className='order_bill_container_bottom'>
          <View className='container'>
            <Text className='bill_no'>{`${slhBillNo && `批次：${slhBillNo}`}`}</Text>
            {desc && (
              <Text className={afterSaleClose ? 'after_sale_close_desc' : 'after_sale_desc'}>
                {desc}
              </Text>
            )}
            {showPayStatus && payLabel.length > 0 && <View className='pay_status'>{payLabel}</View>}
            {refundLabel.length > 0 && (
              <View className={`refund_status__${refundStatus}`}>{refundLabel}</View>
            )}
          </View>
          <View>
            <Text className='goods_count'>{totalNum}件</Text>
            <Text className='sum_money'>¥{totalMoney}</Text>
          </View>
        </View>
      </View>
    )
  }
}
