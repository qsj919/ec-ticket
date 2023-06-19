import { lib, AES, mode, pad, enc } from 'crypto-js'
import JSEncrypt from 'jsencrypt'

let publicKey =
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCfRTwMK+8R2UP/gZStvGh3BQN/i3OCjMLnqk3Q/ovZR4YRemrXF594/C6rtmwdWUEZZeqUCng/OWKk/Qv1CsGpTPFxdd1ja3bgSW25JjUmn7i4wv2OB2/pgqzhAdfhg4eQrGtioSqu0+fWC1+OLf2j35tYBTJx95AE9TS6+3eMNwIDAQAB'

if (process.env.PRODUCT_ENVIRONMENT === 'test') {
  publicKey =
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDACm2Xa/QTA/T9Gr0Un3BMT5IKaJ1sOr+Xym5TtYFVn2QNcdiydYXLvwl5zNh8QLVgYf8VqWs1N8RS4gCdW7odMTUWshgLS4w7LHeDIpRvWlMlmm4gnnxvYFjy9HWocUl2dsiRQkRgdBjZi/oUPQQkAvOGoBSCMWkZMHSUnPzk6wIDAQAB'
}

// const pubKeyString = `-----BEGIN PUBLIC KEY-----
// MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDACm2Xa/QTA/T9Gr0Un3BMT5IKaJ1sOr+Xym5TtYFVn2QNcdiydYXLvwl5zNh8QLVgYf8VqWs1N8RS4gCdW7odMTUWshgLS4w7LHeDIpRvWlMlmm4gnnxvYFjy9HWocUl2dsiRQkRgdBjZi/oUPQQkAvOGoBSCMWkZMHSUnPzk6wIDAQAB
// -----END PUBLIC KEY-----`

// const priKeyString = `-----BEGIN PRIVATE KEY-----
// MIICeQIBADANBgkqhkiG9w0BAQEFAASCAmMwggJfAgEAAoGBAMAKbZdr9BMD9P0avRSfcExPkgponWw6v5fKblO1gVWfZA1x2LJ1hcu/CXnM2HxAtWBh/xWpazU3xFLiAJ1buh0xNRayGAtLjDssd4MilG9aUyWabiCefG9gWPL0dahxSXZ2yJFCRGB0GNmL+hQ9BCQC84agFIIxaRkwdJSc/OTrAgMBAAECgYEApI+LD6l7Mlw+sDEce7KQiWPaEj9JPrgs+8aEugib9qIqG3dGKM6aQ1jFpvDJRdgxVJFFA+v0qVrLSfbObglvNh008/kQ6aJp0DNKv1wwKNbgqrl6rbsDAxFIyj8WfiKLouQoUn+BXoZWv8SCIrxWAttkoFnEpzQ5pNBigQ8FnUkCQQDyYPvMy2rUBQ6fJ9SZhiNTbgEM90YSfViyvNHbPSBBJbUsVMcI6iRCiHeQwr/skXzllDdkCEmTiOLiEpE4oHeFAkEAytU/mJJIJ2Rx1ysHURWapspw5JRkSG1bpY5BYdyKbRQbu2ydz735g27i8br5Bhv2k5ABIdmgbE/mP/stJTa9rwJBAIoxTZ+oY1JbR8jqtsaJul55G9Q+sA8etJHEIoqzwU4jp7aM56ZniSD+Gd3JjA/fq6xh42r/ZqPdqi5nk7ELnNkCQQCy8wk0tnpqJrg5OYEvDHxxAtIvGKyRKcpdefA9QrHuInuFFAL3MYhdaQtYcbkaprkY30fgcXyTkrp1YEkoN++JAkEAqO5QPgAjgjZSsDM7qkXlfAMcOge2lpiDORnnCnyWiBzR10S//djimyWmQKK76lP/fW9NuFKXR2R54fd+NjS1iQ==
// -----END PRIVATE KEY-----`

const pubKeyString = `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDACm2Xa/QTA/T9Gr0Un3BMT5IKaJ1sOr+Xym5TtYFVn2QNcdiydYXLvwl5zNh8QLVgYf8VqWs1N8RS4gCdW7odMTUWshgLS4w7LHeDIpRvWlMlmm4gnnxvYFjy9HWocUl2dsiRQkRgdBjZi/oUPQQkAvOGoBSCMWkZMHSUnPzk6wIDAQAB`

const priKeyString = `MIICeQIBADANBgkqhkiG9w0BAQEFAASCAmMwggJfAgEAAoGBAMAKbZdr9BMD9P0avRSfcExPkgponWw6v5fKblO1gVWfZA1x2LJ1hcu/CXnM2HxAtWBh/xWpazU3xFLiAJ1buh0xNRayGAtLjDssd4MilG9aUyWabiCefG9gWPL0dahxSXZ2yJFCRGB0GNmL+hQ9BCQC84agFIIxaRkwdJSc/OTrAgMBAAECgYEApI+LD6l7Mlw+sDEce7KQiWPaEj9JPrgs+8aEugib9qIqG3dGKM6aQ1jFpvDJRdgxVJFFA+v0qVrLSfbObglvNh008/kQ6aJp0DNKv1wwKNbgqrl6rbsDAxFIyj8WfiKLouQoUn+BXoZWv8SCIrxWAttkoFnEpzQ5pNBigQ8FnUkCQQDyYPvMy2rUBQ6fJ9SZhiNTbgEM90YSfViyvNHbPSBBJbUsVMcI6iRCiHeQwr/skXzllDdkCEmTiOLiEpE4oHeFAkEAytU/mJJIJ2Rx1ysHURWapspw5JRkSG1bpY5BYdyKbRQbu2ydz735g27i8br5Bhv2k5ABIdmgbE/mP/stJTa9rwJBAIoxTZ+oY1JbR8jqtsaJul55G9Q+sA8etJHEIoqzwU4jp7aM56ZniSD+Gd3JjA/fq6xh42r/ZqPdqi5nk7ELnNkCQQCy8wk0tnpqJrg5OYEvDHxxAtIvGKyRKcpdefA9QrHuInuFFAL3MYhdaQtYcbkaprkY30fgcXyTkrp1YEkoN++JAkEAqO5QPgAjgjZSsDM7qkXlfAMcOge2lpiDORnnCnyWiBzR10S//djimyWmQKK76lP/fW9NuFKXR2R54fd+NjS1iQ==`

export function decryptDetailAPi(val: string) {
  try {
    val = val.replace(/\r\n/g, '')
    // val = 'cuNMESipRFYexYVfEgBhY8vPe3JOe6l1H/subZbITFGxzSDKa97utIecmBik3aUaFUUn6qW6kSF2jhw/dGy9uQ=='
    const encrypted = enc.Base64.parse(val)
    const key = enc.Utf8.parse('zymfpdi50ex83od7')
    const iv = enc.Utf8.parse('zymfpdi50ex83od7')

    const c = lib.CipherParams.create({ ciphertext: encrypted })

    const result = enc.Utf8.stringify(
      AES.decrypt(c, key, {
        mode: mode.CBC,
        padding: pad.Pkcs7,
        iv: iv
      })
    )
    const data = JSON.parse(result)
    return { data }
  } catch (e) {}
}

export function encryptCode(code: string) {
  const encrypt = new JSEncrypt()

  encrypt.setPublicKey(publicKey)

  const codeEncrypted = encrypt.encrypt(code)

  return codeEncrypted
}

// const publicKey = new keyutil.Key(
//   'pem',
//   'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCqG78mUuokctt1VBPDn1hzIeGBpT7KP6dLW8WcxRIZNcrAG1VHfFpgbC/+OFHn3zPJUFoeeCcL1Xui7wBp4ChbySsEWDjGxWE/HwQcV2E1Vl1iT711D2nrVY8Ih1YS009Lmfx5WtwnwUO4Pc17Hp2MKBmYNcpDSWx0dyaqY+ig1x93Z2ILiFlIwABBJMaZBTjJ8x6vHiyvz5zPQYewqpIOOIqm5+49ybSNMA0A+dJguSekGhB3nDDf2y91PadLcLvIr5o/i35SHoYe8sjuzm2Ru+mDdxx+QlNVJoSkGgZSXgq5R87CqrALJvl9ZVggoT1mjJOoMzcNZn/+KDJFNc5trsgV6cszGSZbBjbVIoP7MYraiP0A7GfssvNFjCmtTWRLMMpl/bggECPyL5CmO75yiRa50mO8R0AkeDrcdPVI0n7NuCWxvpMU4n1evftZXJbQ2tbCNkGZ2JHuRf9vt2Dp1gZxPyAnhK7FxyfJduc0nFdVHD8WcZdc56820a8ZCz5/C++vh0jqOx34GpVgrV6WsrsKWaFzPoKEcu+B/+K23eXgwdgPSGTv2uZxM6JGsEMmUpyMRzB7ZQWC2+NJtOLclWMt35eLhFlKdLPNumS/1+FLhWNbvCUErESORmxXCqmGGEuTTm4ggM5XBoBT2kZgpqhdRvEdymf4tzpMDvOtpQ== ecool@ecooldeMacBook-Pro.local'
// )

export function mainTest() {
  console.log('=====running main')

  // AES.encrypt()

  const o = new JSEncrypt()

  o.setPublicKey(priKeyString)

  o.setPrivateKey(pubKeyString)

  const res = o.encrypt('ha123dsgsha')

  new JSEncrypt()

  console.log(res, 'enres')

  const h = o.decrypt(res)

  console.log(h, 'decrypt')

  const pri = new JSEncrypt()

  pri.setPrivateKey(pubKeyString)

  const result = pri.decrypt(res)

  console.log(result, 'rrrr')

  return

  const res1 = pri.encrypt('hahahaha111')

  console.log(res1, 'res1')

  const o1 = new JSEncrypt()

  o1.setPublicKey(pubKeyString)

  console.log(o1.decrypt(res1), 'res2')

  // console.log(res1, 'jiemi')

  return
  // privateKey.export('jwk', { outputPublic: false }).then(data => {
  //   console.log(data, 'publickkey')

  // })

  // rsa.encrypt(Buffer.from(msg), jwkObj).then(encrypted => {
  //   console.log('encrypted', encrypted)
  // })
}
