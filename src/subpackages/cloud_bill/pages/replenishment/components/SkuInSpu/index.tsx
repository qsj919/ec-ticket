import Taro from '@tarojs/taro'

import { View, Image, Text, Block } from '@tarojs/components'
import React, { memo, useCallback, FC, useMemo } from 'react'
import { AtSwipeAction } from 'taro-ui'
import StepperV2 from '@components/StepperV2'
import colors from '@@/style/colors'
import { GlobalState, DefaultDispatchProps } from '@@types/model_state'
import messageFeedback from '@services/interactive'

import checkIcon from '@/images/checked_circle_36.png'
import unCheckIcon from '@/images/icon/uncheck_circle.png'
import { SkuForBuy } from '@@types/base'
import classnames from 'classnames'
import styles from './index.module.scss'

const OPTIONS = [
  {
    text: '删除',
    style: {
      backgroundColor: colors.themeColor
    }
  }
]

interface Props {
  spuIndex: number
  // sid: number
  // id: number
  dispatch: any
  sku: SkuForBuy
  disabled?: boolean
  spuShowPrice?: boolean
  industries?: boolean
  disableSwiper?: boolean
}

// const mapStateToProps = ({ replenishment }: GlobalState, { spuIndex, id }: Props) => ({
//   sku: replenishment.list[spuIndex] && replenishment.list[spuIndex].skus[id]
// })

// const mapStateToProps = ({ replenishment }: GlobalState, { spuIndex, id }: Props) => ({})

// type StateProps = ReturnType<typeof mapStateToProps>

function SkuInSpu({
  spuIndex,
  sku,
  dispatch,
  disabled,
  spuShowPrice,
  industries,
  disableSwiper
}: Props) {
  // const id = useMemo(() => {
  //   return `${sku.colorId}_${sku.sizeId}_${sku.styleId}`
  // }, [sku])

  const onDelete = useCallback(() => {
    messageFeedback.showAlertWithCancel('确认删除?', '', () => {
      dispatch({ type: 'replenishment/deleteFromCart', payload: { spuIndex, id: sku.id } })
    })
  }, [spuIndex, sku.id, dispatch])

  const onNumChange = useCallback(
    (num: number) => {
      let groupNum = sku.groupNum
      if (groupNum) {
        const numPerGroup = sku.num / groupNum
        groupNum = num
        num = groupNum * numPerGroup
      }

      dispatch({
        type: 'replenishment/updateGoodsNumInCart',
        payload: { spuIndex, id: sku.id, num, groupNum }
      })
    },
    [sku.groupNum, sku.id, sku.num, dispatch, spuIndex]
  )

  const checkSku = useCallback(() => {
    if (disabled) return
    dispatch({
      type: 'replenishment/updateSku',
      payload: { spuIndex, id: sku.id, checked: !sku.checked }
    })
  }, [sku, spuIndex, dispatch, disabled])

  const isGroupBuy = sku.groupNum && sku.groupNum > 0 && sku.groupNum !== sku.num
  return (
    <AtSwipeAction options={OPTIONS} autoClose onClick={onDelete} disabled={disableSwiper} maxDistance={100} areaWidth={Taro.getSystemInfoSync().windowWidth * 0.88}>
      <View
        className={classnames(styles.sku, { [styles['sku--group']]: isGroupBuy })}
        onClick={checkSku}
      >
        <View className={styles.check}>
          <Image src={sku.checked ? checkIcon : unCheckIcon} className={styles.check_icon} />
        </View>
        <View className={styles.sku__content}>
          <View className={styles.sku__name}>
            {spuShowPrice && <Text className={styles.sku__label}>{`¥${sku.price}`} </Text>}
            {/* <Text className={styles.sku__label}>{`¥${sku.price}`} </Text> */}
            <Block>
              <Text className={styles.sku__label}>{sku.colorName} </Text>
              <View className={classnames(styles.sku__label, styles['sku__label--s'])}>
                <Text>{sku.sizeName}</Text>
                {isGroupBuy && (
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
              onChange={onNumChange}
              disabled={disabled}
            />
            {isGroupBuy && (
              <Text className={styles.sku__stepper__group_total}>{`共${sku.num}件`}</Text>
            )}
          </View>
        </View>
      </View>
    </AtSwipeAction>
  )
}

// export default connect(mapStateToProps)(SkuInSpu) as FC<Props>
export default memo(SkuInSpu) as FC<Props>

SkuInSpu.defaultProps = {
  sku: {},
  industries: false
}
