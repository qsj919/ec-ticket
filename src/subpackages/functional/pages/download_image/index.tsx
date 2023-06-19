import Taro from '@tarojs/taro'
import React from 'react'
import { connect } from 'react-redux'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { Button, Image, View } from '@tarojs/components'
import messageFeedback from '@services/interactive'
import trackSvc from '@services/track'
import events from '@constants/analyticEvents'
import homePng from '@/images/home_red.png'
import { storage } from '@constants/index'
import { getTaroParams } from '@utils/utils'
import { CLOUD_BILL_FLAG } from '@@types/base'
import defaultShopLogo from '@/images/default_shop.png'
import downloadIcon from '@/images/icon/download_icon.png'
import ImageItem from './components/ImageItem'
import styles from './download.module.scss'
import shareBg from './images/share_bg.png'
import bg from '../../images/share_model_img.png'

type State = {
  shopName: string
  shopLogo: string
  cloudBillFlag: string
  ignoreNoti
}

const mapStateToProps = ({ imageDownload }: GlobalState) => ({
  ...imageDownload
})

type stateProps = ReturnType<typeof mapStateToProps>

// @connect<stateProps, {}, DefaultDispatchProps>(mapStateToProps)
class DownloadImage extends React.PureComponent<
  stateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationBarTitleText: '商品相册'
  // }

  static defaultProps = {
    sourceData: []
  }

  onShareAppMessage(e) {
    const { sourceData } = this.props
    const firImage = sourceData && sourceData[0].allImgUrlBig.split(',')[0]
    if (e.from === 'button') {
      return {
        title: `亲爱的老板，该更新模特图啦`,
        path: `subpackages/functional/pages/image_share/index`,
        imageUrl: bg
      }
    } else {
      return {
        title: `${this.state.shopName}门店的商品相册`,
        path: `subpackages/functional/pages/download_image/index${this.getQuery()}`,
        imageUrl: firImage || bg
      }
    }
  }

  getQuery = () => {
    const { shopName, shopLogo, cloudBillFlag } = this.state
    const { mpErpId, sn, epid } = getTaroParams(Taro.getCurrentInstance?.())
    const { sourceData } = this.props
    let _ids: Array<number> = []
    sourceData.forEach(s => {
      _ids.push(s.styleId || s.tenantSpuId)
    })
    let _sourceData = sourceData.map(s => {
      return {
        name: s.name,
        code: s.code,
        allImgUrlBig: s.allImgUrlBig || s.imgUrl,
        tenantSpuId: s.styleId || s.tenantSpuId
      }
    })
    return `?shopName=${encodeURIComponent(
      shopName
    )}&logo=${shopLogo}&cloudBillFlag=${cloudBillFlag}&mpErpId=${mpErpId}&styleIds=${_ids.join(
      ','
    )}&from=share&_sourceData=${JSON.stringify(_sourceData)}&epid=${sourceData[0].epid ||
      epid}&sn=${sourceData[0].sn || sn}`
  }

  constructor(props) {
    super(props)
    const { logo, shopName, cloudBillFlag } = getTaroParams(Taro.getCurrentInstance?.())
    this.state = {
      shopLogo: decodeURIComponent(logo),
      shopName: decodeURIComponent(shopName),
      cloudBillFlag,
      ignoreNoti: false
    }
  }

  componentDidMount() {
    Taro.getStorage({ key: `${storage.NO_NOTIFICATION_IMAGE}:${getTaroParams(Taro.getCurrentInstance?.()).mpErpId}` })
      .then(data => {
        this.setState({ ignoreNoti: data.data })
      })
      .catch(() => {
        // ignore
      })
    const { mpErpId, styleIds, _sourceData, from } = getTaroParams(Taro.getCurrentInstance?.())
    const _source = decodeURIComponent(_sourceData)
    if (from === 'share') {
      this.props.dispatch({
        type: 'imageDownload/fetchImageUrlsFormatData',
        payload: {
          mpErpId,
          styleIds,
          sourceData: [...JSON.parse(_source)]
        }
      })
    }
  }

  componentDidUpdate() {
    const { downLoadding, percent } = this.props
    if (downLoadding) {
      Taro.showLoading({ title: `正在下载第${percent + 1}个图片/视频` })
    }
  }

  componentWillUnmount() {
    this.props.dispatch({ type: 'imageDownload/reset' })
  }

  ignoreNotiClick = () => {
    Taro.setStorage({
      key: `${storage.NO_NOTIFICATION_IMAGE}:${getTaroParams(Taro.getCurrentInstance?.()).mpErpId}`,
      data: true
    })
    this.setState({ ignoreNoti: true })
  }

  // 下载单个款号图片
  downloadImages = (tenantSpuId: number | string, isAll = false) => {
    const { sn, epid, pk = '' } = getTaroParams(Taro.getCurrentInstance?.())
    // 埋点
    if (!isAll) {
      trackSvc.track(events.downloadImageClick, {
        sn,
        epid,
        pk,
        tenantspuId: String(tenantSpuId)
      })
      trackSvc.track(events.downloadImageDownloadClick)
    }
    Taro.showLoading({ title: '获取图片资源...' })
    this.props.dispatch({
      type: 'imageDownload/fetchImageUrls',
      payload: { sn, epid, styleIds: tenantSpuId }
    })
  }

  downloadVideo = (videoUrl: string) => {
    if (videoUrl.substr(0, 5) !== 'https') {
      videoUrl = `https${videoUrl.substr(4)}`
    }
    this.props.dispatch({
      type: 'imageDownload/downloadSaveFiles',
      payload: { imageList: [videoUrl] }
    })
  }

  downloadAllImages = () => {
    // const styleids = this.props.sourceData.map(item => item.tenantSpuId).join(',')
    // this.downloadImages(styleids, true)
    const { sn, epid, pk = '' } = getTaroParams(Taro.getCurrentInstance?.())

    trackSvc.track(events.downloadImageClick, {
      sn,
      epid,
      pk
    })
    trackSvc.track(events.downloadImageDownloadClick)
    this.props.sourceData
      .filter(item => typeof item.allImgUrlBig === 'string' && item.allImgUrlBig !== '')
      .forEach(item => this.downloadImages(item.tenantSpuId || item.styleId, true))
  }

  isImagesMoreThanOne = () => {
    const { sourceData } = this.props
    return sourceData.some(item => {
      return item.allImgUrlBig && item.allImgUrlBig.split(',').length > 0
    })
  }

  onShareClick = () => {
    trackSvc.track(events.downloadImageInvitationClick)
  }

  render() {
    const { sourceData } = this.props
    const { shopLogo, shopName, cloudBillFlag, ignoreNoti } = this.state
    const isNotiVisible =
      sourceData.length === 1 && sourceData.some(item => item.allImgUrlBig.split(',').length <= 1)
    const isNotSkuPic = sourceData.length <= 1 && sourceData.some(item => item.allImgUrlBig === '')
    return (
      <View className={styles.page}>
        <View className={styles.header}>
          {/* <View className={styles.header__bg}></View> */}
          <Image className={styles.header__logo} src={shopLogo || defaultShopLogo} />
          <View className={styles.header__label}>{shopName}</View>
          {Number(cloudBillFlag) === CLOUD_BILL_FLAG.open && (
            <View
              className={styles.header__btn}
              onClick={() => {
                this.props.dispatch({
                  type: 'cloudBill/init',
                  payload: {
                    mpErpId: Number(getTaroParams(Taro.getCurrentInstance?.()).mpErpId)
                  }
                })
                Taro.navigateTo({ url: `/subpackages/cloud_bill/pages/all_goods/index` })
              }}
            >
              <Image className={styles.header__btn__icon} src={homePng} />
              进店
            </View>
          )}
        </View>
        <View className={styles.container}>
          {sourceData.map(item => (
            <View key={item.tenantSpuId} className={styles.b}>
              <ImageItem
                data={item}
                onDownloadClick={this.downloadImages}
                onDownloadVideo={this.downloadVideo}
                goodsLength={sourceData.length}
              />
            </View>
          ))}
        </View>
        <View
          className={styles.download_all}
          onClick={() => !isNotSkuPic && this.downloadAllImages()}
          style={{
            background: `${
              !isNotSkuPic ? 'linear-gradient(137deg, #ff788f 0%, #e62e4d 100%)' : 'gray'
            }`
          }}
        >
          <Image src={downloadIcon} className={styles.download_all__icon} />
          一键下载所有图片
        </View>

        {!ignoreNoti && isNotiVisible && (
          <View className={styles.noti}>
            <Button openType='share' className={styles.noti__btn} onClick={this.onShareClick}>
              <Image src={shareBg} className={styles.noti__btn__img} />
              <View className={styles.noti__label}>去通知</View>
            </Button>
            <View className={styles.noti__cancel} onClick={this.ignoreNotiClick}>
              此商家不再提醒
            </View>
          </View>
        )}
      </View>
    )
  }
}
export default connect<stateProps, {}, DefaultDispatchProps>(mapStateToProps)(DownloadImage)