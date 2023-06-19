import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Picker, Image } from '@tarojs/components'
import noDataImg from '@/images/no_data.png'
import { t } from '@models/language'
import { GlobalState } from '@@types/model_state'
import navigatorSvc from '@services/navigator'

import { getShopList } from '@api/apiManage'
import { getMonthLast, getOneDate, getTaroParams } from '@utils/utils'
import ShopChange from './component/shopChange'

import styles from './index.module.scss'

type StateType = {
  showNoData: boolean
  type: 'year' | 'month' | 'day'
  showShopChange: boolean
  canClick: boolean
  shopList: Array<{
    shopName: string
    logoUrl: string
    flag: number
    id: number
  }>
  dateStart: string
  dateEnd: string
  params: {
    sessionId: string
    shopName: string
    subscribe: string
    shopId: string
    epid: string
    sn: string
  }
}
interface Index {
  props: {}
  state: StateType
}

class Index extends Component {
  constructor(props) {
    super(props)
    const params = getTaroParams(Taro.getCurrentInstance?.())
    if (params.shopName === undefined) {
      params.shopName = ''
    } else {
      params.shopName = decodeURIComponent(params.shopName)
    }
    this.state = {
      showNoData: false,
      type: 'day',
      showShopChange: false,
      shopList: [],
      dateStart: '',
      dateEnd: '',
      canClick: false,
      params: {
        subscribe: params.subscribe,
        sessionId: params.sessionId,
        shopName: params.shopName || '',
        shopId: params.shopId,
        epid: params.epid,
        sn: params.sn
      }
    }
  }

  UNSAFE_componentWillMount() {
    const { params } = this.state
    const todayDate = getOneDate()
    getShopList({ sessionId: params.sessionId })
      .then(res => {
        const rows = res.data.rows || []
        const row = rows[0]
        if (rows.length > 0) {
          this.setState(
            {
              shopList: res.data.rows,
              params: {
                sessionId: params.sessionId,
                subscribe: params.subscribe,
                shopName: row.shopName,
                shopId: row.shopid,
                epid: row.epid,
                sn: row.sn
              },
              dateStart: todayDate,
              dateEnd: todayDate
            },
            () => {
              this.isBtnCanClick()
            }
          )
        } else {
          this.setState({ showNoData: true })
        }
      })
      .catch(err => console.log(err))
  }

  onShopChangeClick = () => {
    this.setState({ showShopChange: true })
  }

  onCancelClick = () => {
    this.setState({ showShopChange: false })
  }

  onConfirmClick = item => {
    this.setState(
      (prevState: StateType) => ({
        params: {
          sessionId: prevState.params.sessionId,
          subscribe: prevState.params.subscribe,
          shopName: item.shopName,
          shopId: item.shopid,
          epid: item.epid,
          sn: item.sn
        },
        showShopChange: false
      }),
      () => {
        this.isBtnCanClick()
      }
    )
  }

  onMergeTypeClick = type => {
    let todayDate = getOneDate()
    if (type === 'month') {
      const arr = todayDate.split('-')
      todayDate = `${arr[0]}-${arr[1]}`
    }
    this.setState({ type, dateStart: todayDate, dateEnd: todayDate }, () => {
      this.isBtnCanClick()
    })
  }

  isBtnCanClick = () => {
    const { dateEnd, dateStart, params } = this.state
    if (dateStart && dateEnd && params.shopId) {
      this.setState({ canClick: true })
    } else {
      this.setState({ canClick: false })
    }
  }

  onDateStartChange = e => {
    const { dateEnd } = this.state

    if (dateEnd) {
      // 苹果手机不兼容2018-09-09这种格式，需要转换成2018/09/09
      const dateS = new Date(e.detail.value.replace(/-/g, '/')).getTime()
      const dateE = new Date(dateEnd.replace(/-/g, '/')).getTime()
      if (dateS > dateE) {
        Taro.showToast({
          title: t('dateGtTip'),
          icon: 'none',
          duration: 3000
        })
      } else {
        this.setState({ dateStart: e.detail.value }, () => {
          this.isBtnCanClick()
        })
      }
    } else {
      this.setState({ dateStart: e.detail.value }, () => {
        this.isBtnCanClick()
      })
    }
  }

  onDateEndChange = e => {
    const { dateStart } = this.state
    if (dateStart) {
      // 苹果手机不兼容2018-09-09这种格式，需要转换成2018/09/09
      const dateS = new Date(dateStart.replace(/-/g, '/')).getTime()
      const dateE = new Date(e.detail.value.replace(/-/g, '/')).getTime()
      if (dateS > dateE) {
        Taro.showToast({
          title: t('dateLtTip'),
          icon: 'none',
          duration: 3000
        })
      } else {
        this.setState({ dateEnd: e.detail.value }, () => {
          this.isBtnCanClick()
        })
      }
    } else {
      this.setState({ dateEnd: e.detail.value }, () => {
        this.isBtnCanClick()
      })
    }
  }

  onMergePageClick = () => {
    const { params, canClick, dateStart, dateEnd, type } = this.state
    let prodate1 = ''
    let prodate2 = ''
    if (type === 'day') {
      prodate1 = dateStart
      prodate2 = dateEnd
    } else if (type === 'month') {
      prodate1 = `${dateStart}-01`
      const lastDay = getMonthLast(dateEnd).getDate()
      prodate2 = `${dateEnd}-${lastDay}`
    }
    const query = `sn=${params.sn}&epid=${params.epid}&sessionId=${params.sessionId}&shopId=${params.shopId}&shopName=${params.shopName}&dateStart=${prodate1}&dateEnd=${prodate2}`
    if (canClick) {
      navigatorSvc.navigateTo({ url: `/pages/mergeBill/mergeBill?${query}` })
    }
  }

  render() {
    const {
      showNoData,
      type,
      showShopChange,
      shopList,
      dateStart,
      dateEnd,
      canClick,
      params
    } = this.state
    return (
      <View>
        {!showNoData && (
          <View className={styles.mergeBillWrapper}>
            <View className={styles.top}>
              <View>小票汇总</View>
            </View>
            <View className={styles.body}>
              <View className={styles.bodyItem}>
                <View>店铺</View>
                <View className={styles.right} onClick={this.onShopChangeClick}>
                  <View>{params.shopName ? params.shopName : '选择店铺'}</View>
                  <View className='at-icon at-icon-chevron-right' />
                </View>
              </View>
              <View className={styles.bodyItem}>
                <View>汇总方式</View>
                <View className={styles.right} onClick={this.onMergeTypeClick.bind(this, 'day')}>
                  <View className={type === 'day' ? styles.check : styles.unCheck}>
                    <View className='at-icon at-icon-check' />
                  </View>
                  <View>按日</View>
                </View>
                <View className={styles.right} onClick={this.onMergeTypeClick.bind(this, 'month')}>
                  <View className={type === 'month' ? styles.check : styles.unCheck}>
                    <View className='at-icon at-icon-check' />
                  </View>
                  <View>按月</View>
                </View>
                {/* <View
              className={styles.right}
              onClick={this.onMergeTypeClick.bind(this, 'year')}
            >
              <View className={type === 'year' ? styles.check : styles.unCheck}>
                <View className='at-icon at-icon-check' />
              </View>
              <View>按年</View>
            </View> */}
              </View>
              <View className={styles.bodyItem}>
                <View>开始日期</View>
                <Picker
                  mode='date'
                  fields={type}
                  value={dateStart}
                  onChange={this.onDateStartChange}
                >
                  <View className={styles.right}>
                    <View>{dateStart ? dateStart : '选择日期'}</View>
                    <View className='at-icon at-icon-chevron-right' />
                  </View>
                </Picker>
              </View>
              <View className={styles.bodyItem}>
                <View>结束日期</View>
                <Picker mode='date' fields={type} value={dateEnd} onChange={this.onDateEndChange}>
                  <View className={styles.right}>
                    <View>{dateEnd ? dateEnd : '选择日期'}</View>
                    <View className='at-icon at-icon-chevron-right' />
                  </View>
                </Picker>
              </View>
            </View>
            <View className={styles.btn}>
              <View
                className={styles.confirm}
                style={canClick ? {} : { opacity: 0.49 }}
                onClick={this.onMergePageClick}
              >
                {' '}
                确定
              </View>
            </View>
            {showShopChange && (
              <ShopChange
                shopId={params.shopId}
                dataList={shopList}
                onCancel={this.onCancelClick}
                onConfirm={this.onConfirmClick}
              />
            )}
          </View>
        )}
        {showNoData && (
          <View className={styles.noDataPage}>
            <Image src={noDataImg} className={styles.img} />
            <View>暂无数据</View>
          </View>
        )}
      </View>
    )
  }
}

export default Index
