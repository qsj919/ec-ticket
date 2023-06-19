import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Image, Block, Text, Button } from '@tarojs/components'
import dva from '@utils/dva'
import { connect } from 'react-redux'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { CloudSource, CloudVideoSource, CLOUD_BILL_FLAG, ScanError } from '@@types/base'
import PhoneGetter from '@components/PhoneGetter'
import myLog from '@utils/myLog'
import clarkGif from '@/images/clark.gif'
import textImg from '@/images/waiting_text.png'
import errorImg from '@/images/error.png'
import LoginBg from '@/images/login_bg.png'
import WechatLogo from '@/images/share_weChat.png'
import { urlQueryParse, getTaroParams } from '@utils/utils'

import LoginView from '@components/LoginView/LoginView'

const mapStateToProps = ({ cloudBill, user }: GlobalState) => ({
  data: cloudBill.videoPageData,
  sessionId: user.sessionId,
  mpUserId: user.mpUserId,
  nickName: user.nickName
})

type StateProps = ReturnType<typeof mapStateToProps>

type State = {}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class CloudBillLandPage extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationBarTitleText: '电子小票'
  // }

  componentDidMount() {
    myLog.log(`didmount，params:${JSON.stringify(getTaroParams(Taro.getCurrentInstance?.()))}`)
    if (this.props.sessionId) {
      this.init()
    }

    myLog.log(`didmount，data:${JSON.stringify(this.props.data)}`)
  }

  componentDidUpdate(prevProps: Readonly<StateProps>) {
    myLog.log(`cloud_bill_landpage__didupdate，data:${JSON.stringify(this.props.data)}`)

    if (this.props.sessionId && !prevProps.sessionId) {
      this.init()
    }

    if (this.props.data.cloudBillFlag !== CLOUD_BILL_FLAG.open && this.props.data.pageType !== 1) {
      return
    }

    const { source, mpErpId, fromScreen, mpErpIds } = this.processParams()

    if (this.props.data.pageType === 2) {
      // 请求商品并跳转视频页
      let _mpErpId = this.props.data.mpErpId
      if (typeof mpErpId === 'number') {
        _mpErpId = mpErpId
      }
      myLog.log(`mpErpId: ${mpErpId}}, type:${typeof mpErpId},_mpErpId:${_mpErpId}`)

      Taro.redirectTo({
        url: `/subpackages/cloud_bill/pages/shop_video/index?mpErpId=${_mpErpId}&source=${source}`
      })
    } else if (this.props.data.pageType === 1) {
      // 小票
      const { sn, epid, billid, type } = this.props.data
      Taro.redirectTo({
        url: `/pages/eTicketDetail/landscapeModel?sn=${sn}&epid=${epid}&billid=${billid}&type=${type}&fromQR=${source}`
      })
    } else {
      /**
       * scanError
       * 2=没用户（没登录）
       * 4=没昵称
       * 5=没手机号
       * 6=没昵称没手机号
       */
      switch (this.props.data.scanError) {
        case ScanError.SUCCESS:
          Taro.redirectTo({
            url: `/subpackages/cloud_bill/pages/shop_video/index?mpErpId=${mpErpId}&source=${source}&fromScreen=${fromScreen}&mpErpIds=${mpErpIds.join(
              ','
            )}`
          })
          break
        case 1:
          this.init()
          break
        // case 2:
        //   // 需要昵称/头像
        //   this.setState({ isPhoneGetterVisible: true })
        //   break
        case ScanError.NONE_VIDEO:
          Taro.redirectTo({
            url: `/subpackages/cloud_bill/pages/all_goods/index?mpErpId=${mpErpId}&source=${source}`
          })
          break
        // 店铺无视频
        default:
      }
    }
  }

  /** 几种情况
   *  1. 小票二维码 sn
   *  2. 小程序菊花码（门店码）mperpid
   *  3. 公众号推送（开通） mperpid
   *  4. 公众号推送（小票） sn
   *
   *  1、2有可能是没关联的，3、4一定是关联过的
   *
   */
  processParams = () => {
    let source = CloudVideoSource.UNKNOWN
    let _mpErpId
    const {
      q,
      mpErpId,
      sn,
      epid,
      billid,
      scene,
      fromScreen,
      pk,
      type = '1',
      mpErpIds
    } = getTaroParams(Taro.getCurrentInstance?.())

    let _params = { sn, epid, billid: billid || pk, type }
    let mpErpIdsArray: string[] = []
    const options = Taro.getLaunchOptionsSync()
    // 小票二维码
    if (q) {
      source = CloudVideoSource.TICKET_QR
      const url = decodeURIComponent(q)
      const params = urlQueryParse(url)
      if (params.sn) {
        _params = {
          sn: params.sn,
          epid: params.epid,
          billid: params.billid || params.pk,
          type: params.type
        }
      }
      if (params.mpErpId) {
        _mpErpId = params.mpErpId
      }
    }
    // 公众号通知 or 菊花码1
    if (mpErpId) {
      _mpErpId = mpErpId
      if ([1047, 1048, 1049].includes(options.scene)) {
        source = CloudVideoSource.MINI_QR
      } else {
        source = CloudVideoSource.PUBLIC_NOTI
      }
    }

    // 小票推送
    if (sn && options.scene === 1043) {
      source = CloudVideoSource.PUBLIC_TICKET
    }

    // 菊花码2
    if (scene) {
      _mpErpId = scene
      source = CloudVideoSource.MINI_QR
    }

    if (mpErpIds) {
      mpErpIdsArray = mpErpIds.split(',')
      if (!_mpErpId) {
        _mpErpId = mpErpIdsArray[0]
      }
    }

    return {
      ..._params,
      mpErpId: _mpErpId ? Number(_mpErpId) : undefined,
      source,
      fromScreen,
      mpErpIds: mpErpIdsArray.slice(1)
    }
  }

  init = () => {
    this.props.dispatch({ type: 'cloudBill/resetCloud' })
    const { source, ...p } = this.processParams()
    if (p.mpErpId) {
      dva.getDispatch()({
        type: 'cloudBill/fetchVideoPageDataByMpErpId',
        payload: { ...p }
      })
    } else {
      dva.getDispatch()({ type: 'cloudBill/fetchVideoPageData', payload: { ...p } })
    }
  }

  getErrorText = () => {
    switch (this.props.data.cloudBillFlag) {
      case CLOUD_BILL_FLAG.never:
        return '该店铺未开通云单'
      case CLOUD_BILL_FLAG.close:
        return '该店铺云单已关闭'
      case CLOUD_BILL_FLAG.expire:
        return '该店铺云单已过期'
      default:
        return '该店铺未开通云单'
    }
  }

  render() {
    const { data } = this.props
    const { mpErpId } = this.processParams()
    return (
      <View
        style={{
          height: '100%',
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '18px',
          background: '#fff',
          color: '#666',
          flexDirection: 'column'
        }}
      >
        {/* 数据加载中,请稍等... */}
        {data.cloudBillFlag === CLOUD_BILL_FLAG.open ? (
          <Block>
            <Block>
              <Image src={clarkGif} style={{ width: '250px', height: '250px' }} />
              <Image src={textImg} style={{ width: '111px', height: '16px' }} />
            </Block>

            <LoginView scanError={data.scanError} mpErpId={mpErpId} />
          </Block>
        ) : (
          <View>
            <Image src={errorImg} style={{ width: '160px', height: '160px' }} />
            <View style={{ fontSize: '14px', textAlign: 'center' }}>{this.getErrorText()}</View>
          </View>
        )}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(CloudBillLandPage)