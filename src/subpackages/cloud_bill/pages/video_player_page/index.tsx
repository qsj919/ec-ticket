import Taro from '@tarojs/taro'
import React from 'react'
import { Video, View } from '@tarojs/components'
import i18n from "@@/i18n";
import debounce from "lodash/debounce";
import download from "@utils/download";
import {httpToHttps} from "@utils/stringUtil";
import myLog from "@utils/myLog";
import { getTaroParams } from '@utils/utils'

import styles from './index.module.scss'

export default class VideoPlayerPage extends React.PureComponent {
  // config = {
  //   navigationBarTitleText: '视频播放'
  // }

  state = {
    videoUrl: getTaroParams(Taro.getCurrentInstance?.()).videoUrl,
    type: getTaroParams(Taro.getCurrentInstance?.()).type
  }

  onExitVideoClick = () => {
    Taro.navigateBack()
  }

  downloadVideo = debounce((url: string) => {
    Taro.showLoading({
      title: '加载中',
    })
    url&&download.downloadSaveFile(
      httpToHttps(url),
      () => {
        Taro.hideLoading()
        Taro.showToast({
          title: '视频已保存至相册'
        })
      },
      e => {
        Taro.hideLoading()
        myLog.log(`视频下载失败${e}`)
      }
    )
  }, 400)

  render() {
    const { videoUrl,type } = this.state
    return (
      <View className={styles.modal}>
        <Video src={videoUrl} className={styles.video} autoplay />
        <View className={styles.exit} onClick={this.onExitVideoClick}>
          退出预览
        </View>
        {
          type==='goodsDetail'&& <View
            onClick={this.downloadVideo.bind(this, videoUrl)}
            className={styles.download_video_title}
          >
            {i18n.t._('downloadVideo')}
          </View>
        }

      </View>
    )
  }
}
