import Taro, { Config, VideoContext } from '@tarojs/taro'
import React from 'react'
import { Image, Video, View, Text, Swiper, SwiperItem, Block } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import images from '@config/images'
import { ISpu } from '@@types/GoodsType'
import CustomNavigation from '@components/CustomNavigation'
import { CloudEventPage, CloudSource } from '@@types/base'
import trackSvc from '@services/track'
import { recordVideoPlay } from '@api/apiManage'
import { storage } from '@constants/index'
import { getTaroParams } from '@utils/utils'
import backCircle from '@/images/icon/angle_left_circle_64.png'
import myLog from '@utils/myLog'
import favorGuideImg from '../../images/favor_guide.png'
import favorGuideImg2 from '../../images/favor_guide2.png'
// import gestureGuideImg from '../../images/flip_guide.png'
import styles from './index.module.scss'
import VideoSwiper from '../../components/VideoSwiper'
import NavigationToMini from '../../components/NavigationToMini'

const mapStateToProps = ({ systemInfo, cloudBill, shop }: GlobalState) => {
  const goodsList = cloudBill.goodsListPreview || []
  return {
    top: systemInfo.gap + systemInfo.navigationHeight,
    data: cloudBill.videoPageData,
    goodsList: goodsList.filter(good => good.imgUrl).slice(0, 3),
    mpErpId: cloudBill.mpErpId,
    shop: shop.list.find(s => s.id === cloudBill.mpErpId),
    menuRect: systemInfo.menuRect,
    // navigationWidth: systemInfo.navigationWidth - systemInfo.navigationPadding,
    navigationRight: systemInfo.navigationPadding,
    videoList: [{ ...cloudBill.videoPageData }, ...cloudBill.videoList],
    noMoreVideos: cloudBill.noMoreVideos
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

type State = {
  videoPaused: boolean
  currentVideoIndex: number
  favorGuide: number // 0 不显示 1 显示step1 2显示step2
  gestureGuide: boolean
  showVideoCover: boolean
  fromScreen: string
  showAllShop: boolean
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class ShopVideo extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config: Config = {
  //   navigationStyle: 'custom'
  // }

  state = {
    videoPaused: false,
    currentVideoIndex: 0,
    favorGuide: 0,
    gestureGuide: false,
    showVideoCover: true,
    fromScreen: getTaroParams(Taro.getCurrentInstance?.()).fromScreen,
    showAllShop: !getTaroParams(Taro.getCurrentInstance?.()).mpErpIds
  }
  videoIns: (VideoContext | null)[]

  // onShareAppMessage() {
  //   const currentShop = this.props.videoList[this.state.currentVideoIndex]
  //   return {
  //     title: `${currentShop.shopName}的视频号`,
  //     path: `pages/cloud_bill_landpage/index?mpErpId=${currentShop.mpErpId}`
  //   }
  // }

  componentDidMount() {
    this.videoIns = [Taro.createVideoContext('video_0')]
    this.init()
    myLog.log(`videoShop => mpErpId:${getTaroParams(Taro.getCurrentInstance?.()).mpErpId}`)
    if (this.props.shop) {
      const { sn, epid, shopid } = this.props.shop
      trackSvc.trackToBigData({
        sn,
        epid,
        shop: shopid,
        data: [{ key: 'enter_cloud', value: 1 }],
        tag: {
          page: CloudEventPage.VIDEO,
          source: getTaroParams(Taro.getCurrentInstance?.()).source
        }
      })
    }

    const favored = Taro.getStorageSync(storage.VIDEO_PAGE_GUIDE)
    if (!favored) {
      this.setState({ favorGuide: 1 })
    }

    const gestureGuide = Taro.getStorageSync(storage.VIDEO_GESTURE_GUIDE)
    if (!gestureGuide) {
      this.setState({ gestureGuide: true })
    }

    recordVideoPlay({ mpErpId: this.props.data.mpErpId, videoId: this.props.data.videoId })
  }

  // 当前页面初始化
  init = () => {
    this.fetchShopVideos(true)
    this.fetchShopGoods(Number(getTaroParams(Taro.getCurrentInstance?.()).mpErpId))
  }

  fetchShopGoods = (mpErpId: number) => {
    this.props.dispatch({
      type: 'cloudBill/save',
      payload: { mpErpId, goodsListPreview: [] }
    })
    this.props.dispatch({ type: 'cloudBill/fetchGoodsListPreview', payload: { mpErpId } })
  }

  fetchShopVideos = (refresh = false) => {
    let payload: object = { refresh, exclusiveId: this.props.data.videoId }
    if (getTaroParams(Taro.getCurrentInstance?.()).mpErpIds) {
      payload = { mpErpIds: getTaroParams(Taro.getCurrentInstance?.()).mpErpIds }
    }
    this.props.dispatch({
      type: 'cloudBill/fetchVideoList',
      payload
    })
  }

  onShopClick = (tabType: string = 'video') => {
    const currentShop = this.props.videoList[this.state.currentVideoIndex]
    this.props.dispatch({ type: 'cloudBill/save', payload: { shopInfo: currentShop } })
    Taro.navigateTo({
      url: `/subpackages/cloud_bill/pages/all_goods/index?mpErpId=${currentShop.mpErpId}&tab=${tabType}`
    })
  }

  onAllShopClick = () => {
    Taro.switchTab({ url: '/pages/cloud_bill_tab/index' })
  }

  onGoodsClick = (item: ISpu) => {
    this.props.dispatch({
      type: 'goodsManage/cloudBillInitShopParam',
      payload: { mpErpId: this.props.mpErpId }
    })
    // 浏览
    this.props.dispatch({
      type: 'cloudBill/fetchGoodsDetail',
      payload: { spuId: item.styleId, goodsDtail: { ...item, skus: [] } }
    })
    Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/goods_detail/index' })
  }

  onTicketClick = () => {
    const { sn, epid, billid, type } = this.props.data
    Taro.navigateTo({
      url: `/pages/eTicketDetail/landscapeModel?sn=${sn}&epid=${epid}&billid=${billid}&type=${type}`
    })
  }

  getVideoIns = (idx?: number) => {
    const { currentVideoIndex } = this.state
    idx = typeof idx === 'number' ? idx : currentVideoIndex
    const ins = this.videoIns[idx]
    if (ins) {
      return ins
    } else {
      return Taro.createVideoContext(`video_${idx}`)
    }
  }

  addVideoIns = (idx: number) => {
    if (!this.videoIns[idx]) {
      this.videoIns[idx] = Taro.createVideoContext(`video_${idx}`)
    }
  }

  removeVideoIns = (idx: number) => {
    this.videoIns[idx] = null
  }

  removeUnusedIns = (base: number) => {
    this.videoIns.forEach((ins, idx) => {
      if (Math.abs(base - idx) > 1 && ins) {
        this.removeVideoIns(idx)
      }
    })
  }

  onVideoPlay = e => {
    const [_, idx] = e.target.id.split('_')
    if (this.state.currentVideoIndex === Number(idx)) {
      this.setState({ videoPaused: false })
    }
  }

  onVideoPause = e => {
    const [_, idx] = e.target.id.split('_')
    if (this.state.currentVideoIndex === Number(idx)) {
      this.setState({ videoPaused: true })
    }
  }

  onVideoClick = () => {
    const videoIns = this.getVideoIns()
    if (this.state.videoPaused) {
      videoIns.play()
    } else {
      videoIns.pause()
    }
  }

  onVideoChangeButStillAnimation = current => {
    if (this.state.currentVideoIndex !== current) {
      this.props.dispatch({ type: 'cloudBill/save', payload: { goodsListPreview: [] } })
    }
  }

  onVideoChange = current => {
    // 发生了改变 拉取货品信息
    if (this.state.currentVideoIndex !== current) {
      this.setState({ currentVideoIndex: current })
      const currentShop = this.props.videoList[current]
      if (currentShop.bindFlag === 1) {
        // 已绑定，拉取货品
        this.fetchShopGoods(currentShop.mpErpId)
      }
      // else {
      //   // 否则清空货品列表
      //   this.props.dispatch({ type: 'cloudBill/save', payload: { goodsListPreview: [] } })
      // }

      recordVideoPlay({ mpErpId: currentShop.mpErpId, videoId: currentShop.videoId })

      if (this.state.gestureGuide) {
        this.setState({ gestureGuide: false })
        Taro.setStorage({ key: storage.VIDEO_GESTURE_GUIDE, data: true })
      }
    }

    if (this.props.videoList.length - current <= 6 && !this.props.noMoreVideos) {
      this.fetchShopVideos()
    }
  }

  onFavorImage1Click = () => {
    this.setState({ favorGuide: 2 })
  }

  onFavorImage2Click = () => {
    this.setState({ favorGuide: 0 })
    Taro.setStorage({ key: storage.VIDEO_PAGE_GUIDE, data: true })
  }

  render() {
    const {
      videoPaused,
      currentVideoIndex,
      favorGuide,
      gestureGuide,
      showVideoCover,
      fromScreen,
      showAllShop
    } = this.state
    const { top, data, goodsList, menuRect, navigationRight, videoList, shop } = this.props
    return (
      <CustomNavigation
        enableBack={fromScreen === 'manage'}
        backIcon={backCircle}
        containerClass={styles.category_navigation}
        stickyTop
      >
        <View className={styles.page}>
          <VideoSwiper
            videoList={videoList}
            onShopClick={this.onShopClick}
            onAnimationFinish={this.onVideoChange}
            onChange={this.onVideoChangeButStillAnimation}
            top={top}
            onAllShopClick={this.onAllShopClick}
            showAllShop={showAllShop}
            goodsList={goodsList}
            onGoodsClick={this.onGoodsClick}
            onLeftFlip={this.onShopClick}
            onTicketClick={this.onTicketClick}
          ></VideoSwiper>
          {/* {gestureGuide && <Image src={gestureGuideImg} className={styles.gesture_guide} />} */}
          {favorGuide === 1 && (
            <Image
              src={favorGuideImg}
              className={styles.fix_item}
              style={{
                top: `${menuRect.top + menuRect.height + 6}px`,
                right: `${navigationRight}px`,
                width: '184px',
                height: '54px'
              }}
              onClick={this.onFavorImage1Click}
            />
          )}
          {favorGuide === 2 && (
            <View className={styles.fix_all_item}>
              <Image
                src={favorGuideImg2}
                className={styles.fix_item}
                style={{
                  top: `${menuRect.top + menuRect.height + 16}px`,
                  right: `${navigationRight + 20}px`,
                  width: '305px',
                  height: '382px'
                }}
                onClick={this.onFavorImage2Click}
              />
            </View>
          )}
        </View>
        <NavigationToMini shop={shop} />
      </CustomNavigation>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(ShopVideo)