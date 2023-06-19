import request from '../utils/request'
import config from '../config/config'

interface IBizLicenseDetectReqBody {
  licenseUrl: string
  docId: string
}
export function bizLicenseDetect(param: IBizLicenseDetectReqBody) {
  const { licenseUrl, docId } = param
  return request({
    url: config.merfin,
    data: {
      apiKey: 'ec-img-bizLicenseDetect',
      licenseUrl,
      docId
    }
  })
}

export function getCategoriesByType() {
  return request({
    url: config.confc,
    data: {
      apiKey: 'wx-open-getCategoriesByType'
    }
  })
}

interface IGetAppRegisterDataParams {
  bizId: string
  proType: string
}
export function getWxAppRegisterData(params: IGetAppRegisterDataParams) {
  return request({
    url: config.confc,
    data: {
      apiKey: 'wx-open-getWxAppRegisterData',
      ...params
    }
  })
}

export interface IRegisterAppParams {
  proType: string
  bizId: string
  appName: string
  appHeadImageDocId: string
  bizLicenseDocId: string
  corpCode: string
  corpCodeType: number
  legalPersonName: string
  legalPersonWechat: string
  corpName: string
  categories: WxAppCategoryDTO[]
}

interface WxAppCategoryDTO {
  first: number
  second: number
  certicates: { key: string; docId: string }[]
}
export function registerApp(params: IRegisterAppParams) {
  return request({
    url: config.confc,
    data: {
      apiKey: 'wx-open-registerWxApp',
      jsonParam: params
    }
  })
}

interface IGetMiniAppVersionInfoParams {
  appId: string
  proType: string
}
export function getMiniAppVersionInfo(params: IGetMiniAppVersionInfoParams) {
  return request({
    url: config.confc,
    data: {
      apiKey: 'ec-wxop-code-getVersionInfo',
      ...params
    }
  })
}
