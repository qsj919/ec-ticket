import Taro from '@tarojs/taro'
import React,{ ComponentType }  from 'react'
import { View, ScrollView } from '@tarojs/components'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { connect } from 'react-redux'
import { setSpuClassHiddenOrShow } from '@api/goods_api_manager'
import styles from './index.module.scss'

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
class CategotyManage extends React.PureComponent<
  StateProps & DefaultDispatchProps & OwnProps,
  State
> {
  // config = {
  //   navigationBarTitleText: '管理分类'
  // }

  onBtnClick = item => {
    const { codeValue, hidden } = item
    const { mpErpId } = this.props
    const params = {
      mpErpId,
      jsonParam: { id: codeValue, hidden: !hidden }
    }
    setSpuClassHiddenOrShow(params).then(() => {
      Taro.showToast({ title: '成功' })
      this.props.dispatch({
        type: 'goodsManage/fetchClassList'
      })
    })
  }

  onSortClick = () => {
    Taro.navigateTo({ url: '/subpackages/cloud_bill/pages/category_manage/category_sort' })
  }

  render() {
    const { classList } = this.props
    return (
      <View className={styles.contanier}>
        <View className={styles.info}>
          <View>
            <View className={styles.info__title}>管理分类</View>
            <View className={styles.info__remind}>可对分类进行隐藏和排序</View>
          </View>
          <View className={styles.info__btn} onClick={this.onSortClick}>
            排序
          </View>
        </View>
        <ScrollView className={styles.list}>
          {classList.map(item => {
            return (
              <View key={item.codeValue} className={styles.list__item}>
                <View>{`${item.codeName}(${item.spuCount})`}</View>
                <View
                  onClick={() => {
                    this.onBtnClick(item)
                  }}
                  className={styles.list__item__btn}
                  style={{ color: item.hidden ? '#2E6BE6' : '#222222' }}
                >
                  {item.hidden ? '显示' : '隐藏'}
                </View>
              </View>
            )
          })}
        </ScrollView>
      </View>
    )
  }
}

export default connect<StateProps, DefaultDispatchProps, OwnProps>(mapStateToProps)(CategotyManage) as ComponentType<OwnProps>
