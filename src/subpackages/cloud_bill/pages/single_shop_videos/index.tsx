import Taro, { Config } from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import CustomNavigation from '@components/CustomNavigation'
import { recordVideoPlay } from '@api/apiManage'
import { getVieoList, getTaroParams } from '@utils/utils'
import ColorSizeModelView from '../goods_detail/components/ColorSizeModelView'
import VideoSwiper from '../../components/VideoSwiper'
import styles from './index.module.scss'

const mapStateToProps = ({ cloudBill, loading }: GlobalState) => {
  return {
    videos: cloudBill.videos,
    goodsVideoList: cloudBill.goodsVideoList,
    colorSizeVisible: cloudBill.colorSizeVisible,
    showPrice: cloudBill.shopParams.spuShowPrice,
    isLoading:
      loading.effects['cloudBill/fetchShopVideos'] &&
      loading.effects['cloudBill/fetchShopVideos'].loading
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

type State = {
  initialIndex: number
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class SingleShopVideos extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config: Config = {
  //   navigationStyle: 'custom'
  // }

  allListLength: number = 0

  constructor(props: Readonly<StateProps & DefaultDispatchProps>) {
    super(props)
    // const index = getTaroParams(Taro.getCurrentInstance?.()).index || 0
    const { videos, goodsVideoList } = this.props
    const videosList = getVieoList(videos, goodsVideoList)
    const index = videosList.findIndex(v => v.id === Number(getTaroParams(Taro.getCurrentInstance?.()).videoId))
    this.state = {
      initialIndex: Number(index > -1 ? index : 0)
    }
  }

  // componentDidMount() {
  //   this.recordVideo(this.state.initialIndex)
  // }

  // recordVideo = current => {
  //   const video = this.props.videos[current]
  //   recordVideoPlay({ mpErpId: video.mpErpId, videoId: video.id })
  // }

  onShopClick = () => {}

  onVideoChange = (current: number) => {
    if (current === this.allListLength - 2) {
      Taro.eventCenter.trigger('on_detail_reach_bottom')
    }
  }

  onVideoChangeButStillAnimation = () => {}

  onGoodsAddClick = styleId => {
    this.props.dispatch({
      type: 'cloudBill/showColorSizeInList',
      payload: { spuId: styleId }
    })
  }

  onGoodsDetailClick = styleId => {
    this.props.dispatch({
      type: 'cloudBill/fetchGoodsDetail',
      payload: { spuId: styleId }
    })
    Taro.navigateTo({
      url: `/subpackages/cloud_bill/pages/goods_detail/index?spuId=${styleId}`
    })
  }

  render() {
    const { colorSizeVisible, videos, goodsVideoList, showPrice } = this.props
    const { initialIndex } = this.state
    const list = getVieoList(videos, goodsVideoList)
    return (
      <CustomNavigation enableBack stickyTop>
        <View className={styles.page}>
          <VideoSwiper
            videoList={list}
            onShopClick={this.onShopClick}
            onAnimationFinish={this.onVideoChange}
            onChange={this.onVideoChangeButStillAnimation}
            showShopInfo={false}
            initialIndex={initialIndex}
            showBottomBtn={false}
            showPrice={showPrice === '1'}
            onAddClick={this.onGoodsAddClick}
            onGoodsDetailClick={this.onGoodsDetailClick}
          />
        </View>

        <ColorSizeModelView
          key='shop_video'
          visible={colorSizeVisible}
          type='buttons'
          // onVisibleChanged={}
        />
      </CustomNavigation>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(SingleShopVideos)