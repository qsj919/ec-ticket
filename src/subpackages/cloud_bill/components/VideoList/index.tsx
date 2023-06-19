import Taro from '@tarojs/taro'
import React ,{ ComponentType } from 'react'
import { Image, View } from '@tarojs/components'
import { connect } from 'react-redux'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { IVideo } from '@@types/base'
import { getVieoList } from '@utils/utils'
import playImg from '../../images/video_play_48.png'
import videoDefaultImg from '../../images/video_default.png'
import VideoCover from '../../images/shop_video_cover.png'
import styles from './index.module.scss'

type Props = {
  // videos: IVideo[]
  // onVideoClick(id: number): void
}

const mapStateToProps = ({ cloudBill, loading }: GlobalState) => {
  return {
    videos: cloudBill.videos,
    goodsVideoList: cloudBill.goodsVideoList,
    isLoading:
      loading.effects['cloudBill/fetchShopVideos'] &&
      loading.effects['cloudBill/fetchShopVideos'].loading
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps, Props>(mapStateToProps)
class VideoList extends React.PureComponent<Props & StateProps & DefaultDispatchProps> {
  onVideoClick = e => {
    const data = e.target.dataset
    if (data.vid) {
      Taro.navigateTo({
        url: `/subpackages/cloud_bill/pages/single_shop_videos/index?videoId=${data.vid}`
      })
    }
  }
  render() {
    const { videos, isLoading, goodsVideoList } = this.props
    const list = getVieoList(videos, goodsVideoList)

    return (
      <View className={styles.container}>
        {list.length > 0 ? (
          <View onClick={this.onVideoClick} className={styles.wrapper}>
            {list.map((v: any) => (
              <View key={v.id} className={styles.video_item} data-vid={v.id}>
                <Image
                  src={v.coverUrl}
                  className={styles.cover}
                  mode='aspectFill'
                  data-vid={v.id}
                />
                {!v.coverUrl && <Image src={videoDefaultImg} className={styles.default_cover} />}
                <Image src={playImg} className={styles.play} data-vid={v.id} />
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.text}>{isLoading ? '视频加载中...' : '商家还未上传视频'}</View>
        )}
      </View>
    )
  }
}

export default connect<StateProps, DefaultDispatchProps, Props>(mapStateToProps)(VideoList) as ComponentType<Props>
