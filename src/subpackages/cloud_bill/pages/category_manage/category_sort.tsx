import Taro from '@tarojs/taro'
import React, { ComponentType } from 'react'
import { View, ScrollView, Image } from '@tarojs/components'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { connect } from 'react-redux'
import drag from '@/images/drag.png'
import { saveSpuClassApi } from '@api/shop_api_manager'
import styles from './index.module.scss'
import MovableBlock from '../../components/MovableBlock'

interface State {
  //
}

interface OwnProps {
  //
}

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    classList: goodsManage.classList,
    mpErpId: goodsManage.mpErpId
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps, OwnProps>(mapStateToProps)
class CategorySort extends React.PureComponent<StateProps & DefaultDispatchProps & OwnProps, State> {
  // config = {
  //   navigationBarTitleText: '管理分类'
  // }

  resultList: any[] = []

  onSortChange = list => {
    const { classList } = this.props
    const hiddenList = classList.filter(item => item.hidden)
    this.resultList = [...list, ...hiddenList]
  }

  onSaveClick = async () => {
    // saveSpuClassApi
    try {
      Taro.showLoading({ title: '保存中' })
      let jsonParam = this.resultList
      if (this.resultList.length !== this.props.classList.length) {
        jsonParam = this.props.classList
      }
      jsonParam = jsonParam.map(item => ({
        name: item.codeName,
        id: item.codeValue,
        hidden: item.hidden,
        spuCount: item.spuCount,
        parentid: item.parentid
      }))
      const { mpErpId } = this.props
      await saveSpuClassApi({ mpErpId, jsonParam })
      this.props.dispatch({
        type: 'goodsManage/fetchClassList'
      })
      Taro.hideLoading()
      Taro.navigateBack()
    } catch (e) {
      //
      Taro.hideLoading()
    }
  }

  render() {
    const { classList } = this.props
    const list = classList.filter(item => !item.hidden)
    return (
      <View className={styles.contanier}>
        <View className={styles.info}>
          <View>
            <View className={styles.info__title}>管理分类</View>
            <View className={styles.info__remind}>可对分类进行隐藏和排序</View>
          </View>
          <View className={styles['info__btn--save']} onClick={this.onSaveClick}>
            保存
          </View>
        </View>
        <ScrollView className={styles.list}>
          <MovableBlock defaultImages={list} onImageChange={this.onSortChange} />
        </ScrollView>
      </View>
    )
  }
}

export default connect<StateProps, DefaultDispatchProps, OwnProps>(mapStateToProps)(CategorySort) as ComponentType<OwnProps>
