/**
 * @author lgl
 * @create date 2019/11/16
 * @desc 下载管理器
 */

import myLog from '@utils/myLog'
import Taro from '@tarojs/taro'
import messageFeedback from '@services/interactive'
import config from '@config/config'
import { isWeapp } from './cross_platform_api'
import { safePostMeaasge } from './postMessage'

function saveMediasToAlbum(option: Taro.saveVideoToPhotosAlbum.Option) {
  if (option.filePath.includes('.mp4')) {
    return Taro.saveVideoToPhotosAlbum(option)
  } else {
    return Taro.saveImageToPhotosAlbum(option)
  }
}

/**
 * 下载保存一个文件
 */
function downloadSaveFile(url: string, success: Function, fail: Function) {
  Taro.downloadFile({
    url,
    success(res) {
      const option = {
        filePath: res.tempFilePath,
        // @ts-ignore
        success(result) {
          if (success) {
            success(result)
          }
        },
        fail(e) {
          myLog.log('保存一个文件失败')
          if (fail) {
            fail(e)
          }
        }
      }
      saveMediasToAlbum(option)
    },
    fail(e) {
      myLog.log('下载一个文件失败')
      if (fail) {
        fail(e)
      }
    }
  })
}
/**
 * 多文件下载并且保存，强制规定，必须所有文件下载成功才算返回成功
 */
function downloadSaveFiles(
  urls: string[] | string[][],
  success: Function,
  fail: Function,
  updatePro: Function,
  appName?: string
) {
  const savedFilePaths = {}
  const tasks = urls.map((url, index) => {
    let mainUrl = ''
    let backUrl = ''
    if (Array.isArray(url)) {
      mainUrl = url[0]
      backUrl = url[1]
    } else {
      mainUrl = url
    }
    myLog.log(`downlading images ====> ${mainUrl}`)
    return Taro.downloadFile({
      url: mainUrl,
      // timeout: 10000,
      // withCredentials: false,
      success(res) {
        const length = Object.keys(savedFilePaths).length + 1
        savedFilePaths[mainUrl] = res.tempFilePath

        if (updatePro) {
          updatePro(length)
        }

        // 如果所有的url 才算成功
        if (length === urls.length) {
          if (success) {
            success()
          }
          Object.keys(savedFilePaths).forEach(key => {
            const tempFilePath = savedFilePaths[key]
            if (isWeapp()) {
              saveMediasToAlbum({
                filePath: tempFilePath,
                // @ts-ignore
                success(result) {
                  console.log('saveImageToPhotosAlbum ')
                },
                fail(e) {
                  messageFeedback.showToast('图片/视频保存失败,请稍后重试')
                  myLog.log(`保存一个文件失败 url === ${key}`)
                  // if (fail) {
                  //   fail(e)
                  // }
                }
              })
            } else {
              safePostMeaasge(
                JSON.stringify({
                  eventType: 'saveImage',
                  data: tempFilePath
                })
              )
            }
          })
        }
      },
      fail(e) {
        if (backUrl) {
          myLog.log('下载失败，开启重试==============')
          myLog.log(`downlading images ====> ${backUrl}`)
          const task = Taro.downloadFile({
            url: backUrl,
            success(res) {
              const length = Object.keys(savedFilePaths).length + 1
              savedFilePaths[backUrl] = res.tempFilePath

              if (updatePro) {
                updatePro(length)
              }

              // 如果所有的url 才算成功
              if (length === urls.length) {
                if (success) {
                  success()
                }

                Object.keys(savedFilePaths).forEach(key => {
                  const tempFilePath = savedFilePaths[key]
                  saveMediasToAlbum({
                    filePath: tempFilePath,
                    // @ts-ignore
                    success(result) {
                      console.log('saveImageToPhotosAlbum ')
                    },
                    fail(e) {
                      messageFeedback.showToast('图片/视频保存失败,请稍后重试')
                      myLog.log(`保存一个文件失败 url === ${key}`)
                      // if (fail) {
                      //   fail(e)
                      // }
                    }
                  })
                })
              }
            },
            fail(e) {
              myLog.log('下载失败（重试）==============')
              if (fail) {
                fail(e)
              }
            }
          })

          tasks[index] = task
        } else {
          myLog.log('下载失败==============')
          if (fail) {
            fail(e)
          }
        }
      }
    })
  })

  return tasks
}

export default {
  downloadSaveFiles,
  downloadSaveFile
}

export function uploadImage(path: string) {
  return Taro.uploadFile({
    url: `${config.imageServe}/v3/upload.do`,
    filePath: path,
    name: 'imageFromETicketMP',
    timeout: 10000,
    withCredentials: false
  })
}

export function saveRemoteImgToAlbum(url: string) {
  myLog.log(`开始下载图片，url:${url}`)
  Taro.showLoading({ title: '正在保存图片' })
  Taro.downloadFile({
    url,
    success(res) {
      myLog.log(`下载图片成功，filePath: ${res.tempFilePath}`)

      Taro.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        // @ts-ignore
        success(result) {
          // 保存成功
          Taro.hideLoading()
          messageFeedback.showToast('图片保存成功')
          myLog.log(`图片保存成功`)
        },
        fail(e) {
          // 保存失败
          Taro.hideLoading()
          myLog.log(`图片保存失败，错误：${JSON.stringify(e)}`)
          if (e.errMsg.includes('auth')) {
            messageFeedback.showToast('请打开相册权限或长按图片保存')
          }
        }
      })
    },
    fail(e) {
      // 下载失败
      Taro.hideLoading()
      myLog.log(`图片下载失败，错误：${JSON.stringify(e)}`)
      messageFeedback.showToast('图片保存失败，请尝试长按保存')
    }
  })
}
