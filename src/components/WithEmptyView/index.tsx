import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import { connect } from 'react-redux'
import EmptyView from '@components/EmptyView'
import classNames from 'classnames'
import { isArrayOrObjectEmpty } from '@utils/utils'
import { StandardProps, ITouchEvent } from '@tarojs/components/types/common'
import { EmptyViewStatus, EmptyViewProps } from '@@types/base'
import './index.scss'

interface StoreState {
  loading: Loading
}
interface Loading {
  global: boolean
  effects: {
    [key: string]: {
      loading: boolean
      error?: Error
    }
  }
}
type ExcludeKey<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>> // 从类型中剔除指定key
interface OwnProps
  extends ExcludeKey<
    EmptyViewProps,
    'type' | 'errorInfo' | 'networkErrorInfo' | 'className' | 'style' // 剔除由本组件控制的EmptyView props
  > {
  effectsName: string
  data: Array<any> | object | null // 数据源
  alwaysDisplayLoading?: boolean // 是否强制展示loading动画 or error错误信息
  containerClassName?: string // 容器类名
  containerStyle?: StandardProps['style'] // 容器样式
  emptyContainerClassName?: string // 空视图容器
  emptyClassName?: string // 空视图类名
  emptyStyle?: StandardProps['style']
  height: string // 空视图高度，也是列表视图高度
  viewStyle?: string
  disabled?: boolean
  needShowButton: boolean
}
interface StateProps {
  loading: boolean
  error?: Error
}
interface Props extends OwnProps, StateProps {}
class WithEmptyView extends React.PureComponent<Props> {
  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    // loadingEffects: {}
  }

  componentDidUpdate() {
    const { error } = this.props
    const { alwaysDisplayLoading, data } = this.props
    if (error && !alwaysDisplayLoading && data != null && !isArrayOrObjectEmpty(data)) {
      // messageFeedback.showError(error)
      Taro.showModal({ title: '提示', content: error.message })
    }
  }

  onTouchMove = (e: ITouchEvent) => {
    // e.preventDefault()
    e.stopPropagation()
  }

  getEmptyViewType = (): EmptyViewStatus => {
    const { data, error, loading } = this.props
    if (loading) {
      return EmptyViewStatus.Loading
    }
    if (error) {
      return EmptyViewStatus.Error
      // if (error.type <= 3) {
      //   return EmptyViewStatus.NetworkError
      // } else {
      //   return EmptyViewStatus.Error
      // }
    }
    if (data != null && isArrayOrObjectEmpty(data)) {
      return EmptyViewStatus.Empty
    }
    return EmptyViewStatus.Null
  }

  render() {
    const {
      customInfo,
      loadingInfo,
      emptyInfo,
      buttonLabel,
      buttonStyle,
      onButtonClick,
      alwaysDisplayLoading,
      containerStyle,
      containerClassName,
      emptyClassName,
      emptyContainerClassName,
      data,
      error,
      loading,
      height,
      imageStyle,
      emptyStyle,
      viewStyle,
      disabled,
      needShowButton,
      isBigImg,
      tabIndex
    } = this.props
    const type = this.getEmptyViewType()
    let _errorInfo = {}
    if (error) {
      _errorInfo = {
        label: error.message
      }
    }

    const isVisible =
      ((data == null || alwaysDisplayLoading) && (loading || error)) ||
      (data != null && isArrayOrObjectEmpty(data))

    return (
      <View className={classNames('with_empty', containerClassName)} style={containerStyle}>
        <View style={{ position: 'relative', width: '100%', height: '100%' }}>
          {this.props.children}
          <View
            className={classNames('empty_container', emptyContainerClassName)}
            style={{ display: isVisible && !disabled ? 'block' : 'none', height }}
            onTouchMove={this.onTouchMove}
          >
            <EmptyView
              viewStyle={viewStyle}
              className={emptyClassName}
              type={type}
              customInfo={customInfo}
              networkErrorInfo={_errorInfo}
              errorInfo={_errorInfo}
              loadingInfo={loadingInfo}
              emptyInfo={emptyInfo}
              buttonLabel={buttonLabel}
              buttonStyle={buttonStyle}
              onButtonClick={onButtonClick}
              imageStyle={imageStyle}
              style={emptyStyle}
              needShowButton={needShowButton}
              isBigImg={isBigImg}
              tabIndex={tabIndex}
            />
          </View>
        </View>
      </View>
    )
  }
}
export default connect<StateProps, {}, OwnProps, StoreState>(({ loading }, { effectsName }) => ({
  loading: loading.effects[effectsName] && loading.effects[effectsName].loading,
  error: loading.effects[effectsName] && loading.effects[effectsName].error
}))(WithEmptyView  as React.ComponentClass<OwnProps>)