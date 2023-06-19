import Taro from '@tarojs/taro'
import { View, ScrollView } from '@tarojs/components'
import { connect } from 'react-redux'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import React, { ComponentType } from 'react'
import classNames from 'classnames'
import { ActiveItem, BaseItem } from '@@types/base'
import styles from './menu.module.scss'

interface Data extends ActiveItem {
  children?: Array<Omit<Data, 'children'>>
}

interface Props {
  activedValue: Readonly<[number, number]>
  onMenuClick(item: BaseItem, index: number, parentItem: BaseItem, parentIndex: number): void
}

interface State {
  activeIndexInLevel1: number
}

const mapStateToProps = ({ address }: GlobalState) => ({
  cities: address.cityProvinceList
})

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps, Props>(mapStateToProps)
class Menu extends React.PureComponent<Props & StateProps & DefaultDispatchProps, State> {
  state = {
    activeIndexInLevel1: 0
  }

  onLevel1Click = (level1: Data, activeIndexInLevel1: number) => {
    this.setState({ activeIndexInLevel1 })
    if (!level1.children) {
      this.props.dispatch({ type: 'address/fetchData', payload: { ...level1 } })
    }
  }

  render() {
    const { cities, onMenuClick, activedValue } = this.props
    const { activeIndexInLevel1 } = this.state
    const level2 = cities[activeIndexInLevel1]
    const level2Data = (level2 && level2.children) || []

    return (
      <View className={styles.menu}>
        <ScrollView scrollY className={classNames(styles.scroll, styles['scroll--left'])}>
          {cities.map((level1, level1Index) => (
            <View
              key={level1.value}
              className={classNames(styles['scroll__item'], styles['scroll__item--left'], {
                [styles['scroll__item--active']]: level1Index === activeIndexInLevel1
              })}
              onClick={() => this.onLevel1Click(level1, level1Index)}
            >
              {level1.label}
            </View>
          ))}
        </ScrollView>
        {level2Data.length > 0 && (
          <ScrollView scrollY className={classNames(styles.scroll, styles['scroll--right'])}>
            {level2Data.map((item, index) => (
              <View
                key={item.value}
                className={classNames(styles['scroll__item'], {
                  [styles['scroll__item--checked']]:
                    index === 0 && activeIndexInLevel1 !== 0
                      ? item.value === activedValue[0]
                      : item.value === activedValue[1]
                })}
                onClick={() => onMenuClick(item, index, level2, activeIndexInLevel1)}
              >
                {index === 0 ? '所有城市' : item.label}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    )
  }
}

export default connect<StateProps, DefaultDispatchProps, Props>(mapStateToProps)(Menu) as ComponentType<Props>
