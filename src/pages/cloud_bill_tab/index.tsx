import Taro, { render } from '@tarojs/taro'
import { Image, View, Text, Swiper, SwiperItem, ScrollView, Button } from '@tarojs/components'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import SearchbarView from '@components/SearchBarView/SearchbarView'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import navigatorSvc from '@services/navigator'
import Tabs from '@components/Tabs'
import { getShopList, getTodayShopList, getLastEnterShop } from '@api/apiManage'
import SlideContainer from '@components/SlideContainer/SlideContainer'
import { SlideDirection } from '@components/SlideContainer/type'
import { CloudSource, CLOUD_BILL_FLAG, ICloudBill, ICloudShop, Shop } from '@@types/base'
import CustomNavigation from '@components/CustomNavigation'
import defaultShopLogo from '@/images/ticket_default_shop.png'
import cloudEmpty from '@/images/cloud_bill_empty.png'
import phoneIcon from '@/images/phone_icon.png'
import headImg from '@/images/default_headImg.png'
import wechatIcon from '@/images/wechat_white.png'
import invitationIcon from '@/images/invitation_icon.png'
import manageIcon from '@/images/manage_icon.png'
import messageFeedback from '@services/interactive'
import { debounce } from 'lodash'
import styles from './index.module.scss'
import './search_bar_polyfill.scss'
import ShopActivity from './ShopActivity'

const mapStateToProps = ({ shop, cloudBill, systemInfo, goodsManage, user }: GlobalState) => ({
  cloudBillCloseList: shop.cloudBillCloseList,
  cloudBillOpenList: shop.cloudBillOpenList,
  mpErpId: cloudBill.mpErpId,
  statusBarHeight: systemInfo.statusBarHeight,
  gap: systemInfo.gap,
  lastEnterShop: goodsManage.lastEnterShop,
  isLoading: user.logining,
  sessionId: user.sessionId
})

type StateProps = ReturnType<typeof mapStateToProps>

type Props = StateProps & DefaultDispatchProps

interface State {
  searchValue: string
  newGoodsShopList: Shop[]
  newGoodsShopLoading: boolean
  newGoodsShopPageNo: number
  newGoodsShopLoadedAll: boolean
  activeTabIndex: number
  shopList: Shop[]
  shopLoading: boolean
  shopPageNo: number
  shopLoadedAll: boolean
  isNotiVisible: boolean
  shop: Shop
  fetchCount: number
}
// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class CloudBillPage extends React.PureComponent<Props, State> {
  // config = {
  //   // navigationBarTitleText: '云单'
  //   navigationStyle: 'custom' as const
  // }

  state = {
    searchValue: '',
    activeTabIndex: 0,
    newGoodsShopList: [] as ICloudShop[],
    newGoodsShopLoading: false,
    newGoodsShopPageNo: 1,
    newGoodsShopLoadedAll: false,
    /** 以上为上新列表,以下为全部列表  */
    shopList: [] as ICloudShop[],
    shopLoading: false,
    shopPageNo: 1,
    shopLoadedAll: false,
    isNotiVisible: false,
    shop: {} as Shop,
    fetchCount: 0
  }

  newGoodsListScrollTop = 0

  isFetchingList = false

  onShareAppMessage(obj: Taro.ShareAppMessageObject): Taro.ShareAppMessageReturn {
    if (obj.from === 'button') {
      return {
        title: '亲爱的老板，邀请你开通云单，看款补货用云单更方便',
        path: `subpackages/functional/pages/pub_web/index?type=1`,
        imageUrl:
          'https://webdoc.hzecool.com/webCdn/weapp/ec-ticket/assets/images/cloud_wechat_share.png'
      }
    } else {
      return {
        title: '新款爆款都在这里，点击查看'
      }
    }
  }

  componentDidMount() {
    if (!this.props.isLoading && this.props.sessionId) {
      this.props.dispatch({
        type: 'goodsManage/selectLastEnterShop'
      })
      this.setState({ newGoodsShopLoading: true })
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.isLoading && !prevProps.sessionId && this.props.sessionId) {
      this.props.dispatch({
        type: 'goodsManage/selectLastEnterShop'
      })
      this.setState({ newGoodsShopLoading: true })
    }

    if (
      prevProps.sessionId &&
      this.props.sessionId &&
      this.props.sessionId !== prevProps.sessionId
    ) {
      this.setState({ newGoodsShopLoading: true })
    }
  }

  onSearch = (searchValue: string) => {
    if (this.state.searchValue === searchValue) {
      if (this.state.newGoodsShopPageNo === 1) {
        this._fetchList()
      } else {
        this.resetScrollTop()
        this.setState({ newGoodsShopPageNo: 1 }, () => {
          this._fetchList()
        })
      }
    } else {
      this.setState({ searchValue, newGoodsShopPageNo: 1 }, () => {
        this._fetchList()
      })
    }
  }

  _fetchList = () => {
    if (this.state.activeTabIndex === 0) {
      this.fetchList()
    } else {
      this.fetchAllList()
    }
  }

  onTabClick = (index: number) => {
    this.setState({ activeTabIndex: index, searchValue: '' }, () => {
      // ?
      this._fetchList()
    })
  }

  onRefreshNew = async () => {
    this.setState(
      prevState => {
        return {
          newGoodsShopLoading: true,
          newGoodsShopPageNo: 1,
          fetchCount: prevState.fetchCount + 1
        }
      },
      () => {
        this.fetchList()
      }
    )
  }

  fetchList = async () => {
    const { newGoodsShopPageNo } = this.state
    this.isFetchingList = true
    try {
      const { data } = await getTodayShopList({
        erpType: 2,
        pageNo: newGoodsShopPageNo,
        searchKey: this.state.searchValue
      })
      const newGoodsShopLoadedAll = true
      if (newGoodsShopPageNo === 1) {
        this.setState({
          newGoodsShopList: data.rows.reduce((prev, cur) => {
            const details = cur.marketInfo.details.filter(
              detail => detail.imgUrls && detail.imgUrls.length > 0
            )
            const marketNumDiff = cur.marketInfo.details.length - details.length
            const marketNum = cur.marketInfo.marketNum - marketNumDiff
            if (details.length > 0) {
              prev.push({ ...cur, marketInfo: { ...cur.marketInfo, details, marketNum } })
            }
            return prev
          }, [] as ICloudShop[]),
          newGoodsShopLoadedAll,
          newGoodsShopLoading: false
        })
      } else {
        this.setState(prevState => {
          return {
            newGoodsShopList: [
              ...prevState.newGoodsShopList,
              ...data.rows.reduce((prev, cur) => {
                const details = cur.marketInfo.details.filter(
                  detail => detail.imgUrls && detail.imgUrls.length > 0
                )
                const marketNumDiff = cur.marketInfo.details.length - details.length
                const marketNum = cur.marketInfo.marketNum - marketNumDiff
                if (details.length > 0) {
                  prev.push({ ...cur, marketInfo: { ...cur.marketInfo, details, marketNum } })
                }
                return prev
              }, [] as ICloudShop[])
            ],
            newGoodsShopLoadedAll,
            newGoodsShopLoading: false
          }
        })
      }
      this.isFetchingList = false
    } catch (e) {
      //
      this.isFetchingList = false
    }
  }

  resetScrollTop = () => {
    this.newGoodsListScrollTop = 0
  }
  _onNewScrollEnd = () => {
    if (this.state.newGoodsShopList.length >= this.state.newGoodsShopPageNo * 20) {
      this.setState(
        prevState => {
          return {
            newGoodsShopPageNo: prevState.newGoodsShopPageNo + 1
            // newGoodsShopLoading: true
          }
        },
        () => {
          this.fetchList()
        }
      )
    }
  }

  onNewScrollEnd = () => {
    if (this.isFetchingList) return
    this._onNewScrollEnd()
  }

  onRefresh = async () => {
    this.setState({ shopLoading: true, shopPageNo: 1 })
    this.fetchAllList()
  }

  fetchAllList = async () => {
    try {
      const { data }: { data: { cloudBillOpenList: ICloudShop[] } } = await getShopList({
        erpType: 1,
        searchKey: this.state.searchValue
      })
      const shopLoadedAll = true
      this.setState({
        shopList: data.cloudBillOpenList
          .reduce((prev, cur) => {
            const details = cur.marketInfo.details.filter(
              detail => detail.imgUrls && detail.imgUrls.length > 0
            )
            const marketNumDiff = cur.marketInfo.details.length - details.length
            const marketNum = cur.marketInfo.marketNum - marketNumDiff
            if (details.length > 0) {
              prev.push({ ...cur, marketInfo: { ...cur.marketInfo, details, marketNum } })
            }
            return prev
          }, [] as ICloudShop[])
          .filter(item => item.independentType !== 2),
        shopLoadedAll,
        shopLoading: false
      })
    } catch (e) {
      //
    }
  }

  onInput = (searchValue: string) => {
    this.setState({ searchValue })
  }

  onSwiperChange = ({ detail }) => {
    this.setState({ activeTabIndex: detail.current })
  }

  onShopClick = (data: Shop) => {
    // if (data.cloudBillFlag === CLOUD_BILL_FLAG.close || data.saasType !== 1) return
    const cloudType =
      data.cloudBillFlag === CLOUD_BILL_FLAG.never || data.cloudBillFlag === CLOUD_BILL_FLAG.expire
        ? ICloudBill.replenishment
        : ICloudBill.all
    // this.props.dispatch({
    //   type: 'cloudBill/init',
    //   payload: { mpErpId: data.id, cloudType, cloudSource: CloudSource.CLOUD_TAB }
    // })
    navigatorSvc.navigateTo({
      url: `/subpackages/cloud_bill/pages/all_goods/index?type=${cloudType}&mpErpId=${data.id}`
    })
  }

  onGoodsClick = async (spuId: number, mpErpId: number, marketInfo, _idx) => {
    if (this.props.mpErpId !== mpErpId) {
      this.props.dispatch({
        type: 'cloudBill/init',
        // cloudType为repleshni是为了不请求列表
        payload: {
          mpErpId,
          cloudType: ICloudBill.replenishment,
          cloudSource: CloudSource.CLOUD_TAB
        }
      })
    }
    Taro.showLoading()
    await this.props
      .dispatch({
        type: 'cloudBill/fetchGoodsList',
        payload: {
          fetchShopGoodsListTop10: true
        }
      })
      .then(() => {
        Taro.hideLoading()
        navigatorSvc.navigateTo({
          url: `/subpackages/cloud_bill/pages/goods_detail/goods_detail_new?_idx=${_idx}&id=${spuId}&from=all`
        })
      })
      .catch(() => {
        Taro.hideLoading()
      })
  }

  onGoodsClickNew = async (spuId: number, mpErpId: number, marketInfo, _idx) => {
    if (this.props.mpErpId !== mpErpId) {
      this.props.dispatch({
        type: 'cloudBill/init',
        // cloudType为repleshni是为了不请求列表
        payload: {
          mpErpId,
          cloudType: ICloudBill.replenishment,
          cloudSource: CloudSource.CLOUD_TAB
        }
      })
    }
    this.props.dispatch({ type: 'cloudBill/clearGoodsListNew' })
    this.props.dispatch({
      type: 'cloudBill/addMarketInfo',
      payload: {
        marketInfo
      }
    })
    Taro.showLoading()
    await this.props
      .dispatch({
        type: 'cloudBill/fetchGoodsListToDayNew',
        payload: {
          marketOptimeBegin: marketInfo.marketDate,
          marketOptimeEnd: marketInfo.marketDate,
          pageNo: 1
        }
      })
      .then(count => {
        Taro.hideLoading()
        if (count > 0) {
          navigatorSvc.navigateTo({
            url: `/subpackages/cloud_bill/pages/goods_detail/goods_detail_new?_idx=${_idx}&id=${spuId}&from=new`
          })
        } else {
          messageFeedback.showAlert('该商品已下架', '提示', '好的')
        }
      })
      .catch(() => {
        Taro.hideLoading()
      })
  }

  onNewScroll = e => {
    this.newGoodsListScrollTop = e.detail.scrollTop
  }

  onManageClick = () => {
    const { sn, epid, shopid } = this.props.lastEnterShop
    Taro.navigateTo({
      url: `/subpackages/cloud_bill/pages/manage/index?sn=${sn}&epid=${epid}&shopId=${shopid}`
    })
  }

  renderManage = () => {
    const { statusBarHeight, gap } = this.props
    return (
      <View
        className={styles['manage-btn']}
        style={`top: ${statusBarHeight + gap}px`}
        onClick={this.onManageClick}
      >
        <Image src={manageIcon} mode='aspectFill' className={styles['manage-btn_icon']} />
      </View>
    )
  }

  renderNotOpenedShopList = () => {
    const { cloudBillCloseList } = this.props
    return (
      cloudBillCloseList.length > 0 && (
        <View className={styles.not_open}>
          <View>还有拿货店铺未开通云单</View>
          <View>点击邀请档口老板开通云单，看款拿货更方便</View>
          <View className={styles.not_open__list}>
            {cloudBillCloseList.map(d => (
              <View
                className={styles.not_open__list__item}
                key={d.id}
                onClick={() => this.setState({ shop: d, isNotiVisible: true })}
              >
                <View className={styles.not_open__list__avatar}>
                  <Image
                    style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                    src={d.logoUrl || defaultShopLogo}
                  />
                  <Image className={styles.invitationIcon} mode='aspectFit' src={invitationIcon} />
                </View>
                <View className={styles.not_open__list__name}>{d.shopName}</View>
              </View>
            ))}
          </View>
        </View>
      )
    )
  }

  render() {
    const {
      newGoodsShopList,
      activeTabIndex,
      newGoodsShopLoading,
      newGoodsShopPageNo,
      newGoodsShopLoadedAll,
      shopLoading,
      shopPageNo,
      shopLoadedAll,
      shopList,
      searchValue,
      isNotiVisible,
      shop
    } = this.state
    const { lastEnterShop, cloudBillOpenList } = this.props
    return (
      <CustomNavigation
        enableBack={false}
        stickyTop={false}
        disableIphoneXPaddingBottom
        title='云单'
        titleTextClass={styles.titleTextClass}
        containerClass={styles.containerClass}
      >
        {JSON.stringify(lastEnterShop) !== '{}' && this.renderManage()}
        <View className={styles.container}>
          <View className={styles.search_container}>
            <SearchbarView
              onInput={this.onInput}
              onClearSearchClick={this.onSearch}
              placeholder='搜索店铺'
              backgroundColor='white'
              onSearchClick={this.onSearch}
            />
          </View>
          <View className={styles.main}>
            <View className={styles.tab}>
              <Tabs
                data={[{ label: '档口上新' }, { label: '全部' }]}
                activeIndex={activeTabIndex}
                onTabItemClick={this.onTabClick}
              />
            </View>
            <Swiper className={styles.list} current={activeTabIndex} onChange={this.onSwiperChange}>
              <SwiperItem className={styles.list_wrapper}>
                <ScrollView
                  showScrollbar={false}
                  lowerThreshold={2500}
                  // enhanced
                  className={styles.shops}
                  scrollY
                  onRefresherRefresh={this.onRefreshNew}
                  refresherEnabled
                  refresherTriggered={newGoodsShopLoading}
                  onScroll={this.onNewScroll}
                  onScrollToLower={this.onNewScrollEnd}
                  scrollTop={this.newGoodsListScrollTop}
                >
                  {newGoodsShopList.map(sh => (
                    <ShopActivity
                      onGoodsClick={this.onGoodsClickNew}
                      onShopClick={this.onShopClick}
                      type={0}
                      data={sh}
                      key={sh.id}
                    />
                  ))}
                  {newGoodsShopList.length > 0 && newGoodsShopLoadedAll && !newGoodsShopLoading && (
                    <View className={styles.bottom_tip}>已经到底啦~</View>
                  )}
                  {newGoodsShopList.length === 0 &&
                    !newGoodsShopLoading &&
                    cloudBillOpenList.length !== 0 && (
                      <View className={styles.empty}>
                        <Image src={cloudEmpty} className={styles.empty_img} />
                        <Text>
                          {searchValue.trim() === ''
                            ? '您还没有在商陆花店铺内拿过货哦'
                            : '找不到相关店铺'}
                        </Text>
                      </View>
                    )}
                  {newGoodsShopLoadedAll && !newGoodsShopLoading && this.renderNotOpenedShopList()}
                </ScrollView>
              </SwiperItem>
              <SwiperItem className={styles.list_wrapper}>
                <ScrollView
                  showScrollbar={false}
                  lowerThreshold={300}
                  enhanced
                  className={styles.shops}
                  scrollY
                  onRefresherRefresh={this.onRefresh}
                  refresherEnabled
                  refresherTriggered={shopLoading}
                  // onScrollToLower={this.onScrollEnd}
                >
                  {shopList.map(sho => (
                    <ShopActivity
                      onGoodsClick={this.onGoodsClick}
                      onShopClick={this.onShopClick}
                      type={1}
                      data={sho}
                      key={sho.id}
                    />
                  ))}
                  {shopList.length > 0 && shopLoadedAll && !shopLoading && (
                    <View className={styles.bottom_tip}>已经到底啦~</View>
                  )}
                  {shopList.length === 0 && !shopLoading && cloudBillOpenList.length !== 0 && (
                    <View className={styles.empty}>
                      <Image src={cloudEmpty} className={styles.empty_img} />
                      <Text>
                        {searchValue.trim() === ''
                          ? '您还没有在商陆花店铺内拿过货哦'
                          : '找不到相关店铺'}
                      </Text>
                    </View>
                  )}
                  {shopLoadedAll && !shopLoading && this.renderNotOpenedShopList()}
                </ScrollView>
              </SwiperItem>
            </Swiper>
          </View>

          <SlideContainer
            visible={isNotiVisible}
            direction={SlideDirection.Bottom}
            containerClass={styles.slide}
            onRequestClose={() => this.setState({ isNotiVisible: false })}
          >
            <View className={styles.notification}>
              <View className={styles.notification__header}>
                <View className={styles.notification__header__logo_wrapper}>
                  <Image
                    className={styles.notification__header__logo}
                    src={shop.logoUrl || defaultShopLogo}
                  />
                </View>
                {`邀请【${shop.shopName}】开通云单`}
              </View>
              <View className={styles.title}>方式一：电话通知</View>
              <View className={styles.phone}>
                <View className='aic'>
                  <Image className={styles.phone__icon} src={phoneIcon} />
                  <View className={styles.phone__text}>{`档口电话：${shop.phone}`}</View>
                </View>

                <View
                  className={styles.phone__btn}
                  onClick={() => {
                    Taro.makePhoneCall({ phoneNumber: shop.phone })
                  }}
                >
                  拨打电话
                </View>
              </View>
              <View className={styles.title}>方式二：微信通知</View>
              <View className={styles.wechat}>
                <View className={styles.wechat__text}>
                  亲爱的老板，邀请你开通云单。看款补货用云单更方便~
                </View>
                <Image className={styles.wechat__avatar} src={headImg} />
              </View>
              <Button openType='share' className={styles.wechat__btn}>
                <Image className={styles.wechat__btn__icon} src={wechatIcon} />
                发送微信链接
              </Button>
            </View>
          </SlideContainer>
        </View>
      </CustomNavigation>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(CloudBillPage) 