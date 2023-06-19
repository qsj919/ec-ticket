import Taro from '@tarojs/taro'
import React from 'react'
import numberUtils from '@utils/num'
import { View, Image, Text, Input, ScrollView } from '@tarojs/components'
import { Bill, BillListItem, DateBillListItem } from '@pages/eTicketList/types'
import defaultShopLogo from '@/images/default_shop.png'
import CaretDownGray from '@/images/caret_down_gray_32.png'
import { getRelativeDate } from '@utils/utils'
import cn from 'classnames'
import TicketItemView from '../TicketItemNew/index'

import './index.scss'

interface Props {
  data: DateBillListItem
  onDatePickerClick(): void
  intersectionTop?: number
  index: number
  dateString: string
}

interface State {
  isDatePickerVisible: boolean
}

export default class TicketCell extends React.Component<Props, State> {
  static options = {
    styleIsolation: 'shared'
  }

  static defaultProps = {
    data: { data: [], totalMoney: 0 },
    intersectionTop: 0,
    dateString: '选择时间'
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      isDatePickerVisible: props.index === 0
    }
  }

  ob: Taro.IntersectionObserver

  componentDidMount() {
    const { intersectionTop = 0 } = this.props
    const { windowHeight } = Taro.getSystemInfoSync()
    this.ob = Taro.createIntersectionObserver(this)
    this.ob
      .relativeToViewport({
        bottom: -(windowHeight - intersectionTop - 60),
        top: -intersectionTop
      })
      .observe('.bill_cell_new_header', res => {
        if (res.intersectionRatio > 0) {
          this.setState({ isDatePickerVisible: true })
        } else {
          if (this.props.index !== 0) {
            this.setState({ isDatePickerVisible: false })
          }
        }
      })
  }

  componentWillUnmount() {
    this.ob && this.ob.disconnect()
  }

  onCheckDetailClick = (item: Bill) => {
    Taro.navigateTo({
      url: `/pages/eTicketDetail/landscapeModel?sn=${item.sn}&epid=${item.epid}&pk=${item.billId}`
    })
  }

  onShopLogoClick = e => {
    const { shop } = e.currentTarget.dataset
    const query = `epid=${shop.epid}&shopid=${shop.shopId}&sn=${shop.sn}`
    Taro.navigateTo({
      url: `/subpackages/ticket/pages/ticket_home/index?type=1&${query}`
    })
  }

  render() {
    const { data, dateString } = this.props
    const { isDatePickerVisible } = this.state
    return (
      <View>
        <View className='bill_cell_new_header'>
          <Text className='bill_cell_new_header__title'>{data.title}</Text>
          <Text className='bill_cell_new_header__sub'>
            {`${data.total}家门店共${data.totalNum}单  `}
            <Text>¥</Text>
            <Text className='bill_cell_new_header__sum'>
              {numberUtils.toFixed(data.totalMoney)}
            </Text>
          </Text>

          {isDatePickerVisible && (
            <View className='bill_cell_new_header__date' onClick={this.props.onDatePickerClick}>
              {dateString}
              <Image src={CaretDownGray} className='bill_cell_new_header__date__icon' />
            </View>
          )}
        </View>
        <View className='bill_cell_new_list'>
          {data.data.map(item => (
            <View className='bill_cell_new' key={item.prodate}>
              <View className='bill_cell_new__date'>
                <Text className='bill_cell_new__date__day'>
                  {getRelativeDate(item.prodate).length > 2
                    ? item.day
                    : getRelativeDate(item.prodate)}
                </Text>
                <Text className='bill_cell_new__date__month'>
                  {getRelativeDate(item.prodate).length > 2 ? `${item.month}月` : ''}
                </Text>
              </View>
              <View className='bill_cell_new__content'>
                {item.shops.map(shop => (
                  <View key={shop.shopId}>
                    <View
                      data-shop={shop}
                      className='bill_cell_new__content__shop aic'
                      onClick={this.onShopLogoClick}
                    >
                      {shop.shopLogo ? (
                        <Image
                          className='bill_cell_new__content__avatar'
                          src={shop.shopLogo || defaultShopLogo}
                        />
                      ) : (
                        <View className={cn('bill_cell_new__content__avatar', 'noLogoView')}>
                          <View
                            className={cn('noLogoText', {
                              text_center: shop.shopName.length <= 3
                            })}
                            style={{
                              fontSize: `17rpx`
                            }}
                          >
                            <Text
                              style={{
                                fontSize: `${shop.shopName.length <= 3 && '25rpx'}`
                              }}
                            >
                              {shop.shopName}
                            </Text>
                          </View>
                        </View>
                      )}

                      {shop.shopName}
                    </View>
                    <View className='bill_cell_new__content__listContent'>
                      {shop.bills.map(b => (
                        <TicketItemView
                          key={b.billId}
                          item={b}
                          onItemClick={this.onCheckDetailClick}
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    )
  }
}
