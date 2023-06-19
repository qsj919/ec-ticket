import Taro from '@tarojs/taro'
import React from 'react'
import { getTaroParams } from '@utils/utils'
import TicketList from './components/TicketList'
interface State {
  shopId?: string
}

export default class CloudBillList extends React.PureComponent<{}, State> {
  // config = {
  //   navigationBarTitleText: '云单小票'
  // }

  constructor() {
    super()
    const { shopId } = getTaroParams(Taro.getCurrentInstance?.())
    this.state = { shopId }
  }

  render() {
    return <TicketList ticketType={3} shopId={this.state.shopId} />
  }
}
