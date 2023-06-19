import Taro, { render } from '@tarojs/taro'
import React from 'react'
import { Block, Image, Text, View } from '@tarojs/components'
import classnames from 'classnames'
import { ICloudShop } from '@@types/base'
import EImage from '@components/EImage'
import defaultShopLogo from '@/images/ticket_default_shop.png'
import angleRight from '@/images/angle_right_gray_40.png'
import cloudShopNew from '@/images/cloud_shop_new.png'
import { getRelativeDate } from '@utils/utils'

import styles from './index.module.scss'

type Props = {
  type: number // 0上新 1全部
  data: ICloudShop
  onShopClick(data: ICloudShop): void
  onGoodsClick(
    spuId: number,
    mpErpId: number,
    marketInfo: { marketDate: string },
    _idx: number
  ): void
}

export default class ShopActivity extends React.PureComponent<Props> {
  static defaultProps = {
    data: {
      marketInfo: {
        details: []
      }
    }
  }

  onShopClick = () => {
    this.props.onShopClick(this.props.data)
    // navigatorSvc.navigateTo({ url: `/subpackages/cloud_bill/pages/all_goods/index?type=${type}` })
  }

  onGoodsClick = (spuId: string) => {
    // console.log(e.target, e.currentTarget, '???')
  }

  renderLessThan3Images = () => {
    const {
      type,
      data: {
        marketInfo: { details },
        id
      },
      data: { marketInfo },
      onGoodsClick
    } = this.props
    // const {
    //   marketInfo: { details }
    // } = data
    return details.map((data, _idx) => (
      <View
        className={styles.images_2}
        key={data.id}
        onClick={() => onGoodsClick(data.id, id, marketInfo, _idx)}
      >
        <View className={styles.image}>
          <EImage mode='aspectFill' src={data.imgUrls} />
          {type === 0 && _idx === 0 && <View className={styles.image_new_flag}>好物上新</View>}
        </View>
      </View>
    ))
  }

  render3Images = () => {
    const {
      type,
      data: {
        marketInfo: { details },
        id
      },
      data: { marketInfo },
      onGoodsClick
    } = this.props
    return (
      <Block>
        <View className={styles.images_3}>
          <View
            className={styles.images_3_wrapper}
            onClick={() => onGoodsClick(details[0].id, id, marketInfo, 0)}
          >
            <View className={styles.image}>
              <EImage mode='aspectFill' src={details[0].imgUrls} />
              {type === 0 && <View className={styles.image_new_flag}>好物上新</View>}
            </View>
          </View>
        </View>
        <View className={styles.images_3__right}>
          <View
            className={styles.images_3__right__img}
            onClick={() => onGoodsClick(details[1].id, id, marketInfo, 1)}
          >
            <View className={styles.image}>
              <EImage mode='aspectFill' src={details[1].imgUrls} />
            </View>
          </View>
          <View
            className={styles.images_3__right__img}
            onClick={() => onGoodsClick(details[2].id, id, marketInfo, 2)}
          >
            <View className={styles.image}>
              <EImage mode='aspectFill' src={details[2].imgUrls} />
            </View>
          </View>
        </View>
      </Block>
    )
    // ))
  }

  renderMoreThan3Images = () => {
    const {
      type,
      data: {
        marketInfo: { details },
        id
      },
      data: { marketInfo },
      onGoodsClick
    } = this.props
    return details.slice(0, 6).map((data, idx) => (
      <View
        className={styles.image_more}
        key={data.id}
        data-spu={data.id}
        onClick={() => onGoodsClick(data.id, id, marketInfo, idx)}
      >
        <View className={styles.images_wrapper}>
          <View className={styles.image}>
            <EImage mode='aspectFill' src={data.imgUrls} />
            {type === 0 && idx === 0 && <View className={styles.image_new_flag}>好物上新</View>}
          </View>
        </View>
      </View>
    ))
  }

  render() {
    const { type, data } = this.props
    const { marketInfo } = data
    return (
      <View className={styles.container}>
        <View className={styles.main} onClick={this.onShopClick}>
          <Image className={styles.avatar} src={data.logoUrl || defaultShopLogo} />
          <View className={styles.header}>
            <View className={styles.shop_name}>{data.shopName}</View>
            {type === 0 && (
              <View className={styles.new}>
                {/* <Image
                  src={cloudShopNew}
                  style={{
                    width: '190rpx',
                    height: '28rpx',
                    position: 'absolute',
                    left: 0,
                    zIndex: -1
                  }}
                /> */}
                <View className={styles.new__flag}>NEW</View>
                {`${getRelativeDate(marketInfo.marketDate)}上新${marketInfo.marketNum}款`}
                {/* <View
                  style={{ lineHeight: 1, height: '100%', display: 'flex', alignItems: 'center' }}
                >{`${getRelativeDate(marketInfo.marketDate)}上新${marketInfo.marketNum}款`}</View> */}
              </View>
            )}
          </View>
          {type === 0 && (
            <View className={styles.goshop_view}>
              进店
              <Image src={angleRight} className={styles.goshop_view_icon} />
            </View>
          )}
          {type === 1 && <Image src={angleRight} className={styles.angle_right} />}
        </View>
        {/* {marketInfo.details.length === 3 && (
          <View className={styles.imgs}>{this.render3Images()}</View>
        )} */}
        {/* {marketInfo.details.length < 3 && (
          <View className={styles.imgs}>{this.renderLessThan3Images()}</View>
        )} */}

        <View className={classnames(styles.imgs, { [styles['imgs--pl']]: type === 0 })}>
          {(marketInfo.details.length > 3 || type == 1) && this.renderMoreThan3Images()}
          {marketInfo.details.length < 3 && type === 0 && this.renderLessThan3Images()}
          {marketInfo.details.length === 3 && type === 0 && this.render3Images()}
        </View>
      </View>
    )
  }
}
