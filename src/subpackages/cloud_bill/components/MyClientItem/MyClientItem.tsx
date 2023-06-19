// 列表项
import Taro from '@tarojs/taro'
import React from 'react'
import { Text, View, Image } from '@tarojs/components'
import classnames from 'classnames'
import defaultHeadImg from '../../images/default_headImg.png'
// import linkPng from '../../images/link.png'
import { ClientItem } from '../../pages/my_client/index'
import './MyClientItem.scss'

type Props = {
  item: ClientItem
  onItemClick?: Function
  onBlockClick?: Function
  from?: string
  actionIsVisible: boolean
  onBindClick?(): void
  itemPadding?: string
}

type State = {}

export default class myClientItem extends React.PureComponent<Props, State> {
  static defaultProps = {
    item: {},
    actionIsVisible: true,
    itemPadding: '0 10px 0 25px'
  }
  render() {
    const { item, onItemClick, onBlockClick, from, actionIsVisible, itemPadding } = this.props
    return (
      <View
        className='centerView'
        key={item.mpUserId}
        onClick={() => {
          onItemClick && onItemClick(item)
        }}
      >
        <View
          className='centerView_item'
          style={{
            padding: itemPadding,
            height: from === 'detail' ? '70px' : '90px'
          }}
        >
          <View className='centerView_item_headImg'>
            <Image className='centerView_item_headImg_img' src={item.logo || defaultHeadImg} />
          </View>
          <View
            // style={{ height: from === 'detail' ? '85%' : '65%' }}
            style='height: 65%'
            className='centerView_item_inforMation'
          >
            <View className='centerView_item_inforMation_nickName'>
              <View
                className='centerView_item_inforMation_nickName_text'
                style={{ color: item.remark || item.nickName ? '' : '#999' }}
              >
                <Text className='text_overflow'>
                  {item.remark || item.nickName || '(未授权用户)'}
                </Text>
                {from === 'detail' && item.shopBlackUser === '1' && (
                  <Text className='boocked_view aic'>已拉黑</Text>
                )}
              </View>
              <View>
                {from !== 'detail' && actionIsVisible && (
                  <Text className='fontColorSmall'>{item.viewTime}</Text>
                )}
              </View>
            </View>

            {from === 'detail' && actionIsVisible && (
              <View className='centerView_item_inforMation_nickName'>
                {item.remark && <View className='fontColorSmall'>微信昵称：{item.nickName}</View>}
                <View className='block_warpper'>
                  <View
                    onClick={() => {
                      onBlockClick && onBlockClick(item)
                    }}
                    className='setting_view'
                  >
                    <Text>设置</Text>
                  </View>
                </View>
              </View>
            )}

            <View className='centerView_item_inforMation_nickName'>
              <View
                className={classnames('centerView_item_inforMation_nickName_text', {
                  'centerView_item_inforMation_nickName_text--detail': from === 'detail'
                })}
              >
                {item.dwName && from !== 'detail' && (
                  <View className='fontColorSmall'>商陆花档案：{item.dwName}</View>
                )}
                {/* {from === 'detail' && (
                  <View className='bind_text' onClick={this.props.onBindClick}>
                    <Image src={linkPng} className='link_img' />
                    {item.dwName ? '换绑' : '绑定客户'}
                  </View>
                )} */}
              </View>
              {from !== 'detail' && actionIsVisible && (
                <View
                  onClick={e => {
                    e.stopPropagation()
                    onBlockClick && onBlockClick(item)
                  }}
                  className={item.shopBlackUser === '0' ? 'checkViewBlock' : 'checkViewCencel'}
                >
                  <Text>{item.shopBlackUser === '0' ? '拉黑' : '取消拉黑'}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    )
  }
}
