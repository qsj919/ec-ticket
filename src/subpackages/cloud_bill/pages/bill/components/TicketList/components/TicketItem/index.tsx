import Taro, { pxTransform } from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import navigatorSvc from '@services/navigator'
import cn from 'classnames'
import defaultIcon from '@/images/ticket_default_shop.png'
import expressIcon from '@/images/icon/express_flag.png'
import './index.scss'

interface TicketItem {
  billno: string
  prodate: string
  totalmoney: string
  totalnum: string
  imgUrls: string
  logisNo: string
  sn: string
  epid: string
  diffDeliverNum: string
  orderSource: string // 来源 8：云单
  sendFlagVal: string
  dwname: string
}

interface Props {
  item: TicketItem
  index: number
  scrollIndex: number
  onItemClick: (i: TicketItem) => void
  shopName: string
  top: number
}

export default class TicketItemView extends React.PureComponent<Props> {
  static defaultProps = {
    item: {
      details: {
        sub: []
      }
    }
  }

  onTicketClick = () => {
    const { onItemClick, item } = this.props
    onItemClick && onItemClick(item)
  }

  render() {
    const { item, index, scrollIndex, shopName } = this.props
    const imgs = item.imgUrls ? item.imgUrls.split(',').slice(0, 4) : []
    const isExpress = typeof item.logisNo === 'string' && item.logisNo !== ''
    const diffDeliverNumString =
      item.diffDeliverNum && Number(item.diffDeliverNum) !== 0 ? `(欠${item.diffDeliverNum})` : ''
    let cloudStatus
    if (item.sendFlagVal === '0') {
      cloudStatus = '未发货'
    } else if (item.sendFlagVal === '1') {
      cloudStatus = '部分发'
    } else if (item.sendFlagVal === '2') {
      cloudStatus = '已发货'
    }
    // console.log(item, 'item')
    return (
      <View
        key={item.billno}
        onClick={this.onTicketClick}
        className={cn('ticket_item_container', 'ticket_item_container--transform', {
          // 'ticket_item_container--rotate30':
          //   scrollIndex - index > -2 && scrollIndex - index < 8,
          // 'ticket_item_container--rotate40':
          //   scrollIndex - index < 0 && scrollIndex - index > -11,
          'ticket_item_container--perspective':
            (scrollIndex - index > -8 && scrollIndex - index < 1) || index < 6
        })}
        style={{
          // top: pxTransform(index * 248 + 20)
          top: pxTransform(this.props.top),
          height: pxTransform(imgs.length > 0 ? 270 : 230)
        }}
      >
        <View className={cn('ticket_cell_container')}>
          <View className='ticket_cell'>
            {item.orderSource === '8' && (
              <View className='ticket_cell__cloud'>
                <View
                  className={cn('ticket_cell__cloud__label', {
                    ['ticket_cell__cloud__label--send']: Number(item.sendFlagVal) > 0
                  })}
                >
                  云单
                </View>
                <View
                  className={cn('ticket_cell__cloud__status', {
                    ['ticket_cell__cloud__status--send']: Number(item.sendFlagVal) > 0
                  })}
                >
                  {cloudStatus}
                </View>
              </View>
            )}
            <View className='ticket__shop_avatar'>
              <Image className='ticket__shop_avatar--img' src={defaultIcon} />
            </View>
            <View className='ticket__custom'>{`客户：${item.dwname}`}</View>
            <View className='ticket__basic_info'>
              <View>
                <View className='ticket__row'>
                  <Text className='ticket__row__text ticket__row__text--left'>{shopName}</Text>
                  <View className='ticket__row__divider' />
                  <Text className='ticket__row__text'>{`NO.${item.billno}`}</Text>
                  {/* <Text className='title'>{`批次: ${item.details.slhBatchNum}`}</Text>
              <Text className='normal_text'>{item.details.proDate}</Text> */}
                </View>
                <View className='ticket__row ticket__row--second'>
                  <Text className='ticket__row__text ticket__row__text--left'>
                    {/* {date.formatDate(item.details.proDate, 'MM-DD HH:mm')} */}
                    {item.prodate}
                  </Text>
                  {/* <View style={{ width: pxTransform(184) }} /> */}
                  <Text className='ticket__row__text'>{`${item.totalnum}件/¥${item.totalmoney}`}</Text>
                </View>
              </View>
              <View className='ticket__row_last'>
                <View className='ticket__row__images'>
                  {imgs.map((url, uIndex) => (
                    <Image
                      src={url}
                      key={url}
                      className='goods_image'
                      style={{ left: pxTransform(36 * uIndex) }}
                    />
                  ))}
                </View>
                {isExpress && <Image className='ticket__row__express' src={expressIcon} />}
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
