import Taro from '@tarojs/taro'
import React from 'react'
import { Image, View } from '@tarojs/components'
import { AtActivityIndicator } from 'taro-ui'
import uncheckedIcon from '@/images/icon/uncheck_circle.png'
// import checkedIcon from '@/images/checked_circle_36.png'
import checkedIcon from '@/images/checked_circle_red.png'
import classnames from 'classnames'
import { ISpu } from '@@types/GoodsType'
import GoodsItemVertical from '../Goods/GoodsItemVertical'

import styles from './index.module.scss'

interface Props {
  data: ISpu
  size: string
  buttonLabel: string
  onButtonClick(data): Promise<void>
  onItemClick(data): void
  manage?: boolean
  showViewCount?: boolean
  showHotIcon?: boolean
  showInvNum?: boolean
}

interface State {
  loading: boolean
}

export default class GoodsItemForManage extends React.PureComponent<Props, State> {
  static defaultProps = {
    buttonLabel: '',
    data: {},
    showViewCount: false,
    showHotIcon: true,
    showInvNum: true
  }

  state = {
    loading: false
  }

  onButtonClick = async () => {
    this.setState({ loading: true })
    try {
      await this.props.onButtonClick(this.props.data)
    } catch (e) {
      // this.setState({ loading: false })
    }
    this.setState({ loading: false })
  }

  onItemClick = () => {
    // this.props
  }

  onCheckClick = e => {
    e.stopPropagation()
    this.props.onItemClick(this.props.data)
  }

  render() {
    const { data, size, buttonLabel, manage, showViewCount, showHotIcon, showInvNum } = this.props
    const { loading } = this.state
    return (
      <View
        className={classnames(styles.container, {
          [styles['container--checked']]: data.checked && manage
        })}
      >
        <GoodsItemVertical
          data={data}
          size={size}
          isCartBtnVisible={false}
          onItemClick={this.props.onItemClick}
          showViewCount={showViewCount}
          showHotIcon={showHotIcon}
          showInvNum={showInvNum}
        />
        {manage ? (
          <Image
            className={styles.check_img}
            src={data.checked ? checkedIcon : uncheckedIcon}
            onClick={this.onCheckClick}
          />
        ) : loading ? (
          <View className={styles.bottom_item}>
            <AtActivityIndicator />
          </View>
        ) : (
          <View className={styles.button} onClick={this.onButtonClick}>
            {loading ? 1 : buttonLabel}
          </View>
        )}
      </View>
    )
  }
}
