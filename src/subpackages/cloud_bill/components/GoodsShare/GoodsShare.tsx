import Taro from '@tarojs/taro'
import React, { useState, useCallback } from 'react'
import { View, Text, Canvas, Button } from '@tarojs/components'
import EImage from '@components/EImage'
import cn from 'classnames'
import { isWeapp } from '@utils/cross_platform_api'
import messageFeedback from '@services/interactive'
import myLog from '@utils/myLog'
import { safePostMeaasge } from '@utils/postMessage'
import { getSpuGroupQrCode, getSpuGroupLink } from '@api/goods_api_manager'
import events from '@constants/analyticEvents'
import trackSvc from '@services/track'

import WeChatLogoIcon from '../../images/wechat_logo_icon_gray.png'
import ShareFirendsIcon from '../../images/share_friends_icon_gray.png'
import ShareMapIcon from '../../images/share_map_icon.png'
import ShareMiniIcon from '../../images/share_mini_icon.png'
import ShareDownloadIcon from '../../images/share_download_icon.png'
import TImage from './TImage'

import './GoodsShare.scss'

interface OwnProps {
  imageSource: Array<ImageType>
  shopName?: string
  onCloseShare?: (redirect?) => void
  onShareItemClick?: (key: string, data: string) => void
  onSetClipSuccess?: (link: string) => void
  onShareClick?: () => void
  shareType: string
  appName?: string
  groupId: number
}

type ImageType = {
  docId?: string
  url: string
  name?: string
  code?: string
  imgUrls: Array<string>
  styleId: number
}

interface State {
  mode: string
  type: string
  codeUrl: string
  groupLink: string
}

export default class GoodsShare extends React.Component<OwnProps, State> {
  state = {
    mode: 'two',
    type: 'share',
    codeUrl: '',
    groupLink: ''
  }
  canvasIns: HTMLCanvasElement | null = null
  goodImgInfo = {
    height: 346 * 3,
    type: 'png',
    width: 275 * 3
  }

  componentDidMount() {
    this.setState({
      type: this.props.shareType
    })
    if (this.props.shareType === 'share') {
      this.init()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.groupId !== this.props.groupId) {
      this.init()
    }
  }

  init = () => {
    Taro.showLoading({ title: '请稍等...' })
    Promise.all([
      getSpuGroupQrCode({
        id: this.props.groupId
      }),
      getSpuGroupLink({
        id: this.props.groupId
      })
    ])
      .then(([res1, res2]) => {
        Taro.hideLoading()
        this.setState({
          codeUrl: res1.data.rows[0],
          groupLink: res2.data.val,
          type: this.props.shareType
        })
      })
      .catch(() => {
        Taro.hideLoading()
      })
  }

  onCloseShare = () => {
    this.props.onCloseShare && this.props.onCloseShare(true)
  }

  onShareClick = e => {
    e.stopPropagation()
    this.props.onShareClick && this.props.onShareClick()
  }

  onShareItemClick = e => {
    const { key } = e.currentTarget.dataset
    if (key === 'minischeme') {
      trackSvc.track(events.goodsShareMinischeme)
      const _label = `点击查看【${this.props.shopName}】最新款式${this.state.groupLink}`
      Taro.setClipboardData({
        data: _label,
        success: () => {
          this.props.onSetClipSuccess && this.props.onSetClipSuccess(_label)
        }
      })
    } else if (key === 'download') {
      trackSvc.track(events.goodsShareSave)
      this.onDownloadClick()
    } else {
      if (key === 'map') {
        trackSvc.track(events.goodsShareMinicard)
      }
      this.drawCanvas(() => {
        if (this.canvasIns) {
          const base64 = this.canvasIns.toDataURL()
          this.props.onShareItemClick && this.props.onShareItemClick(key, base64)
        }
      })
    }
  }

  onDownloadClick = () => {
    if (this.canvasIns) {
      const base64 = this.canvasIns.toDataURL()
      this.savePhotoToPhone(base64)
    } else {
      this.drawCanvas(() => {
        if (this.canvasIns) {
          const base64 = this.canvasIns.toDataURL()
          this.savePhotoToPhone(base64)
        }
      })
    }
  }

  savePhotoToPhone = base64 => {
    if (isWeapp()) {
      Taro.showLoading({ title: '生成图片中...' })
      Taro.canvasToTempFilePath({
        // @ts-ignore
        canvas: this.canvasIns,
        canvasId: '#goodsshare',
        x: 0,
        y: 0
      })
        .then(res => {
          Taro.saveImageToPhotosAlbum({ filePath: res.tempFilePath })
            .then(() => {
              messageFeedback.showToast('图片已保存到相册')
              setTimeout(() => {
                Taro.hideLoading()
              }, 1000)
            })
            .catch(error => {
              Taro.hideLoading()
              myLog.error(`图片保存失败：${JSON.stringify(error)}`)
              messageFeedback.showToast('图片保存失败')
            })
        })
        .catch(error => {
          Taro.hideLoading()
          myLog.error(`图片保存失败：${JSON.stringify(error)}`)
          messageFeedback.showToast('图片保存失败')
        })
    } else {
      safePostMeaasge(
        JSON.stringify({
          eventType: this.props.appName === 'slh' ? 'saveImageBase64' : 'saveImage',
          data: base64
        })
      )
    }
  }

  getCanvasHeight = () => {
    const { imageSource } = this.props
    if (imageSource) {
      const { mode } = this.state
      let _length = imageSource.length > 12 ? 12 : imageSource.length
      return mode === 'two'
        ? Math.ceil(_length / 2) * (125 + 16) + 70
        : Math.ceil(_length / 3) * (81 + 16) + 70
    }
  }

  getCanvasXY = _idx => {
    const { mode } = this.state
    if (mode === 'two') {
      return {
        x: _idx % 2 === 0 ? 16 * 2 : 125 * 3 + 16 * 3,
        y: Math.floor(_idx / 2) * (125 * 3) + 16 * (Math.floor(_idx / 2) + 3),
        w: 125
      }
    } else {
      return {
        x: _idx % 3 === 0 ? 16 * 2 : (_idx % 3) * 81 * 3 + 16 * ((_idx % 3) + 2),
        y: Math.floor(_idx / 3) * (81 * 3) + 16 * (Math.floor(_idx / 3) + 3),
        w: 81
      }
    }
  }

  createSelectorQuery = () => {
    if (isWeapp()) {
      return Taro.createSelectorQuery().in(Taro.getCurrentInstance().page as any)
    } else {
      return {
        select(selectTag: string) {
          const q = document.querySelector(selectTag)
          return {
            node(callback) {
              callback({
                node: Object.assign(q.firstElementChild, {
                  createImage() {
                    const image = new Image()
                    image.crossOrigin = 'anonymous'
                    // return new Image()
                    return image
                  }
                })
              })
              return {
                exec() {}
              }
            }
          }
        }
      }
    }
  }

  drawCanvas = (callback: Function) => {
    const { shopName, imageSource } = this.props
    const label = '扫码查看本店更多新款'
    let successLength = 0
    this.createSelectorQuery()
      .select('#goodsshare')
      .node(res => {
        this.canvasIns = res.node
        const { width: canvasWidth } = this.goodImgInfo
        const canvasHeight = this.getCanvasHeight() * 3
        res.node.width = canvasWidth
        res.node.height = canvasHeight
        const ins = res.node.getContext('2d') as CanvasRenderingContext2D
        ins.clearRect(0, 0, canvasWidth, canvasWidth)
        ins.fillStyle = 'white'
        ins.fillRect(0, 0, canvasWidth, canvasHeight)
        let _imageSource =
          imageSource.length > 12
            ? imageSource.map(item => ({ ...item })).splice(0, 12)
            : imageSource
        _imageSource.forEach((img, _idx) => {
          let goodsImage = res.node.createImage()
          goodsImage.src = img.url
          goodsImage.onload = () => {
            const _size =
              goodsImage.width > goodsImage.heignt ? goodsImage.height : goodsImage.width
            const { x, y, w } = this.getCanvasXY(_idx)
            const scale = _size > w * 3 ? (w * 3) / _size : _size / (w * 3)
            ins.drawImage(
              goodsImage,
              goodsImage.width > goodsImage.height ? (goodsImage.width - goodsImage.height) / 2 : 0,
              goodsImage.height > goodsImage.width ? (goodsImage.height - goodsImage.width) / 2 : 0,
              _size,
              _size,
              x,
              y,
              w * 3,
              w * 3
            )
            successLength++
            this.onCallback(callback, successLength, _imageSource.length)
          }
        })
        // 店铺名称
        ins.fillStyle = '#222222'
        ins.font = 'bold 42px/1 sans-serif'
        ins.textBaseline = 'middle'
        ins.textAlign = 'left'
        ins.fillText(shopName || '无', 16 * 3, canvasHeight - 180)
        // label
        ins.fillStyle = '#999999'
        ins.font = '36px/1 sans-serif'
        ins.textBaseline = 'middle'
        ins.fillText(label, 16 * 3, canvasHeight - 110)
        const qrImg = res.node.createImage()
        qrImg.src = this.state.codeUrl
        qrImg.onload = () => {
          ins.drawImage(qrImg, canvasWidth - (16 + 48) * 3, canvasHeight - 70 * 3, 48 * 3, 48 * 3)
          successLength++
          this.onCallback(callback, successLength, _imageSource.length)
        }
      })
      .exec()
  }

  onCallback = (callback, successLength, imageLength) => {
    if (successLength === imageLength + 1) {
      callback()
    }
  }

  onSwitchModelClick = () => {
    this.canvasIns = null
    this.setState(state => ({
      mode: state.mode === 'two' ? 'three' : 'two'
    }))
  }

  getMenu = () => {
    if (isWeapp()) {
      return [
        {
          icon: ShareDownloadIcon,
          label: '保存海报',
          key: 'download'
        },
        {
          icon: ShareMapIcon,
          label: '分享商品集合',
          key: 'map'
        },
        {
          icon: ShareMiniIcon,
          label: '小程序链接',
          key: 'minischeme'
        }
      ]
    }
    return [
      {
        icon: ShareDownloadIcon,
        label: '保存海报',
        key: 'download'
      },
      {
        icon: ShareFirendsIcon,
        label: '发朋友圈',
        key: 'monents'
      },
      {
        icon: WeChatLogoIcon,
        label: '转发海报',
        key: 'firends'
      },
      {
        icon: ShareMapIcon,
        label: '分享商品集合',
        key: 'map'
      },
      {
        icon: ShareMiniIcon,
        label: '小程序连接',
        key: 'minischeme'
      }
    ]
  }

  onSuccessClick = () => {
    this.props.onCloseShare && this.props.onCloseShare()
  }

  render() {
    const { imageSource = [], shopName } = this.props
    const { mode, type, codeUrl } = this.state
    const MENU = this.getMenu()
    const canvasHeight = this.getCanvasHeight()
    let _imageSource =
      imageSource.length > 12 ? imageSource.map(item => ({ ...item })).splice(0, 12) : imageSource
    return (
      <View>
        <View className='goods_share_edit_page__share' onClick={this.onCloseShare}>
          <View className='flex_view'>
            <View className='flex_view__content'>
              <View
                className='goods_share_edit_page__share__content'
                onClick={e => e.stopPropagation()}
              >
                <View className='goods_share_edit_page__share__content__imageModelContent'>
                  {_imageSource.map(item => (
                    <View
                      key={item.code}
                      className={cn('model_image_item', {
                        ['model_image_item__small']: mode === 'three',
                        ['model_image_item__big']: mode === 'two'
                      })}
                    >
                      <EImage mode='aspectFill' src={item.imgUrls} />
                    </View>
                  ))}
                  {mode === 'three' && _imageSource.length % 3 === 2 && (
                    <View className='model_image_item, model_image_item__small' />
                  )}
                </View>
                <View className='goods_share_edit_page__share__content__shopInfo'>
                  <View className='share_shop_name'>{shopName}</View>
                  <View className='share_shop_label'>扫码查看本店更多新款</View>
                  <View className='share_shop_minicode'>
                    <EImage src={codeUrl} />
                  </View>
                </View>
              </View>
            </View>

            <View className='switcw_model_view' onClick={e => e.stopPropagation()}>
              <View
                className={cn('switcw_model_view__item two_model flex_center', {
                  ['switcw_model_view__item--active']: mode === 'two'
                })}
                onClick={this.onSwitchModelClick}
              >
                两图样式
              </View>
              <View
                className={cn('switcw_model_view__item three_model flex_center', {
                  ['switcw_model_view__item--active']: mode === 'three'
                })}
                onClick={this.onSwitchModelClick}
              >
                三图样式
              </View>
            </View>
          </View>
          {type === 'prewview' && (
            <View className='goods_share_edit_page__share__preview'>
              <View className='goods_share_edit_page__share__preview__title'>分享预览</View>
              <View className='goods_share_edit_page__share__preview__actionView'>
                <View className='goods_share_edit_page__share__preview__actionView__actionLeft'>
                  返回修改
                </View>
                <View
                  className='goods_share_edit_page__share__preview__actionView__actionRight'
                  onClick={this.onShareClick}
                >
                  立即分享
                </View>
              </View>
            </View>
          )}
          {type === 'share' && (
            <View className='goods_share_edit_page__share__shareView'>
              {/* <View className='goods_share_edit_page__share__shareView__headerView flex_center'>
                <View className='header_line'></View>
                <View className='header_label'>查看分享示例</View>
                <View className='header_line'></View>
              </View> */}
              <View
                className='goods_share_edit_page__share__shareView__content'
                onClick={e => e.stopPropagation()}
              >
                {MENU.map(item => (
                  <View
                    className='share_item_view'
                    key={item.key}
                    data-key={item.key}
                    onClick={this.onShareItemClick}
                  >
                    {item.key === 'map' ? (
                      <Button openType='share' className='share_button'>
                        <View className='image_item'>
                          <TImage src={item.icon} />
                        </View>
                        <Text className='item_label'>{item.label}</Text>
                      </Button>
                    ) : (
                      <View className='share_button'>
                        <View className='image_item'>
                          <TImage src={item.icon} />
                        </View>
                        <Text className='item_label'>{item.label}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        <Canvas
          style={{ height: `${canvasHeight}px` }}
          type='2d'
          id='goodsshare'
          canvasId='goodsshare'
          className='goods_canvas'
        />
      </View>
    )
  }
}
