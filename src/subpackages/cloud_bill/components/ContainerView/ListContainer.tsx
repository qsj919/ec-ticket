/**
 * @author lgl
 * @create date 2018-12-17
 * @desc 列表容器
 */

import Taro from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { Text, View } from '@tarojs/components'
import { AtActivityIndicator } from 'taro-ui'
import i18n from '@@/i18n'
import EmptyView from '@components/EmptyView'
import './list_container.scss'

type Props = {
  style?: string
  containerstyle?: string
  noMoreDataVisible?: boolean
  loadMoreDataVisible?: boolean
  noDataVisible?: boolean
  emptyViewImageStyle: string
}

type State = {}

export default class ListContainer extends PureComponent<Props, State> {
  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    emptyViewImageStyle: 'width: 364rpx;height: 364rpx;margin-top: 100rpx;'
  }

  render() {
    const {
      loadMoreDataVisible,
      noMoreDataVisible,
      noDataVisible,
      containerstyle,
      emptyViewImageStyle
    } = this.props
    return (
      <View className='list_container_view' style={containerstyle}>
        {this.props.children}
        {noMoreDataVisible && (
          <View className='at_last_text_view'>
            <Text className='at_last_text'>{i18n.t._('noMoreData')}</Text>
          </View>
        )}
        {loadMoreDataVisible && (
          <View className='at_last_text_view_container'>
            <AtActivityIndicator
              className='at_last_text_view'
              content={`${i18n.t._('loadding')}...`}
              color='#9B9B9B'
            />
          </View>
        )}
        {noDataVisible && (
          <View style='display: flex;flex:1; height: 100%; align-items: center;justify-content: center;background-color: white;'>
            <EmptyView imageStyle={emptyViewImageStyle} type={4} />
          </View>
        )}
      </View>
    )
  }
}
