import Taro from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { View, Text, ScrollView, Block } from '@tarojs/components'
import { sliceString } from '@utils/stringUtil'
import i18n from '@@/i18n'
import { IGoodsClass } from '@@types/GoodsType'
import styles from './category_main.module.scss'

const noGood = [0, 0, 0, 0, 0, 0, 0, 0, 0]

type Props = {
  data: Array<IGoodsClass>
  onClickMainTypeEvent: (index: number, aCode: number | string) => void
  selectedIndex: number
  isLoading?: boolean
}

type State = {}

export default class Item extends PureComponent<Props, State> {
  static defaultProps = {
    data: []
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  categorySelectedEvent = (index: number, aCode: number | string) => {
    this.props.onClickMainTypeEvent(index, aCode)
  }

  render() {
    const { data, selectedIndex, isLoading } = this.props
    return (
      <Block>
        <ScrollView className={styles.leftView} scrollY>
          <View
            className={selectedIndex === -2 ? styles.singleView : styles.noSingleView}
            onClick={() => {
              this.categorySelectedEvent(-2, 0)
            }}
          >
            {selectedIndex === -2 && <View className={styles.remark} />}
            <Text className={styles.text}>{i18n.t._('all')}</Text>
          </View>
          <View
            className={selectedIndex === -1 ? styles.singleView : styles.noSingleView}
            onClick={() => {
              this.categorySelectedEvent(-1, 0)
            }}
          >
            {selectedIndex === -1 && <View className={styles.remark} />}
            <Text className={styles.text}>爆款</Text>
          </View>
          {data.map((item, index) => {
            return (
              <View
                key={index}
                className={index === selectedIndex ? styles.singleView : styles.noSingleView}
                onClick={() => {
                  this.categorySelectedEvent(index, item.id)
                }}
              >
                {index === selectedIndex && <View className={styles.remark} />}
                <Text className={styles.text}>{item.name}</Text>
              </View>
            )
          })}
          {data.length === 0 && isLoading && (
            <View>
              {noGood.map((item, index) => {
                return (
                  <View
                    key={index}
                    className={index === selectedIndex ? styles.singleView : styles.noSingleView}
                    onClick={() => {
                      this.categorySelectedEvent(index, item)
                    }}
                  >
                    <Text className={styles.text}>{sliceString(item)}</Text>
                  </View>
                )
              })}
            </View>
          )}
        </ScrollView>
      </Block>
    )
  }
}
