import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import React from 'react'
import { connect } from 'react-redux'
import { View, Image, Text, Input, Block } from '@tarojs/components'
import Taro, { Config } from '@tarojs/taro'
import checkIcon from '@/images/checked_circle_36.png'
import uncheckedIcon from '@/images/icon/uncheck_circle.png'
import messageFeedback from '@services/interactive'
import Tabs from '@components/Tabs'
import { isWeapp, setNavigationBarTitle } from '@utils/cross_platform_api'
import {
  oneClickMarket,
  getOneClickMarketSpuCount,
  getShopManageData,
  getBaseUnitOrderConversion,
  setBaseUnitOrderConversion
} from '@api/goods_api_manager'
import { getTaroParams } from '@utils/utils'
import myLog from '@utils/myLog'
import colors from '@@/style/colors'
import SwitchItemView from '../../components/SwitchItemView/SwitchItemView'
import { MODE } from '../../components/SwitchItemView/mode'
import rightIcon from '../../images/angle_right_gray_40.png'
import UserRange from '../../components/UseUserRange/index'
import UserTypeRange from '../../components/UseUserTypeRange/index'
import './index.scss'

const TAB_MENU = [
  { label: '货品', value: 0 },
  { label: '客户', value: 1 },
  { label: '订单', value: 2 },
  { label: '库存', value: 3 }
]

let options = [
  // {
  //   title: '库存无关',
  //   desc: '云单商品的上下架不受库存影响',
  //   value: '0'
  // },
  // {
  //   title: '库存相关',
  //   desc: '仅库存为正的货品会自动上架，库存为零时不会下架。',
  //   value: '1'
  // },
  // {
  //   title: '库存相关 + 自动下架',
  //   desc: '仅库存为正的货品会自动上架，并且库存为零时自动下架，补充库存后自动重新上架。',
  //   value: '2'
  // }
  {
    title: '无库存自动下架',
    desc: '',
    value: '2'
  },
  {
    title: '无库存不自动下架',
    desc: '',
    value: '1'
  }
]

const RulesMenu = [
  {
    label: '按扩展单位1换算系数',
    value: '1'
  },
  {
    label: '按扩展单位2换算系数',
    value: '2'
  }
]

const marketInvSourceOptions = [
  { label: '本门店库存', value: '0' },
  { label: '帐套内所有门店库存', value: '1' }
]

type priceTypeItem = {
  delflag: string
  flagname: string
  id: string
  name: string
  sid: string
}
interface State {
  swtichGroupBuy: boolean
  switchPrice: boolean
  switchSpu: boolean
  switchShopIsolate: boolean
  checkedIndex: number
  switchSoldOut: boolean
  switchStock: boolean
  switchAutoAuditOrder: boolean
  switchOrderPay: boolean
  switchVisitorAuth: boolean
  switchMenu: Array<{ flag: boolean; value: number }>
  switchBtn: boolean
  hotSwitchBtn: boolean
  days: number
  selectPriceType: priceTypeItem
  activeTabIndex: number
  // user_manage
  userTypeRangeShow: boolean
  userRangeShow: boolean
  priceTypeIsShow: boolean
  menu: Array<{ text: string; use: string; icon: string }>
  ruleNum: number
  typeList: Array<{
    delflag: string
    flag: string
    id: string
    modelClass: string
    name: string
    opstaffName: string
    optime: string
    sid: string
  }>
  marketInvSourceVisible: boolean
  switchStaffViewClientPhone: boolean
  switchOrderRules: boolean
  rulesValue: string
}

const mapStateToProps = ({ goodsManage, cloudBill }: GlobalState) => {
  return {
    groupBuy: goodsManage.groupBuy,
    spuShowPrice: goodsManage.spuShowPrice,
    shopShowSpu: goodsManage.shopShowSpu,
    shopShowSoldOut: goodsManage.shopShowSoldOut,
    marketInvStrategy: goodsManage.marketInvStrategy,
    autoAuditOrder: goodsManage.autoAuditOrder,
    orderPay: goodsManage.orderPay,
    shopProtectDays: goodsManage.shopProtectDays,
    hotSaleFlag: goodsManage.hotSaleFlag,
    priceTypeList: goodsManage.priceTypeList,
    shopDefaulPriceType: goodsManage.shopDefaulPriceType,
    shopVisitorAuth: goodsManage.shopVisitorAuth,
    userList: goodsManage.userList,
    rule: goodsManage.rule,
    mpErpId: goodsManage.mpErpId,
    orderBillListBeConfirmed: cloudBill.orderBillListBeConfirmed,
    shopIsolate: goodsManage.shopIsolate,
    marketInvSource: goodsManage.marketInvSource,
    tradeComponentStatus: goodsManage.tradeComponentStatus,
    enableApplyIndependent: goodsManage.enableApplyIndependent,
    allowStaffViewClientPhone: goodsManage.allowStaffViewClientPhone,
    staffInfo: goodsManage.staffInfo,
    saasProductType: goodsManage.saasProductType
  }
}
type StateProps = ReturnType<typeof mapStateToProps>
// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class priceShow extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config: Config = {
  //   navigationBarTitleText: '基础设置'
  //   // navigationStyle: 'custom'
  // }

  constructor(props: Readonly<StateProps & DefaultDispatchProps>) {
    super(props)
    this.state = {
      switchPrice: false,
      switchSpu: false,
      switchSoldOut: false,
      switchStock: false,
      switchAutoAuditOrder: false,
      switchOrderPay: false,
      swtichGroupBuy: false,
      priceTypeIsShow: false,
      switchShopIsolate: false,
      switchVisitorAuth: false,
      switchOrderRules: false,
      checkedIndex: 0,
      activeTabIndex: 0,
      switchStaffViewClientPhone: true,
      rulesValue: '',
      switchMenu: [
        {
          flag: false,
          value: 3
        },
        {
          flag: false,
          value: 5
        },
        {
          flag: false,
          value: 7
        },
        {
          flag: false,
          value: 10
        }
      ],
      switchBtn: false,
      hotSwitchBtn: false,
      days: 0,
      selectPriceType: {} as priceTypeItem,
      // user_manage
      userRangeShow: false,
      userTypeRangeShow: false,
      ruleNum: -1,
      typeList: [],
      menu: [
        {
          text: '新款、爆款可见范围',
          use: '全部客户可见',
          icon: rightIcon
        },
        {
          text: '可见客户类型',
          use: '无',
          icon: rightIcon
        }
      ],
      marketInvSourceVisible: props.enableApplyIndependent
    }
  }

  componentDidMount = async () => {
    Taro.showLoading({ title: '请稍等...' })
    await this.props.dispatch({ type: 'goodsManage/batchSelectAllShopParams' })
    this.userManageInit()
    this.orderInit()
    await this.init()
    this.inventoryInit()
    Taro.hideLoading()
  }

  componentDidShow() {
    setNavigationBarTitle('基础设置')
  }

  init = async () => {
    const currentOptionIndex = options.findIndex(o => o.value === this.props.marketInvStrategy)
    if (currentOptionIndex) {
      this.setState({ checkedIndex: currentOptionIndex })
    }
    await Promise.all([
      this.props.dispatch({ type: 'goodsManage/selectShopParamSpuShowInv' }),
      this.props.dispatch({
        type: 'goodsManage/selectShopProtectDays'
      }),
      this.props.dispatch({
        type: 'goodsManage/selectShopPriceTypeList'
      }),
      this.props.dispatch({
        type: 'goodsManage/selectMarketShopIsolate'
      }),
      this.props.dispatch({ type: 'goodsManage/selectMarketInvSource' }),
      this.props.dispatch({ type: 'goodsManage/selectShopGroupBuyVal' }),
      this.props.dispatch({ type: 'goodsManage/selectShopHotSale' })
    ])
    let ruleRes
    if (this.props.saasProductType === 40) {
      ruleRes = await getBaseUnitOrderConversion({ mpErpId: this.props.mpErpId })
    }
    const {
      spuShowPrice,
      marketInvStrategy,
      shopProtectDays,
      priceTypeList,
      shopDefaulPriceType,
      shopIsolate,
      groupBuy,
      hotSaleFlag
    } = this.props
    this.state.switchMenu.map((item, i) => {
      if (item.value === shopProtectDays) {
        this.onMenuClick(i)
      }
    })
    this.setState({
      swtichGroupBuy: groupBuy === '1',
      switchPrice: spuShowPrice === '1',
      switchStock: marketInvStrategy !== '0',
      days: shopProtectDays,
      switchBtn: shopProtectDays > 0,
      hotSwitchBtn: Number(hotSaleFlag) > 0,
      switchShopIsolate: shopIsolate === '1',
      rulesValue: ruleRes && ruleRes.data.val !== 0 ? `${ruleRes.data.val || ''}` : '',
      switchOrderRules: ruleRes && ruleRes.data.val !== 0 && `${ruleRes.data.val}` !== '',
      selectPriceType:
        priceTypeList[priceTypeList.findIndex(item => item.sid === shopDefaulPriceType)]
    })
  }

  userManageInit = async () => {
    // if (this.props.mpErpId) {
    //   this.props.dispatch({
    //     type: 'goodsManage/selelctShopProfileInformation',
    //     payload: {
    //       mpErpId: this.props.mpErpId
    //     }
    //   })
    // }
    await this.props.dispatch({
      type: 'goodsManage/selestShopParamVisitorAuth'
    })

    await this.props
      .dispatch({
        type: 'goodsManage/selectUserType',
        payload: {
          mpErpId: this.props.mpErpId
        }
      })
      .then(() => {
        this.initType()
        const { menu } = this.state
        if (this.props.rule == 0) {
          // _menu[0].use = '全部客户可见'
          this.setState(prevState => {
            prevState.menu[0].use = '全部客户可见'
            return {
              menu: [...prevState.menu]
            }
          })
          if (menu.length > 1) {
            this.setState(prevState => {
              prevState.menu.pop()
              return {
                menu: [...prevState.menu]
              }
            })
          }
        } else if (this.props.rule == 1) {
          // _menu[0].use = '部分客户可见'
          this.setState(prevState => {
            prevState.menu[0].use = '部分客户可见'
            return {
              menu: [...prevState.menu]
            }
          })
        } else {
          // _menu[0].use = '部分客户不可见'
          this.setState(prevState => {
            prevState.menu[0].use = '部分客户不可见'
            return {
              menu: [...prevState.menu]
            }
          })
        }
        this.setState({
          typeList: this.props.userList,
          ruleNum: this.props.rule,
          switchVisitorAuth: this.props.shopVisitorAuth === '1',
          switchStaffViewClientPhone: this.props.allowStaffViewClientPhone === '1'
        })
      })
  }

  orderInit = async () => {
    // 在前一个页面 如果不为new，则表示已经调过selectShopParamAutoAuditOrder
    if (getTaroParams(Taro.getCurrentInstance?.()).type === 'new') {
      await this.props.dispatch({
        type: 'goodsManage/selectShopParamAutoAuditOrder'
      })
    }

    this.props.dispatch({
      type: 'cloudBill/selectAuditBillList',
      payload: {
        mpErpId: this.props.mpErpId,
        auditFlag: 1,
        pageNo: 1
      }
    })
    this.setState({
      switchAutoAuditOrder: this.props.autoAuditOrder === '1',
      switchOrderPay: this.props.orderPay === '1'
    })
  }

  inventoryInit = async () => {
    const { shopShowSpu, shopShowSoldOut } = this.props
    this.setState({
      switchSpu: shopShowSpu === '1',
      switchSoldOut: shopShowSoldOut === '1'
    })
  }

  //选择可见范围
  onRangeItemClick = m => {
    const { menu } = this.state
    //是否添加第二选项
    if (m.rule == 0 && menu.length == 2) {
      // menu.pop()
      this.setState(prevState => {
        prevState.menu.pop()
        return {
          menu: [...prevState.menu]
        }
      })
    }
    if (m.rule > 0) {
      if (menu.length == 1) {
        const { userList } = this.props
        const val = userList
          .filter(item => item.flag == '1')
          .map(m => m.name)
          .join('、')
        this.setState(prevState => {
          prevState.menu.push({
            text: '可见客户类型',
            use: val || '请选择',
            icon: rightIcon
          })
          return {
            menu: [...prevState.menu]
          }
        })
      }
    }
    if (m.rule != -1) {
      // _menu[0].use = m.text
      this.setState(prevState => {
        prevState.menu[0].use = m.text
        return {
          menu: [...prevState.menu]
        }
      })
      this.props.dispatch({
        type: 'goodsManage/selectUserType',
        payload: { mpErpId: this.props.mpErpId }
      })
    }
    this.setState({ ruleNum: m.rule == -1 ? this.state.ruleNum : m.rule })
    this.setState({ userRangeShow: false })
  }
  initType = () => {
    const { userList } = this.props
    const { menu } = this.state
    const useUserY = userList.filter(item => item.flag == '1')
    if (menu.length > 1) {
      if (useUserY.length > 0) {
        this.setState(prevState => {
          prevState.menu[1].use = useUserY.map(m => m.name).join('、')
          return {
            menu: [...prevState.menu]
          }
        })
      }
    }
  }
  //选择类型
  onTypeItemClick = (m, i) => {
    if (i === -1 || i === -2) {
      this.setState({ typeList: m })
      this.setState({ userTypeRangeShow: false })
    }
    if (i === -2) {
      const useUserY = m.filter(item => item.flag === '1')
      this.setState(prevState => {
        prevState.menu[1].use = useUserY.map(m => m.name).join('、')
        return {
          menu: [...prevState.menu]
        }
      })
      if (useUserY.length == 0) {
        this.setState(prevState => {
          prevState.menu[1].use = '请选择'
          return {
            menu: [...prevState.menu]
          }
        })
        return
      }
    }
  }
  //客户管理
  onCenterItemClick = i => {
    if (i == 0) {
      this.setState({ userRangeShow: true })
      return
    }
    this.setState({ userTypeRangeShow: true })
  }

  onSwitchChange = e => {
    if (!e.detail.value) {
      this.clearSwitchStatu()
      this.setState({ days: 0 })
    } else {
      this.onMenuClick(0)
    }
    this.setState({ switchBtn: e.detail.value })
  }

  onHotSwitchChange = e => {
    this.setState({ hotSwitchBtn: e.detail.value })
  }
  onOrderRulesChange = e => {
    this.setState({
      switchOrderRules: e.detail.value
    })
  }

  onRulesClick = () => {
    Taro.showActionSheet({
      itemList: RulesMenu.map(item => item.label),
      success: (res: any) => {
        this.setState({
          rulesValue: RulesMenu[res.tapIndex].value
        })
      },
      fail: () => {
        this.setState({
          rulesValue: ''
        })
      }
    })
  }

  getRulesValue = () => {
    const currentRule = RulesMenu.find(item => item.value === this.state.rulesValue)
    if (currentRule) {
      return currentRule.label
    }
    return '请选择'
  }

  onMenuClick = i => {
    this.clearSwitchStatu()
    this.setState(prevState => {
      const arr = prevState.switchMenu.map((item, index) => {
        return { ...item, flag: i === index }
      })
      return {
        days: prevState.switchMenu[i].value,
        switchBtn: true,
        switchMenu: [...arr]
      }
    })
  }

  clearSwitchStatu = () => {
    this.setState(prevState => {
      const arr = prevState.switchMenu.map(item => {
        return { ...item, flag: false }
      })
      return {
        switchMenu: [...arr]
      }
    })
  }
  setDay = e => {
    const days = parseInt(e.detail.value || 0)
    if (days > 0) {
      this.setState({
        days,
        switchBtn: days > 0
      })
    } else {
      this.setState({
        days: 0
      })
      messageFeedback.showToast('请输入天数')
    }
    let clear = false
    this.state.switchMenu.forEach((item, i) => {
      if (item.value === days) {
        this.onMenuClick(i)
        clear = true
      }
    })
    if (!clear) this.clearSwitchStatu()
  }

  onOptionsClick = e => {
    const { index } = e.currentTarget.dataset
    this.setState({ checkedIndex: index })

    this.props.dispatch({
      type: 'goodsManage/setShopGoodsMarketStrategy',
      payload: {
        value: options[index].value
      }
    })
  }

  getMenu = () => {
    const { switchPrice, selectPriceType } = this.state
    return [
      {
        label: '价格设置',
        menuItems: [
          {
            title: '展示价格',
            explain: '开启后客户可以看到商品价格',
            defaultValue: switchPrice,
            func: this.onPriceSwitchChange,
            mode: MODE.switch,
            id: '0'
          },
          {
            title: '价格展示类型',
            explain: '未设置适用价的客户看到的价格',
            defaultValue: (selectPriceType && selectPriceType.name) || '请选择',
            func: this.onSelectClick,
            mode: MODE.selectBox,
            id: '1'
          }
        ]
      }
    ]
  }

  getStockMenu = () => {
    const { switchSpu, switchSoldOut, switchStock, marketInvSourceVisible } = this.state
    const { marketInvSource } = this.props
    const marketLabel = marketInvSourceOptions.find(
      item => item.value === (marketInvSource || '0')
    ) as { label: string; value: string }

    const marketInvSourceItem = {
      title: '库存来源',
      explain: '选择云单库存来源',
      defaultValue: marketLabel.label,
      func: this.onMarketInvSourceChange,
      mode: MODE.selectBox,
      id: '3'
    }
    const result = [
      {
        label: '库存设置',
        menuItems: [
          {
            title: '展示库存',
            explain: '开启后客户可以看到商品库存',
            defaultValue: switchSpu,
            func: this.onSpuSwitchChange,
            mode: MODE.switch,
            id: '2'
          },
          {
            title: '展示售罄',
            explain: '无库存的商品显示为售罄且不可下单',
            defaultValue: switchSoldOut,
            func: this.onSoldOutSwitchChange,
            mode: MODE.switch,
            id: '3'
          }
        ]
      },
      {
        label: '上下架规则',
        menuItems: [
          {
            title: '库存影响上下架',
            explain: '开启后为正的库存才会上架',
            defaultValue: switchStock,
            func: this.onStockSwitchChange,
            mode: MODE.switch,
            id: '4'
          }
        ]
      }
    ]

    if (marketInvSourceVisible) {
      result[0].menuItems.push(marketInvSourceItem)
    }

    return result
  }

  onPriceSwitchChange = e => {
    this.setState({ switchPrice: e.detail.value })
  }
  onSelectClick = () => {
    this.setState({
      priceTypeIsShow: true
    })
    Taro.showActionSheet({
      itemList: this.getPriceTypeList()
    })
      .then(res => {
        this.setState({
          priceTypeIsShow: false,
          selectPriceType: this.props.priceTypeList.filter(item => item.delflag === '1')[
            res.tapIndex
          ]
        })
      })
      .catch(err => {
        this.setState({
          priceTypeIsShow: false
        })
        console.log(err, 'goods_setting')
      })
  }

  getPriceTypeList = () => {
    const { priceTypeList } = this.props
    let arr: Array<string> = []
    priceTypeList
      .filter(item => item.delflag === '1')
      .forEach(item => {
        arr.push(item.name)
      })
    return arr
  }

  onSpuSwitchChange = e => {
    this.setState({ switchSpu: e.detail.value })
  }
  onSoldOutSwitchChange = e => {
    this.setState({ switchSoldOut: e.detail.value })
  }
  onStockSwitchChange = e => {
    this.setState({ switchStock: e.detail.value })
    if (!e.detail.value) {
      this.props.dispatch({
        type: 'goodsManage/setShopGoodsMarketStrategy',
        payload: {
          value: 0
        }
      })
    }
  }

  onVisitorAuthClick = e => {
    this.setState({ switchVisitorAuth: e.detail.value })
    if (this.props.tradeComponentStatus === '1' && e.detail.value) {
      // 弹窗
      Taro.showModal({
        confirmText: '仍要开启',
        confirmColor: colors.themeColor,
        content: '您已开启视频号直播功能，若开启访客认证会影响直播效果，请谨慎选择'
      }).then(res => {
        console.log(res, 'res')
        if (res.cancel) {
          this.setState({ switchVisitorAuth: false })
        }
      })
    }
  }

  onStaffViewClientPhoneClick = e => {
    this.setState({ switchStaffViewClientPhone: e.detail.value })
  }

  onAutoAuditOrderChange = e => {
    this.setAuditOrderChange(e.detail.value)
  }

  onMarketInvSourceChange = e => {
    // console.log(e.detail.value, 'valu')
    Taro.showActionSheet({
      itemList: marketInvSourceOptions.map(op => op.label)
    }).then(v => {
      if (v.tapIndex > -1) {
        Taro.showLoading()
        const value = marketInvSourceOptions[v.tapIndex].value
        this.props
          .dispatch({ type: 'goodsManage/updateMarketInvSource', payload: { value } })
          .then(() => {
            Taro.hideLoading()
          })
          .catch(() => {
            Taro.hideLoading()
          })
      }
    })
  }

  setAuditOrderChange = (value, pay?: boolean) => {
    this.setState({ switchAutoAuditOrder: value })
    if (value) {
      if (this.props.orderBillListBeConfirmed.length > 0) {
        messageFeedback.showAlert(
          '您还有来自云单的订单未确认，请前往订单模块内处理云单订单，处理后可开启自动确认',
          '提示',
          '去处理',
          () => {
            Taro.redirectTo({
              url: '/subpackages/cloud_bill/pages/order_bill_screen/index'
            })
          }
        )
        return
      }
    }
    this.setShopParam('auto_audit_order', value ? '1' : '0')
    if (pay) {
      this.setShopParam('order_pay', '1')
    }
  }

  onPayChange = e => {
    this.setState({ switchOrderPay: e.detail.value })
    if (e.detail.value) {
      if (!this.state.switchAutoAuditOrder) {
        messageFeedback.showAlert(
          '开启在线支付参数必须要开启自动确认订单参数',
          '提示',
          '好的',
          () => {
            this.setAuditOrderChange(true, true)
          }
        )
      } else {
        this.setShopParam('order_pay', '1')
      }
    } else {
      this.setShopParam('order_pay', '0')
    }
  }

  onGroupBuyChange = e => {
    this.setState({ swtichGroupBuy: e.detail.value })

    this.setShopParam('order_by_group', e.detail.value ? '1' : '0')
  }

  setShopParam = (code: string, val: string) => {
    this.props
      .dispatch({
        type: 'goodsManage/updateShopParamVal',
        payload: {
          code,
          val
        }
      })
      .catch(() => {
        const keyMap = {
          order_by_group: 'swtichGroupBuy',
          order_pay: 'switchOrderPay'
        }
        const key = keyMap[code]
        if (key) {
          this.setState({ [key]: val !== '1' })
        }
      })
  }

  submitBtnClick = async () => {
    const {
      switchPrice,
      switchSpu,
      switchSoldOut,
      switchStock,
      days,
      selectPriceType,
      typeList,
      ruleNum,
      switchAutoAuditOrder,
      switchShopIsolate,
      switchVisitorAuth,
      switchStaffViewClientPhone,
      rulesValue,
      switchOrderRules,
      hotSwitchBtn
    } = this.state
    Taro.showLoading({ title: '请稍等...' })
    if (ruleNum == 0) {
      this.props.dispatch({
        type: 'goodsManage/updateUserType',
        payload: {
          mpErpId: this.props.mpErpId,
          rule: ruleNum
        }
      })
    } else {
      let valList = typeList.filter(m => m.flag === '1')
      if (valList.length == 0) {
        Taro.showToast({
          title: '请选择',
          icon: 'none',
          duration: 2000
        })
        Taro.hideLoading()
        return
      } else {
        this.props.dispatch({
          type: 'goodsManage/updateUserType',
          payload: {
            mpErpId: this.props.mpErpId,
            rule: ruleNum,
            val: valList.map(m => m.sid).join(',')
          }
        })
      }
    }
    if (switchPrice) {
      if (selectPriceType) {
        await this.props.dispatch({
          type: 'goodsManage/updateShopParamVal',
          payload: {
            code: 'spu_default_price_type',
            val: selectPriceType.sid
          }
        })
      } else {
        Taro.showToast({
          title: '请选择价格展示类型',
          icon: 'none',
          duration: 2000
        })
        Taro.hideLoading()
        return
      }
    }
    if (this.state.checkedIndex !== -1 || !switchStock) {
      await this.props.dispatch({
        type: 'goodsManage/setShopGoodsMarketStrategy',
        payload: {
          value: switchStock ? options[this.state.checkedIndex].value : 0
        }
      })
    } else {
      Taro.showToast({
        title: '请选择下架规则',
        icon: 'none',
        duration: 2000
      })
      Taro.hideLoading()
      return
    }
    if (this.props.saasProductType === 40) {
      if (switchOrderRules && rulesValue) {
        await setBaseUnitOrderConversion({
          mpErpId: this.props.mpErpId,
          value: rulesValue
        })
      } else {
        await setBaseUnitOrderConversion({
          mpErpId: this.props.mpErpId,
          value: 0
        })
      }
    }
    this.props.dispatch({
      type: 'goodsManage/updateShopParamVal',
      payload: {
        code: 'spu_show_price',
        val: switchPrice ? '1' : '0'
      }
    })
    this.props.dispatch({
      type: 'goodsManage/updateMarketShopIsolate',
      payload: {
        value: switchShopIsolate ? '1' : '0'
      }
    })

    this.props.dispatch({
      type: 'goodsManage/updateShopParamVal',
      payload: {
        code: 'allow_staff_view_client_phone',
        val: switchStaffViewClientPhone ? '1' : '0'
      }
    })
    await this.props.dispatch({
      type: 'goodsManage/updateShopParamVal',
      payload: {
        code: 'visitor_auth',
        val: switchVisitorAuth ? '1' : '0'
      }
    })
    await this.props.dispatch({
      type: 'goodsManage/updateShopParamVal',
      payload: {
        code: 'spu_show_inv',
        val: switchSpu ? '1' : '0'
      }
    })
    await this.props.dispatch({
      type: 'goodsManage/updateShopParamVal',
      payload: {
        code: 'spu_show_sold_out',
        val: switchSoldOut ? '1' : '0'
      }
    })
    await this.props.dispatch({
      type: 'goodsManage/updateShopProtectDays',
      payload: {
        pubDelayDay: days
      }
    })
    await this.props.dispatch({
      type: 'goodsManage/updateShopParamVal',
      payload: {
        code: 'system_recommend_hot_spu',
        val: hotSwitchBtn ? '1' : '0'
      }
    })
    if (getTaroParams(Taro.getCurrentInstance?.()).type === 'new') {
      this.onGoodsShelves()
    } else {
      Taro.hideLoading()
      Taro.navigateBack()
    }
  }
  onTabClick = index => {
    if (getTaroParams(Taro.getCurrentInstance?.()).type === 'normal') {
      this.setState({ activeTabIndex: index })
    }
  }

  onGoodsShelves = () => {
    Taro.showLoading({ title: '请稍等...' })
    const { mpErpId } = this.props
    oneClickMarket({
      mpErpId
    })
      .then(({ code }) => {
        Taro.hideLoading()
        if (code === 0) {
          getOneClickMarketSpuCount({ mpErpId })
            .then(({ data }) => {
              Taro.hideLoading()
              const _count = Number(data.val)
              if (_count === 0) {
                messageFeedback.showAlert(
                  '可能原因：货品没有图片，不满足库存、新款保护要求等\n您可以手动上架',
                  '没有符合条件的货品',
                  '好的',
                  () => {
                    Taro.eventCenter.trigger('IS_NEED_GUIDE')
                    Taro.redirectTo({ url: '/subpackages/cloud_bill/pages/goods_manage/index' })
                  }
                )
              } else if (_count > 0 && _count < 100) {
                messageFeedback.showAlert(`即将为您上架${data.val}个货品`, '', '好的', () => {
                  Taro.eventCenter.trigger('IS_NEED_GUIDE')
                  Taro.redirectTo({ url: '/subpackages/cloud_bill/pages/goods_manage/index' })
                })
              } else if (_count > 100) {
                messageFeedback.showAlert(
                  `即将为您上架${data.val}个货品\n货品较多，需要花费几秒的时间`,
                  '',
                  '好的',
                  () => {
                    Taro.eventCenter.trigger('IS_NEED_GUIDE')
                    Taro.redirectTo({ url: '/subpackages/cloud_bill/pages/goods_manage/index' })
                  }
                )
              }
            })
            .catch(e => {
              Taro.hideLoading()
            })
        }
      })
      .catch(e => {
        Taro.hideLoading()
        myLog.log(`新用户一键上架失败${e}`)
      })
  }

  onNextClick = () => {
    if (this.state.activeTabIndex === 3) {
      // 保存
      this.submitBtnClick()
    } else {
      if (this.state.activeTabIndex === 0) {
        if (!this.state.selectPriceType && this.state.switchPrice) {
          Taro.showToast({
            title: '请选择价格展示类型',
            icon: 'none',
            duration: 2000
          })
          return
        }
      }
      this.setState(prevState => ({
        activeTabIndex: prevState.activeTabIndex + 1
      }))
    }
  }

  onPreClick = () => {
    this.setState(prevState => ({
      activeTabIndex: prevState.activeTabIndex - 1
    }))
  }

  renderActionView = () => {
    const { activeTabIndex } = this.state
    return (
      <View className='action_view'>
        {activeTabIndex === 0 ? (
          <View className='action_view__next' onClick={this.onNextClick}>
            下一步
          </View>
        ) : (
          <View className='action_view__pre'>
            <View className='action_view__pre___left' onClick={this.onPreClick}>
              上一步
            </View>
            <View className='action_view__pre___right' onClick={this.onNextClick}>
              {activeTabIndex === 3 ? '完成设置，一键上架' : '下一步'}
            </View>
          </View>
        )}
      </View>
    )
  }

  onShopIsolteClick = e => {
    this.setState({
      switchShopIsolate: e.detail.value
    })
  }

  render() {
    const goodsSettingMenu = this.getMenu()
    const stockMenu = this.getStockMenu()
    const {
      checkedIndex,
      switchStock,
      switchMenu,
      switchPrice,
      switchBtn,
      hotSwitchBtn,
      days,
      activeTabIndex,
      userRangeShow,
      userTypeRangeShow,
      menu,
      typeList,
      switchAutoAuditOrder,
      priceTypeIsShow,
      switchShopIsolate,
      switchVisitorAuth,
      switchOrderPay,
      swtichGroupBuy,
      switchStaffViewClientPhone,
      switchOrderRules
    } = this.state
    const { staffInfo, saasProductType } = this.props
    const { type } = getTaroParams(Taro.getCurrentInstance?.())
    return (
      <View className='moneyShow_wrap'>
        <View className='tabsView'>
          <Tabs
            data={TAB_MENU}
            activeIndex={activeTabIndex}
            underlineColor='#E62E4D'
            textColor='#222'
            activeColor='#E62E4D'
            onTabItemClick={this.onTabClick}
            margin={115}
          />
        </View>
        {activeTabIndex === 0 && (
          <View>
            {goodsSettingMenu.map(v => (
              <View key={v.label}>
                <View className='label'>{v.label}</View>
                {v.menuItems.map(
                  item =>
                    (item.id !== '1' || (item.id === '1' && switchPrice)) && (
                      <SwitchItemView
                        key={item.mode}
                        title={item.title}
                        explain={item.explain}
                        defaultValue={item.defaultValue}
                        onItemClick={item.func}
                        mode={item.mode}
                      />
                    )
                )}
              </View>
            ))}
            <View className='label'>自动上下架</View>
            <SwitchItemView
              title='门店隔离'
              explain='开启后仅自动上架当前门店的货品'
              defaultValue={switchShopIsolate}
              onItemClick={this.onShopIsolteClick}
              mode={MODE.switch}
            />
            <SwitchItemView
              title='新款保护'
              explain='开启后新款不自动上架'
              defaultValue={switchBtn}
              onItemClick={this.onSwitchChange}
              mode={MODE.switch}
            />
            <View
              className={`protection_wrap_center ${
                switchBtn ? 'protection_wrap_centerY' : 'protection_wrap_centerN'
              }`}
            >
              <View
                style={{ borderTop: '0.5px solid #f7f7f7' }}
                className='protection_wrap_center_item'
              >
                <Text>新款保护时间</Text>
                <View className='protection_wrap_center_item_inputView'>
                  <Input
                    className='protection_wrap_center_item_inputView_input'
                    type='number'
                    placeholder='请输入天数'
                    value={days === 0 ? '' : days + ''}
                    onInput={this.setDay}
                  ></Input>
                  天
                </View>
              </View>
              <View className='protection_wrap_center_switchItems'>
                <View className='protection_wrap_center_switchItems_switchTab'>
                  {switchMenu.map((item, i) => (
                    <View
                      key={item.value}
                      className={`protection_wrap_center_switchItems_switchTab_item ${
                        item.flag ? 'chooseItemY' : 'chooseItemN'
                      }`}
                      onClick={() => {
                        this.onMenuClick(i)
                      }}
                    >
                      <Text>{item.value}天</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            {saasProductType === 40 && (
              <Block>
                <View className='label'>下单设置</View>
                <SwitchItemView
                  title='下单规则'
                  explain='开启后可设置基础单位下单规则'
                  defaultValue={switchOrderRules}
                  mode={MODE.switch}
                  onItemClick={this.onOrderRulesChange}
                />
                {switchOrderRules && (
                  <SwitchItemView
                    title='选择规则'
                    explain='基础单位下单试用数量'
                    defaultValue={this.getRulesValue()}
                    mode={MODE.selectBox}
                    onItemClick={this.onRulesClick}
                  />
                )}
              </Block>
            )}
            <View className='label'>推荐设置</View>
            <SwitchItemView
              title='爆款系统推荐'
              explain='开启后系统将自动推送爆款商品'
              defaultValue={hotSwitchBtn}
              onItemClick={this.onHotSwitchChange}
              mode={MODE.switch}
            />
          </View>
        )}
        {activeTabIndex === 1 && (
          <View className='user_manage_wrap'>
            <View className='label'>货品可见范围管理</View>
            <View className='user_manage_wrap_center'>
              {menu.map((item, i) => {
                return (
                  <View
                    key={i}
                    className='user_manage_wrap_center_item'
                    onClick={this.onCenterItemClick.bind(this, i)}
                  >
                    <Text className='item_one'>{item.text}</Text>
                    <View style={{ display: 'flex', alignItems: 'center' }}>
                      <Text className='item_two'>{item.use}</Text>
                      <Image className='item_image' src={item.icon}></Image>
                    </View>
                  </View>
                )
              })}
            </View>
            <View className='user_manage_wrap_title'>
              前往&quot;商陆花-往来管理&quot;中，给客户设置类别
            </View>

            <SwitchItemView
              title='访客认证'
              explain='开启后，新客户需要审核才可看到您的云单'
              defaultValue={switchVisitorAuth}
              onItemClick={this.onVisitorAuthClick}
              mode={MODE.switch}
            />

            {(staffInfo.rolename === '总经理' || staffInfo.rolename === '總經理') && (
              <SwitchItemView
                title='允许店员查看客户手机号'
                explain='开启后，店员可在客户详情看到手机号'
                defaultValue={switchStaffViewClientPhone}
                onItemClick={this.onStaffViewClientPhoneClick}
                mode={MODE.switch}
              />
            )}

            {(userRangeShow || userTypeRangeShow) && (
              <View className='user_manage_wrap_mask'>
                <View className='user_manage_wrap_mask_list'>
                  {userRangeShow && <UserRange onRangeItemClick={this.onRangeItemClick} />}
                  {userTypeRangeShow && (
                    <UserTypeRange typeList={typeList} onTypeItemClick={this.onTypeItemClick} />
                  )}
                </View>
              </View>
            )}
          </View>
        )}
        {activeTabIndex === 2 && (
          <View>
            <SwitchItemView
              title='自动确认订单'
              explain='开启后云单的订单将在商陆花内自动创建                '
              defaultValue={switchAutoAuditOrder}
              onItemClick={this.onAutoAuditOrderChange}
              mode={MODE.switch}
              switchDisable={switchOrderPay}
            />
            <SwitchItemView
              title='订单需在线支付'
              explain='开启后云单的订单都需要在线支付                '
              defaultValue={switchOrderPay}
              onItemClick={this.onPayChange}
              mode={MODE.switch}
            />

            <SwitchItemView
              title='按手开单'
              explain='童装商家适用                '
              defaultValue={swtichGroupBuy}
              onItemClick={this.onGroupBuyChange}
              mode={MODE.switch}
            />
          </View>
        )}
        {activeTabIndex === 3 && (
          <View>
            {stockMenu.map(v => (
              <View key={v.label}>
                <View className='label'>{v.label}</View>
                {v.menuItems.map(
                  item =>
                    (item.id !== '1' || (item.id === '1' && switchPrice)) && (
                      <SwitchItemView
                        key={item.mode}
                        title={item.title}
                        explain={item.explain}
                        defaultValue={item.defaultValue}
                        onItemClick={item.func}
                        mode={item.mode}
                      />
                    )
                )}
              </View>
            ))}
            <View className={`rule ${switchStock ? 'ruleY' : 'ruleN'}`}>
              {options.map((o, idx) => (
                <View
                  key={o.title}
                  className='rule__item'
                  data-index={idx}
                  onClick={this.onOptionsClick}
                >
                  <View>
                    <View className='rule__item__title'>{o.title}</View>
                    <View className='rule__item__desc'>{o.desc}</View>
                  </View>

                  <Image
                    src={Number(idx) === Number(checkedIndex) ? checkIcon : uncheckedIcon}
                    className='rule__item__check_icon'
                  />
                </View>
              ))}
            </View>
          </View>
        )}
        {type === 'normal' ? (
          <Block>
            {!priceTypeIsShow && !userRangeShow && !userTypeRangeShow && (
              <View className='moneyShow_wrap_save' onClick={this.submitBtnClick}>
                保存
              </View>
            )}
          </Block>
        ) : (
          <Block>{this.renderActionView()}</Block>
        )}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(priceShow)