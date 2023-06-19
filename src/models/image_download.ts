// import download from '@utils/download'
import dva from '@utils/dva'
import myLog from '@utils/myLog'
// import * as shopApi from '@src/apimanager/shop'
import Taro, { downloadFile } from '@tarojs/taro'
import { NetWorkErrorType, YKError } from '@utils/request/error'
import { Model } from '@@types/dva'
import messageFeedback from '@services/interactive'
import download from '@utils/download'
import { fetchImageUrls } from '@api/apiManage'
import trackSvc from '@services/track'

export interface SPU {
  code: string
  tenantSpuId: number
  name: string
  allImgUrlBig: string
  videoUrl: string
  coverUrl: string
  styleId: number
  imgUrl: string
  sn: string
  epid: string
}

export interface ImageDownloadState {
  percent: number // 当前百分比
  allPercent: number // 总份数
  waitList: string[][]
  downLoadding: boolean
  sourceData: SPU[]
  // downloadTasks: downloadFile.DownloadTask[]
}

const imageDownload: Model<ImageDownloadState> = {
  namespace: 'imageDownload',
  state: {
    percent: 0,
    allPercent: 0,
    waitList: [],
    downLoadding: false,
    sourceData: []
    // downloadTasks: []
  },

  effects: {
    *fetchImageUrlsFormatData({ payload }, { call, put }) {
      const { mpErpId, styleIds, sourceData } = payload
      const { data } = yield call(fetchImageUrls, { mpErpId, styleIds })
      const _sourceData = sourceData.map((s, idx) => {
        const docUrls = (data.rows[idx] && data.rows[idx].docUrls) || []
        return {
          name: s.styleName,
          code: s.styleCode,
          tenantSpuId: s.styleId,
          ...s,
          allImgUrlBig: docUrls.reduce((prev, cur) => prev + (prev ? ',' : '') + cur[0], '')
        }
      })

      yield put({ type: 'save', payload: { sourceData: _sourceData } })
    },
    *fetchImageUrls({ payload }, { call, put, select }) {
      // const { sourceData } = yield select(state => state.imageDownload)
      const { data } = yield call(fetchImageUrls, payload)
      const rows = data.rows || []
      const imageList = rows.reduce((prev, cur) => {
        prev.push(...cur.docUrls)
        return prev
      }, [])

      const _images = imageList.filter(imgArray => imgArray.length > 0)
      trackSvc.track('download_images', { count: _images.length })

      yield put({
        type: 'downloadSaveFiles',
        payload: { imageList: _images } // 过滤空数组
      })
    },
    *downloadSaveFiles(params, { put, select, call }) {
      // const { tenantId } = yield select(state => state.shop)
      // Taro.reportAnalytics('goods_detail_download_image', {
      //   spuid: params.payload.spuId,
      //   type: params.payload.type,
      //   tenantid: tenantId
      // })
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
                    // @ts-ignore
                    success: res => {
                      dva.getDispatch()({
                        type: 'imageDownload/realDownLoad',
                        payload: params.payload
                      })
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
                  dva.getDispatch()({
                    type: 'imageDownload/realDownLoad',
                    payload: params.payload
                  })
                }
              }
            })
          }
        }
      })
    },

    *realDownLoad(params, { put, select, call }) {
      const stateOld = yield select(state => state.imageDownload)
      if (params.payload && params.payload.imageList) {
        if (params.payload.imageList.length === 0) {
          messageFeedback.showToast('未找到图片资源，请稍后再试')
        }
        // const newWaitList = produce(stateOld.waitList, draftState => {
        //   draftState.push(params.payload.imageList)
        // })
        const newWaitList = [...stateOld.waitList, params.payload.imageList]
        yield put({
          type: 'save',
          payload: {
            waitList: newWaitList,
            downLoadding: true,
            allPercent: stateOld.allPercent + params.payload.imageList.length
          }
        })
      }
      if (params.payload && params.payload.imageList && stateOld.downLoadding) {
        return
      }

      const { waitList } = yield select(state => state.imageDownload)
      // messageFeedback.showToast('正在下载图片')
      try {
        if (waitList.length > 0) {
          const docImageList = waitList[0]
          // const newImageList: string[] | string[][] = []
          // for (let i = 0; i < docImageList.length; i++) {
          //   // const docId = docImageList[i]
          //   // // docId = 'docs15724882605173938-16781-ssdoc10d.do'
          //   // const res = yield call(shopApi.getImageRealUrl, docId)
          //   // newImageList.push(res.data[docId])
          yield call(
            download.downloadSaveFiles,
            docImageList,
            () => {
              if (dva.getState().imageDownload.waitList.length === 0) {
                dva.getDispatch()({
                  type: 'imageDownload/save',
                  payload: { downLoadding: false, percent: 0, allPercent: 0 }
                })
                messageFeedback.showToast('图片/视频已成功下载')
              } else {
                dva.getDispatch()({
                  type: 'imageDownload/realDownLoad'
                })
              }
            },
            () => {
              dva.getDispatch()({
                type: 'imageDownload/save',
                payload: {
                  downLoadding: false,
                  percent: 0,
                  allPercent: 0,
                  waitList: []
                }
              })
              messageFeedback.showToast('图片/视频保存失败，请重试！')
            },
            length => {
              dva.getDispatch()({
                type: 'imageDownload/save',
                payload: {
                  percent: dva.getState().imageDownload.percent + 1
                }
              })
            }
          )

          // const newWaitList = produce(waitList, draftState => {
          //   draftState.shift()
          // })
          const temp = [...waitList]
          temp.shift()
          const newWaitList = temp
          yield put({
            type: 'save',
            payload: { waitList: newWaitList }
          })
          if (docImageList.length === 0) {
            yield put({ type: 'realDownLoad' })
          }
        } else {
          yield put({
            type: 'save',
            payload: { downLoadding: false, percent: 0, allPercent: 0 }
          })
        }
      } catch (e) {
        yield put({
          type: 'save',
          payload: { downLoadding: false, percent: 0, allPercent: 0 }
        })
        messageFeedback.showError(e)
      }
    }
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    },
    reset(state) {
      return {
        ...state,
        downLoadding: false,
        percent: 0,
        allPercent: 0,
        waitList: [],
        sourceData: []
      }
    }
  }
}

export default imageDownload
