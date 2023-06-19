// eslint-disable-next-line
import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Swiper, SwiperItem, Image, Block } from '@tarojs/components'
// import defaultImg from '@/images/default_img.png'
import defaultLogo3 from '@/images/default_shop.png'
import share from '@/images/share.png'
import backArrow from '@/images/back_arrow.png'
import shareGuide from '@/images/share_guide.png'
import classNames from 'classnames'
import navigatorSvc from '@services/navigator'
import trackSvc from '@services/track'
import { modalHelper } from '@utils/helper'
import { getTaroParams } from '@utils/utils'

import { getETicketDetail, getWXConfigParams } from '@api/apiManage'
import events, { eventParams } from '@constants/analyticEvents'

import styles from './ticketShareDetail.module.scss'
import GoodsInfoView from '../../components/GoodsInfoView'
import ImageViewer from '../../components/ImageViewer'
import ShareSetting from '../../components/ShareSetting'
import CustomShare from '../../components/CustomShare'
import { GoodsParmas } from './typeConfig'

type PropsType = {}
type StateType = {
  name: string
  code: string
  color: string
  size: string
  imgUrlBigArr: Array<string>
  showShareModal: boolean
  currentIndex: number
  showBackArrow: string
  source: string
  showBigImg: boolean
  imgOnly: number
  template: number
  isShareSettingVisible: boolean
  goodsParams: GoodsParmas
  isCustomShareVisible: boolean
  displayCode: string
  displayName: string
}

export default class Index extends Component<PropsType, StateType> {
  constructor(props) {
    super(props)
    const params = getTaroParams(Taro.getCurrentInstance?.())
    this.state = {
      name: decodeURIComponent(params.itemName),
      code: decodeURIComponent(params.itemCode),
      color: decodeURIComponent(params.itemColor),
      size: decodeURIComponent(params.itemSize),
      displayCode: params.dCode ? decodeURIComponent(params.dCode) : '',
      displayName: params.dName ? decodeURIComponent(params.dName) : '',
      showBackArrow: params.showBackArrow,
      source: params.source,
      imgUrlBigArr: [],
      showShareModal: false,
      currentIndex: 1,
      showBigImg: false,
      template: Number(params.template) || 0, // 分享模版
      isShareSettingVisible: false,
      isCustomShareVisible: false,
      imgOnly: Number(params.imgOnly) || 0, // 分享图文模式 0 图文, 1只有图片
      goodsParams: {}
    }
  }

  configWXParams() {
    /* eslint-disable */
    getWXConfigParams().then(({ data }) => {
      // @ts-ignore
      wx.config({
        debug: false,
        appId: data.appId, // 必填，公众号的唯一标识
        timestamp: data.timeStamp, // 必填，生成签名的时间戳
        nonceStr: data.nonceStr, // 必填，生成签名的随机串
        signature: data.signature, // 必填，签名
        jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData', 'previewImage'] // 必填，需要使用的JS接口列表
      })
      // @ts-ignore
      wx.ready(function() {
        console.log('-> wx ready!')
      })
      // @ts-ignore
      wx.error(function(res) {
        Taro.showToast({
          title: JSON.stringify(res),
          icon: 'none',
          duration: 2000
        })
      })
    })
  }

  UNSAFE_componentWillMount() {
    this.configWXParams()
  }

  componentDidMount() {
    const params = getTaroParams(Taro.getCurrentInstance?.())
    params.shareType = params.source
    const { code, name } = this.state

    const eventParam = this.state.source === '2' ? eventParams.share : eventParams.normal
    trackSvc.track(events.share, eventParam)

    getETicketDetail(params)
      .then(res => {
        let showBigImg = false
        const dets = res.data.dets || []
        let imgUrlBigArr: any = [defaultLogo3]
        const goodsParams: GoodsParmas = {}
        for (let i = 0; i < dets.length; i++) {
          const element = dets[i]
          if (code === element.code) {
            const { className, fabricName, seasonName, themeName } = element
            if (className) {
              goodsParams.className = className
            }
            if (fabricName) {
              goodsParams.fabricName = fabricName
            }
            if (seasonName) {
              goodsParams.seasonName = seasonName
            }
            if (themeName) {
              goodsParams.themeName = themeName
            }
            if (element.allImgUrlBig) {
              imgUrlBigArr = element.allImgUrlBig.split(',')
              showBigImg = true
            }
            break
          }
        }
        this.setState({ imgUrlBigArr, showBigImg, goodsParams }, this.updateShareLink)
      })
      .catch(err => {
        console.log(err)
        this.setState({ imgUrlBigArr: [defaultLogo3] })
      })
  }

  updateShareLink = () => {
    const { code, displayCode, name, imgUrlBigArr, template, imgOnly, displayName } = this.state
    let url = document.URL
    url += `&dCode=${displayCode}&dName=${displayName}`
    const trueCode = displayCode || code
    const trueName = displayName || name
    // @ts-ignore
    wx.ready(function() {
      url = url
        .replace(/subscribe=\d/g, '')
        .replace(/sessionId=\w+/, '')
        .replace(/mpUserId=\d/g, '')
      //需在用户可能点击分享按钮前就先调用
      // @ts-ignore
      wx.updateAppMessageShareData({
        title: trueCode, // 分享标题
        desc: trueName, // 分享描述
        link: `${url}&showBackArrow=false&source=2&template=${template}&imgOnly=${imgOnly}`, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: imgUrlBigArr[0], // 分享图标
        success: function() {
          // 设置成功
        }
      })

      // @ts-ignore
      wx.updateTimelineShareData({
        title: `${trueCode}_${trueName}`, // 分享标题
        link: `${url}&showBackArrow=false&source=2&template=${template}&imgOnly=${imgOnly}`, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: imgUrlBigArr[0], // 分享图标
        success: function() {
          // 设置成功
        }
      })
    })
  }

  onSwiperChange = value => {
    this.setState({ currentIndex: value.detail.current + 1 })
  }

  onBackClick = () => {
    const params = getTaroParams(Taro.getCurrentInstance?.())
    const query = `pk=${params.pk}&sn=${params.sn}&epid=${params.epid}&sessionId=${params.sessionId}&shopId=${params.shopId}&shopName=${params.shopName}&type=${params.type}`
    navigatorSvc.navigateTo({ url: `/pages/eTicketDetail/landscapeModel?${query}` })
  }

  onShareClick = () => {
    this.setState({ showShareModal: true })
  }

  closeModal = () => {
    this.setState({ showShareModal: false })
  }

  onImgClick = index => {
    const { imgUrlBigArr, showBigImg } = this.state
    if (showBigImg) {
      // @ts-ignore
      wx.ready(function() {
        // @ts-ignore
        wx.previewImage({
          current: imgUrlBigArr[index],
          urls: imgUrlBigArr // 需要预览的图片http链接列表
        })
      })
    }
  }

  onShareSettingClick = () => {
    modalHelper.open()
    this.setState({ isShareSettingVisible: true })
  }

  onCustomShareClick = () => {
    modalHelper.open()
    this.setState({ isCustomShareVisible: true })
  }

  onApply = (mode: number[]) => {
    this.setState(
      {
        imgOnly: mode[0],
        template: mode[1],
        isShareSettingVisible: false
      },
      () => {
        this.updateShareLink()
      }
    )
  }

  onCustomShareSave = (name: string, code: string) => {
    modalHelper.close()
    this.setState(
      { displayCode: code, displayName: name, isCustomShareVisible: false },
      this.updateShareLink
    )
  }

  closeShareSetting = () => {
    this.setState({ isShareSettingVisible: false })
    modalHelper.close()
  }

  closeCustomShare = () => {
    this.setState({ isCustomShareVisible: false })
    modalHelper.close()
  }

  renderShareIcon = () => {
    return (
      <View className={styles.share} onClick={this.onShareClick}>
        <Image src={share} className={styles.shareImg} />
      </View>
    )
  }

  renderBackIcon = () => {
    const { showBackArrow } = this.state
    return (
      showBackArrow !== 'false' && (
        <View className={styles.backArrow} onClick={this.onBackClick}>
          <Image src={backArrow} className={styles.backArrowImg} />
        </View>
      )
    )
  }

  renderDefaultView = () => {
    const {
      name,
      displayName,
      code,
      displayCode,
      color,
      size,
      imgUrlBigArr,
      currentIndex,
      imgOnly
    } = this.state
    const trueCode = displayCode || code
    const tureName = displayName || name
    return (
      <Block>
        <View className={styles.topImg}>
          <Swiper className={styles.swiper} onChange={this.onSwiperChange}>
            {imgUrlBigArr.map((imgUrl, index) => (
              <SwiperItem key={index} className={styles.swiperItem}>
                <View className={styles.imgBigCover} onClick={this.onImgClick.bind(this, index)}>
                  <Image className={styles.imgBig} src={imgUrl} mode='aspectFill' />
                </View>
              </SwiperItem>
            ))}
          </Swiper>
          {this.renderBackIcon()}
          {this.renderShareIcon()}
          <View className={styles.indicator}>
            {currentIndex}/{imgUrlBigArr.length}
          </View>
        </View>
        {imgOnly === 0 && (
          <View className={styles.detailInfo}>
            <View className={styles.code}>{trueCode}</View>
            <View className={styles.name}>{tureName}</View>
            <View className={styles.colorCover}>
              <View className={styles.colorWord}>颜色</View>
              <View className={styles.color}>{color}</View>
            </View>
            <View className={styles.sizeCover}>
              <View className={styles.sizeWord}>尺码</View>
              <View className={styles.size}>{size}</View>
            </View>
          </View>
        )}
      </Block>
    )
  }

  render() {
    const {
      name,
      displayName,
      displayCode,
      code,
      color,
      size,
      imgUrlBigArr,
      showShareModal,
      showBackArrow,
      template,
      isShareSettingVisible,
      imgOnly,
      goodsParams,
      isCustomShareVisible
    } = this.state
    const tureName = displayName || name
    const trueCode = displayCode || code
    return (
      <View className={styles.itemShareWrapper}>
        <View>
          {template === 0 ? (
            this.renderDefaultView()
          ) : (
            <Block>
              {template !== 0 && this.renderBackIcon()}
              {template === 2 && this.renderShareIcon()}
              <View
                className={classNames({
                  [styles.image_wrapper]: template === 1
                })}
              >
                <ImageViewer source={imgUrlBigArr} type={template} />
              </View>
              {imgOnly === 0 && (
                <View
                  className={classNames({
                    [styles.goods_info_wrapper]: template === 2
                  })}
                >
                  <GoodsInfoView
                    shareBtn={template === 1 || template === 3}
                    onShareClick={this.onShareClick}
                    code={trueCode}
                    name={tureName}
                    colors={color}
                    sizes={size}
                    goodsParams={goodsParams}
                  />
                </View>
              )}
            </Block>
          )}
        </View>
        {showBackArrow !== 'false' && (
          <View className={styles.bottom_btns}>
            <View
              className={classNames(
                styles.share_setting_button,
                styles['share_setting_button--orange']
              )}
              onClick={this.onCustomShareClick}
            >
              分享自定义
            </View>
            <View className={styles.share_setting_button} onClick={this.onShareSettingClick}>
              分享设置
            </View>
          </View>
        )}

        {showShareModal && (
          <View className={styles.modal} onClick={this.closeModal}>
            <View className={styles.shareGuideCover}>
              <Image src={shareGuide} className={styles.img} />
            </View>
            <View className={styles.guideTip}>
              <View>1. 点击右上角</View>
              <View>2. 点击发送给朋友或分享到朋友圈</View>
            </View>
          </View>
        )}
        <ShareSetting
          onApply={this.onApply}
          visible={isShareSettingVisible}
          onDismiss={this.closeShareSetting}
        />
        <CustomShare
          title={tureName}
          code={trueCode}
          onApply={this.onCustomShareSave}
          visible={isCustomShareVisible}
          onDismiss={this.closeCustomShare}
        />
      </View>
    )
  }
}
