/*
 * @Author: GaoYuJian
 * @Date: 2019-10-15 11:52:09
 * @Last Modified by: Miao Yunliang
 * @Desc 项目配置文件
 */

/**
 * test: 测试环境
 * product: 正式环境
 * @type {string}
 */

let PRODUCT_ENVIRONMENT = 'product'
if (process.env.PRODUCT_ENVIRONMENT) {
  PRODUCT_ENVIRONMENT = process.env.PRODUCT_ENVIRONMENT
}

console.log(`--PRODUCT_ENVIRONMENT: ${PRODUCT_ENVIRONMENT}`)

const ConfigParams = {
  /**
   * 测试
   * 微信支付测试
   */
  test: {
    server: 'https://slbtest.hzdlsoft.com',
    backServer: 'https://slbtest1.hzdlsoft.com',
    wxmpServer: 'https://hzdev.hzdlsoft.com/wx/api.do?apiKey=ec-weixin-mp-sign', // JS-SDK签名
    wxAppId: 'wxe101ecc8e2b231a9', // 杭州衣科研发公众号id
    miniAppId: 'wx2b2f32ee370d5f72',
    wxPublicName: '杭州衣科研发',
    mtaSid: '500699337',
    mtaCid: '500699352',
    amktServer: 'https://hzdev.hzdlsoft.com/amkt/api.do',
    amktH5: 'https://hzdev.hzdlsoft.com',
    authQrUrlPrefix: 'https://slbtest.hzdlsoft.com/weapp/auth_history?',
    followQrUrl:
      'https://a01-1256054816.cos.ap-shanghai.myqcloud.com/2020/08/20/816399597185794438.jpg',
    followQrUrlFromPhone:
      'https://a01-1256054816.cos.ap-shanghai.myqcloud.com/2020/10/28/866624124372648579.png',
    followQrUrlFromAct:
      'https://a01-1256054816.cos.ap-shanghai.myqcloud.com/2020/11/21/883916865481736835.png',
    detailQrUrlPrefix: 'https://slbtest.hzdlsoft.com/weapp/detail',
    uploadImageServe: 'https://s6test.hzdlsoft.com:7401/doc',
    bigData: 'http://192.168.0.99:4001',
    appUserName: 'gh_53399583457d',
    cloudBillGuideH5:
      'https://webdoc.hzecool.com/amkt/market-portal-h5/test/#/cloudBillGuideH5?hideNav=1',
    merfin: 'https://hzdev.hzdlsoft.com/merfin/api.do',
    confc: 'https://hzdev.hzdlsoft.com/confc/api.do'
  },

  /**
   * 正式
   * 微信支付正式
   */
  product: {
    server: 'https://bao.hzecool.com',
    wxmpServer: 'https://weixin.hzdlsoft.com/wx/api.do?apiKey=ec-weixin-mp-sign', // // JS-SDK签名
    wxAppId: 'wx014e2d92e4bf1a3b', // 商陆花信息服务号id
    miniAppId: 'wx19064c2bc9fcb745',
    wxPublicName: '商陆花笑铺日记信息服务号',
    mtaSid: '500699383',
    mtaCid: '500699384',
    amktServer: 'https://mkt.hzecool.com/amkt/api.do',
    amktH5: 'https://mkt.hzecool.com',
    authQrUrlPrefix: 'https://bao.hzecool.com/weapp/auth_history?',
    followQrUrl: 'https://gdoc01a.hzecool.com/2020/08/20/816594444274369033.jpg',
    followQrUrlFromPhone: 'https://gdoc02a.hzecool.com/2020/10/28/866621912976196099.png',
    followQrUrlFromAct: 'https://gdoc02a.hzecool.com/2020/11/21/883916343592878592.png',
    detailQrUrlPrefix: 'https://bao.hzecool.com/weapp/detail',
    uploadImageServe: 'https://gdoc01.hzecool.com/doc',
    bigData: 'https://big.hzecool.com',
    appUserName: 'gh_a4e0bf07933c',
    cloudBillGuideH5:
      'https://webdoc.hzecool.com/amkt/market-portal-h5/prod/#/cloudBillGuideH5?hideNav=1',
    merfin: 'https://merfin.hzdlsoft.com/merfin/api.do',
    confc: 'https://cc.hzecool.com:7580/confc/api.do'
  }
}

console.log('ConfigParams[PRODUCT_ENVIRONMENT] :', ConfigParams[PRODUCT_ENVIRONMENT])

export default {
  get server() {
    return ConfigParams[PRODUCT_ENVIRONMENT].server
  },
  get backServer() {
    return ConfigParams[PRODUCT_ENVIRONMENT].backServer
  },
  get wxAppId() {
    return ConfigParams[PRODUCT_ENVIRONMENT].wxAppId
  },
  get wxmpServer() {
    return ConfigParams[PRODUCT_ENVIRONMENT].wxmpServer
  },
  get mtaSid() {
    return ConfigParams[PRODUCT_ENVIRONMENT].mtaSid
  },
  get mtaCid() {
    return ConfigParams[PRODUCT_ENVIRONMENT].mtaCid
  },
  get amktServer() {
    return ConfigParams[PRODUCT_ENVIRONMENT].amktServer
  },
  get miniAppId() {
    return ConfigParams[PRODUCT_ENVIRONMENT].miniAppId
  },
  get amktH5() {
    return ConfigParams[PRODUCT_ENVIRONMENT].amktH5
  },
  get wxPublicName() {
    return ConfigParams[PRODUCT_ENVIRONMENT].wxPublicName
  },
  get authQrUrlPrefix() {
    return ConfigParams[PRODUCT_ENVIRONMENT].authQrUrlPrefix
  },
  get followQrUrl() {
    return ConfigParams[PRODUCT_ENVIRONMENT].followQrUrl
  },
  get followQrUrlFromPhone() {
    return ConfigParams[PRODUCT_ENVIRONMENT].followQrUrlFromPhone
  },
  get followQrUrlFromAct() {
    return ConfigParams[PRODUCT_ENVIRONMENT].followQrUrlFromAct
  },
  get detailQrUrlPrefix() {
    return ConfigParams[PRODUCT_ENVIRONMENT].detailQrUrlPrefix
  },
  get imageServe() {
    return ConfigParams[PRODUCT_ENVIRONMENT].uploadImageServe
  },
  get bigDataServer() {
    return ConfigParams[PRODUCT_ENVIRONMENT].bigData
  },
  get appUserName() {
    return ConfigParams[PRODUCT_ENVIRONMENT].appUserName
  },
  get cloudBillGuideH5Url() {
    return ConfigParams[PRODUCT_ENVIRONMENT].cloudBillGuideH5
  },
  get merfin() {
    return ConfigParams[PRODUCT_ENVIRONMENT].merfin
  },
  get confc() {
    return ConfigParams[PRODUCT_ENVIRONMENT].confc
  }
}
