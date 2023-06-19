/**
 * @author lgl
 * @create date 2019/7/25
 * @desc
 */
/**
 * @author lgl
 * @create date 2018-12-17
 * @desc 包含footer的容器
 */

import Taro from '@tarojs/taro'
import React, { PureComponent, ComponentClass } from 'react'
import { Image, View } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@/types/model_state'
import { connect } from 'react-redux'
import config from '@config/config'
import './footer_view_container.scss'
import images from '../../../../config/images'

type OwnProps = {
  customStyle?: string
  noMoreDataVisible?: boolean
  noDataVisible?: boolean
  imageContainerStyle?: string
}

const mapStateToProps = ({ shop, user }: GlobalState) => ({
  // shopId: shop.shopInfo.id,
  // mobile: user.mobile,
  name: user.nickName
})

type StateProps = ReturnType<typeof mapStateToProps>

type PageState = {}

type IProps = OwnProps & StateProps & DefaultDispatchProps

// @connect<StateProps, {}, IProps>(mapStateToProps)
class FooterViewContainer extends PureComponent<IProps, PageState> {
  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    customStyle: '',
    imageContainerStyle: '',
    noMoreDataVisible: true
  }

  onOpenShopClick = canClick => {
    // if (!canClick) {
    //   return
    // }
    // const { shopId, mobile, name } = this.props
    // const url = `${config.webdocUrl}openShop?fromShopId=${shopId}&fromWhere=shop&phone=${mobile}&name=${name}`
    // this.props.dispatch({
    //   type: 'ykWebView/save',
    //   payload: { url }
    // })
    // this.props.dispatch({
    //   type: 'router/navigateTo',
    //   payload: `/subpackages/pagesMine/pages/yk_web_view/index`
    // })
  }

  render() {
    const { customStyle, noMoreDataVisible, imageContainerStyle } = this.props
    return (
      <View className='footer_view' style={customStyle}>
        <View className='view_container'>{this.props.children}</View>
        <View
          className='footer_image_container bottom__button--fixiphonex'
          style={imageContainerStyle}
        >
          <Image className='ecool_technical_support_text' src={images.common.ecool_support} />
        </View>
      </View>
    )
  }
}

export default connect<StateProps, {}, IProps>(mapStateToProps)(FooterViewContainer as ComponentClass<OwnProps, PageState>)
