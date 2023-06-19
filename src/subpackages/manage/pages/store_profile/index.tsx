import Taro from '@tarojs/taro'
import React from 'react'
import { View, Block, Input, Text, Image, Picker } from '@tarojs/components'
import { connect } from 'react-redux'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { uploadImage } from '@utils/download'
import { getTaroParams } from '@utils/utils'
import messageFeedback from '@services/interactive'
import myLog from '@utils/myLog'
import { isWeapp, isWeb } from '@utils/cross_platform_api'
import rightIcon from '../../images/angle_right_gray_40.png'
import './index.scss'

interface LevelItem {
  flag: string
  id: string
  name: string
  namepy: string
  parentId: string
  propTypeList: Array<any>
  showOrder: string
}
interface State {
  // categoryIsShow: boolean
  wechatValue: string
  phoneValue: string
  wxcodePath: string
  list: Array<[]>
  column1: number
  firstCategoryId: number
  secondCategoryId: number
  thirdCategoryId: number
  typeName: string
  stateShopName: string
  pickerIndex: Array<number>
}
const mapStateToProps = ({ goodsManage, shop }: GlobalState) => {
  const bizShop = goodsManage.bizShops.find(s => s.bizShopId == goodsManage.shopId)
  const bizStatus = bizShop && bizShop.bizStatus ? bizShop.bizStatus : 1
  const _shop = shop.list.find(s => s.id === goodsManage.mpErpId)

  return {
    mpErpId: goodsManage.mpErpId,
    shopAddress: goodsManage.shopAddress,
    shopInfo: goodsManage.shopInfo,
    shopLogo: goodsManage.shopLogoUrl,
    shopName: goodsManage.shopName,
    levelList: goodsManage.levelList,
    bizStatus,
    expiredDate: bizShop && bizShop.subscribe.expiredDate,
    shopId: goodsManage.shopId,
    shop: _shop
  }
}
type StateProps = ReturnType<typeof mapStateToProps>
// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class UserRange extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationBarTitleText: '门店简介'
  // }

  constructor(props) {
    super(props)
    this.state = {
      // categoryIsShow: false,
      wechatValue: '',
      phoneValue: '',
      wxcodePath: '',
      typeName: '',
      stateShopName: props.shopName,
      list: [[], [], []],
      column1: 0,
      firstCategoryId: 0,
      secondCategoryId: 0,
      thirdCategoryId: 0,
      pickerIndex: [0, 0, 0]
    }
  }

  initTypeList = () => {
    this.props
      .dispatch({
        type: 'goodsManage/selectSpuStdPropType',
        payload: {
          mpErpId: this.props.mpErpId
        }
      })
      .then(() => {
        Taro.hideLoading()
        const { levelList } = this.props
        let list: any = [[], [], []]
        if (levelList.rows.length) {
          levelList.rows.forEach(item => {
            list[0].push(item.name)
          })
          if (levelList.rows[0].propTypeList.length) {
            levelList.rows[0].propTypeList.forEach(item => {
              list[1].push(item.name)
            })
            if (levelList.rows[0].propTypeList[0].propTypeList.length) {
              levelList.rows[0].propTypeList[0].propTypeList.forEach(item => {
                list[2].push(item.name)
              })
            }
          }
        }
        this.setState({
          list: [...list]
        })
      })
      .catch(e => {
        Taro.hideLoading()
        myLog.log(`查询失败${e}`)
      })
  }

  init = () => {
    Taro.showLoading({ title: '请稍等...' })
    this.props
      .dispatch({
        type: 'goodsManage/selelctShopProfileInformation',
        payload: {
          mpErpId: this.props.mpErpId
        }
      })
      .then(shopInfo => {
        this.setState({
          wechatValue: shopInfo.wxCode || '',
          phoneValue: shopInfo.phone || '',
          wxcodePath: shopInfo.wxQrUrl || '',
          typeName: shopInfo.style || ''
        })
        Taro.hideLoading()
        Taro.eventCenter.on('WX_CODE_URL', url => {
          this.setState({
            wxcodePath: url
          })
        })
        Taro.eventCenter.on('WX_CODE_URL_CLEAR', () => {
          this.setState({
            wxcodePath: ''
          })
        })
      })
  }
  componentDidMount() {
    this.initTypeList()
    this.init()
  }

  getMenu = () => {
    const { phoneValue, wechatValue, wxcodePath, stateShopName } = this.state

    return [
      {
        label: '基础信息',
        key: 'info',
        items: [
          {
            label: '店铺名称',
            type: 'input',
            key: 'shopName',
            placeholder: '请输入',
            value: stateShopName
          },
          {
            label: '主营类目',
            type: 'select',
            key: 'category',
            placeholder: ''
          },
          {
            label: '门店地址',
            type: 'select',
            key: 'address',
            placeholder: '请选择'
          }
        ]
      },
      {
        label: '联系方式',
        key: 'call',
        items: [
          {
            label: '微信号',
            type: 'input',
            key: 'wxchat',
            placeholder: '请输入',
            value: wechatValue
          },
          {
            label: '微信二维码',
            type: 'select',
            key: 'wxcode',
            placeholder: wxcodePath ? '去修改' : '去上传'
          },
          {
            label: '联系电话',
            type: 'input',
            key: 'phone',
            placeholder: '请输入',
            value: phoneValue
          }
        ]
      }
    ]
  }

  onItemClick = e => {
    const { key } = e.currentTarget.dataset
    switch (key) {
      case 'address':
        this.goShopAddress()
        break

      case 'wxcode':
        if (this.state.wxcodePath) {
          Taro.navigateTo({
            url: `/subpackages/manage/pages/shop_wx_code/index?url=${this.state.wxcodePath}`
          })
        } else {
          this.onChooseImage('wxcode')
        }
        break
    }
  }

  onChooseImage = type => {
    Taro.chooseImage({
      count: 1,
      success: res => {
        Taro.showLoading({ title: '上传中...' })
        uploadImage(res.tempFilePaths[0])
          .then(({ data }) => {
            Taro.hideLoading()
            const _data = JSON.parse(data)
            this.setState({
              wxcodePath: _data.data.org[0]
            })
            Taro.navigateTo({
              url: `/subpackages/manage/pages/shop_wx_code/index?url=${_data.data.org[0]}`
            })
          })
          .catch(e => {
            Taro.hideLoading()
            myLog.log(`上传图片失败${e}`)
          })
      },
      fail: () => {
        Taro.hideLoading()
      }
    })
  }

  goShopAddress = () => {
    Taro.navigateTo({
      url: '/subpackages/manage/pages/shop_address/index'
    })
  }

  onSaveClick = async () => {
    const {
      wxcodePath,
      phoneValue,
      wechatValue,
      firstCategoryId,
      secondCategoryId,
      thirdCategoryId,
      typeName,
      stateShopName
    } = this.state

    const { shopAddress } = this.props
    // if (
    //   phoneValue &&
    //   !/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(
    //     phoneValue
    //   )
    // ) {
    //   messageFeedback.showAlert('请检查手机号格式')
    //   return
    // }

    Taro.showLoading({ title: '请稍等...' })
    await this.props.dispatch({
      type: 'goodsManage/updataShopProfileInformation',
      payload: {
        mpErpId: this.props.mpErpId,
        coverType: 1,
        style: typeName,
        phone: phoneValue,
        address: shopAddress,
        wxCode: wechatValue,
        wxQrUrl: wxcodePath,
        firstCategoryId,
        secondCategoryId,
        thirdCategoryId,
        shopName: stateShopName
      }
    })
    Taro.hideLoading()
    Taro.navigateBack()
  }

  // onCategoryCancelClick = () => {
  //   this.setState({
  //     categoryIsShow: false
  //   })
  // }

  onInput = e => {
    const {
      detail: { value },
      currentTarget: {
        dataset: { key }
      }
    } = e
    if (key === 'wxchat') {
      this.setState({
        wechatValue: value
      })
    }
    if (key === 'phone') {
      this.setState({
        phoneValue: value
      })
    }
    if (key === 'shopName') {
      this.setState({ stateShopName: value })
    }
  }

  pickerChange = e => {
    const nums = e.detail.value
    const { levelList } = this.props
    const firstCategoryId = parseInt(levelList.rows[nums[0]].id)
    const secondCategoryId = parseInt(levelList.rows[nums[0]].propTypeList[nums[1]].id)
    const thirdCategoryId = parseInt(
      levelList.rows[nums[0]].propTypeList[nums[1]].propTypeList[nums[2]].id
    )

    this.setState({
      firstCategoryId,
      secondCategoryId,
      thirdCategoryId,
      pickerIndex: nums,
      typeName: levelList.rows[nums[0]].propTypeList[nums[1]].propTypeList[nums[2]].name
    })
  }

  pickerInput = e => {
    this.pushLevelList(e.detail)
  }
  pushLevelList = e => {
    const { levelList } = this.props
    let list: any = [[], [], []]
    if (levelList.rows.length) {
      levelList.rows.forEach(item => {
        list[0].push(item.name)
      })
      if (levelList.rows[0].propTypeList.length) {
        levelList.rows[0].propTypeList.forEach(item => {
          list[1].push(item.name)
        })
        if (levelList.rows[0].propTypeList[0].propTypeList.length) {
          levelList.rows[0].propTypeList[0].propTypeList.forEach(item => {
            list[2].push(item.name)
          })
        }
      }
    }
    if (e.column == 0) {
      list[1] = []
      list[2] = []
      levelList.rows[e.value].propTypeList.forEach(item => {
        list[1].push(item.name)
      })
      levelList.rows[e.value].propTypeList[0].propTypeList.forEach(item => {
        list[2].push(item.name)
      })
      this.setState({ column1: e.value })
    } else if (e.column == 1) {
      list[1] = []
      list[2] = []
      levelList.rows[this.state.column1].propTypeList.forEach(item => {
        list[1].push(item.name)
      })
      levelList.rows[this.state.column1].propTypeList[e.value].propTypeList.forEach(item => {
        list[2].push(item.name)
      })
    }
    if (e.column != 2) this.setState({ list: [...list] })
  }

  goCloudBillAmktH5 = () => {
    if (isWeapp()) {
      messageFeedback.showAlert('请前往商陆花线上接单或应用市场内续费', '', '好的')
    } else {
      let { mktToken } = getTaroParams(Taro.getCurrentInstance?.())
      Taro.navigateTo({
        url:
          '/subpackages/cloud_bill/pages/cloud_bill_amkt_h5/index?mktToken=' +
          mktToken +
          '&shopId=' +
          this.props.shopId
      })
    }
  }

  renderActionView = () => {
    return (
      <View className='action_view'>
        <View className='action_view__save' onClick={this.onSaveClick}>
          保存
        </View>
      </View>
    )
  }

  renderMenu = () => {
    const { shopAddress, shop } = this.props
    const { typeName, pickerIndex, list } = this.state
    let MENU = this.getMenu()
    if (shop && shop.industries) {
      MENU[0].items.shift()
    }

    return (
      <View className='store_profile_wrap__menuContent'>
        {MENU.map(m => (
          <Block key={m.key}>
            <View className='store_profile_wrap__menuContent___label'>{m.label}</View>
            {m.items.map(i => (
              <View className='store_profile_wrap__menuContent___item' key={i.key}>
                <View className='item_label'>{i.label}</View>
                <Block>
                  {i.type === 'input' && (
                    <Input
                      placeholder={i.placeholder}
                      className='item_input'
                      placeholderStyle='color: #ccc;'
                      data-key={i.key}
                      onInput={this.onInput}
                      value={i.value}
                    />
                  )}

                  {i.type === 'select' && (
                    <View className='item_select_view' data-key={i.key} onClick={this.onItemClick}>
                      {i.key === 'address' && (
                        <Text
                          className='select_placeholder'
                          style={{
                            color: shopAddress ? '#222' : '#ccc'
                          }}
                        >
                          {shopAddress || i.placeholder}
                        </Text>
                      )}

                      {i.key === 'category' && (
                        <Picker
                          value={pickerIndex}
                          className='picker'
                          mode='multiSelector'
                          range={list}
                          onChange={this.pickerChange}
                          onColumnChange={this.pickerInput}
                        >
                          <View
                            style={{
                              color: typeName ? '#222' : '#ccc'
                            }}
                          >
                            {typeName || '例：女装'}
                          </View>
                        </Picker>
                      )}
                      {i.key !== 'address' && i.key !== 'wxchat' && i.key !== 'phone' && (
                        <Text className='select_placeholder'>{i.placeholder}</Text>
                      )}
                      <Image src={rightIcon} className='right_icon' />
                    </View>
                  )}
                </Block>
              </View>
            ))}
          </Block>
        ))}
      </View>
    )
  }

  render() {
    const { bizStatus, expiredDate } = this.props
    return (
      <View className='store_profile_wrap'>
        {isWeb() && bizStatus === 1 && (
          <View className='store_profile_wrap__timeLimit'>
            <View>云单有效期至 {expiredDate && expiredDate.split(' ')[0]}</View>
            <View
              className='store_profile_wrap__timeLimit___renewal'
              onClick={this.goCloudBillAmktH5}
            >
              续费
            </View>
          </View>
        )}
        {this.renderMenu()}
        {this.renderActionView()}
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(UserRange)