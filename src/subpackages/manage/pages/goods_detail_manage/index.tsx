import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Text, Image, Button, Canvas, Block, ScrollView } from '@tarojs/components'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import {
  createSelectorQuery,
  isWeapp,
  isWeb,
  setNavigationBarTitle
} from '@utils/cross_platform_api'
import myLog from '@utils/myLog'
import EImage from '@components/EImage'
import messageFeedback from '@services/interactive'
import { connect } from 'react-redux'
import download from '@utils/download'
import { NetWorkErrorType, YKError } from '@utils/request/error'
import { safePostMeaasge } from '@utils/postMessage'
import config from '@config/config'
import { httpToHttps } from '@utils/stringUtil'
import { storage } from '@constants/index'
import { getTaroParams } from '@utils/utils'
import angleRight from '@/images/angle_right_gray_40.png'
import deleteIcon from '@/images/delete.png'
import checked from '@/images/checked_circle_red.png'
import unChecked from '@/images/icon/uncheck_circle.png'
import { getSpuDetailQrCode, findSpuMarketLog } from '@api/goods_api_manager'
import SharePosterIcon from '../../images/share_poster_icon.png'
import WeChatLogoIcon from '../../images/wechat_logo_icon.png'
import ShareCancelIcon from '../../images/share_cancel_icon.png'
import ShareFirendsIcon from '../../images/share_ friends_icon.png'
import ShareDownLoadIcon from '../../images/share_download_icon.png'
import ShareDefault from '../../images/share_poster_default.png'
import PlayIcon from '../../images/play_icon.png'

import styles from './index.module.scss'

const mapStateToProps = ({ goodsManage, cloudBill, shop }: GlobalState) => {
  return {
    goodsDetail: goodsManage.goodsDetail,
    shopName: goodsManage.shopName,
    appName: goodsManage.appName,
    mpErpId: goodsManage.mpErpId,
    priceTypeList: goodsManage.priceTypeList,
    independentType: goodsManage.independentType
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

type ShelvesDetail = {
  opType: number
  opDesc: string
  opDate: string
}

interface State {
  shareViewIsShow: boolean
  posterIsShow: boolean
  qrCodeUrl: string
  isPrewImage: boolean
  shelvesDetailIsShow: boolean
  shelvesDetailList: Array<ShelvesDetail>
  momentShareTipsIsShow: boolean
  disableMomentShareTip: boolean
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class GoodsDetailManage extends Component<StateProps & DefaultDispatchProps, State> {
  state = {
    shareViewIsShow: false,
    posterIsShow: false,
    qrCodeUrl: '',
    isPrewImage: false,
    shelvesDetailIsShow: false,
    shelvesDetailList: [] as ShelvesDetail[],
    momentShareTipsIsShow: false,
    disableMomentShareTip: true
  }

  canvasIns: HTMLCanvasElement | null = null
  pageNo: number = 1

  showMomentsTips = true

  goodImgInfo = {
    height: 396 * 3,
    orientation: 'up',
    path: '',
    type: 'png',
    width: 275 * 3
  }

  // config: Taro.Config | undefined = {
  //   navigationBarTitleText: '货品详情'
  // }

  _isWeapp = isWeapp()
  _isWeb = isWeb()

  componentDidShow() {
    if (!this.state.isPrewImage) {
      this.init()
      setNavigationBarTitle('货品详情')
    }
  }

  componentDidMount(): void {
    if (this._isWeb) {
      Taro.getStorage({ key: storage.H5_MOMENTS_SHARE_TIP }).then(res => {
        this.showMomentsTips = res.data
      })
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'goodsManage/save',
      payload: {
        goodsDetail: {}
      }
    })
  }

  init = async () => {
    const { styleId = '' } = getTaroParams(Taro.getCurrentInstance?.())
    Taro.showLoading({ title: '请稍等...' })
    await this.props.dispatch({
      type: 'goodsManage/fetchGoodsDetail',
      payload: {
        spuId: styleId
      }
    })
    await this.props.dispatch({
      type: 'goodsManage/selectShopPriceTypeList'
    })
    this.fetchShelvesDetailList()
    Taro.hideLoading()
  }

  initShareCanvas = async () => {
    this.drawCanvas()
  }

  drawCanvas = () => {
    const label = '扫码查看本店更多新款'
    const { goodsDetail, shopName } = this.props
    if (!!goodsDetail) {
      createSelectorQuery()
        .select('#postershare')
        .node(res => {
          this.canvasIns = res.node
          const { width: canvasWidth, height: canvasHeight, path } = this.goodImgInfo
          res.node.width = canvasWidth
          res.node.height = canvasHeight
          const ins = res.node.getContext('2d') as CanvasRenderingContext2D
          ins.clearRect(0, 0, canvasWidth, canvasWidth)
          ins.fillStyle = 'white'
          ins.fillRect(0, 0, canvasWidth, canvasHeight)
          const goodsImg = res.node.createImage()
          goodsImg.src = goodsDetail.allImgUrlBigs[0][0]
          goodsImg.onload = () => {
            ins.drawImage(
              goodsImg,
              0,
              0,
              goodsImg.width,
              goodsImg.height,
              16 * 3,
              16 * 3,
              243 * 3,
              243 * 3
            )
            // 货品名称
            ins.fillStyle = '#222222'
            ins.font = '50px/1 sans-serif'
            ins.textBaseline = 'middle'
            ins.textAlign = 'center'
            ins.fillText(goodsDetail.name, canvasWidth / 2, 16 * 3 + 243 * 3 + 80, (243 - 30) * 3)
            // 店铺名称
            ins.fillStyle = '#222222'
            ins.font = 'bold 42px/1 sans-serif'
            ins.textBaseline = 'middle'
            ins.textAlign = 'left'
            ins.fillText(shopName, 16 * 3, canvasHeight - 180)
            // label
            ins.fillStyle = '#999999'
            ins.font = '36px/1 sans-serif'
            ins.textBaseline = 'middle'
            ins.fillText(label, 16 * 3, canvasHeight - 110)
          }
          const qrImg = res.node.createImage()
          qrImg.src = this.state.qrCodeUrl
          qrImg.onload = () => {
            ins.drawImage(qrImg, canvasWidth - (16 + 48) * 3, canvasHeight * 0.81, 48 * 3, 48 * 3)
          }
        })
        .exec()
    }
  }

  onShareAppMessage() {
    const { goodsDetail, mpErpId } = this.props
    return {
      title: goodsDetail.name,
      path: `/subpackages/cloud_bill/pages/goods_detail/index?spuId=${goodsDetail.styleId}&mpErpId=${mpErpId}&type=share`,
      imageUrl: (goodsDetail.allImgUrlBigs && goodsDetail.allImgUrlBigs[0][0]) || ShareDefault
    }
  }

  onShareBtnClick = () => {
    const { appName, goodsDetail, mpErpId } = this.props
    if (this._isWeb) {
      safePostMeaasge(
        JSON.stringify({
          eventType: 'shareWxMiniProgram',
          data: {
            title: goodsDetail.name,
            path: `/subpackages/cloud_bill/pages/goods_detail/index?spuId=${goodsDetail.styleId}&mpErpId=${mpErpId}&type=share`,
            thumImageUrl:
              (goodsDetail.allImgUrlBigs && goodsDetail.allImgUrlBigs[0][0]) || ShareDefault,
            desc: '',
            [appName === 'slh' ? 'miniprogramType' : 'miniProgramType']:
              process.env.PRODUCT_ENVIRONMENT === 'product' ? 0 : 2,
            userName: config.appUserName
          }
        })
      )
    }
  }

  onShareClick = () => {
    // this.props.dispatch({ type: 'goodsManage/selectErpQrCodeUrl' })
    Taro.showLoading({
      title: '请稍等...'
    })
    const { styleId = '' } = getTaroParams(Taro.getCurrentInstance?.())
    const { mpErpId } = this.props
    getSpuDetailQrCode({
      mpErpId,
      spuId: styleId
    }).then(({ data }) => {
      Taro.hideLoading()
      if (this.props.independentType !== 0) {
        this.setState(
          {
            posterIsShow: true,
            qrCodeUrl: data.rows[0]
          },
          () => {
            this.initShareCanvas()
          }
        )
      } else {
        this.setState(
          {
            shareViewIsShow: true,
            qrCodeUrl: data.rows[0]
          },
          () => {
            this.initShareCanvas()
          }
        )
      }
    })
  }

  onShareCancelClick = () => {
    this.setState({
      shareViewIsShow: false
    })
  }

  onSharePosterClick = () => {
    this.setState({
      posterIsShow: true
    })
  }

  onShareItemClick = e => {
    const { key } = e.currentTarget.dataset
    switch (key) {
      case 'cancel':
        this.setState({
          posterIsShow: false
        })
        break
      case 'firends':
        this.h5ShareToFirends()
        break
      case 'monents':
        this.h5ShareToMoments()
        // if (this.showMomentsTips) {
        //   this.setState({ momentShareTipsIsShow: true })
        // } else {
        // }
        break
      case 'download':
        if (this._isWeapp) {
          this.getCanvasImage()
        } else {
          this.h5SaveToPhoto()
        }
        break
    }
  }

  h5ShareToFirends = () => {
    const base64Data = this.canvasIns!.toDataURL()
    if (this.props.appName === 'slh') {
      safePostMeaasge(
        JSON.stringify({
          eventType: 'shareImageToWechat',
          data: {
            isTimeline: false,
            imgDataStr: base64Data
          }
        })
      )
    } else {
      safePostMeaasge(
        JSON.stringify({
          eventType: 'shareImageToFriends',
          data: base64Data
        })
      )
    }
  }

  h5ShareToMoments = () => {
    const base64Data = this.canvasIns!.toDataURL()
    if (this.props.appName === 'slh') {
      safePostMeaasge(
        JSON.stringify({
          eventType: 'shareImageToWechat',
          data: {
            isTimeline: true,
            imgDataStr: base64Data
          }
        })
      )
    } else {
      safePostMeaasge(
        JSON.stringify({
          eventType: 'shareWxMoments',
          data: base64Data
        })
      )
    }
  }

  h5SaveToPhoto = () => {
    const base64Data = this.canvasIns!.toDataURL()
    safePostMeaasge(
      JSON.stringify({
        eventType: this.props.appName === 'slh' ? 'saveImageBase64' : 'saveImage',
        data: base64Data
      })
    )
  }

  getCanvasImage = () => {
    Taro.showLoading({ title: '生成图片中...' })
    if (!this.canvasIns) {
      this.initShareCanvas()
    }
    Taro.canvasToTempFilePath({
      // @ts-ignore
      canvas: this.canvasIns,
      canvasId: '#postershare',
      x: 0,
      y: 0
    })
      .then(res => {
        Taro.saveImageToPhotosAlbum({ filePath: res.tempFilePath })
          .then(() => {
            Taro.hideLoading()
            messageFeedback.showToast('图片已保存到相册')
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
  }

  downloadAllImages = () => {
    const _this = this
    if (this._isWeapp) {
      // 获取当前网络类型
      Taro.getNetworkType({
        success: res => {
          const networkType = res.networkType
          if (networkType === 'none') {
            messageFeedback.showError(new YKError('网络未连接', NetWorkErrorType.NotConnected))
          } else {
            // 获取相册授权
            Taro.getSetting({
              success(res) {
                if (!res.authSetting['scope.writePhotosAlbum']) {
                  Taro.authorize({
                    scope: 'scope.writePhotosAlbum',
                    success: () => {
                      _this.beginDownload()
                    },
                    fail(fail) {
                      Taro.showModal({
                        title: '提示',
                        content: '检测到您保存到相册权限未开启,是否开启?',
                        success: sudd => {
                          if (sudd.confirm) {
                            Taro.openSetting({})
                          }
                        }
                      })
                    }
                  })
                } else {
                  _this.beginDownload()
                }
              }
            })
          }
        }
      })
    } else {
      this.h5DownloadAllImgs()
    }
  }

  h5DownloadAllImgs = () => {
    const {
      goodsDetail: { allImgUrlBigs = [] }
    } = this.props
    let imgs: Array<string> = []
    allImgUrlBigs.forEach(e => {
      imgs.push(e[0])
    })
    safePostMeaasge(
      JSON.stringify({
        eventType: 'saveImages',
        data: {
          streamUrl: imgs
        }
      })
    )
    if (this.props.goodsDetail.videoUrl) {
      safePostMeaasge(
        JSON.stringify({
          eventType: 'saveVideo',
          data: {
            videoUrl: this.props.goodsDetail.videoUrl
          }
        })
      )
    }
  }

  beginDownload = () => {
    const {
      goodsDetail: { allImgUrlBigs = [], videoUrl = '' }
    } = this.props
    allImgUrlBigs &&
      download.downloadSaveFiles(
        allImgUrlBigs,
        () => {
          Taro.hideLoading()
          if (!videoUrl) {
            Taro.showToast({
              title: '已保存至相册'
            })
          }
          if (videoUrl) {
            Taro.showLoading({ title: '正在下载视频...' })
            download.downloadSaveFile(
              httpToHttps(this.props.goodsDetail.videoUrl),
              () => {
                Taro.hideLoading()
                Taro.showToast({
                  title: '已保存至相册'
                })
              },
              e => {
                Taro.hideLoading()
                myLog.log(`视频下载失败${e}`)
              }
            )
          }
        },
        e => {
          Taro.hideLoading()
          myLog.log(`下载图片失败${e}`)
        },
        i => {
          Taro.showLoading({
            title: `正在下载第${i}个`
          })
        }
      )
  }

  onEditClick = () => {
    this.setState({
      isPrewImage: false
    })
    Taro.navigateTo({
      url: `/subpackages/cloud_bill/pages/goods_edit/index?styleId=${this.props.goodsDetail.styleId}`
    })
  }

  onDownGoodClick = async () => {
    let type = 'goodsManage/'
    type += Number(getTaroParams(Taro.getCurrentInstance?.()).activeTabIndex) === 0 ? 'takeDownGoods' : 'takeUpGoods'
    if (Number(getTaroParams(Taro.getCurrentInstance?.()).activeTabIndex) === 0) {
      messageFeedback.showAlertWithCancel('确定下架商品？', '', () => {
        Taro.showLoading({ title: '请稍等...' })
        this.props
          .dispatch({
            type,
            payload: {
              styleIds: this.props.goodsDetail.styleId + ','
            }
          })
          .then(() => {
            Taro.hideLoading()
            Taro.navigateBack()
          })
          .catch(() => {
            Taro.hideLoading()
          })
      })
    } else {
      Taro.showLoading({ title: '请稍等...' })
      await this.props.dispatch({
        type,
        payload: {
          styleIds: this.props.goodsDetail.styleId + ','
        }
      })
      Taro.hideLoading()
      Taro.navigateBack()
    }
  }

  getPriceTypeList = () => {
    let list: Array<{ label: string; value: string }> = []
    const _priceType = this.props.priceTypeList.filter(item => item.delflag === '1')
    const { goodsDetail } = this.props
    _priceType.forEach(s => {
      list.push({
        label: s.name,
        value: goodsDetail[`stdPrice${s.sid}`]
      })
    })
    return list
  }

  onImgItemClick = e => {
    const { _idx } = e.currentTarget.dataset
    const {
      goodsDetail: { allImgUrlBigs = [] }
    } = this.props
    const _urls = allImgUrlBigs.map(s => s[0] || s[1])
    Taro.previewImage({
      current: _urls[_idx],
      urls: _urls,
      success: () => {
        this.setState({
          isPrewImage: true
        })
      }
    })
  }

  goVideoPage = () => {
    this.setState({
      isPrewImage: false
    })
    Taro.navigateTo({
      url: `/subpackages/cloud_bill/pages/video_player_page/index?videoUrl=${this.props.goodsDetail.videoUrl}`
    })
  }

  fetchShelvesDetailList = (loadMore = false) => {
    const {
      mpErpId,
      goodsDetail: { styleId }
    } = this.props

    if (!styleId) {
      return
    }
    if (loadMore) {
      this.pageNo++
    } else {
      this.pageNo = 1
    }
    findSpuMarketLog({
      pageNo: this.pageNo,
      mpErpId,
      styleId
    })
      .then(({ data }) => {
        this.setState(prevState => ({
          shelvesDetailList:
            this.pageNo === 1 ? data.rows : [...prevState.shelvesDetailList, ...data.rows]
        }))
      })
      .catch(e => {
        console.log(`货品spu上下架明细报错${JSON.stringify(e)}`)
      })
  }

  hideShelvesDetail = () => {
    this.pageNo = 1
    this.setState({
      shelvesDetailIsShow: false
    })
  }

  scrollToLower = () => {
    if (this.state.shelvesDetailList.length >= this.pageNo * 20) {
      this.fetchShelvesDetailList(true)
    }
  }

  onToggleCheckedNoti = () => {
    this.setState(state => ({ disableMomentShareTip: !state.disableMomentShareTip }))
  }

  renderShelvesDetail = () => {
    const { shelvesDetailList } = this.state
    return (
      <View className={styles.shelves_detail_mask} onClick={this.hideShelvesDetail}>
        <View className={styles.shelves_detail_mask__content} onClick={e => e.stopPropagation()}>
          <View className={styles.shelves_detail_mask__content__header}>
            <Text>上下架记录</Text>
            <Image
              src={deleteIcon}
              className={styles.delete_icon}
              onClick={this.hideShelvesDetail}
            />
          </View>
          {shelvesDetailList.length ? (
            <ScrollView
              className={styles.shelves_detail_mask__content__list}
              scrollAnchoring
              scrollY
              lowerThreshold={300}
              onScrollToLower={this.scrollToLower}
            >
              {shelvesDetailList.map((s, _i) => (
                <View key={_i} className={styles.shelves_detail_mask__content__list___item}>
                  <Text className={styles.shelves_desc}>{s.opDesc}</Text>
                  <Text className={styles.shelves_optime}>{s.opDate}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View className={styles.shelves_detail_mask__content__noData}>暂无上下架记录</View>
          )}
        </View>
      </View>
    )
  }

  renderImages = () => {
    const {
      goodsDetail: { allImgUrlBigs = [], videoUrl = '', coverUrl = '' }
    } = this.props
    return (
      <View className={styles.goods_content__imgs}>
        {allImgUrlBigs.map((path, _i) => (
          <View
            key={_i}
            className={styles.goods_content__imgs__item}
            onClick={this.onImgItemClick}
            data-_idx={_i}
          >
            <EImage mode='aspectFit' src={path} />
          </View>
        ))}
        {videoUrl && (
          <View className={styles.goods_content__imgs__item} onClick={this.goVideoPage}>
            <Image
              mode='aspectFill'
              src={coverUrl}
              className={styles.goods_content__imgs__item__img}
            />
            <View className={styles.goods_content__imgs__item__video}>
              <Image src={PlayIcon} className={styles.play_icon} />
            </View>
          </View>
        )}
      </View>
    )
  }

  renderActionView = () => {
    const { activeTabIndex } = getTaroParams(Taro.getCurrentInstance?.())
    return (
      <View className={styles.action_view}>
        <View className={styles.action_view__pre}>
          <View className={styles.action_view__pre___left} onClick={this.onDownGoodClick}>
            {Number(activeTabIndex) === 0 ? '下架' : '上架'}
          </View>
          {Number(activeTabIndex) === 0 && (
            <View className={styles.action_view__pre___right} onClick={this.onShareClick}>
              一键分享
            </View>
          )}
        </View>
      </View>
    )
  }

  renderShareView = () => {
    const { posterIsShow } = this.state
    return (
      <View className={styles.share_mask_view}>
        {!posterIsShow && (
          <View className={styles.share_mask_view__content}>
            <View className={styles.share_mask_view__content__share}>
              <View className={styles.share_mask_view__content__share__item}>
                <Button
                  openType='share'
                  className={styles.share_mask_view__content__share__button}
                  onClick={this.onShareBtnClick}
                >
                  <Image src={WeChatLogoIcon} className={styles.share_icon} />
                  <Text className={styles.share_label}>微信好友</Text>
                </Button>
              </View>
              <View
                className={styles.share_mask_view__content__share__item}
                onClick={this.onSharePosterClick}
              >
                <Image src={SharePosterIcon} className={styles.share_icon} />
                <Text className={styles.share_label}>分享海报</Text>
              </View>
            </View>

            <View className={styles.share_mask_view__content__cancel}>
              <Text style='padding: 30px;' onClick={this.onShareCancelClick}>
                取消
              </Text>
            </View>
          </View>
        )}
      </View>
    )
  }

  renderPosterView = () => {
    const {
      goodsDetail: { allImgUrlBigs = [], name },
      shopName
    } = this.props
    const { qrCodeUrl } = this.state
    let SHARE_MENU = [
      {
        label: '取消',
        icon: ShareCancelIcon,
        key: 'cancel'
      },
      {
        label: '微信好友',
        icon: WeChatLogoIcon,
        key: 'firends'
      },
      {
        label: '朋友圈',
        icon: ShareFirendsIcon,
        key: 'monents'
      },
      {
        label: '下载图片',
        icon: ShareDownLoadIcon,
        key: 'download'
      }
    ]
    if (this._isWeapp) {
      SHARE_MENU = [
        {
          label: '取消',
          icon: ShareCancelIcon,
          key: 'cancel'
        },
        {
          label: '下载图片',
          icon: ShareDownLoadIcon,
          key: 'download'
        }
      ]
    }
    return (
      <View className={styles.poster_view_mask}>
        <View className={styles.poster_view_mask__content}>
          <Image
            src={allImgUrlBigs[0][0] || ShareDefault}
            className={styles.poster_view_mask__content__goodsImg}
            mode='aspectFill'
          />
          <View className={styles.poster_view_mask__content__goodsName}>{name}</View>
          <View className={styles.poster_view_mask__content__shopName}>{shopName}</View>
          <View className={styles.poster_view_mask__content__label}>扫码查看本店更多新款</View>
          <Image src={qrCodeUrl} className={styles.poster_view_mask__content___qrCode} />
        </View>
        <View className={styles.poster_view_mask__shareView}>
          {SHARE_MENU.map(s => (
            <View
              key={s.key}
              className={styles.poster_view_mask__shareView___item}
              data-key={s.key}
              onClick={this.onShareItemClick}
            >
              <Image
                src={s.icon}
                className={styles.poster_view_mask__shareView___item___shareIcon}
              />
              <Text className={styles.poster_view_mask__shareView___item___shareLabel}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  renderMomentTips = () => {
    const { momentShareTipsIsShow, disableMomentShareTip } = this.state
    return (
      momentShareTipsIsShow && (
        <View className={styles.poster_view_mask}>
          <View className={styles.poster_view_mask__tips}>
            <Text>
              “分享到朋友圈”只能分享第一张图片，如需分享多张，请先下载全部图片后前往微信-朋友圈内进行发布
            </Text>
            <View
              className={styles.poster_view_mask__tips__no_noti}
              onClick={this.onToggleCheckedNoti}
            >
              <Image
                className={styles.poster_view_mask__tips__chekced}
                src={disableMomentShareTip ? checked : unChecked}
              />
              不再提醒
            </View>
            <View
              className={styles.poster_view_mask__tips__buttons}
              onClick={() => {
                this.setState({ momentShareTipsIsShow: false })
                Taro.setStorage({
                  key: storage.H5_MOMENTS_SHARE_TIP,
                  data: !this.state.disableMomentShareTip
                })
              }}
            >
              <View className={styles.poster_view_mask__tips__button} onClick={this.h5SaveToPhoto}>
                去保存图片
              </View>
              <View
                className={styles.poster_view_mask__tips__button}
                onClick={this.h5ShareToMoments}
              >
                继续分享
              </View>
            </View>
          </View>
        </View>
      )
    )
  }

  render() {
    const { shareViewIsShow, posterIsShow, shelvesDetailIsShow } = this.state
    const { goodsDetail } = this.props
    const priceTypeList = this.getPriceTypeList()
    return (
      <View className={styles.goods_detail_manage}>
        <View className={styles.goods_info}>
          <View className={styles.goods_info__detail}>
            <View className={styles.goods_info__detail___goodsName}>
              {goodsDetail.name || ''} {goodsDetail.code && `#${goodsDetail.code}`}
            </View>
            <View className={styles.goods_info__detail___code}>库存：{goodsDetail.invNum}</View>
          </View>
          <View className={styles.goods_info__price}>
            {/* <View className={styles.line_border}></View> */}
            {priceTypeList.map(p => (
              <View key={p.value} className={styles.goods_info__price___priceItem}>
                <Text className={styles.goods_price}>¥{p.value}</Text>
                <Text className={styles.price_type}>{p.label}</Text>
              </View>
            ))}
          </View>
          <View
            className={styles.goods_info__pullDownDetail}
            onClick={() => this.setState({ shelvesDetailIsShow: true })}
          >
            查看上下架记录
            <Image src={angleRight} className={styles.goods_info__pullDownDetail__icon} />
          </View>
        </View>
        <View className={styles.goods_content}>
          <View className={styles.goods_content__header}>
            <Text className={styles.goods_content__header___label}>货品相册</Text>
            <View style='display:flex;align-items:center;'>
              <View className={styles.action_download} onClick={this.downloadAllImages}>
                下载图片
              </View>
              <View className={styles.action_edit} onClick={this.onEditClick}>
                编辑相册
              </View>
            </View>
          </View>
          {this.renderImages()}
        </View>

        <Block>{this.renderActionView()}</Block>
        <Block>{shareViewIsShow && this.renderShareView()}</Block>
        <Block>{posterIsShow && this.renderPosterView()}</Block>
        <Block>{shelvesDetailIsShow && this.renderShelvesDetail()}</Block>

        {/* {this.renderMomentTips()} */}
        <Canvas type='2d' id='postershare' canvasId='postershare' className={styles.my_canvas} />
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(GoodsDetailManage)