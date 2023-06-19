import Taro from '@tarojs/taro'
import React, { PureComponent }  from 'react'
import { View, Image, Input, Text } from '@tarojs/components'
import EButton from '@components/Button/EButton'
import { AtActivityIndicator } from 'taro-ui'
import { fetchExpressProvider, combineExpress, findExpressProviderByNumber } from '@api/apiManage'
import { t } from '@models/language'
import messageFeedback from '@services/interactive'
import navigatorSvc from '@services/navigator'
import { getTaroParams } from '@utils/utils'
import checkIcon from '@/images/checked_circle_36.png'
import caretIcon from '@/images/caret_down_gray_32.png'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import debounce from 'lodash/debounce'
import styles from './index.module.scss'

interface Express {
  code: string
  name: string
  logoUrl: string
  id: number
}

interface State {
  number: string
  companies: Express[]
  activeCompany: Express | null
  isCompanyVisible: boolean
  findingCompany: boolean
  foundCompany: boolean
}

export default class CombineExpress extends React.PureComponent {
  config = {
    navigationBarTitleText: '关联快递'
  }

  state: State = {
    number: '',
    companies: [] as Express[],
    isCompanyVisible: false,
    activeCompany: null,
    findingCompany: false,
    foundCompany: false
  }

  componentDidMount() {
    fetchExpressProvider().then(({ data }) => {
      this.setState({ companies: data.rows })
    })
  }

  onNumberInput = e => {
    this.setState({ number: e.detail.value })
    this.findProvider()
  }

  findProvider = debounce(() => {
    const { activeCompany, companies, number } = this.state
    if (activeCompany || number.trim() === '') return
    this.setState({ findingCompany: true }, () => {
      findExpressProviderByNumber(number)
        .then(({ data }) => {
          const activeCompany = companies.find(c => c.id === data.id) || null
          this.setState({
            findingCompany: false,
            foundCompany: !!activeCompany,
            activeCompany
          })
        })
        .catch(() => {
          this.setState({ findingCompany: false })
        })
    })
  }, 300)

  onBtnClick = () => {
    const { number, activeCompany } = this.state
    const params = getTaroParams(Taro.getCurrentInstance?.()) as { sn: string; epid: string; pk: string }
    if (!number) {
      return messageFeedback.showToast('请输入快递单号')
    }
    if (!activeCompany) {
      return messageFeedback.showToast('请选择快递公司')
    }
    Taro.showLoading()

    combineExpress(number, activeCompany.id, params)
      .then(() => {
        const { sn, epid, pk } = params
        messageFeedback.showToast('关联成功')
        Taro.eventCenter.trigger('logisNoChange')
        navigatorSvc.redirectTo({
          url: `/subpackages/packages_detail/pages/express_track/index?number=${number}&providerId=${activeCompany.id}&sn=${sn}&epid=${epid}&pk=${pk}&from=combine`
        })
        Taro.hideLoading()
      })
      .catch(() => {
        Taro.hideLoading()
      })
  }

  showCompany = () => {
    if (this.state.findingCompany) return
    this.setState({ isCompanyVisible: true })
  }

  hideCompany = () => {
    this.setState({ isCompanyVisible: false })
  }

  onCompanyClick = (c: Express) => {
    this.setState({ activeCompany: c })
    this.hideCompany()
  }

  renderInputs = () => {
    const { number, activeCompany, findingCompany, foundCompany } = this.state
    const name = activeCompany ? activeCompany.name : ''
    return (
      <View className={styles.inputs}>
        <View className={styles.input}>
          {/* <Image className={styles.input__icon} src={mobile} /> */}
          <Text>{t('express:expressNumber')}</Text>
          <Input
            value={number}
            className={styles.input__input}
            placeholder={t('express:inputTip')}
            onInput={this.onNumberInput}
          />
        </View>
        <View className={styles.input} onClick={this.showCompany}>
          {/* <Image className={styles.input__icon} src={mobile} /> */}
          <Text>{t('express:expressCompany')}</Text>
          <Text className={styles.input__company}>{name}</Text>

          {findingCompany ? (
            <View className={styles.input__loading}>
              <AtActivityIndicator />
            </View>
          ) : (
            <Image className={styles.input__caret} src={caretIcon} />
          )}
        </View>
      </View>
    )
  }

  render() {
    const { isCompanyVisible, companies, activeCompany, foundCompany } = this.state
    return (
      <View className={styles.container}>
        <View className={styles.title}>{t('express:combineExpress')}</View>
        <View className={styles.sub_title}>{t('express:combineExpressTip')}</View>
        <View>{this.renderInputs()}</View>
        {foundCompany && (
          <View className={styles.tips}>
            <Text>快递公司如猜测错误，请手动更改</Text>
          </View>
        )}

        <View className={styles.button}>
          <EButton label={t('confirm')} size='large' onButtonClick={this.onBtnClick} />
        </View>

        <SlideContainer visible={isCompanyVisible} onRequestClose={this.hideCompany}>
          {companies.map(item => (
            <View
              className={styles.express_company}
              key={item.id}
              onClick={() => this.onCompanyClick(item)}
            >
              <Text>{item.name}</Text>
              {activeCompany && activeCompany.id === item.id && (
                <Image className={styles.icon} src={checkIcon} />
              )}
            </View>
          ))}
        </SlideContainer>
      </View>
    )
  }
}
