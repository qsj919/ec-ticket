import Taro from '@tarojs/taro'
import React from 'react'
import i18n from '@@/i18n'
import SlideContainer from '@src/components/ContainerView/SlideContainer'
import { View, Text } from '@tarojs/components'
import EButton from '@src/components/Button/EButton'

import './goods_params.scss'

interface Props {
  visible: boolean
  params: { label: string; value: string | Array<string> }[]
  onRequestClose: () => void
}

export default class GoodsParams extends React.PureComponent<Props> {
  static defaultProps = {
    params: []
  }

  onClose = () => {
    const { onRequestClose } = this.props
    onRequestClose && onRequestClose()
  }

  render() {
    const { visible, params } = this.props
    return (
      <SlideContainer visible={visible} onRequestClose={this.onClose}>
        <View className='goods_params'>
          <View className='title'>{i18n.t._('productParameters')}</View>
          {/* <View className="params_list"> */}
          {params.map(item => (
            <View className='params_item' key={item.label}>
              {item.label && <Text className='label'>{item.label}：</Text>}
              {!item.label && <Text className='label' style='margin-left: 3em'></Text>}
              <Text>{item.value}</Text>
            </View>
          ))}

          {/* </View> */}
          <EButton
            label={i18n.t._('complete')}
            size='large'
            height={72}
            onButtonClick={this.onClose}
          />
        </View>
      </SlideContainer>
    )
  }
}
