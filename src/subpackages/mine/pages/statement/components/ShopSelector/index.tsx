import Taro from '@tarojs/taro'
import React, { PureComponent }  from 'react'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import SlideContainer, { SlideDirection } from '@components/SlideContainer/SlideContainer'
import checkIcon from '@/images/checked_circle_36.png'
import { ActiveShop } from '@@types/base'
import './index.scss'

interface Props {
  visible: boolean
  data: ActiveShop[]
  mask?: boolean
  onRequestClose?: () => void
  onShopCellClick: (id: number) => void
}

export default class ShopSelector extends React.PureComponent<Props> {
  static defaultProps = {
    data: []
  }

  render() {
    const { visible, data, mask, onRequestClose, onShopCellClick } = this.props
    return (
      <SlideContainer
        visible={visible}
        direction={SlideDirection.Bottom}
        mask={mask}
        onRequestClose={onRequestClose}
      >
        <View className='shop_selector_container'>
          <ScrollView scrollY className='shop_selector_wrapper'>
            {data.map(item => (
              <View
                key={item.shopid}
                className='shop_selector__cell'
                onClick={() => onShopCellClick(item.shopid)}
              >
                <Image src={item.logoUrl} className='shop_selector__cell__avatar' />
                <Text className='shop_selector__cell__name'>{item.shopName}</Text>
                {item.active && (
                  <View>
                    <Image src={checkIcon} className='shop_selector__cell__active_icon' />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </SlideContainer>
    )
  }
}
