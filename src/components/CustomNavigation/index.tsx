/**
 * @Author: Miao Yunliang
 * @Date: 2019-07-12 11:23:03
 * @Desc: 自定义导航栏页面的容器组件
 */

import Taro from '@tarojs/taro'
import React, { Component, ComponentClass }  from 'react';
import { connect } from 'react-redux'
import { View, Image } from '@tarojs/components'
import cn from 'classnames'
import { SystemInfoState } from '@models/system_info'
import back from '@/images/icon/angle_left_64.png'
import backCircle from '@/images/icon/angle_left_circle_64.png'

// import './custom_navigation.scss'

type StateProps = {
  systemInfo: SystemInfoState
}

type SProps = SystemInfoState

interface OwnProps {
  title?: string // 导航标题
  enableBack?: boolean
  containerClass?: string
  stickyTop?: boolean
  titleTextClass?: string
  navigationClass?: string
  onBackClick?: () => void
  disableIphoneXPaddingBottom?: boolean
  backIcon?: string
  renderOtherIcon?: () => void
  isRenderOtherIcon?: boolean
}

interface Props extends OwnProps, SystemInfoState {}

interface State {
  navigationHeight: number
  navigationPadding: number
  // backTop: number
}

class CustomNavigation extends Component<Props, State> {
  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    enableBack: true,
    stickyTop: true,
    title: '',
    disableIphoneXPaddingBottom: false,
    isRenderOtherIcon: false
  }

  onBackClick = () => {
    if (this.props.onBackClick) {
      this.props.onBackClick()
    } else {
      Taro.navigateBack()
    }
  }

  render() {
    const {
      enableBack,
      statusBarHeight,
      title,
      containerClass,
      titleTextClass,
      navigationClass,
      stickyTop,
      navigationHeight,
      navigationPadding,
      gap,
      // model,
      // disableIphoneXPaddingBottom,
      backIcon,
      isRenderOtherIcon
    } = this.props
    // const isIphoneX = model.toLowerCase().includes('iphone x')
    const backTop = statusBarHeight + gap
    const style: { paddingTop?: string; paddingBottom?: string } = {
      // paddingTop: `${statusBarHeight + navigationHeight}px`
    }
    const backStyle: { paddingLeft?: string; top?: string; left?: string } = {}
    if (!stickyTop) {
      style.paddingTop = `${statusBarHeight + navigationHeight}px`
      backStyle.left = `${navigationPadding}px`
    } else {
      backStyle.paddingLeft = `${navigationPadding}px`
      backStyle.top = `${backTop}px`
    }
    // if (isIphoneX && !disableIphoneXPaddingBottom) {
    //   style.paddingBottom = '34px'
    // }

    const _backIcon = backIcon || (stickyTop ? backCircle : back)
    // 使用CoverImage 在iOS上划动页面时 图片会抖动
    const backElement: any =
      Boolean(enableBack) &&
      (isRenderOtherIcon ? (
        this.props.renderOtherIcon
      ) : (
        <Image
          style={backStyle}
          src={_backIcon}
          className={cn('custom_navigation_container__back', {
            'custom_navigation_container__back--fixed': stickyTop
          })}
          onClick={this.onBackClick}
        />
      ))
    return (
      <View className={cn('custom_navigation_container', containerClass)} style={style}>
        {stickyTop ? (
          backElement
        ) : (
          <View
            className={cn('custom_navigation_container__header', navigationClass)}
            style={{
              height: `${navigationHeight}px`,
              paddingTop: `${statusBarHeight}px`
            }}
          >
            {backElement}
            <View className={cn('custom_navigation_container__title', titleTextClass)}>
              {title}
            </View>
          </View>
        )}
          {/*// @ts-ignore*/}
          {this.props.children}
      </View>
    )
  }
}

export default connect<SProps, {}, OwnProps, StateProps>(({ systemInfo }) => {
  return {
    ...systemInfo
  }
})(CustomNavigation as ComponentClass<OwnProps>) 
