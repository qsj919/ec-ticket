import Taro from '@tarojs/taro'
import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import { connect } from 'react-redux'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import rightIcon from '../../images/angle_right_gray_40.png'
import UserRange from '../../components/UseUserRange/index'
import UserTypeRange from '../../components/UseUserTypeRange/index'
import './index.scss'

interface State {
  userTypeRangeShow: boolean
  userRangeShow: boolean
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
}

const mapStateToProps = ({ goodsManage }: GlobalState) => {
  return {
    userList: goodsManage.userList,
    rule: goodsManage.rule,
    mpErpId: goodsManage.mpErpId
  }
}
type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class UserManage extends React.PureComponent<
  StateProps & DefaultDispatchProps,
  State
> {
  // config = {
  //   navigationBarTitleText: '可见客户设置'
  // }

  constructor(props) {
    super(props)
    this.state = {
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
      ]
    }
  }
  init = async () => {
    Taro.showLoading()
    if (this.props.mpErpId) {
      this.props.dispatch({
        type: 'goodsManage/selelctShopProfileInformation',
        payload: {
          mpErpId: this.props.mpErpId
        }
      })
    }
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
        this.setState({ typeList: this.props.userList, ruleNum: this.props.rule })
      })
    Taro.hideLoading()
  }
  //页面回显
  componentDidMount() {
    this.init()
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
  //保存按钮
  submitBtnClick = async () => {
    const { typeList, ruleNum } = this.state
    Taro.showLoading()
    if (ruleNum == 0) {
      await this.props.dispatch({
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
        return
      } else {
        await this.props.dispatch({
          type: 'goodsManage/updateUserType',
          payload: {
            mpErpId: this.props.mpErpId,
            rule: ruleNum,
            val: valList.map(m => m.sid).join(',')
          }
        })
      }
    }
    Taro.hideLoading()
    Taro.navigateBack()
  }
  render() {
    const { userRangeShow, userTypeRangeShow, menu, typeList } = this.state
    return (
      <View className='user_manage_wrap'>
        <View className='user_manage_wrap_title'>货品可见范围管理</View>
        <View className='user_manage_wrap_center'>
          {menu.map((item, i) => {
            return (
              <View
                key={i}
                className='user_manage_wrap_center_item'
                onClick={this.onCenterItemClick.bind(this, i)}
              >
                <Text className='item_one'>{item.text}</Text>
                <Text className='item_two'>{item.use}</Text>
                <Image className='item_image' src={item.icon}></Image>
              </View>
            )
          })}
        </View>
        <View className='user_manage_wrap_title'>
          前往&quot;商陆花-往来管理&quot;中，给客户设置类别
        </View>
        <View className='user_manage_wrap_btn' onClick={this.submitBtnClick}>
          保存
        </View>
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
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(UserManage)