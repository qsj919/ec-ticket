import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import React from 'react'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import { getTaroParams } from '@utils/utils'
import { ISpu } from '@@types/GoodsType'
import { getShopGoodsList, getSpuGroup, deleteSpuGroup } from '@api/goods_api_manager'
import EImage from '@components/EImage'
import messageFeedback from '@services/interactive'
import { safePostMeaasge } from '@utils/postMessage'
import { isWeapp, isWeb } from '@utils/cross_platform_api'
import config from '@config/config'

import GoodsShare from '../../components/GoodsShare/GoodsShare'

import './index.scss'

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    mpErpId: goodsManage.mpErpId,
    shopName: goodsManage.shopName,
    appName: goodsManage.appName
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  goodsList: Array<ISpu>
  title: string
  shareViewMask: boolean
  shareTitle: string
  setClipSuccess: boolean
  groupLink: string
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class GroupsDetail extends React.Component<StateProps & DefaultDispatchProps, State> {
  // config: Taro.Config = {
  //   navigationBarTitleText: '集合详情'
  // }
  state = {
    goodsList: [] as ISpu[],
    title: '',
    shareViewMask: false,
    shareTitle: '',
    setClipSuccess: false,
    groupLink: ''
  }

  componentDidMount() {
    const { id, type } = getTaroParams(Taro.getCurrentInstance?.())
    let _title = ''
    if (type === '0') {
      _title = '自定义集合'
    }
    if (type === '1') {
      _title = '爆款集合'
    }
    if (type === '2') {
      _title = '上新集合'
    }
    Taro.showLoading({ title: '请稍等...' })
    Promise.all([
      getShopGoodsList({
        pageSize: 20,
        jsonParam: {
          type: 8,
          mpErpId: this.props.mpErpId,
          groupId: id
        }
      }),
      getSpuGroup({
        id
      })
    ])
      .then(([res1, res2]) => {
        Taro.hideLoading()
        this.setState({
          goodsList: res1.data.rows,
          title: _title,
          shareTitle: res2.name
        })
      })
      .catch(() => {
        Taro.hideLoading()
      })
  }

  onShareAppMessage() {
    const { shareTitle } = this.state
    const { mpErpId } = this.props
    const { id } = getTaroParams(Taro.getCurrentInstance?.())
    return {
      title: shareTitle,
      path: `/subpackages/cloud_bill/pages/goods_share_collection/index?mpErpId=${mpErpId}&groupId=${id}`
    }
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
    const { _imageSource } = this.updateImageSource(this.state.goodsList)
    let imageUrl = ''
    if (_imageSource[0]) {
      if (_imageSource[0].url) {
        imageUrl = _imageSource[0].url
      } else if (_imageSource[0].imgUrls) {
        imageUrl = _imageSource[0].imgUrls[0]
      }
    }
    if (isWeb()) {
      const { mpErpId } = this.props
      const { shareTitle } = this.state
      const { id } = getTaroParams(Taro.getCurrentInstance?.())
      safePostMeaasge(
        JSON.stringify({
          eventType: 'shareWxMiniProgram',
          data: {
            title: shareTitle,
            path: `/subpackages/cloud_bill/pages/goods_share_collection/index?mpErpId=${mpErpId}&groupId=${id}`,
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

  onManageClick = () => {
    Taro.showActionSheet({ itemList: ['删除集合'] })
      .then(() => {
        const { id } = getTaroParams(Taro.getCurrentInstance?.())
        messageFeedback.showAlertWithCancel('删除后集合失效，确认删除吗？', '提示', () => {
          deleteSpuGroup({
            id
          })
            .then(({ code }) => {
              if (code === 0) {
                Taro.eventCenter.trigger('FETCH_GROUP_LIST')
                Taro.navigateBack()
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

  onShareClick = () => {
    this.setState({
      shareViewMask: true
    })
  }

  onCloseShare = () => {
    this.setState({
      shareViewMask: false
    })
  }
  onSuccessClick = () => {
    this.setState({
      setClipSuccess: false
    })
  }

  setClipSuccess = link => {
    this.setState({
      shareViewMask: false,
      setClipSuccess: true,
      groupLink: link
    })
  }

  updateImageSource = list => {
    return list.map((item, _idex) => ({
      url: item.imgUrl ? item.imgUrl : '',
      name: item.name || '',
      code: item.code || '',
      orderBy: _idex,
      imgUrls: item.imgUrls,
      styleId: item.styleId
    }))
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
    const { goodsList, title, shareViewMask, setClipSuccess } = this.state
    const { shopName, appName } = this.props
    const { id } = getTaroParams(Taro.getCurrentInstance?.())
    const _imageSource = this.updateImageSource(goodsList)
    return (
      <View className='group_detail_page'>
        <View className='group_detail_page__content'>
          <View className='group_detail_page__content__header'>{title}</View>
          <View className='group_detail_page__content__list'>
            {goodsList.map(item => (
              <View key={item.id} className='group_detail_page__content__list__item'>
                <View className='group_detail_page__content__list__item__goodsImage'>
                  <EImage src={item.imgUrls} mode='aspectFill' />
                </View>
                <View className='group_detail_page__content__list__item__goodsName'>
                  {item.name}
                </View>
                <View className='group_detail_page__content__list__item__goodsCode'>
                  {item.code}
                </View>
              </View>
            ))}
            {goodsList.length % 3 === 2 && (
              <View className='group_detail_page__content__list__item' />
            )}
          </View>
        </View>

        <View className='group_detail_page__bottom jcsb'>
          <View
            className='group_detail_page__bottom__actionLeft aic jcc'
            onClick={this.onManageClick}
          >
            管理
          </View>
          <View
            className='group_detail_page__bottom__actionRight aic jcc'
            onClick={this.onShareClick}
          >
            立即分享
          </View>
        </View>
        {shareViewMask && (
          <GoodsShare
            shareType='share'
            imageSource={_imageSource}
            shopName={shopName}
            onCloseShare={this.onCloseShare}
            onShareItemClick={this.onShareItemClick}
            onSetClipSuccess={this.setClipSuccess}
            appName={appName}
            groupId={Number(id)}
          />
        )}

        {setClipSuccess && this.renderSetClipSuccess()}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(GroupsDetail)