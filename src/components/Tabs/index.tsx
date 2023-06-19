import Taro, { pxTransform, SelectorQuery, NodesRef } from '@tarojs/taro'
import React from 'react'
import { View, Image, ScrollView } from '@tarojs/components'
import cn from 'classnames'
import colors from '../../style/colors'

import './tab.scss'

interface Data {
  label: string
  value?: string | number
}

interface Props {
  onTabItemClick?: (index: number, data: Data) => void
  activeIndex?: number
  data: Data[]
  activeColor: string
  underlineColor: string
  textColor: string
  underlineWidth: number
  underlineHeight: number
  margin: number // 元素之间间距
  padding: number // 容器两边内间距
  textClass?: string
  containerClass?: string
  tabItemClass?: string
  width: string
  tabsBackgroundImage?: string //渐变色的下划线
  activeFontSize?: string
  from?: 'allGoods' | undefined // 页面状态
}

interface State {
  activeIndex: number
  rects: any []
  scrollLeft: number
}

export default class Tabs extends React.Component<Props, State> {
  static defaultProps = {
    data: [],
    activeColor: colors.titleColor,
    underlineColor: colors.themeColor,
    tabsBackgroundImage: '',
    textColor: colors.normalTextColor,
    margin: 50,
    padding: 24,
    underlineWidth: 60,
    underlineHeight: 6,
    width: '100%',
    activeFontSize: '28rpx'
  }

  static options = {
    addGlobalClass: true
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    const { activeIndex } = props
    if (typeof activeIndex === 'number' && activeIndex !== state.activeIndex) {
      return {
        activeIndex
      }
    } else {
      return null
    }
  }

  windowWidth: number = 0

  scale: number = 1

  constructor(props: Props) {
    super(props)
    this.state = {
      activeIndex: typeof props.activeIndex === 'number' ? props.activeIndex : 0,
      rects: [],
      scrollLeft: 0
    }
  }

  // UNSAFE_componentWillReceiveProps(nextProps: Props) {
  //   const { activeIndex, data } = nextProps
  //   if (
  //     typeof activeIndex === 'number' &&
  //     activeIndex !== this.state.activeIndex &&
  //     activeIndex >= 0 &&
  //     activeIndex <= data.length - 1
  //   ) {
  //     this.setState({ activeIndex })
  //   }
  // }

  // shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
  //   if (nextState.scrollLeft - this.state.scrollLeft <= 1 && nextState.scrollLeft - this.state.scrollLeft > 0) return false
  //   return true
  // }

  componentDidMount() {
    const sysInfo = Taro.getSystemInfoSync()
    this.windowWidth = sysInfo.windowWidth
    this.scale = this.windowWidth / 750
    // taro bug 在didmount中拿到的位置信息不准确
    setTimeout(() => {
      this.calculatePosition()
    }, 200)
    // this.calculatePosition()
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.data.length !== this.props.data.length) {
      return this.calculatePosition()
    }

    for (let i = 0; i < this.props.data.length; i++) {
      const prevItem = prevProps.data[i]
      const curItem = this.props.data[i]
      if (prevItem.label !== curItem.label) {
        this.calculatePosition()
        break
      }
    }
  }

  calculatePosition = () => {
    const query: SelectorQuery = Taro.createSelectorQuery().in(Taro.getCurrentInstance()?.page as any)
    query
      .selectAll('.tab_item')
      .boundingClientRect((rects: any) => {
        this.setState({ rects })
      })
      .exec()
  }

  calculateUnderLinePosition = () => {
    try {
      const { rects, activeIndex } = this.state
      const { padding, underlineWidth } = this.props
      const leftItemsWidth = rects.slice(0, activeIndex).reduce((prev, cur) => {
        return prev + cur.width
      }, 0)
      const currentItem = rects[activeIndex]
      const offset = (currentItem.width - underlineWidth * this.scale) / 2

      return leftItemsWidth + offset + padding * this.scale
    } catch (e) {
      return 0
    }
  }

  updateScrollOffset = (activeIndex: number) => {
    const { rects } = this.state
    const currentItem = rects[activeIndex]

    const containerWidth = this.windowWidth
    const scrollLeft = currentItem.left - (containerWidth - currentItem.width) / 2
    this.setState({ scrollLeft })
  }

  onItemClick = (index: number) => {
    const { onTabItemClick, data } = this.props
    this.updateScrollOffset(index)
    this.setState({ activeIndex: Number(index) })
    onTabItemClick && onTabItemClick(Number(index), data[index])
  }

  render() {
    const { activeIndex, scrollLeft } = this.state
    const {
      data,
      underlineColor,
      activeColor,
      textColor,
      underlineHeight,
      underlineWidth,
      margin,
      containerClass,
      padding,
      width,
      tabItemClass,
      tabsBackgroundImage,
      activeFontSize,
      from
    } = this.props
    const diff = this.calculateUnderLinePosition()
    const itemStyle = {
      padding: `0 ${pxTransform(margin / 2)}`
    }
    const containerStyle = {
      padding: `0 ${pxTransform(padding)}`
    }
    return (
      <View className='e_tab_container'>
        <ScrollView
          scrollX
          className='e_tab_scroll'
          scrollLeft={scrollLeft}
          scrollWithAnimation
          style={{ width }}
        >
          <View className={cn('tabs', containerClass)} style={{ ...containerStyle }}>
            {data.map((item, index) => {
              return (
                <View
                  className={cn('tab_item', tabItemClass, {
                    'tab_item--active': index === activeIndex
                  })}
                  style={{
                    color: index === activeIndex ? activeColor : textColor,
                    fontSize: index === activeIndex ? activeFontSize : '',
                    // fontFamily: from === 'allGoods' && index !== 0 ? 'tab_font' : '',
                    fontWeight:
                      from === 'allGoods' && index !== 0 ? 500 : index === activeIndex ? 600 : 500,
                    ...itemStyle
                  }}
                  key={item.label}
                  onClick={() => this.onItemClick(index)}
                  data-index={index}
                >
                  {item.label}
                </View>
              )
            })}
            <View
              className='indicator_line'
              style={{
                left: `${diff}px`,
                backgroundColor: underlineColor,
                backgroundImage: tabsBackgroundImage,
                borderRadius: '4px',
                height: pxTransform(underlineHeight),
                width: pxTransform(underlineWidth)
              }}
            />
          </View>
        </ScrollView>
      </View>
    )
  }
}
