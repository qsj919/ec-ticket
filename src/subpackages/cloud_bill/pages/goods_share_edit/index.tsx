import Taro from '@tarojs/taro'
import React from 'react'
import { Image, Input, Text, View, ScrollView } from '@tarojs/components'
import { connect } from 'react-redux'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { isWeb, isWeapp, setNavigationBarTitle } from '@utils/cross_platform_api'
import { safePostMeaasge } from '@utils/postMessage'
import { saveSpuGroup } from '@api/goods_api_manager'
import config from '@config/config'
import events from '@constants/analyticEvents'
import { getTaroParams } from '@utils/utils'
import trackSvc from '@services/track'
import messageFeedback from '@services/interactive'
import GoodsShare from '../../components/GoodsShare/GoodsShare'
import hotGoodsImg from '../goods_share_index/images/hot_goods.png'
import newGoodsImg from '../goods_share_index/images/new_goods.png'
import createCollectionImg from '../goods_share_index/images/create_collection.png'
import MovableImagePicker from '../../components/MovableImagePicker'
import './index.scss'

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    useGoodsSpus: goodsManage.useGoodsSpus,
    shopName: goodsManage.shopName,
    hotGoodsList: goodsManage.manageHotList,
    newGoodsList: goodsManage.manageNewList,
    mpErpId: goodsManage.mpErpId,
    appName: goodsManage.appName,
    goodsList: goodsManage.goodsList
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  shareViewMask: boolean
  imageSource: Array<ImageType>
  shareType: string
  setClipSuccess: boolean
  groupId: number
  isSaved: boolean
  isStart: boolean
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
class GoodsShareEditPage extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config: Taro.Config = {
  //   navigationBarTitleText: ''
  // }

  state = {
    shareViewMask: false,
    imageSource: [] as ImageType[],
    shareType: 'prewview',
    setClipSuccess: false,
    groupId: -1,
    isSaved: false,
    isStart: false,
    groupLink: ''
  }

  goodImgInfo = {
    height: 346 * 3,
    type: 'png',
    width: 275 * 3
  }
  titleValue: string = ''

  canvasIns: HTMLCanvasElement | null = null

  canvasImages: Array<ImageType> = [] as ImageType[]

  componentDidMount() {
    const { type } = getTaroParams(Taro.getCurrentInstance?.())
    if (type === '1') {
      if (this.props.hotGoodsList.length) {
        const _list = this.props.hotGoodsList.filter(item => item.allImgUrlBig !== '')
        this.updateImageSource(_list)
      } else {
        this.updateImageSource(this.props.useGoodsSpus.filter(item => item.allImgUrlBig !== ''))
      }
    }
    if (type === '2') {
      if (this.props.newGoodsList.length) {
        const _list = this.props.newGoodsList.filter(item => item.allImgUrlBig !== '')
        this.updateImageSource(_list)
      } else {
        this.updateImageSource(this.props.useGoodsSpus.filter(item => item.allImgUrlBig !== ''))
      }
    }
    if (type === '0') {
      if (this.props.useGoodsSpus.length) {
        this.updateImageSource(this.props.useGoodsSpus.filter(item => item.allImgUrlBig !== ''))
      }
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.useGoodsSpus !== this.props.useGoodsSpus) {
      this.updateImageSource(this.props.useGoodsSpus)
    }
  }
  componentWillUnmount() {
    this.props.dispatch({
      type: 'goodsManage/clearShareGoods'
    })
  }

  onShareAppMessage(): Taro.ShareAppMessageReturn {
    const { mpErpId, shopName } = this.props
    const { groupId, imageSource } = this.state
    const info = this.getTitleInfo()
    let imageUrl = ''
    if (imageSource[0]) {
      if (imageSource[0].url) {
        imageUrl = imageSource[0].url
      } else if (imageSource[0].imgUrls) {
        imageUrl = imageSource[0].imgUrls[0]
      }
    }
    return {
      title: this.titleValue || `${shopName}${info.label}`,
      path: `/subpackages/cloud_bill/pages/goods_share_collection/index?mpErpId=${mpErpId}&groupId=${groupId}`,
      imageUrl
    }
  }

  updateImageSource = list => {
    this.canvasImages = list
    this.setState({
      imageSource: list.map((item, _idex) => ({
        url: item.imgUrl ? item.imgUrl : '',
        name: item.name || '',
        code: item.code || '',
        orderBy: _idex,
        imgUrls: item.imgUrls,
        styleId: item.styleId,
        imgUrl: item.imgUrl
      }))
    })
  }

  onAddGoodsClick = async () => {
    if (this.canvasImages.length < 20) {
      await this.props.dispatch({
        type: 'goodsManage/fetchGoodsList',
        payload: {
          styleIdsNotIn: this.canvasImages.map(item => item.styleId)
        }
      })
      this.props.dispatch({
        type: 'goodsManage/save',
        payload: {
          useGoodsSpus: this.canvasImages
        }
      })
      await this.props.dispatch({
        type: 'goodsManage/checkePartGoods',
        payload: {
          styleIds: this.canvasImages.map(item => item.styleId)
        }
      })
      Taro.navigateTo({
        url: '/subpackages/cloud_bill/pages/use_goods/index?from=share'
      })
    } else {
      messageFeedback.showToast('商品集合数量上限20')
    }
  }

  onMovableChange = images => {
    this.canvasImages = images
  }

  onInput = e => {
    this.titleValue = e.detail.value
  }

  onPreViewClick = () => {
    if (this.canvasImages.length) {
      this.setState({
        shareViewMask: true,
        shareType: 'prewview'
      })
    } else {
      Taro.showToast({ title: '请选择货品', icon: 'none' })
    }
  }

  onShareClick = () => {
    // 保存商品集合
    const { mpErpId, shopName } = this.props
    const { type } = getTaroParams(Taro.getCurrentInstance?.())
    const info = this.getTitleInfo()
    if (this.canvasImages.length) {
      if (!this.state.isSaved) {
        saveSpuGroup({
          jsonParam: {
            mpErpId,
            name: this.titleValue || `${shopName}${info.label}`,
            spuIds: this.canvasImages.map(item => item.styleId).join(','),
            type: Number(type)
          }
        }).then(({ data }) => {
          this.setState({
            shareViewMask: true,
            shareType: 'share',
            groupId: data.val,
            isSaved: true
          })

          Taro.eventCenter.trigger('FETCH_GROUP_LIST')
        })
      } else {
        this.setState({
          shareViewMask: true,
          shareType: 'share'
        })
      }
    } else {
      Taro.showToast({ title: '请选择货品', icon: 'none' })
    }

    trackSvc.track(events.goodsShareEditClick)
  }

  onCloseShare = (redirectTo = false) => {
    this.setState(
      {
        shareViewMask: false
      },
      () => {
        if (this.state.isSaved && redirectTo) {
          Taro.redirectTo({
            url: `/subpackages/cloud_bill/pages/groups_detail/index?id=${this.state.groupId}&type=${getTaroParams(Taro.getCurrentInstance?.()).type}`
          })
        }
      }
    )
  }

  onShareItemClick = (key, data) => {
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

  shareMiniCard = data => {
    let imageUrl = ''
    if (this.canvasImages[0]) {
      if (this.canvasImages[0].url) {
        imageUrl = this.canvasImages[0].url
      } else if (this.canvasImages[0].imgUrls) {
        imageUrl = this.canvasImages[0].imgUrls[0]
      }
    }
    if (isWeb()) {
      const info = this.getTitleInfo()
      const { shopName } = this.props
      safePostMeaasge(
        JSON.stringify({
          eventType: 'shareWxMiniProgram',
          data: {
            title: this.titleValue || `${shopName}${info.label}`,
            path: `/subpackages/cloud_bill/pages/goods_share_collection/index?mpErpId=${this.props.mpErpId}&groupId=${this.state.groupId}`,
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

  getTitleInfo = () => {
    const { type } = getTaroParams(Taro.getCurrentInstance?.())
    if (type === '0') {
      return {
        title: '自定义商品集合',
        label: '推荐款',
        icon: createCollectionImg
      }
    } else if (type === '1') {
      return {
        title: '爆款商品集合',
        label: '爆款集合',
        icon: hotGoodsImg
      }
    } else {
      return {
        title: '上新商品集合',
        label: '上新集合',
        icon: newGoodsImg
      }
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

  onShart = () => {
    this.setState({
      isStart: true
    })
  }
  onEnd = () => {
    this.setState({
      isStart: false
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
    const { shareViewMask, imageSource, shareType, setClipSuccess, groupId, isStart } = this.state
    const { shopName, appName } = this.props
    const info = this.getTitleInfo()
    const { type } = getTaroParams(Taro.getCurrentInstance?.())
    return (
      <View className='goods_share_edit_page'>
        <View className='goods_share_edit_page__wrapper flex1 scroll'>
          <View className='goods_share_edit_page__top aic'>
            <Image className='goods_share_edit_page__top__image' src={info.icon} />
            <View className=''>
              <View className='goods_share_edit_page__top__title'>{info.title}</View>
              <Text>系统将为您自动拼图</Text>
            </View>
          </View>

          <View className='goods_share_edit_page__header'>
            <View className='goods_share_edit_page__header__title'>标题</View>
            <Input
              maxLength={20}
              className='goods_share_edit_page__header__input'
              placeholder={`${shopName}${info.label}`}
              onInput={this.onInput}
            />
          </View>

          <View className='goods_share_edit_page__goods'>
            {type === '0' ? (
              <View className='goods_share_edit_page__goods__header jcsb'>
                <Text className='goods_share_edit_page__goods__header__title'>商品集合</Text>
                {imageSource.length > 0 && (
                  <View
                    className='goods_share_edit_page__goods__header__add'
                    onClick={this.onAddGoodsClick}
                  >
                    添加
                  </View>
                )}
              </View>
            ) : (
              <View className='goods_share_edit_page__goods__header jcsb'>
                <Text className='goods_share_edit_page__goods__header__title'>
                  {type === '1' ? '近期爆款的商品' : '近期上架的商品'}
                </Text>
                <View
                  className='goods_share_edit_page__goods__header__add'
                  onClick={this.onAddGoodsClick}
                >
                  添加
                </View>
              </View>
            )}
            {imageSource.length === 0 && type === '0' && (
              <View
                className='goods_share_edit_page__goods__addgoods aic jcc'
                onClick={this.onAddGoodsClick}
              >
                +添加商品
              </View>
            )}
            {imageSource.length >= 12 && (
              <View className='goods_share_edit_page__goods__tips'>
                {/* <Image className='goods_share_edit_page__goods__tips__icon' /> */}
                <Text>拼图数量上限12，请将主推款拖动调整至前12</Text>
              </View>
            )}
            {imageSource.length > 0 && (
              <View className='goods_share_edit_page__goods__movable'>
                <MovableImagePicker
                  onStart={this.onShart}
                  onEnd={this.onEnd}
                  onImageChange={this.onMovableChange}
                  defaultImages={imageSource}
                  from='goods_share'
                />
              </View>
            )}
            <View className='goods_share_edit_page__goods__list'></View>
          </View>
        </View>
        <View className='goods_share_edit_page__bottom jcsb'>
          <View
            className='goods_share_edit_page__bottom__actionLeft aic jcc'
            onClick={this.onPreViewClick}
          >
            预览
          </View>
          <View
            className='goods_share_edit_page__bottom__actionRight aic jcc'
            onClick={this.onShareClick}
          >
            立即分享
          </View>
        </View>

        {shareViewMask && (
          <GoodsShare
            imageSource={this.canvasImages}
            shopName={shopName}
            onCloseShare={this.onCloseShare}
            onShareItemClick={this.onShareItemClick}
            onSetClipSuccess={this.setClipSuccess}
            onShareClick={this.onShareClick}
            shareType={shareType}
            appName={appName}
            groupId={groupId}
          />
        )}

        {setClipSuccess && this.renderSetClipSuccess()}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(GoodsShareEditPage)