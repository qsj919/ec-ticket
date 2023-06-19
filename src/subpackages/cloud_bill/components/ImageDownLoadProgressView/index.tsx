/**
 * @author lgl
 * @create date 2019-03-08
 * @desc 环形进度条
 */
import Taro from '@tarojs/taro'
import React, { PureComponent, ComponentClass } from 'react'
import { View } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import RoundProgressView from '../RoundProgressView'

import './index.scss'

type OwnProps = {}

type IProps = OwnProps & StateProps & DefaultDispatchProps

type PageState = {}

const mapStateToProps = ({ imageDownload }: GlobalState) => ({
  percent: imageDownload.percent,
  allPercent: imageDownload.allPercent
})

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, {}, IProps>(mapStateToProps)
class ImageDownLoadProgressView extends PureComponent<IProps, PageState> {
  static defaultProps = {
    percent: 0,
    allPercent: 100
  }

  onProgressComplete = () => {}

  render() {
    const { percent, allPercent } = this.props
    return (
      <View className='image_download_progress_view'>
        {percent !== allPercent && allPercent > 0 && (
          <RoundProgressView
            percent={percent}
            allPercent={allPercent}
            onProgressComplete={this.onProgressComplete}
          />
        )}
      </View>
    )
  }
}

export default connect<StateProps, {}, IProps>(mapStateToProps)(ImageDownLoadProgressView) as ComponentClass<OwnProps, PageState>
