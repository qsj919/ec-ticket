import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import cn from 'classnames'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import { uploadImage } from '@utils/download'
import myLog from '@utils/myLog'
import messageFeedback from '@services/interactive'

import GoodsSortView from '../../components/GoodsSortView'

import './index.scss'

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    mpErpId: goodsManage.mpErpId
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface BannerItem {
  styleId: string
  url: string
  id: string
  uploadId?: string
}

interface PageState {
  switchSort: boolean
  bannerList: BannerItem[]
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class ShopHotGoods extends React.Component<StateProps & DefaultDispatchProps, PageState> {
  // config: Taro.Config = {
  //   navigationBarTitleText: '首页banner'
  // }
  state = {
    switchSort: false,
    bannerList: [] as BannerItem[]
  }

  _bannerList: BannerItem[] = []
  waitUploadList: Array<{ uploadId: number; url: string }> = []

  componentDidMount() {
    this.props
      .dispatch({
        type: 'goodsManage/selelctShopProfileInformation',
        payload: {
          mpErpId: this.props.mpErpId
        }
      })
      .then(data => {
        if (data.bannerUrls.includes(',')) {
          this._bannerList =
            data.bannerUrls &&
            data.bannerUrls.split(',').map((item: string, _idx: number) => {
              return {
                url: item,
                id: `${_idx}`,
                styleId: `${_idx}`
              }
            })
        } else if (data.bannerUrls) {
          this._bannerList = [
            {
              url: data.bannerUrls,
              id: '1',
              styleId: '1'
            }
          ]
        } else {
          this._bannerList = []
        }
        this.setState({
          bannerList: this._bannerList
        })
      })
  }

  onSortClick = () => {
    this.setState(state => ({
      switchSort: !state.switchSort
    }))
  }

  // 排序 or 删除 or 保存
  onGoodsChange = list => {
    this._bannerList = list
  }

  onAddClick = () => {
    if (this._bannerList.length < 9) {
      Taro.chooseImage({
        count: 9 - this._bannerList.length,
        success: res => {
          let _list = [
            ...this._bannerList,
            ...res.tempFilePaths.map((temp, _idx) => ({
              url: temp,
              uploadId: this.waitUploadList.length + _idx
            }))
          ]
          // 将需要上传的图片暂时保存
          this.waitUploadList = [
            ...this.waitUploadList,
            ...res.tempFilePaths.map((item, _idx) => {
              return {
                url: item,
                uploadId: this.waitUploadList.length + _idx
              }
            })
          ]
          this._bannerList = _list.map((item: BannerItem, _idx: number) => ({
            ...item,
            styleId: `${_idx}`,
            id: `${_idx}`
          }))
          this.setState({
            bannerList: _list.map((item: BannerItem, _idx: number) => ({
              ...item,
              styleId: `${_idx}`,
              id: `${_idx}`
            }))
          })
        },
        fail: () => {
          Taro.hideLoading()
        }
      })
    } else {
      messageFeedback.showToast('最多可添加9张图片')
    }
  }

  onSaveClick = async () => {
    let uploadSuccess: any = []
    if (this.waitUploadList) {
      Taro.showLoading({ title: '上传中...' })
      for (let i = 0; i < this.waitUploadList.length; i++) {
        await uploadImage(this.waitUploadList[i].url)
          .then(({ data }) => {
            const _data = JSON.parse(data)
            uploadSuccess.push({
              url: _data.data.org[0],
              uploadId: this.waitUploadList[i].uploadId
            })
          })
          .catch(e => {
            Taro.hideLoading()
            myLog.log(`上传图片失败${e}`)
          })
      }
      Taro.hideLoading()
    }
    this._bannerList = this._bannerList.slice().map(item => {
      return {
        ...item,
        url: item.hasOwnProperty('uploadId')
          ? uploadSuccess.find(s => s.uploadId === item.uploadId).url
          : item.url
      }
    })
    this.props.dispatch({
      type: 'goodsManage/updataShopProfileInformation',
      payload: {
        mpErpId: this.props.mpErpId,
        bannerUrls: this._bannerList.map(item => item.url).join(',') || ''
      }
    })
    Taro.navigateBack()
  }

  render() {
    const { switchSort, bannerList } = this.state
    return (
      <View className='shop_hot_goods'>
        <View className='shop_hot_goods__header'>
          <View className='shop_hot_goods__header__title'>首页banner</View>
          <View className='shop_hot_goods__header__label'>图片将展示在店铺首页顶部</View>
          <View
            onClick={this.onSortClick}
            className={cn('shop_hot_goods__header__actionView aic jcc', {
              ['action_save']: switchSort,
              ['action_sort']: !switchSort
            })}
          >
            {switchSort ? '保存' : '排序'}
          </View>
        </View>
        <View className='shop_hot_goods__content'>
          <GoodsSortView
            type='banner'
            data={bannerList}
            sort={switchSort}
            onChange={this.onGoodsChange}
          />
        </View>
        <View className='shop_hot_goods__bottom'>
          <View className='shop_hot_goods__bottom__left' onClick={this.onAddClick}>
            添加图片
          </View>
          <View className='shop_hot_goods__bottom__right' onClick={this.onSaveClick}>
            保存
          </View>
        </View>
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(ShopHotGoods)