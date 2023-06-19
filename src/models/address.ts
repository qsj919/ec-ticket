import { Model } from '@@types/dva'
import { BaseItem } from '@@types/base'
import { fetchProvinceAndCity } from '@api/apiManage'

interface Data extends BaseItem {
  children?: Array<Omit<Data, 'children'>>
}

const initialState = {
  cityProvinceList: [] as Data[],
  // checkedProvince: null as BaseItem | null,
  checkedCity: null as BaseItem | null
}

export type AddressState = typeof initialState

const address: Model<AddressState> = {
  namespace: 'address',
  state: initialState,
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    },
    saveCity(state, { payload }) {
      const cityProvinceList = state.cityProvinceList.map(item => {
        if (item.value === payload.value) {
          return { ...item, children: payload.cityList }
        } else {
          return item
        }
      })
      return { ...state, cityProvinceList }
    },
    onCityChecked(state, { payload }) {
      return { ...state, checkedCity: { ...payload }, checkedProvince: null }
    },
    onProvinceChecked(state, { payload }) {
      return { ...state, checkedProvince: { ...payload }, checkedCity: null }
    }
  },
  effects: {
    *fetchData({ payload }, { call, put, select }) {
      const value = (payload && payload.value) || 0
      const { data } = yield call(fetchProvinceAndCity, value, value === 0 ? 10 : 0)
      if (value === 0) {
        const cityProvinceList: Data[] = data.addresses.map(cityItemMap)
        cityProvinceList.unshift({
          label: '热门城市',
          value: -1,
          children: [{ label: '全国', value: -1 }, ...data.hotCities.map(cityItemMap)]
        })
        yield put({ type: 'save', payload: { cityProvinceList } })
        for (let i = 1; i < 10; i++) {
          yield put({ type: 'fetchData', payload: { ...cityProvinceList[i] } })
        }
      } else if (value > 0) {
        const cityList = data.addresses.map(cityItemMap)
        cityList.unshift({ ...payload })
        yield put({ type: 'saveCity', payload: { value, cityList } })
      }
    }
  }
}

function cityItemMap(item) {
  return { label: item.codeName, value: item.codeValue }
}

export default address
