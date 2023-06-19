import Taro from '@tarojs/taro'
import { isWeb } from '@utils/cross_platform_api'
import myLog from '@utils/myLog'

interface ImageType {
  docId?: string
  url: string
}

/**
 *
 * @param images 图片
 * @param url 上传地址
 * @param cb 上传完成回调
 * @param cb1 第一张图上传完成回调
 */
export const uploadImageAsync = (
  images: ImageType[],
  url: string,
  cb: (docIds: string[], newDocNum?: number, failDocNum?: number) => void,
  cb1: () => void
) => {
  // return new Promise((resolve, reject) => {
  const docIds: string[] = new Array(images.length).fill(undefined)
  myLog.log(`开始异步上传，图片长度:${images.length}`)
  let failDocNum = 0
  let newDocNum = 0
  let firstImgUpload = false
  images.forEach(async (img, idx) => {
    if (img.docId) {
      docIds[idx] = img.docId
      if (docIds.every(docId => docId && docId.length > 0) && docIds.length === images.length) {
        if (!firstImgUpload) {
          cb1()
          firstImgUpload = true
        }
        cb(
          docIds.filter(docId => !Number.isNaN(Number(docId))),
          newDocNum,
          failDocNum
        )
      }
    } else {
      let filePath
      if (isWeb()) {
        filePath = img.url
      } else {
        const res = await Taro.compressImage({ src: img.url, quality: 60 })
        filePath = res.tempFilePath
      }

      Taro.uploadFile({
        url: url,
        filePath: filePath,
        name: 'img',
        withCredentials: false
      }).then(({ data }) => {
        if (Number.isNaN(Number(data))) {
          // 出错情况，记录日志
          myLog.error(`图片上传失败:${data}`)
          failDocNum += 1
          newDocNum -= 1
        }
        newDocNum += 1
        docIds[idx] = data
        if (!firstImgUpload) {
          cb1()
          firstImgUpload = true
        }
        if (docIds.every(docId => docId && docId.length > 0) && docIds.length === images.length) {
          cb(
            docIds.filter(docId => !Number.isNaN(Number(docId))),
            newDocNum,
            failDocNum
          )
        }
      })
      // Taro.compressImage({
      //   src: img.url,
      //   quality: 60
      // }).then(res => {

      // })
    }
  })
  // })
}
