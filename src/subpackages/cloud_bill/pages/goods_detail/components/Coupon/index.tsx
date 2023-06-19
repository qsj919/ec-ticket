import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import images from '@src/config/images'
import { couponType } from '@src/models/models/discount/type'
import i18n from '@@/i18n'

interface Props {
  showCoupons: () => void
  coupons: Array<couponType>
}

export default class GoodsDetailCoupon extends React.PureComponent<Props> {
  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    coupons: []
  }

  render() {
    const { coupons } = this.props
    return (
      coupons.length > 0 && (
        <View className='coupon_title_view' onClick={this.props.showCoupons}>
          <Text className='title'>{i18n.t._('cheap')}</Text>
          <View className='coupon_view_right'>
            {coupons.slice(0, 2).map(item => (
              <View className='subTitle_view' key={item.id}>
                <Text className='subTitle_text'>{item.subTitle}</Text>
              </View>
            ))}
            <View className='coupon_view_right__right'>
              <Text className='right_title_word'>{i18n.t._('collectCouponsGoods')}</Text>
              <Image src={images.common.angle_right_40} className='angle_right' />
            </View>
          </View>
        </View>
      )
    )
  }
}
