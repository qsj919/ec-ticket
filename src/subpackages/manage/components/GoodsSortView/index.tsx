import Taro, { NodesRef } from '@tarojs/taro'
import { Block, View, Image } from '@tarojs/components'
import { ISpu } from '@@types/GoodsType'
import React, { CSSProperties } from 'react'
import cn from 'classnames'
import { ITouchEvent, ITouch } from '@tarojs/components/types/common'
import { isWeapp, isWeb } from '@utils/cross_platform_api'
import SortIcon from '../../images/sort_icon.png'

import GoodsCell from '../GoodsCell'

import './index.scss'

let Sortable
if (process.env.TARO_ENV === 'h5') {
  Sortable = require('sortablejs').default
}

type OwnProps = {
  type?: 'hot' | 'special' | 'banner' | string
  data: Array<ISpu>
  onChange?: (data: Array<ISpu>) => void
  onDeleteImage?: (spuId: number) => void
  onSettingClick?: (spuId: number) => void
  needShowDiscountPrice?: boolean
  sort: boolean
}

interface State {
  dataSource: ISpu[]
  activeImageIndex: number
  imageDisplayIndexArray: number[]
  activeImageStyle: CSSProperties
  styles: CSSProperties[]
}

const baseAnimationStyle: CSSProperties = {
  transition: 'transform ease-in-out 0.3s, opacity ease-in-out 0.3s'
}

export default class GoodsSortView extends React.Component<OwnProps, State> {
  static defaultProps = {
    data: []
  }

  state = {
    dataSource: [] as ISpu[],
    activeImageIndex: -1,
    imageDisplayIndexArray: [],
    styles: [] as CSSProperties[],
    activeImageStyle: {} // 实际
  }

  rects: NodesRef.BoundingClientRectCallbackResult[]

  cloneItemRet

  observers: any[] = []

  scale = 1

  isStart = false

  startPosition: { x: number; y: number } = { x: 0, y: 0 }

  startImagePosition = { x: 0, y: 0 }

  timer: NodeJS.Timeout

  disableClick = false

  sortable: any

  componentDidMount() {
    this.setState({ dataSource: this.props.data })

    if (process.env.TARO_ENV === 'h5') {
      var el = document.getElementById('movable_item_container')
      // console.log(Sortable, 'Sortable')
      this.sortable = Sortable.create(el, {
        // handle: '.sort_icon',
        animation: 200,
        direction: 'vertical',
        // disabled: true,
        delay: 300,
        // Element dragging ended
        onEnd: (/**Event*/ evt) => {
          const { oldIndex, newIndex } = evt
          if (oldIndex !== newIndex) {
            this.setState(
              state => {
                const imageDisplayIndexArray = [...state.imageDisplayIndexArray]
                const [oldValue] = imageDisplayIndexArray.splice(oldIndex, 1)
                imageDisplayIndexArray.splice(newIndex, 0, oldValue)

                return { imageDisplayIndexArray: [...imageDisplayIndexArray] }
              },
              () => {
                const images = this.getImagesInRealIndex()
                this.props.onChange && this.props.onChange(images)
              }
            )
          }
          // var itemEl = evt.item // dragged HTMLElement
          // evt.to // target list
          // evt.from // previous list
          // evt.oldIndex // element's old index within old parent
          // evt.newIndex // element's new index within new parent
          // evt.oldDraggableIndex // element's old index within old parent, only counting draggable elements
          // evt.newDraggableIndex // element's new index within new parent, only counting draggable elements
          // evt.clone // the clone element
          // evt.pullMode // when item is in another sortable: `"clone"` if cloning, `true` if moving
        }
      })
    }
  }

  componentDidUpdate(prevProps: Readonly<OwnProps>, prevState: Readonly<State>) {
    // const { onImageChange } = this.props
    if (this.state.dataSource.length !== prevState.dataSource.length) {
      this.reCalculateImageDisplayIndex()
      this.calculatePosition()
      this.removeObserver()
      this.addObserver()
    }

    const notEqual = prevProps.data.reduce((prev, cur, index) => {
      return prev || cur.id !== this.props.data[index].id
    }, false)
    if (
      notEqual ||
      this.props.data.length !== prevProps.data.length ||
      this.props.data !== prevProps.data
    ) {
      this.setState({
        dataSource: [...this.props.data],
        imageDisplayIndexArray: this.props.data.map((item, _i) => _i)
      })
    }
  }

  componentWillUnmount() {
    this.removeObserver()
  }

  clearTimer = () => {
    this.timer && clearTimeout(this.timer)
  }

  disableClickEvent = () => {
    this.disableClick = true
    setTimeout(() => {
      this.disableClick = false
    }, 200)
  }

  addObserver = () => {
    if (process.env.TARO_ENV === 'weapp') {
      this.state.dataSource.forEach((item, index) => {
        const observe = (Taro.getCurrentInstance().page as any).createIntersectionObserver()
        observe
          .relativeTo('#move-image')
          .observe(`#goods_view_for_judge_interaction--${index}`, res => {
            if (res.intersectionRatio > 0) {
              this.moveImages(this.state.activeImageIndex, index)
            }
          })

        this.observers.push(observe)
      })
    }
  }

  removeObserver = () => {
    this.observers.forEach(ob => ob.disconnect())
    this.observers = []
  }

  reCalculateImageDisplayIndex = () => {
    const { onChange } = this.props
    const imageLength = this.state.dataSource.length
    const indexLength = this.state.imageDisplayIndexArray.length
    if (indexLength < imageLength) {
      this.setState(
        state => {
          const imageDisplayIndexArray = [...state.imageDisplayIndexArray]
          for (let i = imageDisplayIndexArray.length; i < imageLength; i++) {
            imageDisplayIndexArray.push(i)
          }
          return {
            imageDisplayIndexArray
          }
        },
        () => {
          const images = this.getImagesInRealIndex()
          onChange && onChange(images)
        }
      )
    }
  }

  // from, to皆为视觉上的 要map到实际顺序来交换
  moveImages = (from: number, to: number) => {
    if (!this.isStart) return
    const { onChange } = this.props
    const length = this.state.dataSource.length
    if (
      from > length - 1 ||
      to > length - 1 ||
      from < 0 ||
      to < 0 ||
      from === to ||
      typeof from !== 'number' ||
      typeof to !== 'number'
    )
      return
    this.setState(
      state => {
        const imageDisplayIndexArray = [...state.imageDisplayIndexArray]
        const fromIndex = state.imageDisplayIndexArray[from]
        imageDisplayIndexArray.splice(from, 1)
        imageDisplayIndexArray.splice(to, 0, fromIndex)
        return {
          imageDisplayIndexArray,
          activeImageIndex: to
        }
      },
      () => {
        const images = this.getImagesInRealIndex()
        onChange && onChange(images)
      }
    )
  }

  getImagesInRealIndex = () => {
    const { dataSource, imageDisplayIndexArray } = this.state
    return dataSource.reduce<ISpu[]>((prev, cur, index) => {
      const _index = imageDisplayIndexArray[index]
      prev.push({ ...dataSource[_index] })
      return prev
    }, [])
  }

  calculatePosition = () => {
    const query = Taro.createSelectorQuery().in(Taro.getCurrentInstance().page as any)
    query
      .selectAll('.goods_sort_view__item')
      .boundingClientRect((rects: any) => {
        this.rects = rects
        const styles: CSSProperties[] = []
        const baseRect = rects[0]
        rects.forEach(rect => {
          const x = rect.left - baseRect.left
          const y = rect.top - baseRect.top
          const transform = transformXYToCssTransfrom({ x, y }, this.scale)
          styles.push({ transform, ...baseAnimationStyle })
        })
        this.setState({ styles })
      })
      .exec()
  }

  findImageIndexFromPosition = (p: { x: number; y: number }): number => {
    let result: number = -1
    for (let i = 0; i < this.rects.length; i++) {
      const rect = this.rects[i]
      const { x, y } = p
      if (rect.left < x && rect.right > x && rect.top < y && rect.bottom > y) {
        result = i
        break
      }
    }

    return result
  }

  deleteImage = styleId => {
    if (this.disableClick) return
    // e.stopPropagation()
    // this.isDeleteClicked = true
    // let dataset = e.target.dataset
    // if (isWeb()) {
    //   dataset = e.target.parentElement.dataset
    // }
    // const index = Number(dataset.index)
    const index = this.state.dataSource.findIndex(item => item.styleId === styleId)
    const { onChange, onDeleteImage } = this.props
    const { dataSource } = this.state
    const image = dataSource[index]
    this.setState(
      state => {
        const _index = state.imageDisplayIndexArray.findIndex(itemIndex => itemIndex === index)
        const imageDisplayIndexArray = [...state.imageDisplayIndexArray]
        imageDisplayIndexArray.splice(_index, 1)
        return {
          dataSource: state.dataSource.filter((item, i) => i !== index),
          imageDisplayIndexArray: imageDisplayIndexArray.map(v => (v >= index ? v - 1 : v))
        }
      },
      () => {
        // this.isDeleteClicked = false
        onDeleteImage && onDeleteImage(styleId)
        const images = this.getImagesInRealIndex()
        onChange && onChange(images)
      }
    )
  }

  manageClick = spuId => {
    Taro.showActionSheet({
      itemList: ['恢复成普通商品'],
      success: () => {
        this.deleteImage(spuId)
      }
    })
  }

  settingClick = spuId => {
    this.props.onSettingClick && this.props.onSettingClick(spuId)
  }

  startMove = e => {
    const activeImageIndex = this.findImageIndexFromPosition(this.startPosition)
    if (activeImageIndex > -1) {
      this.isStart = true
      const baseRect = this.rects[0]
      const activeRect = this.rects[activeImageIndex]
      const x = activeRect.left - baseRect.left
      const y = activeRect.top - baseRect.top
      const transform = transformXYToCssTransfrom({ x, y }, this.scale)
      this.startImagePosition = { x, y }
      const activeImageStyle = { top: `${y}px`, left: `${x}px` }
      this.setState({
        activeImageIndex,
        activeImageStyle
      })
    }
  }

  onTouchStart = (e: ITouchEvent) => {
    // if (isWeb()) return
    if (!this.props.sort) return
    const touchs = (e.changedTouches as unknown) as ITouch[]
    const touch = touchs[0]
    this.startPosition = { x: touch.pageX, y: touch.pageY }
    // this.timer = setTimeout(() => {
    this.startMove(e)
    // }, 500)
  }

  onTouchEnd = e => {
    if (!this.props.sort) return
    this.clearTimer()
    if (this.isStart) {
      // const { onDragEnd } = this.props
      this.disableClickEvent()
      this.isStart = false
      const baseRect = this.rects[0]
      const activeRect = this.rects[this.state.activeImageIndex]
      const x = activeRect.left - baseRect.left
      const y = activeRect.top - baseRect.top
      this.setState({
        activeImageStyle: {
          // transform: transformXYToCssTransfrom({ x: 0, y: 0 }, this.scale),
          top: `${y}px`,
          left: `${x}px`
        }
      })
      this.setState({ activeImageIndex: -1 }, () => {
        const { dataSource, imageDisplayIndexArray } = this.state
        const images = imageDisplayIndexArray.map(item => {
          return dataSource[item]
        })
        // onDragEnd && onDragEnd(images)
      })
    }
  }

  render() {
    const { sort } = this.props
    const {
      styles,
      activeImageIndex,
      activeImageStyle,
      imageDisplayIndexArray,
      dataSource
    } = this.state
    const { type, needShowDiscountPrice } = this.props
    const activeItem = dataSource[imageDisplayIndexArray[activeImageIndex]] || {}
    return (
      <View className='goods_sort_view'>
        {process.env.TARO_ENV === 'weapp' && (
          <Block>
            <wxs module='move' src='./move.wxs'></wxs>
            <View>
              {dataSource.map((item, _i) => (
                <View
                  key={item.id}
                  className='goods_sort_view__item goods_sort_view__item--center'
                  data-idx={_i}
                  style={{
                    height: type === 'banner' ? '135px' : '84px'
                  }}
                >
                  <View
                    className='goods_view_for_judge_interaction'
                    id={`goods_view_for_judge_interaction--${_i}`}
                  />
                </View>
              ))}
            </View>
          </Block>
        )}

        <View
          id='movable_item_container'
          className={cn('movable_item_container', {
            ['movable_item_container_position']: isWeapp()
          })}
        >
          {dataSource.map((item, _i) =>
            process.env.TARO_ENV === 'weapp' ? (
              <View
                style={{
                  ...styles[imageDisplayIndexArray.findIndex(indexItem => indexItem === _i)],
                  opacity: _i === imageDisplayIndexArray[activeImageIndex] ? 0 : 1,
                  height: type === 'banner' ? '135px' : '84px',
                  zIndex: sort ? 0 : 100 - _i
                }}
                key={item.id}
                className='movable_item'
                data-idx={_i}
                onLongPress='{{move.onTouchStart}}'
                onTouchMove='{{move.onTouchMove}}'
                onTouchEnd='{{move.onTouchEnd}}'
                data-index={_i}
              >
                {type === 'banner' ? (
                  <View className='shop_home_banner_item'>
                    <Image
                      src={item.url}
                      mode='aspectFill'
                      style={{ width: '100%', height: '100%' }}
                    />
                    {sort ? (
                      <Image src={SortIcon} className='sort_icon' />
                    ) : (
                      <View
                        className='goods_sort_delete_icon'
                        onClick={() => this.deleteImage(item.styleId)}
                      >
                        移除
                      </View>
                    )}
                  </View>
                ) : (
                  <GoodsCell
                    type={type}
                    sort={sort}
                    data={item}
                    needShowDiscountPrice={needShowDiscountPrice}
                    onDeleteClick={this.deleteImage}
                    onManageClick={this.manageClick}
                    onSettingClick={this.settingClick}
                  />
                )}
              </View>
            ) : (
              <View
                key={item.id}
                className='movable_item movable_item--h5'
                data-idx={_i}
                data-index={_i}
                style={{
                  height: type === 'banner' ? '135px' : '84px'
                }}
              >
                {type === 'banner' ? (
                  <View className='shop_home_banner_item'>
                    <Image
                      src={item.url}
                      mode='aspectFill'
                      style={{ width: '100%', height: '100%' }}
                    />
                    {sort ? (
                      <Image src={SortIcon} className='sort_icon' />
                    ) : (
                      <View
                        className='goods_sort_delete_icon'
                        onClick={() => this.deleteImage(item.styleId)}
                      >
                        移除
                      </View>
                    )}
                  </View>
                ) : (
                  <GoodsCell
                    type={type}
                    sort={sort}
                    data={item}
                    onDeleteClick={this.deleteImage}
                    onManageClick={this.manageClick}
                    onSettingClick={this.settingClick}
                  />
                )}
              </View>
            )
          )}
        </View>

        <View onClick={this.onTouchStart} onTouchEnd={this.onTouchEnd}></View>

        <View
          id='move-image'
          className='active_movable_item'
          style={{
            opacity: sort && activeImageIndex > -1 ? 1 : 0,
            zIndex: activeImageIndex > -1 ? 2 : -1,
            height: type === 'banner' ? '135px' : '84px',
            ...activeImageStyle
          }}
        >
          {type === 'banner' ? (
            <View className='shop_home_banner_item'>
              <Image
                src={activeItem.url}
                mode='aspectFill'
                style={{ width: '100%', height: '100%' }}
              />
              {sort ? (
                <Image src={SortIcon} className='sort_icon' />
              ) : (
                <View
                  className='goods_sort_delete_icon'
                  onClick={() => this.deleteImage(activeItem.styleId)}
                >
                  移除
                </View>
              )}
            </View>
          ) : (
            <GoodsCell type='hot' sort={sort} data={activeItem} />
          )}
        </View>

        {sort && <View id='goods_sort_hook'></View>}
      </View>
    )
  }
}

function transformXYToCssTransfrom(p: { x: number; y: number }, scale = 1) {
  return `translate(${p.x * scale}px, ${p.y * scale}px)`
}
