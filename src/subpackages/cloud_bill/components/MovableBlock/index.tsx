/**
 * @Author: Miao Yunliang
 * @Date: 2019-09-26 19:01:03
 * @Desc: 可拖动的图片选择组件
 */

import Taro, { NodesRef } from '@tarojs/taro'
import React, { CSSProperties } from 'react'
import { View, Image, Text } from '@tarojs/components'
import images from '@config/images'
import { ITouchEvent, ITouch } from '@tarojs/components/types/common'
import classnames from 'classnames'
import MoveIcon from './touch_view.png'
import './index.scss'

let Sortable
if (process.env.TARO_ENV === 'h5') {
  Sortable = require('sortablejs').default
}

type ParamPropTempFiles = ParamPropTempFilesItem[]
type ParamPropTempFilesItem = {
  path: string
  size: number
}

interface ImageType {
  codeName: string
  codeValue: string | number
  spuCount: number
}

interface Props {
  onChoseImage?: (images: ImageType[], image: ImageType[]) => void
  onDeleteImage?: (images: ImageType[], image: ImageType) => void
  onImageChange?: (images: ImageType[]) => void
  onDragEnd?: (images: ImageType[]) => void
  onUploadSuccess?(docIds: string): void
  defaultImages: ImageType[]
  from?: 'goods_edit' | 'goods_share'
  onStart?: () => void
  onEnd?: () => void
}

interface State {
  imageSource: ImageType[]
  // activeImage: string
  activeImageIndex: number
  activeImageStyle: CSSProperties
  styles: CSSProperties[]
  imageDisplayIndexArray: number[]
}

const baseAnimationStyle: CSSProperties = {
  transition: 'transform ease-in-out 0.3s, opacity ease-in-out 0.3s;'
}

function getHasOverlap(first, second): boolean {
  return (
    first.left < second.right &&
    first.right > second.left &&
    first.top < second.bottom &&
    first.bottom > second.top
  )
}

export default class MovableBlock extends React.PureComponent<Props, State> {
  static defaultProps = {
    defaultImages: [],
    from: 'goods_edit'
  }

  isStart = false

  scale = 1

  startPosition: { x: number; y: number } = { x: 0, y: 0 }

  startImagePosition = { x: 0, y: 0, top: 0, left: 0, bottom: 0, right: 0 }

  timer: NodeJS.Timeout

  rects: any

  transitionCount = 0

  imageStyles: CSSProperties[] = []

  imageDisplayIndexArray: number[] = []

  isDeleteClicked = false

  disableClick = false

  observers: any[] = []

  sortable: any

  state = {
    // activeImage: '',
    activeImageIndex: -1, // 视觉上
    imageSource: [] as ImageType[], // 实际
    activeImageStyle: {},
    imageDisplayIndexArray: [], // 实际 map 视觉
    styles: [] as CSSProperties[] // 实际
  }

  componentDidMount() {
    this.setState({ imageSource: this.props.defaultImages })

    if (process.env.TARO_ENV === 'h5') {
      const el = document.getElementById('movable_image_container')
      this.sortable = Sortable.create(el, {
        animation: 150,
        delay: 200,
        // Element dragging ended
        onStart: () => {
          this.isStart= true
        },
        onEnd: (/**Event*/ evt) => {
          this.isStart = false
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
                this.props.onImageChange && this.props.onImageChange(images)
              }
            )
          }
        }
      })
    }
  }

  componentDidUpdate(prevProps, prevState: Readonly<State>) {
    const { onImageChange } = this.props
    if (this.state.imageSource.length !== prevState.imageSource.length) {
      this.reCalculateImageDisplayIndex()
      this.calculatePosition()
      this.removeObserver()
      this.addObserver()
    }

    const notEqual = prevProps.defaultImages.reduce((prev, cur, index) => {
      return prev && cur.codeValue === this.props.defaultImages[index].codeValue
    }, false)
    if (
      notEqual ||
      this.props.defaultImages.length !== prevProps.defaultImages.length ||
      (this.props.from === 'goods_share' && this.props.defaultImages !== prevProps.defaultImages)
    ) {
      this.setState({
        imageSource: [...this.props.defaultImages]
      })
    }
  }

  componentWillUnmount() {
    this.removeObserver()
  }

  addObserver = () => {
    if (process.env.TARO_ENV === 'weapp') {
      this.state.imageSource.forEach((item, index) => {
        const observe = (Taro.getCurrentInstance()?.page as any).createIntersectionObserver()
        observe.relativeTo('#move-image').observe(`#view_for_judge_interaction--${index}`, res => {
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

  calculateScrennScale = () => {
    const { windowWidth } = Taro.getSystemInfoSync()
    this.scale = windowWidth / 750
  }

  calculatePosition = () => {
    const query = Taro.createSelectorQuery().in(Taro.getCurrentInstance().page as any)
    query
      .selectAll('.view_for_calculate_position')
      .boundingClientRect((rects: any) => {
        this.rects = rects
        const styles: CSSProperties[] = []
        const baseRect = rects[0]
        rects.forEach(rect => {
          // console.log(rect, 'recct')
          const x = rect.left - baseRect.left
          const y = rect.top - baseRect.top
          // const width = rect
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

  startMove = _index => {
    const activeImageIndex = this.state.imageDisplayIndexArray.findIndex(v => v === _index)
    if (activeImageIndex > -1) {
      this.isStart = true
      this.props.onStart && this.props.onStart()
      const baseRect = this.rects[0]
      const activeRect = this.rects[activeImageIndex]
      const x = activeRect.left - baseRect.left
      const y = activeRect.top - baseRect.top
      const transform = transformXYToCssTransfrom({ x, y }, this.scale)
      this.startImagePosition = { ...activeRect, x, y }
      const activeImageStyle = { transform: `${transform} scale(1.0)` }
      this.setState({
        activeImageIndex,
        activeImageStyle
      })
    }
  }

  // from, to皆为视觉上的 要map到实际顺序来交换
  moveImages = (from: number, to: number) => {
    const { onImageChange } = this.props
    const length = this.state.imageSource.length
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
        onImageChange && onImageChange(images)
      }
    )
  }

  reCalculateImageDisplayIndex = () => {
    const { onImageChange } = this.props
    const imageLength = this.state.imageSource.length
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
          onImageChange && onImageChange(images)
        }
      )
    }
  }

  getImagesInRealIndex = () => {
    const { imageSource, imageDisplayIndexArray } = this.state
    return imageSource.reduce<ImageType[]>((prev, cur, index) => {
      const _index =
        imageDisplayIndexArray[index] === undefined ? index : imageDisplayIndexArray[index]
      prev.push({ ...imageSource[_index] })
      return prev
    }, [])
  }

  onTouchStart = (e: ITouchEvent) => {
    const touchs = (e.changedTouches as unknown) as ITouch[]
    const { index } = e.currentTarget.dataset
    const touch = touchs[0]
    this.startPosition = { x: touch.pageX, y: touch.pageY }
    this.timer = setTimeout(() => {
      this.startMove(Number(index))
    }, 500)
  }

  onTouchMove = e => {
    e.stopPropagation()
    const touchs = (e.changedTouches as unknown) as ITouch[]
    const touch = touchs[0]
    const touchDiff = {
      x: touch.pageX - this.startPosition.x,
      y: touch.pageY - this.startPosition.y
    }
    const positionDiff = {
      x: this.startImagePosition.x + touchDiff.x,
      y: this.startImagePosition.y + touchDiff.y
    }
    this.setState({
      activeImageStyle: {
        transform: transformXYToCssTransfrom(positionDiff, this.scale)
      }
    })
  }

  onTouchEnd = e => {
    this.clearTimer()
    if (this.isStart) {
      const { onDragEnd } = this.props
      this.disableClickEvent()
      this.isStart = false
      this.props.onEnd && this.props.onEnd()
      const baseRect = this.rects[0]
      const activeRect = this.rects[this.state.activeImageIndex]
      const x = activeRect.left - baseRect.left
      const y = activeRect.top - baseRect.top
      this.setState({
        activeImageStyle: {
          transform: transformXYToCssTransfrom({ x, y }, this.scale)
        }
      })
      this.setState({ activeImageIndex: -1 }, () => {
        const { imageSource, imageDisplayIndexArray } = this.state
        const images = imageDisplayIndexArray.map(item => {
          return imageSource[item]
        })
        onDragEnd && onDragEnd(images)
      })
    }
  }

  disableClickEvent = () => {
    this.disableClick = true
    setTimeout(() => {
      this.disableClick = false
    }, 200)
  }

  onMovableImageTransitionEnd = e => {
    this.isStart && this.transitionCount++
  }

  clearTimer = () => {
    this.timer && clearTimeout(this.timer)
  }

  onWrapperTouchMove = e => {
    if (this.isStart) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  deleteImage = e => {
    if (this.disableClick) return
    e.stopPropagation()
    this.isDeleteClicked = true
    let dataset = e.target.dataset
    const index = Number(dataset.index)
    const { onDeleteImage, onImageChange } = this.props
    const { imageSource } = this.state
    const image = imageSource[index]
    this.setState(
      state => {
        const _index = state.imageDisplayIndexArray.findIndex(itemIndex => itemIndex === index)
        const imageDisplayIndexArray = [...state.imageDisplayIndexArray]
        imageDisplayIndexArray.splice(_index, 1)
        return {
          imageSource: state.imageSource.filter((item, i) => i !== index),
          imageDisplayIndexArray: imageDisplayIndexArray.map(v => (v >= index ? v - 1 : v))
        }
      },
      () => {
        this.isDeleteClicked = false
        // onDeleteImage && onDeleteImage(this.state.imageSource, image)
        const images = this.getImagesInRealIndex()
        onImageChange && onImageChange(images)
      }
    )
  }

  render() {
    const {
      imageSource,
      styles,
      activeImageIndex,
      activeImageStyle,
      imageDisplayIndexArray
    } = this.state
    const { from } = this.props
    const _height = process.env.TARO_ENV === 'weapp' ? '100rpx' : '50px'
    const activeImage = imageSource[imageDisplayIndexArray[activeImageIndex]] || null
    console.log(activeImageStyle, 'activeImageStyle')
    return (
      <View className='movable_block' style={{ position: 'relative' }} onTouchMove={e => {
        if(e.target.class = 'movable_image movable_image--h5' && this.isStart)  {
          e.preventDefault()
        }
      }}
      >
        {process.env.TARO_ENV === 'weapp' && <View className='view_for_placeholder'>
          {imageSource.map((item, index) => (
            <View
              className='view_for_calculate_position'
              key={item.codeValue}
              style={{
                height: _height,
                marginBottom: process.env.TARO_ENV === 'weapp' ? '20rpx' : '10px'
              }}
            >
              <View
                className='view_for_judge_interaction'
                id={`view_for_judge_interaction--${index}`}
              />
            </View>
          ))}
        </View>}

        <View
          id='movable_image_container'
          className={classnames('movable_image_container', {
            'movable_image_container--h5': process.env.TARO_ENV === 'h5'
          })}
        >
          {imageSource.map((item, index) => {
            return  process.env.TARO_ENV === 'weapp' ? (
              <View
                className='movable_image'
                key={item.codeValue}
                style={{
                  ...styles[imageDisplayIndexArray.findIndex(indexItem => indexItem === index)],
                  opacity: index === imageDisplayIndexArray[activeImageIndex] ? 0 : 1,
                  height: _height
                }}
                // onClick={this.previewImage}
              >
                <Text>{`${item.codeName}(${item.spuCount}件)`}</Text>

                <View
                  className='touch_view'
                  onTouchStart={this.onTouchStart}
                  onTouchMove={this.onTouchMove}
                  onTouchEnd={this.onTouchEnd}
                  data-index={index}
                >
                  <Image src={MoveIcon} style='width:100%;height:100%;' />
                </View>
              </View>
            ) : (
              <View
                className='movable_image movable_image--h5'
                key={item.codeValue}
              >
                <Text>{`${item.codeName}(${item.spuCount}件)`}</Text>
                <View
                  className='touch_view'
                >
                  <Image src={MoveIcon} style='width:100%;height:100%;' />
                </View>
              </View>
            )
          })}
        </View>

        <View
          id='move-image'
          className='base_image base_image--active'
          style={{
            opacity: activeImageIndex > -1 ? 1 : 0.8,
            zIndex: activeImageIndex > -1 ? 2 : -1,
            ...activeImageStyle
          }}
        >
          {activeImage && <Text>{`${activeImage.codeName}(${activeImage.spuCount}件)`}</Text>}
          <View
            className='touch_view'
            // onTouchStart={this.onTouchStart}
            // onTouchMove={this.onTouchMove}
            // onTouchEnd={this.onTouchEnd}
            // data-index={index}
          >
            <Image src={MoveIcon} style='width:100%;height:100%;' />
          </View>
        </View>
      </View>
    )
  }
}

//
function transformXYToCssTransfrom(p: { x: number; y: number }, scale = 1) {
  return `translate(${p.x * scale}px, ${p.y * scale}px)`
}
