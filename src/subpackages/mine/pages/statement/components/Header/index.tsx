import Taro from '@tarojs/taro'
import React, { PureComponent }  from 'react'
import { View, Text, Image } from '@tarojs/components'
import questionIcon from '@/images/question_circle.png'
import { t } from '@models/language'
import starIcon from '@/images/star.png'
import starActiveIcon from '@/images/star_active.png'
import editIcon from '@/images/edit.png'
import { moneyInShort } from '@utils/utils'
import { BaseItem } from '@@types/base'
import classNames from 'classnames'
import styles from './header.module.scss'

interface Props {
  data: {
    beginsum: number //	期初欠款
    endsum: number //	期末欠款
    sendsum: number //	销售金额
    paysum: number //	支付金额
    adjustsum: number //	调整金额
    backsum: number //	退款金额
  }
  onQuestionClick: () => void
  shopName: string
  onStarClick: () => void
  onUnfollowClick: () => void
  // onSaveShopName: (name: string) => void
  star: boolean
  onEditClick: () => void
}

interface State {
  dataArrayLine1: BaseItem[]
  dataArrayLine2: BaseItem[]
}

export default class Header extends React.PureComponent<Props, State> {
  static defaultProps = {
    data: {}
  }

  state = {
    dataArrayLine1: [],
    dataArrayLine2: []
  }

  componentDidMount() {
    const { data } = this.props
    const dataArrayLine2 = [
      {
        label: t('pay'),
        value: data.paysum
      },
      {
        label: t('endOfPeriod'),
        value: data.endsum
      }
    ]
    if (this.props.data.adjustsum !== 0) {
      dataArrayLine2.splice(1, 0, {
        label: t('statement:adjust'),
        value: data.adjustsum
      })
    }
    this.setState({
      dataArrayLine1: [
        {
          label: t('startOfPeriod'),
          value: data.beginsum
        },
        {
          label: t('statement:total'),
          value: data.sendsum
        },
        {
          label: t('refund'),
          value: data.backsum
        }
      ],
      dataArrayLine2
    })
  }

  componentDidUpdate() {
    if (this.props.data.adjustsum !== 0 && this.state.dataArrayLine2.length === 2) {
      this.setState(state => {
        const dataArray2 = [...state.dataArrayLine2]
        dataArray2.splice(1, 0, {
          label: t('statement:adjust'),
          value: this.props.data.adjustsum
        })
        return { dataArrayLine2: dataArray2 }
      })
    } else if (this.props.data.adjustsum === 0 && this.state.dataArrayLine2.length === 3) {
      this.setState(state => ({
        dataArrayLine2: state.dataArrayLine2.filter((_, index) => index !== 1)
      }))
    }
  }

  onEditClick = () => {
    this.props.onEditClick()
  }

  // onUnfollowClick = () => {
  //   this
  // }

  render() {
    const { data, onQuestionClick, shopName, star } = this.props
    const dataArray1 = this.state.dataArrayLine1.map((item, index) => {
      let value
      switch (index) {
        case 0:
          value = moneyInShort(data.beginsum)
          break
        case 1:
          value = moneyInShort(data.sendsum)
          break
        case 2:
          value = moneyInShort(data.backsum)
          break
        default:
          value = item.value
      }
      return { ...item, value }
    })
    const dataArray2 = this.state.dataArrayLine2.map((item, index) => {
      let value
      switch (index) {
        case 0:
          value = moneyInShort(data.paysum)
          break
        case 1:
          value = moneyInShort(data.adjustsum !== 0 ? data.adjustsum : data.endsum)
          break
        case 2:
          value = moneyInShort(data.endsum)
          break
        default:
          value = item.value
      }
      return { ...item, value }
    })

    return (
      <View className={styles.container}>
        <View className={styles.top}>
          <View className={styles.top__left}>
            <Image
              onClick={this.props.onStarClick}
              className={styles.top__star}
              src={star ? starActiveIcon : starIcon}
            />
            <View className={styles.top__shop} onClick={this.onEditClick}>
              <Text className={styles.top__shop__name}>{shopName}</Text>
              <Image className={styles.top__shop__edit} src={editIcon} />
            </View>
          </View>
          {/* <View className={styles.top__unfollow} onClick={this.props.onUnfollowClick}>
            取消关注
          </View> */}
        </View>
        <View className={styles.statistics}>
          {dataArray1.map((item, index) => (
            <View className={styles.statistics__item} key={item.label}>
              <View style={{ position: 'relative' }}>
                <View
                  className={classNames(styles.statistics__item__title, {
                    [styles['statistics__item__title--question']]: index === 0
                  })}
                >
                  {item.label}
                  {index === 0 && (
                    <Image
                      onClick={onQuestionClick}
                      src={questionIcon}
                      className={styles.questionIcon}
                    />
                  )}
                </View>
              </View>

              <Text className={styles.statistics__item__value}>{item.value || 0}</Text>
            </View>
          ))}
        </View>
        <View className={styles.statistics}>
          {dataArray2.map(item => (
            <View className={styles.statistics__item} key={item.label}>
              <Text className={styles.statistics__item__title}>{item.label}</Text>
              <Text className={styles.statistics__item__value}>{item.value || 0}</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }
}
