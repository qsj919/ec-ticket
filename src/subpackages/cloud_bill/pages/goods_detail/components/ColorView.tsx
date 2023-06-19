/**
 * @author GaoYuJian
 * @create date 2018-11-21
 * @desc
 */
import Taro from '@tarojs/taro'
import React, { PureComponent }  from 'react'
import { View, Text } from '@tarojs/components'
// import { getCustomColorCharacter } from '@utils/localizableString'
import { sliceString } from '@utils/stringUtil'
import WithBadge from '@components/WithBadge'
import className from 'classnames'
import { IColorSizeItem } from '@@types/GoodsType'
import i18n from '@@/i18n'
import './color.scss'

type Props = {
  colorItems: Array<IColorSizeItem>
  onItemClick: (id: string, colorName: string) => void
  label: string
  titleSubTitle?: string
}

export default class ColorView extends PureComponent<Props, {}> {
  static defaultProps = {
    goodsDetail: {},
    label: '¥',
    active: false,
    disable: false
  }

  static options = {
    addGlobalClass: true
  }

  onItemClick(item: IColorSizeItem) {
    this.props.onItemClick(item.id, item.name)
  }

  render() {
    const { colorItems = [], label, titleSubTitle } = this.props
    return (
      <View className='goods_detail_color'>
        <View className='label_view'>
          <Text className='label'> {i18n.byCn(label)} </Text>
          {titleSubTitle && <Text className='sub_title'>{titleSubTitle}</Text>}
        </View>

        <View className='items_container'>
          {colorItems.map((item, index) => {
            return (
              <View key='id' className='color_badge'>
                <WithBadge
                  position='center'
                  value={item.num !== 0 ? item.num : ''}
                  maxValue={100000}
                >
                  <View
                    className={className({
                      // eslint-disable-next-line @typescript-eslint/camelcase
                      color_item_active: item.checked,
                      // eslint-disable-next-line @typescript-eslint/camelcase
                      color_item_inactive: !item.checked
                      // 'color_item--disabled': item.disabled
                    })}
                    onClick={this.onItemClick.bind(this, item)}
                  >
                    {sliceString(item.name, 10)}
                  </View>
                </WithBadge>
              </View>
            )
          })}
        </View>
      </View>
    )
  }
}
