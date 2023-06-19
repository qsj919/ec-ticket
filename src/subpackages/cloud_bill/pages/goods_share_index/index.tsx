import { Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import React from 'react'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import { findSpuGroupList, deleteSpuGroup } from '@api/goods_api_manager'
import { ISpu } from '@@types/GoodsType'
import { getTargerPastDays } from '@utils/utils'
import { PAGE_SIZE } from '@constants/index'
import { setNavigationBarTitle, isWeb } from '@utils/cross_platform_api'
import messageFeedback from '@services/interactive'
import { safePostMeaasge } from '@utils/postMessage'
import config from '@config/config'
import events from '@constants/analyticEvents'
import trackSvc from '@services/track'
import { ShareHistoryItem } from './types'

import GoodsShare from '../../components/GoodsShare/GoodsShare'
import HistoryShareCell from './components/HistoryShareCell'
import hotGoodsImg from './images/hot_goods.png'
import newGoodsImg from './images/new_goods.png'
import createCollectionImg from './images/create_collection.png'
import bgImg from './images/share_bg.png'

import './index.scss'

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    mpErpId: goodsManage.mpErpId,
    shopName: goodsManage.shopName,
    appName: goodsManage.appName,
    manageNewList: goodsManage.manageNewList,
    newListLength: goodsManage.newListLength
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  pageNo: number
  groupList: Array<ShareHistoryItem>
  shareViewMask: boolean
  imageSource: Array<ImageType>
  setClipSuccess: boolean
  groupLink: string
}

type ImageType = {
  docId?: string
  url: string
  name?: string
  code?: string
  imgUrls: Array<string>
  styleId: number
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class GoodsShareIndex extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationBarTitleText: '商品分享'
  // }

  state = {
    pageNo: 1,
    groupList: [] as ShareHistoryItem[],
    shareViewMask: false,
    imageSource: [] as ImageType[],
    setClipSuccess: false,
    groupLink: ''
  }

  groupId: number

  currentGroup: ShareHistoryItem

  componentDidShow() {
    setNavigationBarTitle('商品分享')
  }

  /**
   * type
   * 0  自定义集合
   * 1  爆款集合
   * 2  新品集合
   */

  onReachBottom() {
    if (this.state.groupList.length >= this.state.pageNo * PAGE_SIZE) {
      this.fetchGroupList(true)
    }
  }

  componentDidMount() {
    this.fetchGroupList()
    this.fetchNewGoodsList()
    Taro.eventCenter.on('FETCH_GROUP_LIST', this.fetchGroupList)
  }

  componentWillUnmount() {
    Taro.eventCenter.off('FETCH_GROUP_LIST')
  }

  onShareAppMessage() {
    const { mpErpId, shopName } = this.props
    const { imageSource } = this.state
    let imageUrl = ''
    if (imageSource[0]) {
      if (imageSource[0].url) {
        imageUrl = imageSource[0].url
      } else if (imageSource[0].imgUrls) {
        imageUrl = imageSource[0].imgUrls[0]
      }
    }
    return {
      title: this.currentGroup.name || shopName,
      path: `/subpackages/cloud_bill/pages/goods_share_collection/index?mpErpId=${mpErpId}&groupId=${this.groupId}`,
      imageUrl
    }
  }

  fetchNewGoodsList = () => {
    const r = getTargerPastDays(15)
    return this.props.dispatch({
      type: 'goodsManage/fetchManageNewGoods',
      payload: {
        slhMarketDateBegin: r.startDate,
        slhMarketDateEnd: r.endDate,
        pageSize: PAGE_SIZE
      }
    })
  }

  fetchGroupList = (loadMore = false) => {
    const { pageNo = 1 } = this.state
    const { mpErpId } = this.props
    let _pageNo = pageNo
    if (loadMore) {
      _pageNo = _pageNo + 1
    } else {
      _pageNo = 1
    }
    Taro.showLoading({ title: '请稍等...' })

    findSpuGroupList({
      pageNo: _pageNo,
      mpErpId,
      pageSize: PAGE_SIZE
    })
      .then(({ data }) => {
        this.setState({
          groupList: _pageNo === 1 ? data.rows : [...this.state.groupList, ...data.rows],
          pageNo: _pageNo
        })
        Taro.hideLoading()
      })
      .catch(e => {
        Taro.hideLoading()
      })
  }

  goShareEdit = async e => {
    Taro.showLoading({
      title: '请稍等...'
    })
    const { type } = e.currentTarget.dataset
    if (type === '2') {
      trackSvc.track(events.goodsShareNewClick)
      await this.fetchNewGoodsList()
    }
    if (type === '1') {
      trackSvc.track(events.goodsShareHotClick)
      await this.props.dispatch({
        type: 'goodsManage/fetchManageHotGoods',
        payload: {
          pageSize: PAGE_SIZE
        }
      })
    }
    if (type === '0') {
      trackSvc.track(events.goodsShareCustomClick)
    }
    Taro.hideLoading()
    Taro.navigateTo({ url: `/subpackages/cloud_bill/pages/goods_share_edit/index?type=${type}` })
  }

  onMoreClick = (data: ShareHistoryItem) => {
    Taro.showActionSheet({ itemList: ['删除集合'] })
      .then(() => {
        messageFeedback.showAlertWithCancel('删除后集合失效，确认删除吗？', '提示', () => {
          deleteSpuGroup({
            id: data.id
          })
            .then(({ code }) => {
              if (code === 0) {
                this.setState(state => ({
                  groupList: [...state.groupList.filter(item => item.id !== data.id)]
                }))
              }
            })
            .catch(e => {
              Taro.hideLoading()
            })
        })
      })
      .catch(e => {
        console.log(e, 'ee')
      })
  }

  onShareClick = (item: ShareHistoryItem) => {
    trackSvc.track(events.goodsShareIndexShareClick)
    const { spuList } = item
    this.groupId = item.id
    this.currentGroup = item
    this.updateImageSource(spuList)
  }

  updateImageSource = list => {
    this.setState({
      imageSource: list.map((item, _idex) => ({
        url: item.imgUrl ? item.imgUrl : '',
        name: item.name || '',
        code: item.code || '',
        orderBy: _idex,
        imgUrls: item.imgUrls,
        styleId: item.styleId
      })),
      shareViewMask: true
    })
  }

  onCloseShare = () => {
    this.setState({
      shareViewMask: false
    })
  }
  onShareItemClick = async (key, data) => {
    if (key === 'map') {
      this.shareMiniCard(data)
    }
    if (key === 'monents') {
      this.shareMonents(data)
    }
    if (key === 'firends') {
      this.shareFirends(data)
    }
  }

  shareMiniCard = data => {
    const { imageSource } = this.state
    let imageUrl = ''
    if (imageSource[0]) {
      if (imageSource[0].url) {
        imageUrl = imageSource[0].url
      } else if (imageSource[0].imgUrls) {
        imageUrl = imageSource[0].imgUrls[0]
      }
    }
    if (isWeb()) {
      const { shopName, mpErpId } = this.props
      safePostMeaasge(
        JSON.stringify({
          eventType: 'shareWxMiniProgram',
          data: {
            title: this.currentGroup.name || shopName,
            path: `/subpackages/cloud_bill/pages/goods_share_collection/index?mpErpId=${mpErpId}&groupId=${this.groupId}`,
            thumImageUrl: imageUrl,
            desc: '',
            [this.props.appName === 'slh' ? 'miniprogramType' : 'miniProgramType']:
              process.env.PRODUCT_ENVIRONMENT === 'product' ? 0 : 2,
            userName: config.appUserName
          }
        })
      )
    }
  }

  shareMonents = data => {
    if (this.props.appName === 'slh') {
      safePostMeaasge(
        JSON.stringify({
          eventType: 'shareImageToWechat',
          data: {
            isTimeline: true,
            imgDataStr: data
          }
        })
      )
    } else {
      safePostMeaasge(
        JSON.stringify({
          eventType: 'shareWxMoments',
          data: data
        })
      )
    }
  }

  shareFirends = data => {
    if (this.props.appName === 'slh') {
      safePostMeaasge(
        JSON.stringify({
          eventType: 'shareImageToWechat',
          data: {
            isTimeline: false,
            imgDataStr: data
          }
        })
      )
    } else {
      safePostMeaasge(
        JSON.stringify({
          eventType: 'shareImageToFriends',
          data: data
        })
      )
    }
  }

  setClipSuccess = link => {
    this.setState({
      setClipSuccess: true,
      shareViewMask: false,
      groupLink: link
    })
  }

  onSuccessClick = () => {
    this.setState({
      setClipSuccess: false
    })
  }

  onGroupItemClick = data => {
    Taro.navigateTo({
      url: `/subpackages/cloud_bill/pages/groups_detail/index?id=${data.id}&type=${data.type}`
    })
  }

  renderSetClipSuccess = () => {
    const { groupLink } = this.state
    return (
      <View className='goods_share__mask'>
        <View className='goods_share__mask__clipSuccess'>
          <View className='goods_share__mask__clipSuccess__title'>小程序链接已复制</View>
          <View className='goods_share__mask__clipSuccess__label'>发送给客户或发朋友圈</View>
          <View className='goods_share__mask__clipSuccess__successContent'>{groupLink}</View>
          <View className='goods_share__mask__clipSuccess__action' onClick={this.onSuccessClick}>
            好的
          </View>
        </View>
      </View>
    )
  }

  render() {
    const { groupList, shareViewMask, imageSource, setClipSuccess } = this.state
    const { shopName, appName, newListLength } = this.props
    return (
      <View className='goods_share_page'>
        <View className='goods_share_page__top col aic'>
          <Image className='goods_share_page__top__image' src={bgImg} />
          <View className='goods_share_page__top__title'>拼图海报、小程序分享</View>
          <Text className='goods_share_page__top__text'>代替传统朋友圈分享，精准触达</Text>
        </View>
        <View className='goods_share_page__middle'>
          <View className='aic jcsb'>
            <View
              className='goods_share_page__middle__block aic'
              data-type='2'
              onClick={this.goShareEdit}
            >
              <Image className='goods_share_page__middle__block__img' src={newGoodsImg} />
              <Text>上新分享</Text>
              {newListLength > 0 && (
                <View className='goods_share_page__middle__block__guide-view aic jcc'>
                  近期有上新，快分享给客户吧
                </View>
              )}
            </View>
            <View
              className='goods_share_page__middle__block aic'
              data-type='1'
              onClick={this.goShareEdit}
            >
              <Image className='goods_share_page__middle__block__img' src={hotGoodsImg} />
              <Text>爆款分享</Text>
            </View>
          </View>

          <View
            className='goods_share_page__middle__block goods_share_page__middle__block--big aic'
            data-type='0'
            onClick={this.goShareEdit}
          >
            <Image className='goods_share_page__middle__block__img' src={createCollectionImg} />
            <View>
              <View>创建商品分享</View>
              <Text className='goods_share_page__middle__block__text'>自定义分享</Text>
            </View>
          </View>
        </View>

        <View className='goods_share_page__history'>
          {groupList.length > 0 && (
            <Text className='goods_share_page__history__title'>历史分享</Text>
          )}
          <View>
            {groupList.map(item => (
              <HistoryShareCell
                key={item.id}
                data={item}
                onItemClick={this.onGroupItemClick}
                onMoreClick={this.onMoreClick}
                onShareClick={this.onShareClick}
              />
            ))}
          </View>
        </View>
        {shareViewMask && (
          <GoodsShare
            shareType='share'
            imageSource={imageSource}
            shopName={shopName}
            onCloseShare={this.onCloseShare}
            onShareItemClick={this.onShareItemClick}
            onSetClipSuccess={this.setClipSuccess}
            appName={appName}
            groupId={this.groupId}
          />
        )}
        {setClipSuccess && this.renderSetClipSuccess()}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(GoodsShareIndex)