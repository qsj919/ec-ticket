import Taro from '@tarojs/taro'
import React from 'react'
import { View, Video, Image } from '@tarojs/components'
import { getCurrentDateNumber } from '@utils/utils'
import { getTxCloudSign } from '@api/apiManage'
import { connect } from 'react-redux'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import messageFeedback from '@services/interactive'
import { MAX_VIDEO_DURATION } from '@constants/index'
import myLog from '@utils/myLog'
import closeIcon from '@/images/close_white_circle.png'
import { setNavigationBarTitle } from '@utils/cross_platform_api'
import images from '@config/images'
import videoDefaultImg from '../../images/video_default.png'
import styles from './index.module.scss'

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

const mapStateToProps = ({ shop, systemInfo, user, loading, goodsManage }: GlobalState) => {
  const _shop = shop.list.find(s => s.id === goodsManage.mpErpId)
  const videos = goodsManage.videos || []
  return {
    videos: videos
  }
}

type State = {
  videoUrl: string
  isVideoVisible: boolean
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class VideoEdit extends React.PureComponent<StateProps & DefaultDispatchProps> {
  // config = {
  //   navigationBarTitleText: '门店视频'
  // }

  // state = {
  //   videoUrl: '',
  //   isVideoVisible: false
  // }

  sign: ''

  refreshTimer: NodeJS.Timeout

  componentDidMount() {
    getTxCloudSign().then(({ data }) => {
      this.sign = data.sign
    })
  }

  componentDidShow() {
    setNavigationBarTitle('门店视频')
  }

  componentDidUpdate(prevProps: Readonly<StateProps>) {
    if (this.props.videos.length > prevProps.videos.length) {
      this.startRefreshVideoTimer()
    }
  }

  componentWillUnmount() {
    this.clearRefreshTimer()
  }

  startRefreshVideoTimer = () => {
    this.clearRefreshTimer()

    this.refreshTimer = setTimeout(() => {
      this.props.dispatch({ type: 'goodsManage/fetchShopVideos' }).then(() => {
        if (!this.props.videos[0].coverUrl) {
          this.startRefreshVideoTimer()
        }
      })
    }, 4000)
  }

  clearRefreshTimer = () => {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }
  }

  /** 选择视频 */
  onUploadClick = () => {
    Taro.chooseVideo({
      compressed: false,
      maxDuration: MAX_VIDEO_DURATION,
      success: res => {
        if (res.duration > MAX_VIDEO_DURATION) {
          return messageFeedback.showToast(`视频长度不能超过${MAX_VIDEO_DURATION}秒`, 2000)
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
    if (!this.sign) {
      return messageFeedback.showToast('请重进页面再试')
    }
    Taro.showLoading({ title: '视频上传中...' })
    myLog.log(`开始上传视频，文件信息：${JSON.stringify(file)}`)
    const uploader = VodUploader.start({
      // 必填，把 wx.chooseVideo 回调的参数(file)传进来
      mediaFile: file,
      // 必填，获取签名的函数
      getSignature: callback => callback(this.sign),
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
        this.props.dispatch({
          type: 'goodsManage/uploadShopVideo',
          payload: {
            videoUrl: result.videoUrl,
            coverUrl: result.coverUrl || file.thumbTempFilePath,
            fileId: result.fileId
          }
        })
        // http://1256054816.vod2.myqcloud.com/d998f7afvodsh1256054816/f699185d3701925920786543001/ZA7yzCaAA0IA.mp4
      },
      // 上传错误回调，处理异常
      error: function(result) {
        Taro.hideLoading()
        messageFeedback.showToast(result.errMsg || result.message)
        myLog.log(`上传视频失败: ${result.errMsg || result.message}，${JSON.stringify(result)}`)
      }
    })
  }

  onDeleteClick = (id: number) => {
    messageFeedback.showAlertWithCancel('是否删除该视频', '提示', () => {
      this.props.dispatch({ type: 'goodsManage/deleteShopVideo', payload: { id } }).then(() => {
        messageFeedback.showToast('删除成功')
      })
    })
  }

  onVideoClick = item => {
    // this.setState({ videoUrl: item.videoUrl, isVideoVisible: true })
    Taro.navigateTo({
      url: `/subpackages/cloud_bill/pages/video_player_page/index?videoUrl=${item.videoUrl}`
    })
  }

  render() {
    const { videos } = this.props
    // const { videoUrl, isVideoVisible } = this.state
    return (
      <View className={styles.page}>
        {/* {video && <Video src={video.videoUrl} />} */}
        {videos.length > 0 ? (
          <View className={styles.videos}>
            {videos.map(item => (
              <View key={item.videoUrl} className={styles.video_item}>
                {item.coverUrl ? (
                  <Image
                    src={item.coverUrl}
                    className={styles.cover}
                    mode='aspectFit'
                    onClick={() => this.onVideoClick(item)}
                  />
                ) : (
                  <Image
                    src={videoDefaultImg}
                    className={styles.default_cover}
                    onClick={() => this.onVideoClick(item)}
                  />
                )}
                <Image
                  src={closeIcon}
                  className={styles.close}
                  onClick={() => this.onDeleteClick(item.id)}
                />
                <Image
                  src={images.common.play_96}
                  className={styles.play}
                  onClick={() => this.onVideoClick(item)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.center}>
            <View className={styles.intro}>
              <View>档口视频名片</View>
              <View>让客户更容易记住</View>
            </View>
          </View>
        )}

        <View onClick={this.onUploadClick} className={styles.upload_btn}>
          上传视频
        </View>
      </View>
    )
  }
}

export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(VideoEdit)
