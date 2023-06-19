import Taro from '@tarojs/taro'
import React, { PureComponent }  from 'react'
import { View, Text, Image } from '@tarojs/components'
import { dateFormat, getTaroParams } from '@utils/utils'
import { fetchExpressTrack } from '@api/apiManage'
import classNames from 'classnames'
import { AtActivityIndicator } from 'taro-ui'
import emptyImage from '@/images/special/express_empty.png'
import copyIcon from '@/images/icon/copy_32.png'
import navigatorSvc from '@services/navigator'
import messageFeedback from '@services/interactive'

import styles from './express_track.module.scss'

interface TrackItem {
  acceptTime: string
  acceptStation: string
}

interface State {
  tracks: TrackItem[]
  loading: boolean
  number: string
  companyName: string
  from: string
}

export default class ExpressTrack extends React.PureComponent<any, State> {
  config = {
    navigationBarTitleText: '快递查询'
  }

  constructor(props) {
    super(props)
    const { from } = getTaroParams(Taro.getCurrentInstance?.())

    this.state = {
      tracks: [] as TrackItem[],
      loading: false,
      number: '',
      companyName: '',
      // eslint-disable-next-line react/no-unused-state
      from
    }
  }

  UNSAFE_componentWillMount() {
    const { number, providerId } = getTaroParams(Taro.getCurrentInstance?.())
    this.setState({ loading: true, number })
    fetchExpressTrack(number, providerId)
      .then(({ data }) => {
        this.setState({
          tracks: data.traces || [],
          companyName: data.logisCompName || '',
          loading: false
        })
      })
      .catch(() => {
        this.setState({ loading: false })
      })
  }

  copyNumber = () => {
    Taro.setClipboardData({
      data: this.state.number
    }).then(() => {
      messageFeedback.showToast('单号复制成功')
    })
  }

  onEditClick = () => {
    const { pk, sn, epid } = getTaroParams(Taro.getCurrentInstance?.())
    const query = `pk=${pk}&sn=${sn}&epid=${epid}`
    navigatorSvc.redirectTo({
      url: `/subpackages/packages_detail/pages/combine_express/index?${query}`
    })
  }

  render() {
    const { tracks, loading, number, companyName } = this.state
    return (
      <View className={styles.page}>
        <View className={styles.basic_info} onClick={this.copyNumber}>
          {`${companyName}  ${number}`}
          <Image className={styles.copy_icon} src={copyIcon} />
        </View>
        {tracks.length > 0 ? (
          <View className={styles.track_container}>
            {tracks.map((item, index) => (
              <View
                className={classNames(styles.track, { [styles['track--main']]: index == 0 })}
                key={item.acceptTime}
              >
                <View className={styles.track__date}>
                  <View className={styles.track__date__date}>{dateFormat(item.acceptTime, 0)}</View>
                  <Text>{dateFormat(item.acceptTime)}</Text>
                </View>
                <View className={styles.track__divider}>
                  <View
                    className={classNames(styles.track__divider__circle, {
                      [styles['track__divider__circle--red']]: index === 0
                    })}
                  ></View>
                  <View className={styles.track__divider__line}></View>
                </View>
                <View className={styles.track__content}>
                  {/* <View className={styles.track__content__title}></View> */}
                  <Text className={styles.track__content__detail}>{item.acceptStation}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.empty}>
            {loading ? (
              <AtActivityIndicator mode='center' size={80}></AtActivityIndicator>
            ) : (
              <View className={styles.empty__p}>
                <Image className={styles.empty__image} src={emptyImage} />
                <View>暂无快递信息</View>
              </View>
            )}
          </View>
        )}
        <View className={styles.edit}>
          <Text>单号填写有误？</Text>
          <Text className='highlight_text' onClick={this.onEditClick}>
            立即修改
          </Text>
        </View>
      </View>
    )
  }
}
