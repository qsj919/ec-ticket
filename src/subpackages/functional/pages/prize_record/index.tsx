import Taro from '@tarojs/taro'
import React from 'react'
import { View } from '@tarojs/components'
import { fetchPrizeRecord } from '@api/apiManage'
import messageFeedback from '@services/interactive'
import { getTaroParams } from '@utils/utils'
import classnames from 'classnames'
import styles from './index.module.scss'
import JackPotModal from '../activity/components/JackPotModal'

interface IPrizeRecord {
  activityPrizeId: number //活动奖品id
  name: string //	活动奖品姓名
  description: string //	活动奖品描述
  docId: string //	活动奖品图片
  value: number //	活动奖品价值
  prizeCode: string //	奖品凭证
  startDate: string //	活动开始日期
  receiveDate: string //	领取时间
  expireDate: string //	过期时间
  flag: number //	活动状态,0-过期 1-已领取 2-已兑换）
}

interface State {
  prizeRecords: IPrizeRecord[]
  isPrizeModalVisible: boolean
  currentPrize: IPrizeRecord | null
}

export default class PrizeRecordPage extends React.PureComponent<{}, State> {
  // config = {
  //   navigationBarTitleText: '中奖记录'
  // }

  state: State = {
    prizeRecords: [] as IPrizeRecord[],
    isPrizeModalVisible: false,
    currentPrize: null
  }

  componentDidMount() {
    // messageFeedback.s
    const activityId = getTaroParams(Taro.getCurrentInstance?.()).activityId
    Taro.showLoading()
    fetchPrizeRecord(activityId)
      .then(({ data }) => {
        Taro.hideLoading()
        this.setState({ prizeRecords: data.rows })
        if (data.rows.length === 0) {
          messageFeedback.showAlert(
            '没有查询到您的中奖记录，快去参与抽奖吧～',
            '提示',
            '确认',
            () => {
              Taro.navigateBack()
            }
          )
          // Taro.showModal({title: ''})
        }
      })
      .catch(e => {
        Taro.hideLoading()
      })
  }

  onPrizeClick = (prize: IPrizeRecord) => {
    if (prize.flag === 1) {
      this.setState({ isPrizeModalVisible: true, currentPrize: prize })
    }
  }

  hideModal = () => {
    this.setState({ isPrizeModalVisible: false })
  }

  prizeStatus = (flag: number) => {
    switch (flag) {
      case 0:
        return '已过期'
      case 1:
        return '立即兑换'
      case 2:
        return '已兑换'
    }
  }

  render() {
    const { currentPrize } = this.state
    return (
      <View className={styles.container}>
        {this.state.prizeRecords.map(p => (
          <View className={styles.cell} key={p.activityPrizeId}>
            <View className={styles.name}>{p.name}</View>
            <View
              className={classnames(styles.status, { [styles['status--alive']]: p.flag === 1 })}
              onClick={() => this.onPrizeClick(p)}
            >
              {this.prizeStatus(p.flag)}
            </View>
          </View>
        ))}

        <JackPotModal
          visible={this.state.isPrizeModalVisible}
          onRequestClose={this.hideModal}
          activityPrizeId={this.state.currentPrize ? this.state.currentPrize.activityPrizeId : 0}
          prize={this.state.currentPrize ? this.state.currentPrize.name : ''}
          code={this.state.currentPrize ? this.state.currentPrize.prizeCode : ''}
          expireDate={currentPrize ? currentPrize.expireDate : ''}
        />
      </View>
    )
  }
}
