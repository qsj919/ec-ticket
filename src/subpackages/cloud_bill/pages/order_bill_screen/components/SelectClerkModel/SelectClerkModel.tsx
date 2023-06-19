import Taro from '@tarojs/taro'
import React from 'react'
import { Text, View, Image } from '@tarojs/components'
import rightIcon from '../../../../images/angle_right_gray_40.png'
import './SelectClerkModel.scss'

type Props = {
  title: string
  placeholderTitle: string
  onItemClick: () => void
}

type State = {}

export default class SelectClerkModel extends React.Component<Props, State> {
  static defaultProps = {}

  goUseClerk = () => {
    this.props.onItemClick && this.props.onItemClick()
  }

  render() {
    const { title, placeholderTitle } = this.props
    return (
      <View className='select_clerk_model_container'>
        <View className='title'>{title}</View>
        <View className='placeholder_title_view' onClick={this.goUseClerk}>
          <Text className='placeholder_title'>{placeholderTitle}</Text>
          <Image src={rightIcon} className='right_icon' />
        </View>
      </View>
    )
  }
}
