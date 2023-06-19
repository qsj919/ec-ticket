import Taro from '@tarojs/taro'
import React, { memo, useEffect, useState } from 'react';
import { View, Picker } from '@tarojs/components'
import { getRegionCodeAll } from '@api/live_api_manager'

interface IProps {
  className: string
  handleChange: ({ country, province, city, town }) => void
}

type State = {
  indexs: number[]
  allRegionData: any[]
  selected: boolean
}

export default class RegionCodeSelect extends React.Component<IProps, State> {
  constructor (props) {
    super(props)
    this.state = {
      indexs: [0, 0, 0, 0],
      allRegionData: [],
      selected: false,
    }
  }
  
  componentDidMount = () => {
    getRegionCodeAll().then((res) => {
      const china: any = {
        label: '中国',
        children: [],
      }
      const allRegionData: any[] = [china]
      res.data.rows.forEach((row) => {
        if (row.children != undefined) {
          china.children.push(row)
        } else {
          allRegionData.push(row)
        }
      })
      this.setState({ allRegionData })
    })
  }

  getTown = () => {
    const { indexs } = this.state
    const curCity = this.getCity().cur
    let labels = []
    if (curCity && curCity.children) {
      labels = curCity.children.map((t) => t.label)
      return {
        cur: curCity.children[indexs[3]],
        labels,
      }
    } else {
      return {
        cur: null,
        labels,
      }
    }
  }

  getCity = () => {
    const { indexs } = this.state
    const curProvince = this.getProvince().cur
    let labels = []
    if (curProvince && curProvince.children) {
      labels = curProvince.children.map((p) => p.label)
      return {
        cur: curProvince.children[indexs[2]],
        labels,
      }
    } else {
      return {
        cur: null,
        labels,
      }
    }
  }

  getProvince = () => {
    const { indexs } = this.state
    const curCountry = this.getCountry().cur
    let labels = []
    if (curCountry && curCountry.children) {
      labels = curCountry.children.map((p) => p.label)
      return {
        cur: curCountry.children[indexs[1]],
        labels,
      }
    } else {
      return {
        cur: null,
        labels,
      }
    }
  }

  getCountry = () => {
    const { allRegionData, indexs } = this.state
    return {
      cur: allRegionData[indexs[0]],
      labels: allRegionData.map((c) => c.label),
    }
  }

  onChange = (e) => {
    const { indexs, selected } = this.state
    const { handleChange } = this.props
    let newIndexs = [...indexs]
    if (e.detail.column !== undefined) {
      newIndexs[e.detail.column] = e.detail.value
    } else if (Array.isArray(e.detail.value)) {
      newIndexs = e.detail.value
      handleChange({
        country: this.getCountry().cur,
        province: this.getProvince().cur,
        city: this.getCity().cur,
        town: this.getTown().cur,
      })
      if (selected === false) {
        this.setState({ selected: true })
      }
    }

    this.setState({ indexs: newIndexs })
  }

  render() {
    const { className } = this.props
    const { indexs, selected } = this.state
    const country = this.getCountry()
    const province = this.getProvince()
    const city = this.getCity()
    const town = this.getTown()
    return (
      <Picker
        className={className}
        mode='multiSelector'
        value={indexs}
        range={[country.labels, province.labels, city.labels, town.labels]}
        onColumnChange={this.onChange}
        onChange={this.onChange}
      >
        <View className='picker'>
          {country.cur && selected
            ? country.cur.label === '海外'
              ? '海外'
              : `${country.cur.label}/${province.cur.label}/${city.cur.label}/${town.cur.label}`
            : '请选择省市区'}
        </View>
      </Picker>
    )
  }
}
