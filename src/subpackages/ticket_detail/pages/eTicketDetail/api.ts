import request from '@utils/request'

let url = '/slb/api.do'

export function getETicketDetailV6(params: { pk: string; sn: string; epid: string }) {
  return request({
    url,
    data: {
      apiKey: 'ec-shareMpSaleBillTicketV6',
      ...params
    }
  })
}

export function getAuthKey(params: {
  appId: string
  pubKeyVer: string
  authcode: string
  token: string
}) {
  return request({
    url,
    data: {
      apiKey: 'ec-gateway-security-getAuthKey',
      pubKeyType: 'ticketAuth',
      ...params
    }
  })
}

export function getTS() {
  return request({
    url,
    data: {
      apiKey: 'ec-gateway-getTimeStamp'
    }
  })
}
