import Taro from '@tarojs/taro'
import React from 'react'
import { Image, View } from '@tarojs/components'
import { connect } from 'react-redux'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import messageFeedback from '@services/interactive'
import checkIcon from '@/images/checked_circle_36.png'
import uncheckedIcon from '@/images/icon/uncheck_circle.png'
import styles from './index.module.scss'

const options = [
  {
    title: '库存无关',
    desc: '云单商品的上下架不受库存影响',
    value: '0'
  },
  {
    title: '库存相关',
    desc: '仅库存为正的货品会自动上架，库存为零时不会下架，在云单中显示售罄，顾客无法下单。',
    value: '1'
  },
  {
    title: '库存相关 + 自动下架',
    desc: '仅库存为正的货品会自动上架，并且库存为零时自动下架，补充库存后自动重新上架。',
    value: '2'
  }
]

const mapStateToProps = ({ goodsManage }: GlobalState) => ({
  marketInvStrategy: goodsManage.marketInvStrategy
})

interface State {
  checkedIndex: number
}

type StateProps = ReturnType<typeof mapStateToProps>

type Props = StateProps & DefaultDispatchProps

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class GoodsMarketRule extends React.PureComponent<Props, State> {
  // config = {
  //   navigationBarTitleText: '上下架规则'
  // }

  state = {
    checkedIndex: 0
  }

  componentDidMount() {
    const currentOptionIndex = options.findIndex(o => o.value === this.props.marketInvStrategy)
    if (currentOptionIndex) {
      this.setState({ checkedIndex: currentOptionIndex })
    }
  }

  onOptionsClick = e => {
    const { index } = e.currentTarget.dataset
    this.setState({ checkedIndex: index })
  }

  onConfirm = async () => {
    Taro.showLoading({ title: '' })
    await this.props.dispatch({
      type: 'goodsManage/setShopGoodsMarketStrategy',
      payload: { value: options[this.state.checkedIndex].value }
    })
    Taro.hideLoading()
    messageFeedback.showToast('修改成功')
    Taro.navigateBack()
  }

  render() {
    const { checkedIndex } = this.state
    return (
      <View className={styles.container}>
        <View className={`${styles.rule} flex1`}>
          {options.map((o, idx) => (
            <View
              key={o.title}
              className={styles.rule__item}
              data-index={idx}
              onClick={this.onOptionsClick}
            >
              <View>
                <View className={styles.rule__item__title}>{o.title}</View>
                <View className={styles.rule__item__desc}>{o.desc}</View>
              </View>

              <Image
                src={idx === checkedIndex ? checkIcon : uncheckedIcon}
                className={styles.rule__item__check_icon}
              />
            </View>
          ))}
        </View>
        <View className={styles.goods_market_rule_btn} onClick={this.onConfirm}>
          确定
        </View>
      </View>
    )
  }
}
export default onnect<StateProps, DefaultDispatchProps>(mapStateToProps)(GoodsMarketRule)