import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import cn from 'classnames'
import { SlideDirection } from './type'
// import withModalHelper from '@components/hoc/withModalHelper'

interface OwnProps {
  showIpxPadding?: boolean
  direction?: SlideDirection
  className?: string
  containerClass?: string
  wrapperClass?: string
  visible: boolean
  mask?: boolean
  onRequestClose?: () => void
  maxHeight: number
}

interface State {
  enableTransition: boolean
}

class SlideContainer extends React.PureComponent<OwnProps, State> {
  static defaultProps = {
    direction: SlideDirection.Bottom,
    mask: true,
    showIpxPadding: true,
    maxHeight: 60
  }

  static options = {
    addGlobalClass: true
  }

  state = {
    enableTransition: false
  }

  componentDidMount() {
    this.setState({ enableTransition: true })
  }

  onMaskClick = () => {
    const { onRequestClose } = this.props
    onRequestClose && onRequestClose()
  }

  render() {
    const {
      direction,
      className,
      containerClass,
      visible,
      wrapperClass,
      mask,
      maxHeight
    } = this.props
    const { enableTransition } = this.state
    // const isIphoneX = model.toLowerCase().includes('iphone x')
    return (
      <View
        className={cn(
          'slide_full_screen',
          {
            'slide_full_screen--active': visible
          },
          className
        )}
      >
        <View
          style={{ maxHeight: maxHeight + '%' }}
          className={cn(
            'slide_container',
            `slide_container--${direction}`,
            {
              'slide_container--active': visible,
              'slide_container--transition': enableTransition
            },
            containerClass
          )}
        >
          <View className={cn('slide_wrapper', wrapperClass)}>{this.props.children}</View>
        </View>
        {mask && (
          <View
            className={cn('slide_mask', { 'slide_mask--active': visible })}
            onClick={this.onMaskClick}
            onTouchMove={e => {
              e.stopPropagation()
              e.preventDefault()
            }}
          />
        )}
      </View>
    )
  }
}

// export default withModalHelper<OwnProps>(SlideContainer) as ComponentType<OwnProps>
export default SlideContainer
