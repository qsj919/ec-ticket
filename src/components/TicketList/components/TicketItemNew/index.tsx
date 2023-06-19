import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import DefaultGood from '@/images/default_good_pic.png'
import { Bill } from '@pages/eTicketList/types'
import EImage from '@components/EImage'
import numberUtils from '@utils/num'
import cn from 'classnames'
import TicketCellBg from '@/images/ticket_cell_bg.png'
import './index.scss'

interface Props {
  item: Bill
  onItemClick: (i: Bill) => void
  type: 1 | 2 | 3
}

export default class TicketItemViewNew extends React.PureComponent<Props> {
  static defaultProps = {
    item: {
      totalMoney: 0,
      details: {
        sub: []
      }
    },
    type: 2
  }

  onTicketClick = () => {
    const { onItemClick, item } = this.props
    onItemClick && onItemClick(item)
  }

  renderGoodsImgs = imgs => {
    return (
      <View className='goods_images'>
        {imgs.map((u: string, i) => (
          <View className='goods_images__img' key={i}>
            <EImage mode='aspectFill' src={u.split(',')} />
          </View>
        ))}
      </View>
    )
  }

  render() {
    const { item, type } = this.props
    const imgs = item.imgUrls ? item.imgUrls.slice(0, 3) : []
    return (
      <View
        key={item.billNo}
        onClick={this.onTicketClick}
        className={cn('ticket_itew__new', {
          ['background_bg']: type !== 1
        })}
        style={{
          backgroundColor: type === 1 ? '#f7f7f7' : '',
          borderRadius: type === 1 ? '12px' : ''
        }}
      >
        {type !== 2 && (
          <View
            className='ticket_itew__new___header'
            style={{
              marginTop: imgs.length ? '' : '6px'
            }}
          >
            <View className='ticket_itew__new___header_label'>
              {`NO.${item.billNo}`}
              {item.dwname && (
                <View
                  style={{
                    maxWidth: '105px'
                  }}
                  className='dw_name_view'
                >
                  {item.dwname}
                </View>
              )}
            </View>
            <Text
              className='ticket_itew__new___header_label ticket_itew__new___header_label--gray'
              style={{
                marginRight: type === 3 ? '80px' : ''
              }}
            >
              {item.proDate}
            </Text>
          </View>
        )}
        {type === 2 && (
          <View
            className='ticket_itew__new___header'
            style={{
              marginTop: imgs.length ? '' : '6px'
            }}
          >
            <View className='ticket_itew__new___header_label'>
              {`NO.${item.billNo}`}
              {item.dwName && (
                <View
                  style={{
                    maxWidth: '200px'
                  }}
                  className='dw_name_view'
                >
                  {item.dwName}
                </View>
              )}
            </View>
          </View>
        )}
        {type !== 1 && (
          <View className='ticket_itew__new___right'>
            <Text className='right_count'>{`共${item.totalNum}件`}</Text>
            <Text className='right_price'>
              <Text className='ticket_itew__new___content__dollar'>¥</Text>
              {numberUtils.toFixed(item.totalMoney)}
            </Text>
          </View>
        )}
        <View className='ticket_itew__new___content'>
          {this.renderGoodsImgs(imgs)}
          <View className='ticket_itew__new___content__info'>
            {type === 1 && (
              <View>
                <Text>{`共${item.totalNum}件`}</Text>
                <Text className='ticket_itew__new___content__sum'>
                  <Text className='ticket_itew__new___content__dollar'>¥</Text>
                  <Text>{numberUtils.toFixed(item.totalMoney)}</Text>
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }
}
