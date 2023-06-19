import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import React from 'react'
import CustomNavigation from '@components/CustomNavigation'
import Taro from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import { getTaroParams } from '@utils/utils'
import { checkPhoneNumberWithBoss, checkBossPublicAuth } from '@api/apiManage'
import bgIcon from '@/images/daily_report/bg.png'
import analyzeIcon from './img/analyze.png'
import bigBillRemindIcon from './img/big_bill_remind.png'
import dailyReportIcon from './img/daily_report.png'
import otherIcon from './img/other.png'
import './index.scss'

const mapStateToProps = ({ user }: GlobalState) => {
  return {
    sessionKey: user.sessionKey,
    wxOpenId: user.wxOpenId
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface PageState {
  needMask: boolean
  authentication: boolean
  bossPhone: string
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class BossAuthentication extends React.Component<
  StateProps & DefaultDispatchProps,
  PageState
> {
  // config = {
  //   navigationStyle: 'custom'
  // }

  constructor(props) {
    super(props)
    this.state = {
      needMask: false,
      authentication: false,
      bossPhone: ''
    }
  }

  componentDidMount() {
    this.checkUserAuth()
  }

  checkUserAuth() {
    const params = {
      mpOpenId: getTaroParams(Taro.getCurrentInstance?.()).mpOpenId
    }
    checkBossPublicAuth(params).then(({ data }) => {
      if (data && `${data.val}` === '1') {
        this.setState({ authentication: true })
      }
    })
  }

  getPhoneNumber(e) {
    if (e.detail.errMsg.includes('ok')) {
      const { sessionKey } = this.props
      const params  = getTaroParams(Taro.getCurrentInstance?.())
      const { encryptedData, iv } = e.detail
      const _params = {
        sessionKey,
        mpOpenId: params.mpOpenId,
        ivData: iv,
        encrypData: encryptedData
      }
      checkPhoneNumberWithBoss(_params)
        .then(res => {
          if (res && res.data) {
            const { val } = res.data
            if (`${val}` === '1') {
              Taro.showToast({ title: '认证成功', icon: 'none', duration: 1200 })
              this.setState({ authentication: true })
            } else {
              this.setState({ needMask: true, bossPhone: `${val}` })
            }
          }
        })
        .catch(() => {
          this.setState({ needMask: true })
        })
    }
  }

  transferPhoneNumber() {
    const { bossPhone } = this.state
    let reg = /^(\d{3})\d{4}(\d{4})$/
    return bossPhone.replace(reg, '$1****$2')
  }

  render() {
    const { needMask, bossPhone, authentication } = this.state
    const params  = getTaroParams(Taro.getCurrentInstance?.())
    const { needGoBack = '0' } = params
    console.log(typeof needGoBack)

    const infoArray = [
      { name: '报单提醒', source: bigBillRemindIcon },
      { name: '日营业报表推送', source: dailyReportIcon },
      { name: '店铺经营情况分析', source: analyzeIcon },
      { name: '其他功能', source: otherIcon }
    ]
    return (
      <CustomNavigation
        navigationClass='navigation_class'
        enableBack={needGoBack === '1'}
        stickyTop={false}
        disableIphoneXPaddingBottom
        title='身份认证'
      >
        {needMask && <View className='mask'></View>}
        {needMask && (
          <View className='failRemindContanier'>
            <View className='failRemindPopup'>
              <View className='failRemindPopup_info'>
                <View className='failRemindPopup_info_l1'>认证失败</View>
                <View className='failRemindPopup_info_l2'>检测老板端手机号和认证手机号不匹配</View>
                {bossPhone !== '' && (
                  <View className='failRemindPopup_info_l2'>
                    请使用手机号
                    <View className='failRemindPopup_info_l2_phone'>
                      {this.transferPhoneNumber()}
                    </View>
                    进行认证
                  </View>
                )}
              </View>
              <View className='failRemindPopup_button'>
                <View
                  onClick={() => {
                    this.setState({ needMask: false })
                  }}
                  style={{ backgroundColor: '#6E7C93' }}
                  className='failRemindPopup_button_item'
                >
                  取消
                </View>
                <Button
                  onClick={() => {
                    this.setState({ needMask: false })
                  }}
                  openType='getPhoneNumber'
                  onGetPhoneNumber={this.getPhoneNumber}
                  style={{ backgroundColor: '#A2AAB8' }}
                  className='failRemindPopup_button_item'
                >
                  重新获取
                </Button>
              </View>
            </View>
          </View>
        )}
        <View className='contanier'>
          <Image src={bgIcon} className='bg_img'></Image>
          <View className='header_info'>
            <View className='header_info_title'>商户身份认证</View>
            <View className='header_info_subtitle'>为了保障您的数据安全,需要进行商户身份认证</View>
          </View>
          <View className='body'>
            <View className='body_contanier'>
              <View className='body_contanier_title'>完成认证后可开启以下功能</View>
              <View>
                {infoArray.map((info, index) => {
                  const { name, source } = info
                  return (
                    <View className='body_contanier_item' key={index}>
                      <Image className='body_contanier_item_img' src={source}></Image>
                      <View className='body_contanier_item_text'>{name}</View>
                    </View>
                  )
                })}
              </View>
              <Button
                disabled={authentication}
                openType='getPhoneNumber'
                onGetPhoneNumber={this.getPhoneNumber}
                className='body_contanier_button'
                style={{ backgroundColor: authentication ? '#D1D1D1' : '#3764FF' }}
              >
                {authentication ? '已完成认证' : '立即认证'}
              </Button>
            </View>
          </View>
        </View>
      </CustomNavigation>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(BossAuthentication)