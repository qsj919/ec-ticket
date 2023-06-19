import Taro from '@tarojs/taro'
import React from 'react'
import { Button, Image, Input, Text, View } from '@tarojs/components'
import { uploadImage } from '@utils/download'
import { GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import EButton from '@components/Button/EButton'
import { getTaroParams } from '@utils/utils'
import messageFeedback from '@services/interactive'
import styles from './index.module.scss'

const mapStateToProps = ({ user }: GlobalState) => ({
  nickName: user.nickName,
  avatar: user.avatar
})

interface Props {}

type StateProps = ReturnType<typeof mapStateToProps>

interface State {
  name: string
  avatar: string
  showTip: boolean
}

// @connect(mapStateToProps)
class UserInfoPage extends React.PureComponent<StateProps, State> {
  // config = {
  //   navigationBarTitleText: '完善个人信息'
  // }

  constructor(props: StateProps) {
    super(props)
    this.state = {
      showTip: getTaroParams(Taro.getCurrentInstance?.()) ? getTaroParams(Taro.getCurrentInstance?.()).showTip === '1' : false,
      name: props.nickName === '微信用户' ? '' : props.nickName,
      avatar:
        props.avatar ||
        'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
    }
  }

  choosedAvatar = false

  onNameInput = e => {
    this.setState({ name: e.detail.value })
  }

  onChooseAvatar = e => {
    this.choosedAvatar = true
    this.setState({ avatar: e.detail.avatarUrl })
  }

  onSave = async () => {
    const { avatar, name } = this.state
    let _avatar = avatar
    if (!name) {
      return messageFeedback.showToast('请输入昵称')
    }

    Taro.showLoading({ title: '' })
    if (this.choosedAvatar) {
      Taro.showLoading({ title: '上传头像中...' })
      const { data } = await uploadImage(avatar)
      const res = JSON.parse(data)
      _avatar = res.data.h640[0]
    }

    this.props
      .dispatch({
        type: 'user/updateNickNameAndAvatar',
        payload: {
          nickName: name,
          headimgurl: _avatar
        }
      })
      .then(() => {
        Taro.navigateBack()
      })
  }

  render() {
    const { name, avatar, showTip } = this.state
    return (
      <View className={styles.container}>
        <View>
          {showTip && (
            <View style={{ textAlign: 'center' }}>
              <Text>你还没有填写个人信息噢，快去完善吧～</Text>
            </View>
          )}

          <Button
            className={styles.avatar_button}
            open-type='chooseAvatar'
            onChooseavatar={this.onChooseAvatar}
          >
            <Text className={styles.avatar_label}>选择头像</Text>
            <Image className={styles.avatar} src={avatar}></Image>
          </Button>

          <View className={styles.name_wrapper}>
            <Text>输入昵称</Text>
            <Input
              className={styles.name_input}
              type='nickname'
              value={name}
              onInput={this.onNameInput}
              placeholder='请输入昵称'
            />
            {/* 以下文本不展示，为了输入框能相对屏幕居中 */}
            <Text style='color: white'>输入昵称</Text>
          </View>
        </View>

        <EButton label='保存' onButtonClick={this.onSave} />
      </View>
    )
  }
}
export default connect(mapStateToProps)(UserInfoPage)