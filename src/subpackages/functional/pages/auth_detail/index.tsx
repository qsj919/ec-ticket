import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'

// import classnames fro 'classnames'
import editIcon from '@/images/edit.png'
import unAuthIcon from '@/images/icon/un_auth.png'
import { fetchAuthDetail, updateAuthUser, unlinkAuth } from '@api/user_api_manager'
import messageFeedback from '@services/interactive'

import styles from './index.module.scss'
import AuthCell from '../../components/AuthCell'
import InputModal from '../../components/InputModal'
import { AuthData } from '../../types'

interface State {
  data: AuthData
  isRenameModalVisible: boolean
  // rem: string
}

export default class AuthHistory extends React.PureComponent<{}, State> {
  // config = {
  //   navigationBarTitleText: '授权管理'
  // }

  state = {
    isRenameModalVisible: false,
    data: {} as AuthData
    // rem: ''
  }

  inputRules = [
    {
      maxLength: 15,
      msg: '最多输入15个字'
    }
  ]

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  fetchData = () => {
    const { params } = Taro.getCurrentInstance?.()
    fetchAuthDetail(params.id).then(({ data }) => {
      this.setState({ data })
    })
  }

  onEditClick = () => {
    this.setState({ isRenameModalVisible: true })
  }

  closeInputModal = () => {
    this.setState({ isRenameModalVisible: false })
  }

  onInputConfirm = (s: string) => {
    const { data } = this.state
    updateAuthUser({ id: data.id, nickName: s }).then(() => {
      messageFeedback.showToast('修改备注成功')
      this.fetchData()
    })
  }

  onUnBindClick = () => {
    messageFeedback.showAlertWithCancel('是否确认取消该用户授权', '提示', () => {
      unlinkAuth(this.state.data.id).then(() => {
        Taro.navigateBack()
      })
    })
  }

  render() {
    const { isRenameModalVisible, data } = this.state
    return (
      <View className={styles.page}>
        <View className={styles.top_container}>
          <AuthCell data={data} />
          <View className={styles.op}>
            <View className={styles.op__item} onClick={this.onUnBindClick}>
              <Image src={unAuthIcon} className={styles.op__item__icon} />
              <Text>取消授权</Text>
            </View>
            <View className={styles.op__item} onClick={this.onEditClick}>
              <Image src={editIcon} className={styles.op__item__icon} />
              <Text>修改备注</Text>
            </View>
          </View>
        </View>

        {isRenameModalVisible && (
          <InputModal
            visible={isRenameModalVisible}
            title='修改备注'
            onRequestClose={this.closeInputModal}
            defaultInput={data.nickName}
            onConfirm={this.onInputConfirm}
            rules={this.inputRules}
          />
        )}
      </View>
    )
  }
}
