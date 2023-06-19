import Taro from '@tarojs/taro'
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import EButton from '@components/Button/EButton'
import successIcon from '@/images/success_icon.png'
import { connect } from 'react-redux'
import { GlobalState } from '@@types/model_state'
import defaultShopLogo from '@/images/default_shop.png'
import navigatorSvc from '@services/navigator'
import styles from './index.module.scss'

const mapStateToProps = ({ user }: GlobalState) => ({
  shopList: user.shopListRelativeToPhone
})

type StateProps = ReturnType<typeof mapStateToProps>

// @connect(mapStateToProps)
class BindPhoneSuccess extends React.PureComponent<StateProps> {
  // config = {
  //   navigationBarTitleText: '绑定成功'
  // }

  onBtnClick = () => {
    navigatorSvc.switchTab({ url: '/pages/statement/index' })
  }

  render() {
    const { shopList } = this.props
    return (
      <View className={styles.container}>
        <View className={styles.top}>
          <Image className={styles.icon} src={successIcon} />
          <Text>绑定成功</Text>
          <View className={styles.tip}>
            <View>还有店铺没关联？</View>
            <Text>请联系商家设置您的手机号。</Text>
          </View>
        </View>
        <View className={styles.bottom}>
          <View className={styles.bottom__header}>{`为您找到了${shopList.length}家店铺`}</View>
          <View>
            {shopList.map(item => (
              <View className={styles.shop_item} key={item.id}>
                <Image className={styles.shop_item__logo} src={item.logoUrl || defaultShopLogo} />
                <Text>{item.shopName}</Text>
              </View>
            ))}
          </View>
        </View>
        <View className={styles.button}>
          <EButton label='查看全部小票' onButtonClick={this.onBtnClick} />
        </View>
      </View>
    )
  }
}
export default connect(mapStateToProps)(BindPhoneSuccess)