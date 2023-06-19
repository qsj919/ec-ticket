import { CodeTypes, ICodeType } from '@@/subpackages/apply_miniapp/utils/constants'
import { Model } from '@@types/dva'
import { bizLicenseDetect } from '@api/applyApp_api_manager'
import { uploadImage } from '@utils/download'

interface ImgObj {
  url: string
  docId: string
}
type Img = ImgObj | null
interface ISeniorityAuth {
  // 营业执照
  bizLicense: Img
  // 信用代码
  licenseNo: string
  // 法人
  faRen: string
  // 企业类型
  regType: string
  // 法人微信
  faRenWx: string
  // 企业代码类型
  codeType: ICodeType | null
  // 企业名称
  companyName: string
  // 第三方联系电话
  componentPhone : string
}

interface IBusinessCategory {
  l1Category: any // WxAppCategoryCertificateDTO
  l2Category: any
}

interface ICertification extends ImgObj {
  qualifyName: string
}

export interface ApplyMiniappState {
  name: string
  avatar: Img
  businessCategory: IBusinessCategory
  seniorityAuth: ISeniorityAuth
  certifications: ICertification[] | null
}

const applyMiniappModel: Model<ApplyMiniappState> = {
  namespace: 'applyMiniapp',
  state: {
    name: '',
    avatar: null,
    businessCategory: {
      l1Category: null,
      l2Category: null
    },
    seniorityAuth: {
      bizLicense: null,
      licenseNo: '',
      faRen: '',
      regType: '',
      faRenWx: '',
      codeType: null,
      companyName: '',
      componentPhone: ''
    },
    certifications: null
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    },
    changeSeniorityAuth(state, { payload }) {
      return {
        ...state,
        seniorityAuth: {
          ...state.seniorityAuth,
          ...payload
        }
      }
    },
    changeBusinessCategory(state, { payload }) {
      return { ...state, ...payload }
    },
    updateCertifications(state, { payload }) {
      let prevCertifications = state.certifications || []
      prevCertifications[payload.index] = payload.certification
      return {
        ...state,
        certifications: [...prevCertifications]
      }
    }
  },
  effects: {
    *uploadImage({ payload }, { put }) {
      const { url, imgType, index, qualifyName } = payload

      let reqData
      yield uploadImage(url)
        .then(({ data }) => {
          const _data = JSON.parse(data)
          reqData = _data
        })

      // 上传失败退出
      if (!reqData) return

      const imgUrl = reqData.data.org[0]
      const docId = reqData.data.id
      switch (imgType) {
        case 'avatar':
          yield put({
            type: 'save',
            payload: {
              avatar: {
                url: imgUrl,
                docId
              }
            }
          })
          break
        case 'bizLicense':
          yield put({
            type: 'save',
            payload: {
              seniorityAuth: {
                bizLicense: {
                  url: imgUrl,
                  docId
                }
              }
            }
          })
          yield put.resolve({
            type: 'parseBizLicenseImg',
            payload: {
              bizLicense: {
                url: imgUrl,
                docId
              }
            }
          })
          break
        case 'certifications':
          yield put({
            type: 'updateCertifications',
            payload: {
              certification: {
                qualifyName,
                url: imgUrl,
                docId
              },
              index
            }
          })
        default:
          break
      }
    },

    *parseBizLicenseImg({ payload }, { put }) {
      // 请求接口解析执照内容
      const { bizLicense } = payload
      const parseData = yield bizLicenseDetect({
        licenseUrl: bizLicense.url,
        docId: bizLicense.docId
      })

      if (parseData.data && parseData.data.licenseNo) {
        const curCodeType = CodeTypes.find(
          codeType => codeType.numLength === parseData.data.licenseNo.length
        )
        yield put({
          type: 'save',
          payload: {
            seniorityAuth: {
              bizLicense: payload.bizLicense,
              codeType: curCodeType,
              ...parseData.data
            }
          }
        })
      }
    }
  }
}

export default applyMiniappModel
