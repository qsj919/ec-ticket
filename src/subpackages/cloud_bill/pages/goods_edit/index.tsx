import Taro from '@tarojs/taro'
import React from 'react'
import { Image, Text, Video, View } from '@tarojs/components'
import { connect } from 'react-redux'
import { AtActivityIndicator } from 'taro-ui'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import messageFeedback from '@services/interactive'
import EButton from '@components/Button/EButton'
import dva from '@utils/dva'
import myLog from '@utils/myLog'
import images from '@config/images'
import { getCurrentDateNumber, getTaroParams } from '@utils/utils'
import { isWeapp, setNavigationBarTitle } from '@utils/cross_platform_api'
import { MAX_GOODS_VIDEO_DURATION } from '@constants/index'
import videoDefaultImg from '../../images/video_default.png'
import MovableImagePicker from '../../components/MovableImagePicker'
import styles from './index.module.scss'
import { uploadImageAsync } from '../../helper/uploadImageSvc'

// eslint-disable-next-line import/no-commonjs
import VodUploader from '../../vod_sdk'

interface SuccessVideoResult {
  /** 选定视频的时间长度 */
  duration: number
  /** 返回选定视频的高度 */
  height: number
  /** 选定视频的数据量大小 */
  size: number
  /** 选定视频的临时文件路径 */
  tempFilePath: string
  /** 封面 */
  thumbTempFilePath: string
  /** 返回选定视频的宽度 */
  width: number
  /** 调用结果 */
  errMsg: string
}

interface ImageType {
  docId?: string
  url: string
}

const mapStateToProps = ({ goodsManage, loading }: GlobalState) => {
  const detail = goodsManage.goodsDetail
  const { allImgUrlBig, fileId } = detail
  const _urls = allImgUrlBig.split(',')
  const docIds = fileId.split(',')
  const imagesFromProps = fileId ? _urls.map((url, index) => ({ url, docId: docIds[index] })) : []
  return {
    docUploadUrl: goodsManage.docUploadUrl,
    imagesFromProps,
    goodsData: detail,
    loading:
      loading.effects['goodsManage/fetchGoodsDetail'] &&
      loading.effects['goodsManage/fetchGoodsDetail'].loading,
    sign: goodsManage.sign
  }
}

type State = {
  videoInfo: { fileId?: string | number; videoUrl?: string }
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class GoodsEditPage extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config: Taro.Config = {
  //   navigationBarTitleText: '相册管理'
  // }

  state = {
    videoInfo: {} as { fileId?: string | number; videoUrl?: string },
    isVideoVisible: false
  }

  coverDocId?: string

  images: ImageType[] = []

  backTimer: NodeJS.Timer | null = null

  componentDidShow() {
    setNavigationBarTitle('相册管理')
  }

  componentDidMount() {
    const { styleId } = getTaroParams(Taro.getCurrentInstance?.())
    this.props.dispatch({ type: 'goodsManage/resetDetail' })
    this.props.dispatch({ type: 'goodsManage/fetchGoodsDetail', payload: { spuId: styleId } })
  }

  componentDidUpdate(prevProps) {
    const { videoUrl } = this.props.goodsData
    if (!prevProps.goodsData.videoUrl && videoUrl) {
      this.setState({ videoInfo: { videoUrl } })
    }
  }

  componentWillUnmount() {
    this.backTimer && clearTimeout(this.backTimer)
  }

  onChooseImage = (allImages: ImageType[], addedImages: ImageType[]) => {
    this.images = allImages
  }

  onDeleteImage = (allImages: ImageType[], deleteImage: ImageType) => {
    this.images = allImages
  }

  onImageChange = (allImages: ImageType[]) => {
    this.images = allImages
    // 记录下首次进来的封面图
    if (!this.coverDocId) {
      this.coverDocId = allImages[0].url
    }
  }

  uploadSuccess = async () => {
    messageFeedback.showToast('图片视频更改成功')
    this.backTimer = setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  onSaveClick = async () => {
    if (this.images.length === 0) {
      return messageFeedback.showToast('请选择至少一张图片')
    }
    Taro.showLoading({ mask: true, title: '图片上传中...' })
    const current = this.images[0].url
    const prev = this.coverDocId
    const url = this.props.docUploadUrl
    const images = [...this.images]
    const { videoInfo } = this.state
    const { styleId } = getTaroParams(Taro.getCurrentInstance?.())
    try {
      uploadImageAsync(
        images,
        url,
        (docIds, newDocNum, failDocNum) => {
          // 上传完成之后的保存图片
          dva.getDispatch()({
            type: 'goodsManage/updateGoodsMedias',
            payload: { docIds, ...videoInfo, newDocNum, failDocNum, pk: styleId }
          })
          dva.getDispatch()({
            type: 'goodsManage/updateGoodsImageLocal',
            payload: { url: current, spuId: styleId }
          })
          this.uploadSuccess()
        },
        () => {
          // 上传一张完成即返回
          // Taro.hideLoading()
          // this.uploadSuccess()
        }
      )
    } catch (e) {
      Taro.hideLoading()
      myLog.log(`上传图片失败：${e.message || e.errMsg}`)
      messageFeedback.showToast(e.message || e.errMsg)
    }
  }

  uploadImg = async () => {
    const url = this.props.docUploadUrl

    const res = await Promise.all(
      this.images.map(img => {
        if (img.docId) {
          return new Promise(resolve => {
            resolve(img.docId)
          })
        } else {
          return Taro.uploadFile({
            url: url,
            filePath: img.url,
            name: 'img'
          }).then(({ data }) => {
            return data
          })
        }
      })
    )
    return res
  }

  deleteVideo = () => {
    // this.videoInfo = { fileId: -1 }
    this.setState({ videoInfo: { fileId: -1, videoUrl: '' } })
  }

  onVideoClick = () => {
    Taro.navigateTo({
      url: `/subpackages/cloud_bill/pages/video_player_page/index?videoUrl=${this.state.videoInfo.videoUrl}`
    })
  }

  /** 选择视频 */
  onUploadClick = () => {
    Taro.chooseVideo({
      compressed: false,
      maxDuration: MAX_GOODS_VIDEO_DURATION,
      success: res => {
        if (res.duration > MAX_GOODS_VIDEO_DURATION) {
          return messageFeedback.showToast(`视频长度不能超过${MAX_GOODS_VIDEO_DURATION}秒`, 2000)
        }
        console.log(res)
        myLog.log(`视频元信息：${JSON.stringify(res)}`)
        this.uploadVideo(res)
      }
    })
  }

  uploadVideo = (
    file: SuccessVideoResult,
    coverFile?: { tempFilePaths: string[]; tempFiles: { path: string; size: number }[] }
  ) => {
    if (!this.props.sign) {
      this.props.dispatch({ type: 'goodsManage/fetchTXCloudSign' })
      return messageFeedback.showToast('请重进页面再试')
    }
    Taro.showLoading({ title: '视频上传中...' })
    myLog.log(`开始上传视频，文件信息：${JSON.stringify(file)}`)
    const uploader = VodUploader.start({
      // 必填，把 wx.chooseVideo 回调的参数(file)传进来
      mediaFile: file,
      // 必填，获取签名的函数
      getSignature: callback => callback(this.props.sign),
      // 选填，视频名称，强烈推荐填写(如果不填，则默认为“来自小程序”)
      mediaName: `${getCurrentDateNumber()}_from_mp`,
      // 选填，视频封面，把 wx.chooseImage 回调的参数(file)传进来
      coverFile,
      // 上传中回调，获取上传进度等信息
      progress: function(result) {
        Taro.showLoading({ title: `视频上传中(${Math.floor(result.percent * 100)}%)` })
        // console.log('progress')
        // console.log(result)
      },
      // 上传完成回调，获取上传后的视频 URL 等信息
      finish: (result: {
        coverUrl?: string
        fileId: string
        videoName: string
        videoUrl: string
      }) => {
        Taro.hideLoading()
        myLog.log(`上传结束，文件信息：${JSON.stringify(result)}`)
        messageFeedback.showToast('视频上传成功')
        this.setState({
          videoInfo: {
            videoUrl: result.videoUrl,
            coverUrl: result.coverUrl,
            fileId: result.fileId
          }
        })
      },
      // 上传错误回调，处理异常
      error: function(result) {
        Taro.hideLoading()
        messageFeedback.showToast(result.errMsg || result.message)
        myLog.log(`上传视频失败: ${result.errMsg || result.message}，${JSON.stringify(result)}`)
      }
    })
  }

  renderActionView = () => {
    return (
      <View className={styles.action_view}>
        <View className={styles.action_view___right} onClick={this.onSaveClick}>
          保存
        </View>
      </View>
    )
  }

  render() {
    const { imagesFromProps, loading, goodsData } = this.props
    const { videoInfo, isVideoVisible } = this.state

    const showAddVideo = !videoInfo.videoUrl
    const coverUrl = !goodsData.coverUrl || videoInfo.fileId ? videoDefaultImg : goodsData.coverUrl
    return (
      <View className={styles.container}>
        <View className='flex1 scroll' style='background-color:#f7f7f7;'>
          {loading ? (
            <View className='aic jcc' style={{ height: '100%' }}>
              <AtActivityIndicator size={100} />
            </View>
          ) : (
            <View>
              <View className={styles.media_content}>
                <View className={styles.title}>上传视频</View>
                {showAddVideo ? (
                  <View
                    className={styles.image_add}
                    style='background-color: white;'
                    onClick={this.onUploadClick}
                  >
                    <Image className={styles.image_add__icon} src={images.relay.add} />
                    <Text className={styles.image_add__text}>添加视频</Text>
                  </View>
                ) : (
                  <View className={styles.image}>
                    <Image
                      className={styles.image__image}
                      onClick={this.onVideoClick}
                      src={coverUrl}
                      mode='aspectFill'
                    />
                    <Image
                      className={styles.image__del_icon}
                      src={images.relay.close}
                      onClick={this.deleteVideo}
                    />
                    <View className={styles.image__edit} onClick={this.onUploadClick}>
                      更换视频
                    </View>
                  </View>
                )}
              </View>
              <View className={styles.media_content}>
                <View className={styles.title} style={{ marginTop: '8px' }}>
                  上传图片
                </View>
                <MovableImagePicker
                  onImageChange={this.onImageChange}
                  // onChoseImage={this.onChooseImage}
                  // onDeleteImage={this.onDeleteImage}
                  defaultImages={imagesFromProps}
                />
              </View>
            </View>
          )}
        </View>

        {this.renderActionView()}
        {/* <EButton label='保存' onButtonClick={this.onSaveClick} /> */}

        {/* {isVideoVisible && (
          <View className={styles.modal}>
            <Video src={videoInfo.videoUrl} className={styles.video} autoplay />
            <View className={styles.exit} onClick={this.onExitVideoClick}>
              退出预览
            </View>
          </View>
        )} */}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(GoodsEditPage)