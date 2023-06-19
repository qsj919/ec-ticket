import { View, Text, Image } from '@tarojs/components'
import React from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import shopInfomation1 from '../../images/shopinfomation1.png'
import shopInfomation2 from '../../images/shopinfomation2.png'
import shopInfomation3 from '../../images/shopinfomation3.png'
import shopInfomation4 from '../../images/shopinfomation4.png'
import shopInfomation5 from '../../images/shopinfomation5.png'
import not_store_profile from '../../images/not_store_profile.png'
import './index.scss'

interface State {
  imgHttps: Array<string>
  address: Array<string>
}

const mapStateToProps = ({ cloudBill, goodsManage, shop }: GlobalState) => {
  const _shop = shop.list.find(s => s.id === cloudBill.mpErpId)
  return {
    shopInfo: goodsManage.shopInfo,
    shop: _shop
  }
}
type StateProps = ReturnType<typeof mapStateToProps>

type OwnProps = {
  mpErpId: number
}

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class ShopInfomation extends React.PureComponent<
  StateProps & DefaultDispatchProps & OwnProps,
  State
> {
  constructor(props) {
    super(props)
    this.state = {
      imgHttps: [],
      address: []
    }
  }
  componentDidMount() {
    // if (this.props.shop) {
    this.props
      .dispatch({
        type: 'goodsManage/selelctShopProfileInformation',
        payload: {
          mpErpId: this.props.mpErpId
        }
      })
      .then(() => {
        const { coverUrls, address } = this.props.shopInfo
        let imgs: string[] = []
        if (coverUrls) {
          imgs = coverUrls.split(',')
        }
        this.setState({ imgHttps: imgs, address: address.split('\n') })
      })
    // }
  }
  render() {
    const { coverType, style, categoryName, phone, areaCode } = this.props.shopInfo
    const { imgHttps, address } = this.state
    return (
      <View className='shop_infomation_wrap'>
        <View className='shop_infomation_wrap_top'>
          <View className='shop_infomation_wrap_center_information'>
            <View className='shop_infomation_wrap_center_informationItem'>
              <Image src={shopInfomation1} className='shopInfomationImg'></Image>
            </View>
            <Text className='shop_infomation_wrap_center_informationText'>商家介绍</Text>
          </View>
          {coverType == 1 && (
            <View className='shop_infomation_wrap_center_bigView'>
              {imgHttps.length > 0 ? (
                imgHttps.map(item => {
                  return (
                    <Image
                      mode='aspectFill'
                      src={item}
                      className='shop_infomation_wrap_center_imgs_big'
                    ></Image>
                  )
                })
              ) : (
                <Image
                  src={not_store_profile}
                  className='shop_infomation_wrap_center_imgs_big'
                ></Image>
              )}
            </View>
          )}
          {coverType == 2 && (
            <View className='shop_infomation_wrap_center_centerView'>
              {imgHttps.map(item => {
                return (
                  <Image
                    mode='aspectFill'
                    src={item}
                    className='shop_infomation_wrap_center_imgs_center'
                  ></Image>
                )
              })}
            </View>
          )}
          {coverType == 3 && (
            <View className='shop_infomation_wrap_center_smallView'>
              {imgHttps.map(item => {
                return (
                  <Image
                    mode='aspectFill'
                    src={item}
                    className='shop_infomation_wrap_center_imgs_small'
                  ></Image>
                )
              })}
            </View>
          )}
        </View>
        <View className='shop_infomation_wrap_center'>
          <View className='shop_infomation_wrap_center_information'>
            <View className='shop_infomation_wrap_center_informationItem'>
              <Image src={shopInfomation1} className='shopInfomationImg'></Image>
            </View>
            <Text className='shop_infomation_wrap_center_informationText'>商家信息</Text>
          </View>
          {/* <View className='shop_infomation_wrap_center_item'>
            <View className='shop_infomation_wrap_center_item_img'>
              <Image src={shopInfomation2} className='shopInfomationImg'></Image>
            </View>
            <View className='shop_infomation_wrap_center_item_text'>风格</View>
            <View className='shop_infomation_wrap_center_item_view'>{style || '无'}</View>
          </View> */}
          <View className='shop_infomation_wrap_center_item'>
            <View className='shop_infomation_wrap_center_item_img'>
              <Image src={shopInfomation3} className='shopInfomationImg'></Image>
            </View>
            <View className='shop_infomation_wrap_center_item_text'>品类</View>
            <View className='shop_infomation_wrap_center_item_view'>{style || '无'}</View>
          </View>
          <View className='shop_infomation_wrap_center_item'>
            <View className='shop_infomation_wrap_center_item_img'>
              <Image src={shopInfomation4} className='shopInfomationImg'></Image>
            </View>
            <View className='shop_infomation_wrap_center_item_text'>电话</View>
            <View className='shop_infomation_wrap_center_item_view'>
              {areaCode.length > 0 && phone.length != 11 ? areaCode + '-' + phone : phone}
            </View>
          </View>
          <View className='shop_infomation_wrap_center_item' style='margin-bottom:30px;'>
            <View className='shop_infomation_wrap_center_item_img'>
              <Image src={shopInfomation5} className='shopInfomationImg'></Image>
            </View>
            <View className='shop_infomation_wrap_center_item_text'>地址</View>
            <View className='shop_infomation_wrap_center_item_view'>
              {address.map(item => {
                return <Text style='display:block'>{item}</Text>
              })}
              {!address.length && <Text style='display:block'>暂未公开</Text>}
            </View>
          </View>
        </View>
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(ShopInfomation)