// const { isWeapp } = require('@utils/cross_platform_api')

import { isWeapp } from '@utils/cross_platform_api'

let VodUploader
if (process.env.TARO_ENV === 'weapp') {
  VodUploader = require('../vod-wx-sdk-v2')
} else {
  // 打包小程序的时候会有问题 暂时注释。
  VodUploader = require('vod-js-sdk-v6').default
}

console.log(VodUploader, 'VodUploader')

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

type Param = {
  mediaFile: SuccessVideoResult
  getSignature(cb: (sign: string) => void): void
  mediaName: string
  progress?(p: { percent: number }): void
  finish(result: { coverUrl?: string; fileId: string; videoName: string; videoUrl: string }): void
  error?(err: { errMsg?: string; message?: string }): void
}

const uploader = {
  async start(p: Param) {
    if (isWeapp()) {
      VodUploader.start(p)
    } else {
      const vod = new VodUploader({
        getSignature: () =>
          new Promise(resolve => {
            p.getSignature(sign => resolve(sign))
          })
      })
      const blob = await fetch(p.mediaFile.tempFilePaths[0], {}).then(r => {
        return r.blob()
      })
      const surfix = blob.type.replace('video/', '') || 'mp4'
      const file = new File(
        [blob],
        `${p.mediaName || 'video'}.${surfix === 'quicktime' ? 'MOV' : surfix}`,
        { type: blob.type }
      )

      const vUploader = vod.upload({
        mediaFile: file
        // mediaName: p.mediaName
      })

      vUploader.on('media_progress', function(info) {
        p.progress && p.progress(info) // 进度
      })

      // 视频上传完成时
      vUploader.on('media_upload', function(info) {
        console.log('doen', info)
      })

      console.log(vUploader, 'vUploader')

      vUploader
        .done()
        .then(function(res) {
          // deal with doneResult
          p.finish({ ...res, fileId: res.fileId, videoUrl: res.video.url })
        })
        .catch(function(err) {
          // deal with error
          p.error && p.error(err)
        })
    }
  }
}

export default uploader
