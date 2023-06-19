/**
 * @description 授权列表 同时扫授权码进入的也是这个页面
 */
import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'

import {
  fetchTheUserAuthedToMe,
  fetchMyAuthUser,
  applyAuth,
  unlinkAuth
} from '@api/user_api_manager'
import EmptyView, { InfoItem } from '@components/EmptyView'
import messageFeedback from '@services/interactive'
import Empty from '@components/Empty'
import { urlQueryParse, getTaroParams } from '@utils/utils'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { connect } from 'react-redux'
import navigatorSvc from '@services/navigator'
import authFailImage from '../../images/auth_fail.png'
import AuthCell from '../../components/AuthCell'
import { AuthData } from '../../types'
import styles from './index.module.scss'
import config from '../../../../config/config'

enum AuthStatus {
  None,
  // Pendding,
  // Success,
  Fail
}

interface State {
  authList: AuthData[] // 授权列表
  authToMeList: AuthData[] // 授权给我的列表
  fetched: boolean
  authStatus: AuthStatus
  emptyInfo: InfoItem
}

const mapStateToProps = ({ user }: GlobalState) => ({
  sessionId: user.sessionId,
  requireFollowPublic: user.requireFollowPublic
})

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, {}, DefaultDispatchProps>(mapStateToProps)
class AuthHistory extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationBarTitleText: '授权管理'
  // }

  constructor(props) {
    super(props)
    this.state = {
      authList: [],
      authToMeList: [],
      fetched: false,
      authStatus: AuthStatus.None,
      emptyInfo: { label: '暂无授权数据～' }
    }
  }

  UNSAFE_componentWillMount() {
    if (this.props.requireFollowPublic) {
      this.setState({
        emptyInfo: {
          label: `请先关注${config.wxPublicName}公众号再进行授权操作`,
          image: authFailImage
        }
      })
      return
    }
    Taro.showLoading({ title: '加载中...' })
    this.validatePage()
  }

  // componentDidMount() {
  //   console.log(this.props.sessionId, 'sessionId componentDidMount')
  // }

  componentDidShow() {
    if (this.state.fetched) {
      this.fetchData()
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.sessionId && this.props.sessionId && getTaroParams(Taro.getCurrentInstance?.()).q) {
      this.validatePage()
    }
    // anti
    if (!prevProps.requireFollowPublic && this.props.requireFollowPublic) {
      Taro.hideLoading()
      this.setState({
        emptyInfo: {
          label: `请先关注${config.wxPublicName}公众号再进行授权操作`,
          image: authFailImage
        }
      })
    }
  }

  validatePage = () => {
    if (!this.props.sessionId) return
    const { params } = Taro.getCurrentInstance?.()
    if (params.q) {
      // 扫码进来的情况，
      const q = decodeURIComponent(params.q)
      const query = urlQueryParse(q)
      this.auth(query)
    } else {
      this.fetchData()
    }
  }

  auth = (query: { [key: string]: string }) => {
    //
    const { mpUserId, timestamp } = query
    Taro.showLoading({ title: '获取授权中...' })
    applyAuth(mpUserId, timestamp)
      .then(({ data }) => {
        if (data.success) {
          this.fetchData()
          this.props.dispatch({ type: 'shop/fetchShopList' })
        } else {
          // 授权失败
          Taro.hideLoading()
          this.setState({
            emptyInfo: { label: data.message, image: authFailImage },
            authStatus: AuthStatus.Fail
          })
        }
      })
      .catch(e => {
        Taro.hideLoading()
        this.setState({
          emptyInfo: { label: e.message, image: authFailImage },
          authStatus: AuthStatus.Fail
        })
      })
  }

  fetchData = () => {
    Taro.showLoading({ title: '加载数据中...' })
    Promise.all([fetchTheUserAuthedToMe(), fetchMyAuthUser()])
      .then(([res1, res2]) => {
        this.setState({ authToMeList: res1.data.rows, authList: res2.data.rows, fetched: true })
        Taro.hideLoading()
        this.setState({ fetched: true })
      })
      .catch(() => {
        Taro.hideLoading()
      })
  }

  onCellClick = (data: AuthData) => {
    navigatorSvc.navigateTo({
      url: `/subpackages/functional/pages/auth_detail/index?id=${data.id}`
    })
  }

  onCellBtnClick = (data: AuthData) => {
    unlinkAuth(data.id).then(() => {
      messageFeedback.showToast('操作成功')
      this.setState(state => ({
        authToMeList: state.authToMeList.filter(item => item.id !== data.id)
      }))
      // 更新店铺列表
      this.props.dispatch({ type: 'shop/fetchShopList' })
    })
  }

  render() {
    const { authToMeList, authList, fetched, authStatus, emptyInfo } = this.state
    const { requireFollowPublic } = this.props
    const isEmpty = authList.length === 0 && authToMeList.length === 0
    return (
      <View className={styles.page}>
        {authToMeList.length > 0 && (
          <View className={styles.container}>
            <View className={styles.title}>已获得以下用户的授权({`${authToMeList.length}/5`})</View>
            {authToMeList.map(item => (
              <AuthCell
                key={item.id}
                data={item}
                showButton
                buttonLabel='取消关联'
                onButtonClick={this.onCellBtnClick}
                showRem={false}
              />
            ))}
          </View>
        )}
        {authList.length > 0 && (
          <View className={styles.container}>
            <View className={styles.title}>已授权以下用户{`(${authList.length}人)`}</View>
            {authList.map(item => (
              <AuthCell key={item.id} data={item} showRightCaret onCellClick={this.onCellClick} />
            ))}
          </View>
        )}
        {((isEmpty && fetched) || authStatus === AuthStatus.Fail || requireFollowPublic) && (
          <EmptyView type={4} emptyInfo={emptyInfo} />
        )}
      </View>
    )
  }
}
export default connect<StateProps, {}, DefaultDispatchProps>(mapStateToProps)(AuthHistory)