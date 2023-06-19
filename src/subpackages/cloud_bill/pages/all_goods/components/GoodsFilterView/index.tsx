/*
 * @Author: GaoYuJian
 * @Date: 2019-02-27 16:28:13
 * @Last Modified by: GaoYuJian
 * @Last Modified time: 2019-02-27 16:44:34
 * 商品筛选视图
 */
import Taro from '@tarojs/taro'
import React, { PureComponent } from 'react'
import i18n from '@@/i18n'
import { FilterOption, FilterUpdateOption } from '@src/types'

import FilterView from '../../../../components/FilterView/index_food'
import dva from '../../../../utils/dva'
import object from '../../../../utils/object'
import { GoodsDetailStatus } from '../../type'

type Props = {
  isOpened: boolean
  // 不包含的筛选项目
  // 1: 标签 5: 城市 4: 主营类目 3: 风格 7: 价格区间
  excludedOptions: number[]
  onClose: () => void
  onValueChanged: (filterValues: any) => void
  goodsDetail: GoodsDetailStatus
  statusBarHeight?: number
}

type State = {
  options: FilterOption[]
  updateOption?: FilterUpdateOption
}

export default class Index extends PureComponent<Props, State> {
  static defaultProps = {
    excludedOptions: []
  }

  constructor(props) {
    super(props)

    this.state = {
      options: []
    }
  }

  componentDidMount = () => {
    this.getOptions()
  }

  getOptions() {
    const { goodsBrandStatus, goodsSeasonStatus } = this.props.goodsDetail
    const configs = [
      {
        typeValue: 7, // 价格区间
        type: 'range',
        typeName: i18n.t._('price'),
        multipleSelect: true,
        items: ['', '', i18n.t._('lowestPrice'), i18n.t._('highestPrice')]
      }
    ]
    if (goodsSeasonStatus === 1) {
      const reasons = dva.getState().shopClassify.seasons
      const reasonsItem: any[] = []
      reasons.forEach(el => {
        reasonsItem.push({
          codeValue: el.codeValue,
          codeName: el.codeName
        })
      })
      configs.push({
        typeValue: 3, // 季节
        type: 'tag',
        typeName: i18n.t._('season'),
        multipleSelect: true,
        items: reasonsItem
      })
    }
    if (goodsBrandStatus === 1) {
      const brands = dva.getState().shopClassify.brands
      const brandItems: any[] = []
      brands.forEach(el => {
        brandItems.push({
          codeValue: el.codeValue,
          codeName: el.codeName
        })
      })
      configs.push({
        typeValue: 4, // 品牌
        type: 'tag',
        typeName: i18n.t._('brand'),
        multipleSelect: true,
        items: brandItems
      })
    }
    configs.push({
      typeValue: 17, // 价格区间
      type: 'range',
      typeName: i18n.t._('dateAdded'),
      multipleSelect: true,
      items: ['', '', i18n.t._('startDate'), i18n.t._('endDate')]
    })
    // Taro.eventCenter.trigger('UPDATE_FILTER_DATA', configs)
    // @ts-ignore
    this.setState({ options: configs })
  }

  onFilterValueChanged(options: FilterOption[]) {
    const filterParams: any = {}
    const filterParamsPick: any = {}
    const filterParamsSeasons: any = {}
    const filterParamsBrands: any = {}
    const keyWords = {}
    const mutilVeluesKey = {}
    const mutilVeluesKeyMust = {}
    for (const option of options) {
      const items: any = []
      if (option.type === 'tag') {
        for (const item of option.items) {
          if (!(typeof item === 'string') && item.isSelected) {
            items.push(item.codeValue)
          }
        }
      }

      // 标签
      if (option.typeValue === 1 && items.length) {
        Object.assign(mutilVeluesKeyMust, { labels: items })
      }

      // 城市
      if (option.typeValue === 5 && items.length) {
        Object.assign(keyWords, { cityId: items })
      }

      // 市场
      if (option.typeValue === 6 && items.length) {
        Object.assign(keyWords, { marketId: items })
      }
      // 季节
      if (option.typeValue === 3 && items.length) {
        filterParamsSeasons.season = items.join(',')
      }
      // 品牌
      if (option.typeValue === 4 && items.length) {
        filterParamsBrands.brandId = items.join(',')
      }
      // 价格区间
      if (option.typeValue === 7) {
        filterParams.priceGte = option.items[0]
        filterParams.priceLte = option.items[1]
      }

      if (option.typeValue === 17) {
        filterParamsPick.marketDateGte = option.items[0]
        filterParamsPick.marketDateLte = option.items[1]
      }
    }

    const result: any = {}
    result.seasons = filterParamsSeasons.season
    result.marketDateGte = filterParamsPick.marketDateGte
    result.marketDateLte = filterParamsPick.marketDateLte
    result.priceGte = filterParams.priceGte
    result.priceLte = filterParams.priceLte
    result.brandIds = filterParamsBrands.brandId
    if (object.values(mutilVeluesKeyMust).length) {
      result.mutilVeluesKeyMust = mutilVeluesKeyMust
    }
    if (object.values(mutilVeluesKey).length) {
      result.mutilVeluesKey = mutilVeluesKey
    }
    if (object.values(keyWords).length) {
      result.keyWords = keyWords
    }
    this.props.onValueChanged(result)
  }

  render() {
    const { isOpened, onClose, goodsDetail, statusBarHeight } = this.props
    const { options, updateOption } = this.state
    return (
      <FilterView
        goodsDetail={goodsDetail}
        isOpened={isOpened}
        onClose={onClose}
        configOptions={options}
        updateOption={updateOption}
        onValueChanged={this.onFilterValueChanged.bind(this)}
        statusBarHeight={statusBarHeight}
      />
    )
  }
}
