import Taro from '@tarojs/taro'
import React from 'react'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { Image, View } from '@tarojs/components'
import EButton from '@components/Button/EButton'
import { getOneClickMarketSpuCount, oneClickMarket } from '@api/goods_api_manager'
import checkIcon from '@/images/checked_circle_36.png'
import unCheckIcon from '@/images/icon/uncheck_circle.png'
import classnames from 'classnames'
import messageFeedback from '@services/interactive'
import styles from './index.module.scss'

interface Props {
  visible: boolean
  mpErpId: number
  onRequestClose(): void
  saasProductType?: number
}

interface State {
  options: { label: string; value: string; checked?: boolean }[]
  noImage: boolean
}

export default class FlashUploadGoods extends React.PureComponent<Props, State> {
  state = {
    options: [
      { label: '近3个月', value: '0', checked: true },
      { label: '近6个月', value: '1' },
      { label: '近1年', value: '2' },
      { label: '全部货品', value: '3' }
    ],
    noImage: false
  }

  onNoImageClick = () => {
    this.setState(state => ({ noImage: !state.noImage }))
  }

  onOptionsClick = (value: string) => {
    this.setState(state => ({
      options: state.options.map(op => ({ ...op, checked: op.value === value }))
    }))
  }

  onUploadClick = async () => {
    Taro.showLoading({ title: '请稍等' })
    const { options, noImage } = this.state
    const { mpErpId } = this.props
    const rangeDaysOption = options.find(item => item.checked) || options[0]
    const params = {
      rangeDaysOption: rangeDaysOption.value,
      needPic: !noImage,
      mpErpId
    }

    if (this.props.saasProductType === 40) {
      delete params.needPic
      delete params.rangeDaysOption
    }

    const { data } = await getOneClickMarketSpuCount(params)
    let title = `正在为您上架${data.val}个货品`
    let content = '请稍后刷新查看'
    if (data.val === 0) {
      title = '没有符合条件的货品'
      content = ''
    } else if (data.val > 100) {
      content = '货品较多，需要花费几秒时间，请稍后刷新查看'
    }
    messageFeedback.showAlert(content, title)

    Taro.hideLoading()
    if (data.val !== 0) {
      oneClickMarket(params)
    }
  }

  render() {
    const { visible, onRequestClose } = this.props
    const { options, noImage } = this.state
    return (
      <View style={{ position: 'relative', zIndex: 2999 }}>
        <SlideContainer visible={visible} onRequestClose={onRequestClose}>
          <View>
            <View className={styles.header}>一键上架</View>
            <View className={styles.content}>
              <View className={styles.tips}>按商陆花上架时间选择需要上架到云单的货品</View>
              <View className={styles.options}>
                {options.map(item => (
                  <View
                    onClick={() => this.onOptionsClick(item.value)}
                    className={classnames(styles.option, {
                      [styles['option--checked']]: item.checked
                    })}
                    key={item.value}
                  >
                    {item.label}
                  </View>
                ))}
              </View>
              <View className={styles.check_img} onClick={this.onNoImageClick}>
                <Image src={noImage ? checkIcon : unCheckIcon} className={styles.check_icon} />
                包含无图片的货品
              </View>
              <EButton
                label='立即上架'
                buttonClass={styles.button}
                onButtonClick={this.onUploadClick}
              />
            </View>
          </View>
        </SlideContainer>
      </View>
    )
  }
}
