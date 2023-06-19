import Taro from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { View, Image, Text } from '@tarojs/components'
import cn from 'classnames'
import { StandardProps } from '@tarojs/components/types/common'
import images from '@config/images'
import emptyImg from '@/images/no_data.png'
import { EmptyViewProps, EmptyViewStatus } from '@@types/base'
import './empty_view.scss'
import Loading from '../Loading'

const defaultLoadingInfo = {
  label: '加载中...'
}
const defaultErrorInfo = {
  label: '出错啦！请稍后再试～',
  image: images.common.business_error
}
const defaultNetworkErrorInfo = {
  label: '网络错误',
  image: images.common.business_error
}
const defaultEmptyInfo = {
  label: '暂无数据～',
  image: emptyImg
}
export default class EmptyView extends PureComponent<EmptyViewProps> {
  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    buttonLabel: '重新加载',
    buttonStyle: '',
    imageStyle: '',
    needShowButton: false,
    type: EmptyViewStatus.Empty
  }

  onButtonClick = () => {
    if (this.props.onButtonClick) {
      this.props.onButtonClick()
    }
  }

  generateViews = () => {
    const { type, emptyInfo, errorInfo, loadingInfo, networkErrorInfo } = this.props
    let info: { image?: string; label: string } = {} as { label: string }
    switch (type) {
      case EmptyViewStatus.Loading:
        info = { ...defaultLoadingInfo, ...loadingInfo }
        break
      case EmptyViewStatus.Empty:
        info = { ...defaultEmptyInfo, ...emptyInfo }
        break
      case EmptyViewStatus.Error:
        info = { ...defaultErrorInfo, ...errorInfo }
        break
      case EmptyViewStatus.NetworkError:
        info = { ...defaultNetworkErrorInfo, ...networkErrorInfo }
        break
      case EmptyViewStatus.Custom:
        break
      default:
    }
    return info
  }

  render() {
    const {
      buttonStyle,
      className,
      type,
      buttonLabel,
      onButtonClick,
      imageStyle,
      style,
      needShowButton,
      viewStyle,
      isBigImg,
      tabIndex
    } = this.props
    const info = this.generateViews()
    const isButtonVisible =
      (type === EmptyViewStatus.Error || type === EmptyViewStatus.NetworkError || needShowButton) &&
      typeof onButtonClick === 'function'

    return (
      type !== EmptyViewStatus.Null && (
        <View className={cn('empty_view_container', className)} style={style}>
          <View
            className={
              (isBigImg === -1 || isBigImg === 2) && tabIndex !== 4
                ? 'empty_view_bigImg'
                : 'empty_view'
            }
            style={viewStyle}
          >
            {type === EmptyViewStatus.Loading && !info.image ? (
              <Loading />
            ) : (
              <Image
                src={info.image || ''}
                className={
                  (isBigImg === -1 || isBigImg === 2) && tabIndex !== 4
                    ? 'isBigImg'
                    : 'empty_view_image'
                }
                style={imageStyle}
                mode='scaleToFill'
              />
            )}
            {((isBigImg !== -1 && isBigImg !== 2) || tabIndex === 4) && (
              <Text className='empty_view_text'>{info.label}</Text>
            )}
            {isButtonVisible && isBigImg !== -1 && isBigImg !== 2 && (
              <View className='empty_view_button' onClick={this.onButtonClick} style={buttonStyle}>
                {buttonLabel}
              </View>
            )}
          </View>
        </View>
      )
    )
  }
}
