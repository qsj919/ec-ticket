import Taro from '@tarojs/taro'
import React, { createRef } from 'react'
import { View, CoverView, Button } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { getTaroParams } from '@utils/utils'
import { connect } from 'react-redux'
import { TaroCropper } from 'taro-cropper'
import styles from './index.module.scss'

const mapStateToProps = ({ applyMiniapp }: GlobalState) => {
  return {
    avatar: applyMiniapp.avatar
  }
}
type State = {
  width: number
  height: number
  src: string
  imgType?: string
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class ImageCropper extends React.Component<StateProps & DefaultDispatchProps, State> {
  constructor(props) {
    super(props)
    this.state = {
      src: '',
      height: 0,
      width: 0
    }
  }

  componentDidMount() {
    const { height, width, url, imgtype } = getTaroParams(Taro.getCurrentInstance?.())
    this.setState({ src: url, height: Number(height), width: Number(width), imgType: imgtype })
  }

  taroCropper

  catTaroCropper = node => {
    this.taroCropper = node
  }

  handleCut = async res => {
    Taro.showLoading({ title: '图片上传中' })
    await this.props.dispatch({
      type: 'applyMiniapp/uploadImage',
      payload: { url: res, imgType: this.state.imgType }
    })
    Taro.hideLoading()
    Taro.navigateBack()
  }

  handleCancel = () => Taro.navigateBack()

  handleConfirm = async () => {
    const res = await this.taroCropper.cut()
    this.handleCut(res.filePath)
  }

  render() {
    const { height, width, src } = this.state
    return (
      <View>
        <TaroCropper
          src={src}
          cropperWidth={300}
          cropperHeight={300}
          ref={this.catTaroCropper}
          themeColor={'#2e6be6'}
          fullScreen
          onCut={this.handleCut}
          onCancel={this.handleCancel}
          hideFinishText={true}
        />
        <CoverView className={styles.bar}>
          <Button className={styles.bar__btn} onClick={this.handleCancel}>
            取消
          </Button>
          <Button className={styles.bar__btn} onClick={this.handleConfirm}>
            确定
          </Button>
        </CoverView>
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(ImageCropper)