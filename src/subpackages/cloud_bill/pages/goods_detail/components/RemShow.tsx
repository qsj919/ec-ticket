/**
 * @author GaoYuJian
 * @create date 2018-11-21
 * @desc
 */
import Taro from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { View, Text } from '@tarojs/components'
import i18n from '@@/i18n'

import './remshow.scss'

type Props = {
  onChangeRemInEdit?: Function
  rem: string
  showEdit: boolean
  type?: string
}

type State = {}

export default class RemShow extends PureComponent<Props, State> {
  static options = {
    addGlobalClass: true
  }

  onChangeRemInEdit = () => {
    const { showEdit, onChangeRemInEdit } = this.props
    if (onChangeRemInEdit && showEdit) {
      onChangeRemInEdit()
    }
  }

  render() {
    const { rem, showEdit, type } = this.props
    let className = ''
    if (type === 'cart') {
      className = 'good_remark__cart'
    } else if (type === 'order') {
      className = 'good_remark__order'
    } else {
      className = 'good_remark'
    }
    return (
      <View className={className} onClick={this.onChangeRemInEdit}>
        <View className='good_remark_content'>
          {rem.length > 0 ? (
            <Text
              className={type === 'cart' || type === 'order' ? 'remark_text_cart' : 'remark_text'}
            >
              {rem}
            </Text>
          ) : (
            <Text
              className={type === 'cart' || type === 'order' ? 'remark_text_cart' : 'remark_text'}
              style='color: #999999;'
            >
              {i18n.t._('otherRemarks')}
            </Text>
          )}
          {showEdit && (
            <View
              className={
                type === 'cart' || type === 'order' ? 'remark_button_cart' : 'remark_button'
              }
            >
              {rem.length > 0 ? i18n.t._('modify') : i18n.t._('remark')}
            </View>
          )}
        </View>
      </View>
    )
  }
}
