import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image } from '@tarojs/components'
import { UserRangeType } from '@@types/base'
import rightIcon from '../../images/right_checkbox_yes.png'
import './index.scss'

interface State {
  list: Array<{
    delflag: string
    flag: string
    id: string
    modelClass: string
    name: string
    opstaffName: string
    optime: string
    sid: string
  }>
  cencelList: Array<{ flag: string; name: string }>
}
export default class UserTypeRange extends React.PureComponent<UserRangeType, State> {
  config = {
    navigationBarTitleText: '客户管理'
  }

  constructor(props) {
    super(props)
    this.state = {
      list: [],
      cencelList: []
    }
  }
  UNSAFE_componentWillMount() {
    if (this.props.typeList) {
      this.setState({
        list: this.props.typeList,
        cencelList: JSON.parse(JSON.stringify(this.props.typeList))
      })
    }
  }
  onItemClick = (m: { flag: string }, i: number) => {
    const { onTypeItemClick } = this.props
    if (i !== -1 && i !== -2) {
      this.setState(prevState => {
        prevState.list[i].flag = m.flag == '1' ? '0' : '1'
        return {
          list: [...prevState.list]
        }
      })
    }
    if (i === -1) {
      onTypeItemClick && onTypeItemClick(this.state.cencelList, i)
    }
    if (i === -2) {
      onTypeItemClick && onTypeItemClick(this.state.list, i)
    }
  }
  render() {
    const { list } = this.state
    return (
      <View className='user_type_range_wrap'>
        <View className='user_type_range_wrap_head'>
          <View
            className='user_type_range_wrap_head_cencel'
            onClick={this.onItemClick.bind(this, {}, -1)}
          >
            取消
          </View>
          <View className='user_type_range_wrap_head_use'> 选择客户类型</View>
          <View
            className='user_type_range_wrap_head_yes'
            onClick={this.onItemClick.bind(this, {}, -2)}
          >
            确定
          </View>
        </View>
        {/* <View style="margin-top: 90px;"></View> */}
        <View className='user_type_range_wrap_center'>
          {list.map((m, i) => {
            return (
              <View
                className='user_type_range_wrap_center_item'
                onClick={this.onItemClick.bind(this, m, i)}
              >
                <View className={m.flag === '1' ? 'flagColor' : ''}>{m.name}</View>
                <View className='user_type_range_wrap_center_item_icon'>
                  {m.flag === '1' && (
                    <Image
                      className='user_type_range_wrap_center_item_icon_img'
                      src={rightIcon}
                    ></Image>
                  )}
                </View>
              </View>
            )
          })}
        </View>
      </View>
    )
  }
}
