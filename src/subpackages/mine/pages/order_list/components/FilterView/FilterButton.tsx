/**
 * @author GaoYuJian
 * @create date 2019-02-22
 * @desc
 */
import Taro from '@tarojs/taro'
import React, { PureComponent }  from 'react'
import { View, Text } from '@tarojs/components'

// import selectedBg from '../../images/filter_button_selected.png'
import './filter_button.scss'

type Props = {
  title: string
  isSelected?: boolean
  onClick: () => void
  customStyle?: string
}

export default class FilterButton extends PureComponent<Props, {}> {
  static defaultProps = {
    isSelected: false
  }

  render(): any {
    const { title, isSelected, onClick, customStyle } = this.props
    return (
      <View
        className={isSelected ? 'filter-button_selected' : 'filter-button'}
        onClick={onClick}
        style={customStyle}
      >
        {/* {isSelected && ( */}
        {/*  <Image className='filter-button__image' src={selectedBg} /> */}
        {/* )} */}
        <Text
          className={`filter-button__text ${
            isSelected ? 'filter-button__text--selected' : 'filter-button__text--normal'
          }`}
        >
          {title}
        </Text>
      </View>
    )
  }
}
