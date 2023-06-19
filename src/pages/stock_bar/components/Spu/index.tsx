import Taro from '@tarojs/taro'
import React, { useState, useCallback, useMemo, useEffect, memo } from 'react'
import { View, Text, Image, Block } from '@tarojs/components'
import { connect } from 'react-redux'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import checkIcon from '@/images/checked_circle_36.png'
import unCheckIcon from '@/images/icon/uncheck_circle.png'
import goodsImg from '@/images/default_goods.png'
import GoodsRem from '@components/GoodsRem'
import colors from '@@/style/colors'
import { AtSwipeAction } from 'taro-ui'
import StepperV2 from '@components/StepperV2'
import messageFeedback from '@services/interactive'
import classnames from 'classnames'
import { SPUForBuy } from '@@types/base'

import styles from './index.module.scss'
// import SkuInSpu from '../SkuInSpu'

const OPTIONS = [
  {
    text: '删除',
    style: {
      backgroundColor: colors.themeColor
    }
  }
]

interface Props {
  index: number
  shopIndex: number
  manage?: boolean
  spu: SPUForBuy
  spuShowPrice: Number
  industries?: boolean
}

const mapStateToProps = ({ replenishment, goodsManage }: GlobalState, ownProps: Props) => ({
  // spu:
  //   replenishment.stockBarList.length && replenishment.stockBarList[ownProps.shopIndex]
  //     ? replenishment.stockBarList[ownProps.shopIndex].spus[ownProps.index]
  //     : {},
  // spuShowPrice:
  //   replenishment.stockBarList.length && replenishment.stockBarList[ownProps.shopIndex]
  //     ? Number(replenishment.stockBarList[ownProps.shopIndex].spuShowPrice)
  //     : 0
})

type StateProps = ReturnType<typeof mapStateToProps>

function Spu({
  spu,
  dispatch,
  shopIndex,
  index,
  manage,
  spuShowPrice,
  industries
}: Props & StateProps & DefaultDispatchProps) {
  const firstSkuInSpu = spu && spu.skus && spu.skus[0]

  const [isSkuVisible, setSkuVisibility] = useState(() => {
    return spu && spu.skus && spu.skus.every(sku => sku.num < 1)
  }, [spu])
  const disabled = useMemo(() => {
    return spu && spu.flag === 0
  }, [spu])
  const isSpuChecked = useMemo(() => {
    return spu && spu.skus && spu.skus.every(sku => sku.checked)
  }, [spu])

  const toggleSkus = () => {
    setSkuVisibility(v => !v)
  }

  useEffect(() => {
    // 如果是失效的，处于非管理状态，并且被选中的款，取消选中
    if (disabled && !manage && isSpuChecked) {
      dispatch({ type: 'replenishment/checkSpu', payload: { index, checked: !isSpuChecked } })
    }
  }, [manage, spu, disabled, dispatch, index, isSpuChecked])

  const checkSpu = () => {
    if (disabled && !manage) return
    dispatch({
      type: 'replenishment/checkSpuInStockBar',
      payload: { index, shopIndex, checked: !isSpuChecked }
    })
  }

  const onRemConfirm = useCallback(
    (rem: string) => {
      dispatch({
        type: 'replenishment/updateCartGoodsRemInStockBar',
        payload: { shopIndex, spuIndex: index, id: firstSkuInSpu.id, rem }
      })
    },
    [index, shopIndex, firstSkuInSpu, dispatch]
  )

  const onDelete = useCallback(() => {
    const ids = spu.skus.reduce<number[]>((arr, sku) => {
      arr.push(sku.id)
      return arr
    }, [])
    messageFeedback.showAlertWithCancel('确认删除?', '', () => {
      dispatch({
        type: 'replenishment/deleteSpu',
        payload: { shopIndex, spuIndex: index, ids }
      })
    })
  }, [spu, dispatch, shopIndex, index])

  const visibleSkus = useMemo(() => {
    const skus = (spu && spu.skus) || []
    return isSkuVisible ? skus : skus.filter(sku => sku.num > 0)
  }, [spu, isSkuVisible])

  const handleDelete = sku => {
    messageFeedback.showAlertWithCancel('确认删除?', '', () => {
      dispatch({
        type: 'replenishment/deleteFromCartInStockBar',
        payload: { shopIndex, spuIndex: index, id: sku.id }
      })
    })
  }
  const checkSku = sku => {
    if (disabled) return
    dispatch({
      type: 'replenishment/updateSkuInStockBar',
      payload: { spuIndex: index, shopIndex, id: sku.id, checked: !sku.checked }
    })
  }

  const onNumChange = sku => (num: number) => {
    let groupNum = sku.groupNum
    if (groupNum) {
      const numPerGroup = sku.num / groupNum
      groupNum = num
      num = groupNum * numPerGroup
    }
    dispatch({
      type: 'replenishment/updateGoodsNumInStockBar',
      payload: { shopIndex, spuIndex: index, id: sku.id, num, groupNum }
    })
  }

  return (
    <View className={styles.spu}>
      <AtSwipeAction options={OPTIONS} autoClose onClick={onDelete} maxDistance={100} areaWidth={Taro.getSystemInfoSync().windowWidth * 0.88}>
        <View className={styles.spu__header}>
          <View className={styles.spu__check} onClick={checkSpu}>
            <Image
              src={isSpuChecked ? checkIcon : unCheckIcon}
              className={styles.spu__check_icon}
            />
          </View>
          <View className={styles.spu__header__main}>
            <View className={styles.spu__header__img}>
              <Image
                mode='aspectFill'
                style={{ width: '100%', height: '100%' }}
                src={spu.imgUrl || goodsImg}
              />
              {disabled && <View className={styles.spu__header__img__disabled}>已失效</View>}
            </View>

            <View className={styles.spu__header__content}>
              <View className={styles.spu__header__code}>{spu.code}</View>
              <View className={styles.spu__header__name}>{spu.name}</View>
            </View>
          </View>
        </View>
      </AtSwipeAction>
      {spu && spu.skus && (
        <View className={styles.spu__skus}>
          {visibleSkus.map((sku, sIndex) => (
            <AtSwipeAction
              options={OPTIONS}
              autoClose
              onClick={() => {
                handleDelete(sku)
              }}
              disabled={manage}
              key={sku.id}
              maxDistance={100} areaWidth={Taro.getSystemInfoSync().windowWidth * 0.88}
            >
              <View
                className={classnames(styles.sku, {
                  [styles['sku--group']]:
                    sku.groupNum && sku.groupNum > 0 && sku.groupNum !== sku.num
                })}
                onClick={() => {
                  checkSku(sku)
                }}
              >
                <View className={styles.check}>
                  <Image
                    src={sku.checked ? checkIcon : unCheckIcon}
                    className={styles.check_icon}
                  />
                </View>
                <View className={styles.sku__content}>
                  <View className={styles.sku__name}>
                    {spuShowPrice && <Text className={styles.sku__label}>{`¥${sku.price}`} </Text>}
                    {/* <Text className={styles.sku__label}>{`¥${sku.price}`} </Text> */}
                    <Block>
                      <Text className={styles.sku__label}>{sku.colorName} </Text>
                      <View className={classnames(styles.sku__label, styles['sku__label--s'])}>
                        <Text>{sku.sizeName}</Text>
                        {sku.groupNum && sku.groupNum > 0 && sku.groupNum !== sku.num && (
                          <Text className={styles.sku__group_label}>{`(1手${sku.num /
                            sku.groupNum}件)`}</Text>
                        )}
                      </View>
                    </Block>
                    {/* 占位元素 */}
                    <Text style={{ flex: 0.5 }} className={styles.sku__label}></Text>
                  </View>
                  <View className={styles.sku__stepper}>
                    <StepperV2
                      type='number'
                      value={sku.groupNum ? sku.groupNum : sku.num}
                      min={1}
                      onChange={onNumChange(sku)}
                      disabled={disabled}
                    />
                    {sku.groupNum && sku.groupNum > 0 && sku.groupNum !== sku.num && (
                      <Text className={styles.sku__stepper__group_total}>{`共${sku.num}件`}</Text>
                    )}
                  </View>
                </View>
              </View>
            </AtSwipeAction>
            // <SkuInSpu
            //   dispatch={dispatch}
            //   key={sku.id}
            //   sku={sku}
            //   spuIndex={index}
            //   shopIndex={shopIndex}
            //   disabled={disabled}
            //   spuShowPrice={spuShowPrice}
            //   industries={industries}
            //   disableSwiper={manage}
            // />
          ))}
          {!disabled && spu && spu.skus && spu.skus.length && (
            <View style={{ marginTop: '10px', paddingLeft: '24rpx' }}>
              <GoodsRem rem={spu.skus[0].rem} onConfirm={onRemConfirm} />
            </View>
          )}
        </View>
      )}
    </View>
  )
}

// @ts-ignore
export default connect(mapStateToProps)(Spu) as FC<Props>

Spu.defaultProps = {
  spu: {},
  index: 0,
  shopIndex: 0,
  spuShowPrice: 0,
  industries: false
}
