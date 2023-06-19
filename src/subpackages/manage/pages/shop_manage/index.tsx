import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text, Block } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import { isWeb, isWeapp, setNavigationBarTitle } from '@utils/cross_platform_api'
import messageFeedback from '@services/interactive'
import DefaultShopLogo from '@/images/ticket_default_shop.png'
import angleRight from '@/images/angle_right_gray_40.png'
import { safePostMeaasge } from '@utils/postMessage'
import config from '@config/config'
import { uploadImage } from '@utils/download'
import { getTaroParams } from '@utils/utils'
import myLog from '@utils/myLog'
import { getShopManageData } from '@api/goods_api_manager'
import { getRegisterMerchantParam } from '@api/apiManage'
import DefaultHeaderImg from '../../images/default_header_img.png'
import NewIcon from '../../images/shop_manage_new_icon.png'
import RightIcon from '../../images/shop_manage_right_icon.png'

import './index.scss'

interface MerchantParam {
  appId: string
  bizLine: string
  bizSn: string
  callbackUrl: string
  merchantList: Array<any>
  storeId: string
  token: string
}

const mapStateToProps = ({ goodsManage, shop, user }: GlobalState) => {
  const _shop = shop.list.find(s => s.id === goodsManage.mpErpId)
  const bizShop = goodsManage.bizShops.find(s => s.bizShopId == goodsManage.shopId)
  const bizStatus = bizShop && bizShop.bizStatus ? bizShop.bizStatus : 1
  return {
    expiredDate: bizShop && bizShop.subscribe.expiredDate,
    bizStatus,
    shopId: goodsManage.shopId,
    mpErpId: goodsManage.mpErpId,
    shopLogo: goodsManage.shopLogoUrl,
    shopName: goodsManage.shopName,
    appName: goodsManage.appName,
    merchantParams: goodsManage.merchantParams,
    independentType: goodsManage.independentType,
    shop: _shop,
    saasProductType: goodsManage.saasProductType,
    shopInfo: goodsManage.shopInfo,
    phone: user.phone
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  headerImage: string
  bannerLabel: string
  hotText: string
  specialText: string
}

export enum DescText {
  hot = '爆款',
  special = '特价'
}

export enum FoodDescText {
  hot = '店长推荐',
  special = '福利'
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class ShopManage extends React.Component<StateProps & DefaultDispatchProps, State> {
  // config: Config = {
  //   navigationBarTitleText: '店铺管理'
  // }

  state = {
    headerImage: '',
    bannerLabel: '选择图片',
    hotText: DescText.hot,
    specialText: DescText.special
  }

  componentDidShow() {
    setNavigationBarTitle('店铺管理')
  }

  UNSAFE_componentWillMount(): void {
    const { independentType, saasProductType } = this.props
    if (independentType !== 0 && saasProductType === 40) {
      this.setState({
        hotText: FoodDescText.hot,
        specialText: FoodDescText.special
      })
    }
  }

  componentDidMount() {
    Taro.showLoading({ title: '请稍等...' })
    if (this.props.independentType !== 0) {
      this.initMerchantParams()
    }
    this.props
      .dispatch({
        type: 'goodsManage/selelctShopProfileInformation',
        payload: {
          mpErpId: this.props.mpErpId
        }
      })
      .then(shopInfo => {
        let headerImage = ''
        if (shopInfo && shopInfo.coverUrls) {
          headerImage = shopInfo.coverUrls.includes(',')
            ? shopInfo.coverUrls.split(',')[0]
            : shopInfo.coverUrls
        } else {
          headerImage = DefaultHeaderImg
        }
        console.log(shopInfo)
        this.setState({
          headerImage,
          bannerLabel: shopInfo.bannerUrls
            ? shopInfo.bannerUrls.includes(',')
              ? `已设置${shopInfo.bannerUrls.split(',').length}张`
              : '已设置1张'
            : '选择图片'
        })
        Taro.hideLoading()
      })
      .catch(e => {
        Taro.hideLoading()
      })
  }

  onSetHeaderImg = () => {
    Taro.chooseImage({
      count: 1,
      success: res => {
        Taro.showLoading({ title: '上传中...' })
        uploadImage(res.tempFilePaths[0])
          .then(({ data }) => {
            Taro.hideLoading()
            const _data = JSON.parse(data)
            this.setState({
              headerImage: _data.data.org[0]
            })
            this.props.dispatch({
              type: 'goodsManage/updataShopProfileInformation',
              payload: {
                mpErpId: this.props.mpErpId,
                coverType: 1,
                coverUrls: _data.data.org[0]
              }
            })
          })
          .catch(e => {
            Taro.hideLoading()
            myLog.log(`上传图片失败${e}`)
          })
      },
      fail: () => {
        Taro.hideLoading()
      }
    })
  }

  initMerchantParams = () => {
    Taro.showLoading({ title: '请稍等...' })
    getRegisterMerchantParam({
      mpErpId: this.props.mpErpId
    })
      .then(res => {
        Taro.hideLoading()
        this.props.dispatch({
          type: 'goodsManage/save',
          payload: {
            merchantParams: res.data
          }
        })
      })
      .catch(e => {
        Taro.hideLoading()
        messageFeedback.showToast(e.errorMsg)
      })
  }

  onAuditClick = () => {
    Taro.navigateTo({
      url: '/subpackages/manage/pages/merchant_params/index'
    })
  }

  onWalletClick = () => {
    Taro.navigateTo({
      url: '/subpackages/manage/pages/merchant_wallet/index'
    })
  }

  goCloudBillAmktH5 = () => {
    if (isWeapp()) {
      messageFeedback.showAlert('请前往商陆花线上接单或应用市场内续费', '', '好的')
    } else {
      let { mktToken } = getTaroParams(Taro.getCurrentInstance?.())
      Taro.navigateTo({
        url:
          '/subpackages/cloud_bill/pages/cloud_bill_amkt_h5/index?mktToken=' +
          mktToken +
          '&shopId=' +
          this.props.shopId
      })
    }
  }

  goHotManage = async () => {
    Taro.showLoading({ title: '请稍等...' })
    await this.props.dispatch({
      type: 'goodsManage/fetchManageHotGoods',
      payload: {
        pageSize: 300
      }
    })
    Taro.hideLoading()
    Taro.navigateTo({
      url: '/subpackages/manage/pages/shop_hot_goods/index?type=hot'
    })
  }
  goShopBanner = () => {
    Taro.navigateTo({
      url: '/subpackages/manage/pages/shop_home_banner/index?type=hot'
    })
  }

  goSpecialManage = async () => {
    Taro.showLoading({ title: '请稍等...' })
    await this.props.dispatch({
      type: 'goodsManage/fetchManageSpecialGoods'
    })
    Taro.hideLoading()
    Taro.navigateTo({
      url: '/subpackages/manage/pages/shop_hot_goods/index?type=special'
    })
  }

  goShopInfo = () => {
    const { mktToken } = getTaroParams(Taro.getCurrentInstance?.())
    Taro.navigateTo({
      url: `/subpackages/manage/pages/store_profile/index?mktToken=${mktToken}`
    })
  }

  onShopViewerClick = () => {
    const { appName } = this.props
    if (this.props.mpErpId) {
      if (isWeapp()) {
        Taro.navigateTo({
          url: '/pages/cloud_bill_landpage/index?fromScreen=manage&mpErpId=' + this.props.mpErpId
        })
      } else {
        safePostMeaasge(
          JSON.stringify({
            eventType: appName === 'slh' ? 'openWxMiniProgram' : 'launchMini',
            data: {
              path:
                'pages/cloud_bill_landpage/index?fromScreen=manage&mpErpId=' + this.props.mpErpId,
              [appName === 'slh' ? 'miniprogramType' : 'miniProgramType']:
                process.env.PRODUCT_ENVIRONMENT === 'product' ? 0 : 2,
              userName: config.appUserName
            }
          })
        )
      }
    }
  }

  onApplyMiniAppClick = async () => {
    const res = await getShopManageData({ mpErpId: this.props.mpErpId })
    if (res.data.enableApplyIndependent === false) {
      Taro.navigateTo({ url: '/subpackages/apply_miniapp/pages/independent_abs/index' })
    } else {
      Taro.navigateTo({
        url: `/subpackages/apply_miniapp/pages/index/index?bizId=${this.props.mpErpId}&proType=cloudBill`
      })
    }
  }

  render() {
    const {
      bizStatus,
      expiredDate,
      shopName,
      shopLogo,
      merchantParams,
      saasProductType,
      phone,
      shopInfo
    } = this.props
    // const userPhone = getTaroParams(Taro.getCurrentInstance?.()).mobile || phone
    const rolename = getTaroParams(Taro.getCurrentInstance?.()).rolename // h5传参数，临时用于钱包权限判断
    const { headerImage, bannerLabel, hotText, specialText } = this.state
    return (
      <View className='shop_manage col aic'>
        {isWeb() && bizStatus === 1 && (
          <View className='shop_manage__timeLimit aic jcsb'>
            <View>云单有效期至 {expiredDate && expiredDate.split(' ')[0]}</View>
            <View
              className='shop_manage__timeLimit___renewal aic jcc'
              onClick={this.goCloudBillAmktH5}
            >
              续费
            </View>
          </View>
        )}
        <View className='shop_manage__shopInfo'>
          <Image mode='aspectFill' src={headerImage} className='shop_manage__shopInfo__bg' />

          <View className='setting_action' onClick={this.onSetHeaderImg}>
            设置门头照
          </View>

          <View className='shop_manage__shopInfo__view aic jcsb'>
            <Image
              src={shopLogo || DefaultShopLogo}
              className='shop_manage__shopInfo__view__headImage'
            />
            <View className='shop_manage__shopInfo__view__shopName'>{shopName}</View>
            <View
              className='shop_manage__shopInfo__view__shopSetting aic jcc'
              onClick={this.goShopInfo}
            >
              基础设置
            </View>
          </View>
        </View>
        {this.props.independentType !== 0 && (
          <View
            className='shop_manage__hotModel special audit_view  aic jcsb'
            onClick={this.onAuditClick}
          >
            <Text>支付认证</Text>
            <View className='shop_manage__hotModel__action aic jcc'>
              <Text
                style={{
                  color: merchantParams.bindFlag === 1 ? '#28B275' : '#E62E4D'
                }}
              >
                {merchantParams.bindFlag === 0 ? '未认证' : ''}
                {merchantParams.bindFlag === 10 ? '认证中' : ''}
                {merchantParams.bindFlag === 1 ? '已认证' : ''}
              </Text>
              <Image className='right_icon' src={RightIcon} />
            </View>
          </View>
        )}

        {merchantParams.bindFlag === 1 &&
          this.props.independentType !== 0 &&
          isWeb() &&
          (rolename === '总经理' || rolename === '總經理') && (
            <View
              className='shop_manage__hotModel special audit_view aic jcsb'
              onClick={this.onWalletClick}
            >
              <Text>钱包</Text>
              <View className='shop_manage__hotModel__action aic jcc'>
                <Image className='right_icon' src={RightIcon} />
              </View>
            </View>
          )}

        <View
          className='shop_manage__hotModel round_corner audit_view  aic jcsb'
          onClick={this.onApplyMiniAppClick}
        >
          <Text>独立部署</Text>
          <Image className='right_icon' src={RightIcon} />
        </View>
        <Block>
          <View className='shop_manage__label'>活动模块</View>
          <View className='shop_manage__hotModel border_line aic jcsb'>
            <Text>{shopInfo.activityNames[2] || hotText}</Text>
            <View className='shop_manage__hotModel__action aic jcc' onClick={this.goHotManage}>
              +推荐{shopInfo.activityNames[2] || hotText}
              <Image className='right_icon' src={RightIcon} />
            </View>
          </View>
          <View className='shop_manage__hotModel special  aic jcsb' onClick={this.goSpecialManage}>
            <Text>{shopInfo.activityNames[10] || specialText}</Text>
            <View className='shop_manage__hotModel__action aic jcc'>
              +添加{shopInfo.activityNames[10] || specialText}
              <Image className='right_icon' src={RightIcon} />
            </View>
            {/* <Image src={NewIcon} className='new_icon' /> */}
          </View>
        </Block>

        {saasProductType === 40 && (
          <Block>
            <View className='shop_manage__label'>店铺装饰模块</View>
            <View className='shop_manage__hotModel special  aic jcsb' onClick={this.goShopBanner}>
              <Text>首页banner</Text>
              <View className='shop_manage__hotModel__action aic jcc'>
                {bannerLabel}
                <Image className='right_icon' src={RightIcon} />
              </View>
            </View>
          </Block>
        )}

        {/* <View className='shop_manage__bottom jcsb'>
          <View className='shop_manage__bottom__actionLeft aic jcc'>预览店铺</View>
          <View className='shop_manage__bottom__actionRight aic jcc'>分享云单</View>
        </View> */}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(ShopManage)