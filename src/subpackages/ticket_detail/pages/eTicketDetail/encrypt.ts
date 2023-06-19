import { lib, AES, mode, pad, enc } from 'crypto-js'
import JSEncrypt from 'jsencrypt'
// import { v4 as uuidv4 } from 'uuid'
import Taro from '@tarojs/taro'
import config from '@config/config'
import { getAuthKey, getETicketDetailV6, getTS } from './api'

let mykey = ''
let keyVer = ''

// 随机字符串
function generateUUID() {
  var d = new Date().getTime()
  var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid.slice(0, 16)
}

let publicKey =
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCfRTwMK+8R2UP/gZStvGh3BQN/i3OCjMLnqk3Q/ovZR4YRemrXF594/C6rtmwdWUEZZeqUCng/OWKk/Qv1CsGpTPFxdd1ja3bgSW25JjUmn7i4wv2OB2/pgqzhAdfhg4eQrGtioSqu0+fWC1+OLf2j35tYBTJx95AE9TS6+3eMNwIDAQAB'

if (process.env.PRODUCT_ENVIRONMENT === 'test') {
  publicKey =
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDACm2Xa/QTA/T9Gr0Un3BMT5IKaJ1sOr+Xym5TtYFVn2QNcdiydYXLvwl5zNh8QLVgYf8VqWs1N8RS4gCdW7odMTUWshgLS4w7LHeDIpRvWlMlmm4gnnxvYFjy9HWocUl2dsiRQkRgdBjZi/oUPQQkAvOGoBSCMWkZMHSUnPzk6wIDAQAB'
}

export async function fuckmain(params: any) {
  if (!mykey) {
    const str = generateUUID()
    const { code } = await Taro.login()
    const encrypt = new JSEncrypt()

    encrypt.setPublicKey(publicKey)

    const strEncrypted = encrypt.encrypt(str)
    const codeEncrypted = encrypt.encrypt(code)

    if (strEncrypted && codeEncrypted) {
      // 调用接口拿到密钥
      // console.log(`发起请求: code=${code}\nstring=${str}`)
      const { data } = await getAuthKey({
        appId: config.miniAppId,
        authcode: codeEncrypted,
        token: strEncrypted,
        pubKeyVer: 'V2'
      })

      // 用str AES 解密 密钥，得到K2
      const d = enc.Base64.parse(data.key)

      const c = lib.CipherParams.create({ ciphertext: d })

      const key = enc.Utf8.parse(str)

      const _K2 = AES.decrypt(c, key, {
        mode: mode.ECB,
        padding: pad.Pkcs7
      })

      // const K2 = enc.Utf8.stringify(_K2)
      mykey = _K2
      keyVer = data.keyVer
    }
  }

  // 获取时间戳T
  const {
    data: { val }
  } = await getTS()
  // 用密钥K2加密时间戳T，
  const r = AES.encrypt(val.toString(), mykey, {
    mode: mode.ECB
  })

  // 请求详情
  return getETicketDetailV6({
    ...params,
    _sec_keyVer: keyVer,
    _sec_token: r.toString()
  }).then(({ data }) => {
    const val = data.val.replace(/\r\n/g, '')
    const encrypted = enc.Base64.parse(data.val)
    const c = lib.CipherParams.create({ ciphertext: encrypted })

    const result = AES.decrypt(c, mykey, {
      mode: mode.ECB,
      padding: pad.Pkcs7
    })

    const r1 = enc.Utf8.stringify(result)

    return {
      data: JSON.parse(r1)
    }
  })
}
