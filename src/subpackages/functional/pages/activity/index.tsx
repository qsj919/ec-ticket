import Taro from '@tarojs/taro'
import React from 'react'
import { View, Canvas, Image, Button } from '@tarojs/components'
import { fetchActivityDetail, joinPrizeActivity } from '@api/apiManage'
import messageFeedback from '@services/interactive'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import classnames from 'classnames'
import { getTaroParams } from '@utils/utils' 
import trackSvc from '@services/track'
import events from '@constants/analyticEvents'
import discBg from './images/bg_disc.png'
import titleBg from './images/bg_title.png'
import buttonIcon from './images/button.png'
import styles from './index.module.scss'
import JackPotModal from './components/JackPotModal'
import FollowModal from './components/FollowModal'

interface Prize {
  description: string
  docId: string
  expireVal: string
  id: number
  name: string
  num: number
  value: number
  expireDate: string
}

interface IPrize extends Prize {
  activityPrizeId: number
  prizeCode: string
}

interface Rule {
  title: string
  content: string[]
}
interface State {
  rotating: boolean
  prize: IPrize | null
  prizes: Prize[]
  rules: Rule[]
  leftCount: number // 剩余次数
  // drawFlag: number // 活动状态
  isPrizeModalVisible: boolean
  cooldown: boolean // 代表是否处于转盘转完到展示中奖弹窗这个中间阶段
  flag: number // 活动状态 0-结束 1-未开始 2-开始但不在每日的活动时间中 3-进行中
  isFolllowModalVisible: boolean
  drawStartDate: string
  drawEndDate: string
}

const mapStateToProps = ({ user }: GlobalState) => ({
  sessionId: user.sessionId,
  isLogining: user.logining,
  subscribe: user.subscribe
})

type StateProps = ReturnType<typeof mapStateToProps>
// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class ActivityPage extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationBarTitleText: '限量送好礼'
  // }

  state: State = {
    rotating: false,
    prize: null,
    prizes: [] as Prize[],
    rules: [] as Rule[],
    // drawFlag: 1,
    leftCount: 0,
    isPrizeModalVisible: false,
    cooldown: false,
    isFolllowModalVisible: false,
    flag: 0,
    drawStartDate: '',
    drawEndDate: ''
  }

  componentDidMount() {
    this.fetchActivityDetail().then(() => {
      this.drawCanvas()
    })
  }

  componentDidUpdate(prevProps: Readonly<StateProps>) {
    if (!prevProps.sessionId && this.props.sessionId) {
      this.fetchActivityDetail().then(() => {
        // this.drawCanvas()
      })
    }
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer)
    this.timer1 && clearTimeout(this.timer1)
  }

  canvasCtx: CanvasRenderingContext2D

  timer: NodeJS.Timer

  timer1: NodeJS.Timer

  drawCanvas = () => {
    const { pixelRatio = 2 } = Taro.getSystemInfoSync()

    Taro.createSelectorQuery()
      .select('#canvas')
      .node(res => {
        // 需要显式的设置宽高，默认300 x 150
        const CANVAS_WIDTH = 580 * pixelRatio
        const CANVAS_HEIGHT = 580 * pixelRatio
        const radius = CANVAS_WIDTH / 2
        res.node.width = CANVAS_WIDTH
        res.node.height = CANVAS_HEIGHT
        const ctx: CanvasRenderingContext2D = res.node.getContext('2d')
        this.canvasCtx = ctx
        const data = this.state.prizes

        // 转盘奖品区
        const originX = CANVAS_WIDTH / 2
        const originY = CANVAS_HEIGHT / 2
        const anglePerPrize = 360 / data.length
        const prizeIconSize = 96 // 奖品图片尺寸
        data.forEach((prize, i) => {
          const image = res.node.createImage()
          image.src = prize.docId
          image.onload = function(e) {
            ctx.save()
            ctx.beginPath()
            ctx.moveTo(originX, originY)
            ctx.translate(originX, originY)
            ctx.rotate((Math.PI / 180) * i * anglePerPrize)
            ctx.moveTo(0, 0)
            ctx.arc(
              0,
              0,
              radius,
              (Math.PI / 180) * (-90 - anglePerPrize / 2),
              (Math.PI / 180) * (-90 + anglePerPrize / 2)
            )
            ctx.textAlign = 'center'
            ctx.fillStyle = i % 2 === 0 ? 'white' : 'yellow'
            // ctx.fillStyle = 'white'
            ctx.fill()
            ctx.fillStyle = 'black'
            ctx.font = `500 ${20 * pixelRatio}px  sans-serif`
            ctx.fillText(prize.name.slice(0, 4), 0, -140 * pixelRatio)
            ctx.fillText(prize.name.slice(4), 0, -110 * pixelRatio)
            ctx.drawImage(
              image,
              (-prizeIconSize / 2) * pixelRatio,
              -260 * pixelRatio,
              96 * pixelRatio,
              96 * pixelRatio
            )
            ctx.restore()
          }

          image.onerror = function(e) {
            console.log(e, 'eee')
          }
        })
      })
      .exec()
  }

  fetchActivityDetail = () => {
    const { activityId } = getTaroParams(Taro.getCurrentInstance?.())
    return fetchActivityDetail(activityId).then(({ data }) => {
      this.setState({ ...data })
    })
  }

  onGetUserInfo = e => {
    if (this.props.sessionId) return
    if (this.props.isLogining) {
      messageFeedback.showToast('登录中，请稍后')
    }
    const { iv, encryptedData } = e.detail
    if (iv && encryptedData) {
      Taro.showLoading({ title: '登录中...' })
      return this.props.dispatch({ type: 'user/login' }).then(() => {
        Taro.hideLoading()
        this.onStartBtnClick()
      })
    } else {
      messageFeedback.showToast('请先登录')
    }
  }

  onStartBtnClick = () => {
    const { drawStartDate, drawEndDate } = this.state
    if (this.state.flag === 2) {
      if (this.props.subscribe === '1') {
        messageFeedback.showToast(`活动开始时间为${drawStartDate}至${drawEndDate}`)
      } else {
        this.setState({ isFolllowModalVisible: true })
      }
      return
    }
    if (this.state.rotating || !this.props.sessionId || this.state.cooldown) return
    this.setState({ rotating: true, prize: null })
    const { activityId } = getTaroParams(Taro.getCurrentInstance?.())
    joinPrizeActivity(activityId)
      .then(({ data }) => {
        trackSvc.track(events.joinPrizeActivity)
        // const resultIndex = this.state.prizes.findIndex(p => p.id === data.activityPrizeId)
        this.timer = setTimeout(() => {
          this.setState(state => ({
            cooldown: true,
            rotating: false,
            prize: data,
            leftCount: state.leftCount - 1
          }))
          this.timer1 = setTimeout(() => {
            this.setState({ isPrizeModalVisible: true, cooldown: false })
          }, 1100)
        }, 1500)
      })
      .catch(() => {
        this.setState({ rotating: false })
      })
  }

  hidePrizeModal = () => {
    this.setState({ isPrizeModalVisible: false })
  }

  hideFollowModal = () => {
    this.setState({ isFolllowModalVisible: false })
  }

  onPrizeRecordClick = () => {
    const { activityId } = getTaroParams(Taro.getCurrentInstance?.())

    Taro.navigateTo({
      url: `/subpackages/functional/pages/prize_record/index?activityId=${activityId}`
    })
  }

  render() {
    const {
      rotating,
      prize,
      rules,
      leftCount,
      isPrizeModalVisible,
      prizes,
      isFolllowModalVisible,
      drawStartDate,
      drawEndDate
    } = this.state
    const prizeName = prize ? prize.name : ''
    const resultIndex = prizes.findIndex(p => prize && p.id === prize.activityPrizeId)
    const renderButton = !this.props.sessionId
    const buttonAnimation = leftCount > 0 && !rotating
    return (
      <View className={styles.activity}>
        <Image className={styles.bg} src={titleBg} />
        <View className={styles['activity__disc']}>
          <Image src={discBg} className={styles.activity__disc__bg} />
          <View className={styles.center}>
            <View
              className={classnames(styles['activity__disc__canvas'], {
                [styles['activity__disc__canvas--start']]: rotating,
                [styles[`activity__disc__canvas--result--${resultIndex}`]]:
                  resultIndex > 0 && !rotating
              })}
            >
              <Canvas
                className={classnames(styles['activity__disc__canvas'])}
                id='canvas'
                canvasId='canvas'
                type='2d'
              ></Canvas>
            </View>
          </View>
          {/* 转盘 */}

          {renderButton ? (
            <Button
              openType='getUserInfo'
              className={classnames(styles['activity__disc__button'], {
                [styles.animation]: buttonAnimation
              })}
              onClick={this.onStartBtnClick}
              onGetUserInfo={this.onGetUserInfo}
            >
              <Image src={buttonIcon} style={{ width: '100%', height: '100%' }}>
                {/* 按钮 */}
              </Image>
            </Button>
          ) : (
            <Image
              src={buttonIcon}
              className={classnames(styles['activity__disc__button'], {
                [styles.animation]: buttonAnimation
              })}
              onClick={this.onStartBtnClick}
            >
              {/* 按钮 */}
            </Image>
          )}
        </View>

        <View className={styles.activity__info}>
          <View className={styles.activity__info__count}>{`您还有${leftCount}次抽奖机会`}</View>
          <View className={styles.activity__info__record} onClick={this.onPrizeRecordClick}>
            我的中奖纪录
          </View>
          <View className={styles.activity__info__rule}>
            <View className={styles.activity__info__rule__title}>活动规则</View>
            <View className={styles.activity__info__rule__details}>
              {rules.map(rule => (
                <View className={styles.activity__info__rule__detail} key={rule.title}>
                  <View className={styles.activity__info__rule__subtitle}>{rule.title}</View>
                  <View>
                    {rule.content.map(c => (
                      <View key={c}>{c}</View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <JackPotModal
          visible={isPrizeModalVisible}
          prize={prizeName}
          activityPrizeId={prize ? prize.id : 0}
          code={prize ? prize.prizeCode : ''}
          onRequestClose={this.hidePrizeModal}
          expireDate={prize ? prize.expireDate : ''}
        />

        <FollowModal
          visible={isFolllowModalVisible}
          onRequestClose={this.hideFollowModal}
          startDate={drawStartDate}
          endDate={drawEndDate}
        />
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(ActivityPage) 