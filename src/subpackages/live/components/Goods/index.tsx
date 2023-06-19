import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import { LIVE_GOODS, LIVE_ACTION_TYPE, LIVE_AUDIT_FLAG } from '@@types/base'
import messageFeedback from '@services/interactive'
import cn from 'classnames'
import DeleteIcon from '../../images/delete_icon.png'

import './index.scss'

type OwnProps = {
  type: number
  data: LIVE_GOODS
  onActionClick: (type: number, data?: LIVE_GOODS) => void
}

interface State {}

export default class Goods extends React.Component<OwnProps, State> {
  static defaultProps = {
    type: 0,
    data: {
      auditData: '{}'
    } as LIVE_GOODS
  }

  onUpdateClick = () => {
    this.props.onActionClick(LIVE_ACTION_TYPE.UPDATE, this.props.data)
  }

  onUpClick = () => {
    this.props.onActionClick(LIVE_ACTION_TYPE.UP, this.props.data)
  }

  onDownClick = () => {
    messageFeedback.showAlertWithCancel('确定下架商品?', '提示', () => {
      this.props.onActionClick(LIVE_ACTION_TYPE.DELETE, this.props.data)
    })
  }

  onAsyncClick = () => {
    this.props.onActionClick(LIVE_ACTION_TYPE.ASYNC, this.props.data)
  }

  onEditClick = () => {
    this.props.onActionClick(LIVE_ACTION_TYPE.EDIT)
  }

  // onDeleteClick = () => {
  //   messageFeedback.showAlertWithCancel('确定删除商品?', '提示', () => {
  //     this.props.onActionClick(LIVE_ACTION_TYPE.DELETE, this.props.data)
  //   })
  // }

  render() {
    const { type, data } = this.props
    let _auditData = data.auditData !== '' && JSON.parse(data.auditData)
    let _invNum = 0
    if (_auditData.skus) {
      _invNum = _auditData.skus.reduce((total, sku) => {
        total += sku.invNum
        return total
      }, 0)
    }
    return (
      <View className='goods_com_wrapper'>
        <View className='goods_com_wrapper__top'>
          <Image
            src={data.imgData && Object.keys(JSON.parse(data.imgData))[0]}
            mode='aspectFill'
            className='goods_com_wrapper__top__goodsImage'
          />
          <View className='goods_com_wrapper__top__goodsInfo'>
            <View className='goods_com_wrapper__top__goodsInfo__goodsName'>{data.styleName}</View>
            <View className='goods_com_wrapper__top__goodsInfo__goodsInv'>
              库存：{_invNum || 0}
            </View>
            <View className='goods_com_wrapper__top__goodsInfo__goodsPrice'>
              <Text>
                直播价格<Text className='goods_price_color'>¥{data.livePrice}</Text>
              </Text>
              <Text style='margin-left: 8px;'>原价 ¥{data.realPrice}</Text>
            </View>
          </View>
          {type === 0 && (
            <View className='sync_invnum' onClick={this.onAsyncClick}>
              同步库存
            </View>
          )}
          {type === 1 && (
            <View
              className={cn('audit_flag_status', {
                ['AUDITING']: data.auditFlag === LIVE_AUDIT_FLAG.AUDITING,
                ['FAILURE']: data.auditFlag === LIVE_AUDIT_FLAG.FAILURE
              })}
            >
              {data.auditFlag === LIVE_AUDIT_FLAG.AUDITING ? '审核中' : ''}
              {data.auditFlag === LIVE_AUDIT_FLAG.FAILURE ? '审核失败' : ''}
            </View>
          )}
        </View>
        <View className='goods_com_wrapper__bottom'>
          <View />
          {/* <Image src={DeleteIcon} className='goods_delete_icon' onClick={this.onDeleteClick} /> */}
          {type === 0 && (
            <View className='goods_com_wrapper__bottom__actionView'>
              <View
                className='goods_com_wrapper__bottom__actionView__item'
                onClick={this.onDownClick}
              >
                下架
              </View>
              <View
                className='goods_com_wrapper__bottom__actionView__item'
                onClick={this.onUpdateClick}
              >
                改价
              </View>
            </View>
          )}
          {type === 2 && (
            <View className='goods_com_wrapper__bottom__actionView'>
              <View
                className='goods_com_wrapper__bottom__actionView__item'
                onClick={this.onUpClick}
              >
                上架
              </View>
            </View>
          )}
        </View>
      </View>
    )
  }
}
