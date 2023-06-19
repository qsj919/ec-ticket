import Taro from '@tarojs/taro'
import React from 'react'
import { Image, View } from '@tarojs/components'
import {
  fetchDownStreamOrderDetail,
  fetchPrintConfig,
  printBarCodeByOrder,
  setPrintConfig
} from '@api/factory_api_manager'
import classnames from 'classnames'
import EButton from '@components/Button/EButton'
import { getTaroParams } from '@utils/utils'
import messageFeedback from '@services/interactive'
import InputModal from '../../components/InputModal'
import styles from './index.module.scss'
import { OrderDetail } from '../../types'

function groupSpu(data: OrderDetail[]) {
  return data.reduce((prev, cur) => {
    const target = prev.find(d => d.spuId === cur.spuId)
    if (target) {
      target.skus.push({ ...cur })
    } else {
      // target.skus = [{...cur}]
      prev.push({ ...cur, skus: [{ ...cur }] })
    }
    return prev
  }, [] as (OrderDetail & { skus: OrderDetail[] })[])
}

type State = {
  data: (OrderDetail & { skus: OrderDetail[] })[]
  isInputVisible: boolean
  printNo: string
}

export default class FactoryOrderDetail extends React.PureComponent<{}, State> {
  // config = {
  //   navigationBarTitleText: '订单明细'
  // }

  state = {
    data: [] as (OrderDetail & { skus: OrderDetail[] })[],
    isInputVisible: false,
    printNo: ''
  }

  componentDidMount() {
    this.fetchData()
    this.fetchPrintCode()
  }

  fetchData = async () => {
    const { mpErpId, billId } = getTaroParams(Taro.getCurrentInstance?.())
    Taro.showLoading({ title: '加载中...' })
    try {
      const { data } = await fetchDownStreamOrderDetail({ mpErpId, jsonParam: { billId } })
      this.setState({ data: groupSpu(data.rows) })
    } catch (e) {}
    Taro.hideLoading()
  }

  hideInput = () => {
    this.setState({ isInputVisible: false })
  }

  onPrintClick = () => {
    // messageFeedback.showAlertWithCancel('请输入打印机编号', '提示', this.print)
    this.setState({ isInputVisible: true })
  }

  setPrintCode = async (code: string) => {
    try {
      await setPrintConfig(code)
      messageFeedback.showToast('设置成功')
      this.fetchPrintCode()
    } catch (e) {
      this.setState({ isInputVisible: true })
    }
  }

  fetchPrintCode = async () => {
    const { data } = await fetchPrintConfig()
    this.setState({ printNo: data.printNo })
  }

  onPrint = async () => {
    const { mpErpId, billId } = getTaroParams(Taro.getCurrentInstance?.())

    // const jsonParam = this.state.data.skus
    //   .filter(sku => Number(sku.num) > 0)
    //   .map(sku => ({ styleid: sku.spuId, colorid: sku.colorId, sizeid: sku.sizeId, num: sku.num }))
    Taro.showLoading()
    try {
      // await setPrintConfig(code)
      await printBarCodeByOrder({ mpErpId, billId })
      Taro.hideLoading()
      messageFeedback.showToast('打印任务创建成功')
    } catch (e) {
      Taro.hideLoading()
      if (
        e.message.includes('打印机标识有误，请重新填写') ||
        e.message.includes('请先设置打印机配置')
      ) {
        this.setState({ isInputVisible: true })
      }
    }
  }

  render() {
    const { data, isInputVisible, printNo } = this.state
    return (
      <View className={styles.container}>
        <View className={styles.wrapper}>
          {data.map(order => (
            <View className={styles.order_item} key={order.spuId}>
              <View className={styles.order_item__top}>
                <Image className={styles.order_item__img} src={order.fileUrl} />
                <View>
                  <View style={{ fontSize: '28rpx', marginBottom: '8rpx' }}>{order.spuCode}</View>
                  <View style={{ fontSize: '24rpx', color: '#999' }}>{order.spuName}</View>
                </View>
              </View>
              <View>
                {order.skus &&
                  order.skus.map(or => (
                    <View key={or.mainId} className={classnames('jcsb aic', styles.row)}>
                      <View className='flex1'>{or.colorName}</View>
                      <View className={styles.row__size}>{or.sizeName}</View>
                      <View className='flex1 jcfe'>{`${or.num}件`}</View>
                    </View>
                  ))}
              </View>
            </View>
          ))}
        </View>
        <View className={styles.button}>
          <EButton
            labels={['设置打印机编号', '打印条码']}
            onLeftButtonClick={this.onPrintClick}
            onRightButtonClick={this.onPrint}
          />
        </View>

        <InputModal
          visible={isInputVisible}
          title='请输入打印机编号'
          onRequestClose={this.hideInput}
          onConfirm={this.setPrintCode}
          defaultInput={printNo}
        />
      </View>
    )
  }
}
