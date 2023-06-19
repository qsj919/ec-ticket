/**
 * @author fhw
 * @create date 2019-10-09
 * @desc
 */
import Taro from '@tarojs/taro'
import React, { PureComponent, ComponentClass } from 'react'
import { Block, Image, ScrollView, Text, View } from '@tarojs/components'
import GoodsRem from '@components/GoodsRem'
import { connect } from 'react-redux'
import angleDown from '@images/angle_down_shadow.png'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import selectors from '../../selector'
import './index.scss'
import ColorView from '../ColorView'
import SizeView from '../SizeView'

type OwnProps = {
  visible?: boolean
  industries?: boolean
  showPrice?: boolean
}

type DispatchProps = {
  dispatch: any
}

type PageState = {
  isRemInEdit: boolean
}

type IProps = OwnProps & StateProps & DispatchProps

const mapStateToProps = ({ cloudBill, goodsManage }: GlobalState) => ({
  goodsDetail: cloudBill.goodsDetail,
  colorItems: selectors.colorItemsSelector(cloudBill),
  sizeItems: selectors.sizeItemsSelector(cloudBill),
  shopShowSpu: goodsManage.shopShowSpu === '1',
  shopShowSoldOut: goodsManage.shopShowSoldOut === '1',
  marketInvStrategy: goodsManage.marketInvStrategy === '2'
})

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps>(mapStateToProps)
class ColorSizeView extends PureComponent<IProps, PageState> {
  constructor(props) {
    super(props)
    this.state = {
      isRemInEdit: false
    }
  }

  onColorItemClick = (id: string) => {
    this.props.dispatch({
      type: 'cloudBill/save',
      payload: { activeColor: id }
    })
  }

  onSizeItemClick = (id: string, name: string, num?: number, addOrSet?: string) => {
    this.props.dispatch({ type: 'cloudBill/updateSkuNum', payload: { id, name, num } })
  }

  onEndRemInput = (rem: string) => {
    this.setState({ isRemInEdit: false })
    this.props.dispatch({ type: 'cloudBill/updateSpuRem', payload: { rem } })
  }

  onChangeRemInEdit = () => {
    this.setState({ isRemInEdit: !this.state.isRemInEdit })
  }

  render() {
    const { isRemInEdit } = this.state
    const {
      goodsDetail,
      colorItems,
      sizeItems,
      visible,
      shopShowSpu,
      shopShowSoldOut,
      industries = false,
      marketInvStrategy,
      showPrice
    } = this.props
    const colorLabel = '颜色'
    const rem = goodsDetail.skus[0] && goodsDetail.skus[0].rem
    const { spec1Name = '颜色', spec2Name = '尺码' } = goodsDetail
    return (
      <View className='outer'>
        {/* {isRemInEdit && (
          <GoodsRem
            onEndInput={this.onEndInput}
            isRemInEdit={isRemInEdit}
            rem={spuRem}
            fixed={false}
            cursorSpacing={90}
          />
        )} */}
        <ScrollView scrollY className='color_size_scrollview'>
          {!isRemInEdit && (
            <Block>
              {!industries && (
                <ColorView
                  colorItems={colorItems}
                  onItemClick={this.onColorItemClick}
                  label={spec1Name}
                />
              )}

              <SizeView
                // visible={visible}
                shopShowSpu={shopShowSpu}
                shopShowSoldOut={shopShowSoldOut}
                marketInvStrategy={marketInvStrategy}
                goodsDetail={goodsDetail}
                showPrice={showPrice}
                sizeItems={sizeItems}
                label={spec2Name}
                onItemClick={this.onSizeItemClick}
                industries={industries}
              />
            </Block>
          )}
        </ScrollView>
        {/* {!isRemInEdit && (
          <View>
            <GoodsRem onConfirm={this.onEndRemInput} rem={rem} mask={false} />
          </View>
        )} */}
      </View>
    )
  }
}

export default connect<StateProps>(mapStateToProps)(ColorSizeView as ComponentClass<OwnProps>) 
