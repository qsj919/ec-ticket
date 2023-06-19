import Taro, { eventCenter } from '@tarojs/taro'
import React from 'react'
import { Image, View } from '@tarojs/components'
import {
  fetchDownStreamOrderDetail,
  fetchPrintConfig,
  printBarCodeBySkus,
  setPrintConfig
} from '@api/factory_api_manager'
import { getTaroParams } from '@utils/utils'
import classnames from 'classnames'
import EButton from '@components/Button/EButton'
import StepperV2 from '@components/StepperV2'
import messageFeedback from '@services/interactive'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { SlideDirection } from '@components/SlideContainer/type'
import qrImg from '../../images/we_chat.png'
import InputModal from '../../components/InputModal'
import styles from './index.module.scss'
import { FSpu, OrderDetail } from '../../types'

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
  data: FSpu
  isInputVisible: boolean
  printNo: string
  qrVisible: boolean
}

export default class FactoryOrderDetail extends React.PureComponent<{}, State> {
  // config = {
  //   navigationBarTitleText: '商品明细'
  // }

  state = {
    data: {} as FSpu,
    isInputVisible: false,
    printNo: '',
    qrVisible: false
  }

  componentDidMount() {
    const eventChannel = (Taro.getCurrentInstance()?.page as any).getOpenerEventChannel()
    eventChannel.on('print_spu', this.initData)
    this.fetchPrintCode()
  }

  initData = (data: FSpu) => {
    this.setState({ data })
  }

  onPrintClick = () => {
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
    const { mpErpId } = getTaroParams(Taro.getCurrentInstance?.())
    const jsonParam = this.state.data.rawSkus
      .filter(sku => Number(sku.num) > 0)
      .map(sku => ({ styleid: sku.spuId, colorid: sku.colorId, sizeid: sku.sizeId, num: sku.num }))
    if (jsonParam.length === 0) {
      return messageFeedback.showToast('请选择打印数量 ')
    }
    Taro.showLoading()
    try {
      await printBarCodeBySkus({ mpErpId, jsonParam })
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

  onStepperChange = (value: number, sId: number) => {
    this.setState(state => {
      const { data } = state
      const skus = data.rawSkus.map(sku => ({ ...sku, num: sId === sku.id ? value : sku.num }))
      return {
        data: { ...data, rawSkus: skus }
      }
    })
  }

  hideInput = () => {
    this.setState({ isInputVisible: false })
  }

  onTipClick = () => {
    this.setState({ qrVisible: true })
  }

  render() {
    const { data, isInputVisible, printNo, qrVisible } = this.state
    return (
      <View className={styles.container}>
        <View onClick={this.onTipClick} className={styles.tips}>
          点我添加企业微信，立享一键打印
        </View>
        <View className={styles.wrapper}>
          <View className={styles.order_item}>
            <View className={styles.order_item__top}>
              <Image className={styles.order_item__img} src={data.imgUrls} />
              <View>
                <View style={{ fontSize: '28rpx', marginBottom: '8rpx' }}>{data.spuCode}</View>
                <View style={{ fontSize: '24rpx', color: '#999' }}>{data.spuName}</View>
              </View>
            </View>
            <View>
              {data.rawSkus &&
                data.rawSkus.map(or => (
                  <View key={or.id} className={classnames('jcsb aic', styles.row)}>
                    <View className='flex1'>{or.color}</View>
                    <View className={styles.row__size}>{or.size}</View>
                    <View className='flex1 jcfe'>
                      <StepperV2
                        sId={or.id}
                        type='number'
                        onChange={this.onStepperChange}
                        value={Number(or.num) || 0}
                        min={0}
                      />
                    </View>
                  </View>
                ))}
            </View>
          </View>
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

        <SlideContainer
          direction={SlideDirection.Center}
          visible={qrVisible}
          containerClass='bg_trans'
          maxHeight={100}
          onRequestClose={() => this.setState({ qrVisible: false })}
        >
          <View className={styles.modal}>
            <Image className={styles.img} showMenuByLongpress src={qrImg} />
          </View>
        </SlideContainer>
      </View>
    )
  }
}
