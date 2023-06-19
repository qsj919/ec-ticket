import Taro from '@tarojs/taro'
import React from 'react'
import { View, Block, Image } from '@tarojs/components'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import { connect } from 'react-redux'
import EImage from '@components/EImage'
import { enableVisitorIn } from '@api/shop_api_manager'
import DefaultGood from '@/images/default_good_pic.png'
import cn from 'classnames'
import { ALL_GOODS_PAGE_SIZE } from '@constants/index'
import { getDateLabel } from '@utils/utils'
import ColorSizeModelView from '../goods_detail/components/ColorSizeModelView'

import './index.scss'

const mapStateToProp = ({ cloudBill, loading, user }: GlobalState) => {
  return {
    boughtGoodsList: cloudBill.boughtGoodsList,
    mpErpId: cloudBill.mpErpId,
    mpUserId: user.mpUserId,
    colorSizeVisible: cloudBill.colorSizeVisible,
    shopBlackUser: cloudBill.shopParams.shopBlackUser === '1',
    isLoading:
      loading.effects['cloudBill/fetchGoodsList'] &&
      loading.effects['cloudBill/fetchGoodsList'].loading
  }
}

type StateProps = ReturnType<typeof mapStateToProp>

interface State {
  sortType: string
  biughtPageNo: number
  enableVisitor: boolean
}

const GOODS_TABS_MENU = [
  {
    label: '最新',
    value: 'lastDate'
  },
  {
    label: '最多',
    value: 'num'
  }
]

// @connect<StateProps, DefaultDispatchProps>(mapStateToProp)
class BoughtGoodsList extends React.Component<
  StateProps & DefaultDispatchProps,
  State
> {
  config?: Taro.Config | undefined = {
    navigationBarTitleText: '快速补货'
  }

  constructor(props) {
    super(props)

    this.state = {
      sortType: 'lastDate',
      biughtPageNo: 1,
      enableVisitor: true
    }
  }

  componentDidMount() {
    this.fetchBoughGoodsList()
    enableVisitorIn({
      mpErpId: this.props.mpErpId,
      mpUserId: this.props.mpUserId
    }).then(({ data }) => {
      this.setState({
        enableVisitor: data.val
      })
    })
  }

  onReachBottom() {
    if (
      (this.props.boughtGoodsList && this.props.boughtGoodsList.length) <
      ALL_GOODS_PAGE_SIZE * this.state.biughtPageNo
    )
      return
    this.fetchBoughGoodsList(true)
  }

  fetchBoughGoodsList = (loadMore = false) => {
    this.setState(
      prevState => ({
        biughtPageNo: loadMore ? prevState.biughtPageNo + 1 : 1
      }),
      this.dispatchBoughtGoodList
    )
  }

  onGoodsTabsClick = e => {
    this.setState(
      {
        sortType: e.currentTarget.dataset._value
      },
      this.dispatchBoughtGoodList
    )
  }

  dispatchBoughtGoodList = () => {
    this.props.dispatch({
      type: 'cloudBill/fetchBoughtGoodsList',
      payload: {
        pageNo: this.state.biughtPageNo,
        orderBy: this.state.sortType
      }
    })
  }

  onAddClick = e => {
    const { styleid } = e.currentTarget.dataset
    this.props.dispatch({
      type: 'cloudBill/showColorSizeInList',
      payload: { spuId: styleid }
    })
  }

  render() {
    const { boughtGoodsList, isLoading, colorSizeVisible, shopBlackUser } = this.props
    const { sortType, enableVisitor } = this.state
    return (
      <Block>
        <View style={{ zIndex: 500 }}>
          <ColorSizeModelView
            key='all_goods'
            visible={colorSizeVisible}
            type='buttons'
            // onVisibleChanged={}
          />
        </View>
        <View className='rightView'>
          {boughtGoodsList.length ? (
            <Block>
              <View className='rightView__replen_header aic jcsb'>
                <View className='rightView__replen_header__label'>本店历史拿货，一键补货</View>
                <View className='rightView__replen_header__orderTabs'>
                  {GOODS_TABS_MENU.map(item => (
                    <View
                      key={item.value}
                      className='rightView__replen_header__orderTabs___item'
                      style={{
                        backgroundColor: `${sortType === item.value ? '#fff' : ''}`,
                        boxShadow: `${
                          sortType === item.value ? '0 3px 7px rgba(0, 0, 0, 0.15)' : ''
                        }`
                      }}
                      data-_value={item.value}
                      onClick={this.onGoodsTabsClick}
                    >
                      {item.label}
                    </View>
                  ))}
                </View>
              </View>
              <View className='rightView__replen_content aic'>
                {boughtGoodsList.map(good => (
                  <View key={good.id} className='rightView__replen_content__item aic'>
                    <View className='rightView__replen_content__item__headerImage'>
                      {good.imgUrls ? (
                        <EImage src={good.imgUrls} mode='aspectFill' />
                      ) : (
                        <Image src={DefaultGood} style='width:100%;height:100%;' />
                      )}
                      {!enableVisitor && <View className='pic_blur_goods' />}
                    </View>
                    <View className='rightView__replen_content__item__content'>
                      <View
                        className={cn('replen_goodsName', {
                          ['blur_goodsinfo']: !enableVisitor
                        })}
                      >
                        {good.name}
                      </View>
                      <View
                        className={cn('replen_goodsCode', {
                          ['blur_goodsinfo']: !enableVisitor
                        })}
                      >
                        {good.code}
                      </View>
                      {enableVisitor && (
                        <View className='aic'>
                          <View className='replen_goodsTime aic jcc'>
                            {getDateLabel(good.lastDate && good.lastDate.split(' ')[0])}
                          </View>
                          <View className='replen_goodsTime aic jcc'>{`累计${good.num ||
                            '0'}件`}</View>
                        </View>
                      )}
                    </View>
                    {!(good.flag === 1 || good.marketFlag === 0) &&
                      enableVisitor &&
                      !shopBlackUser && (
                        <View
                          data-styleid={good.styleId}
                          className='rightView__replen_content__item__action aic jcc'
                          onClick={this.onAddClick}
                        >
                          补货
                        </View>
                      )}
                  </View>
                ))}
              </View>
            </Block>
          ) : (
            !isLoading && (
              <View className='aic col'>
                <View className='no_data aic jcc'>暂未找到拿货记录</View>
              </View>
            )
          )}
        </View>
      </Block>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProp)(BoughtGoodsList)