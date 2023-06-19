import Taro from '@tarojs/taro'
import React, { ComponentType } from 'react'
import { Image, View } from '@tarojs/components'
import { ImageProps } from '@tarojs/components/types/Image'
import * as Sentry from 'sentry-miniapp'
import myLog from '@utils/myLog'
import { addUrlQuery, debounceCaptureException } from '@utils/utils'
import isEqual from 'lodash/isEqual'
import { GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import { APP_VERSION } from '@constants/index'

type OwnProps = Omit<ImageProps, 'src'> & {
  src: string[] | string
}

type State = {
  source: string
}

const mapStateToProps = ({ image }: GlobalState) => {
  const mode = typeof image.mode === 'number' ? image.mode : 0
  return {
    // loadMode: image.mode
    useVersionStamp: mode === 2 || mode === 3,
    useBackground: mode === 1 || mode === 3,
    useTmp: mode === 4
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

type Props = StateProps & OwnProps

// @connect<StateProps, OwnProps>(mapStateToProps)
class EImage extends React.PureComponent<Props, State> {
  errMsgs: string[] = []

  constructor(props: Props) {
    super(props)
    /**
     * 2022-05-30：优先使用“后一张图片”
     * 根据观察👀 首页「好像」未出现图片白屏，而他与其他页面不同的地方就是对URL数组进行了reverse
     */
    const source = Array.isArray(props.src) ? props.src[props.src.length - 1] : props.src
    this.state = {
      source: source || ''
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (!isEqual(prevProps.src, this.props.src)) {
      const source = Array.isArray(this.props.src)
        ? this.props.src[this.props.src.length - 1]
        : this.props.src

      this.setState({ source: source || '' })
    }
  }

  onLoad = () => {
    // myLog.log(`图片加载成功，地址:${this.state.source}`)
  }

  uploadError = () => {
    const errMsg = this.errMsgs.join(';;;')
    const { src } = this.props
    Sentry.withScope(scope => {
      scope.setTag('type', 'image-error2')
      debounceCaptureException(new Error(`**图片加载失败**，图片地址：${src}；错误信息：${errMsg}`))
    })
    myLog.error(`【图片加载失败】图片地址：${src}；错误信息：${errMsg}`)
  }

  /**
   * 图片相同 && 不含?t，使用timestamp避开缓存重试。
   * 图片相同，但含?t，使用下一个地址。
   * 不再使用getImageInfo
   */
  onError = e => {
    const { errMsg } = e.detail
    const { src, useVersionStamp } = this.props
    const { source } = this.state
    const isHttpUri = source.includes('https://') || source.includes('http://')
    this.errMsgs.push(errMsg)
    if (!isHttpUri && typeof src === 'string') {
      this.uploadError()
      return
    }

    /**
     * 版本戳的情况
     */
    if (useVersionStamp) {
      if (typeof src === 'string') {
        // 加一个时间戳再试一次
        if (!this.state.source.includes('?t=')) {
          this.setState({ source: addUrlQuery(src, { t: Date.now() }) })
        } else {
          this.uploadError()
        }
      } else if (Array.isArray(src)) {
        for (let i = src.length - 1; i > 0; i--) {
          const url = src[i]
          const tmpUrl = addUrlQuery(url, { vv: APP_VERSION })
          if (url === this.state.source) {
            this.setState({ source: tmpUrl })
            break
          } else if (tmpUrl === addUrlQuery(this.state.source, { vv: APP_VERSION })) {
            if (i === 0) {
              this.uploadError()
            } else {
              this.setState({ source: addUrlQuery(src[i - 1], { vv: APP_VERSION }) })
            }
            break
          }
        }
      }

      return
    }

    /**
     * 默认模式的情况
     */
    if (typeof src === 'string') {
      if (this.state.source === src && !this.state.source.includes('?t=')) {
        this.setState({ source: addUrlQuery(src, { t: Date.now() }) })
      } else {
        this.uploadError()
      }
    } else if (Array.isArray(src)) {
      for (let i = src.length - 1; i > 0; i--) {
        const url = src[i]
        if (url === this.state.source) {
          this.setState({ source: `${url}?t=${Date.now()}` })
          break
        } else if (this.state.source.includes(`${url}?t=`)) {
          if (i === 0) {
            this.uploadError()
          } else {
            this.setState({ source: src[i - 1] })
          }
        }
      }
    }
  }

  onImageClick = e => {
    const { onClick } = this.props
    if (onClick) {
      onClick(e)
    }
  }

  render() {
    const { mode, lazyLoad, useBackground, useVersionStamp, useTmp } = this.props
    const { source } = this.state
    const isHttpUri = source.includes('https://') || source.includes('http://')
    // let _source = useVersionStamp && isHttpUri ? addUrlQuery(source, { vv: APP_VERSION }) : source
    let _source = source
    // _source = useTmp && isHttpUri ? addUrlQuery(_source, { t: Date.now() }) : _source
    return useBackground && isHttpUri ? (
      <View
        style={{
          width: '100%',
          height: '100%',
          background: `url('${_source}') center/cover no-repeat`
        }}
      />
    ) : (
      <Image
        style={{ width: '100%', height: '100%' }}
        src={_source}
        mode={mode}
        onError={this.onError}
        onLoad={this.onLoad}
        // onLoad={this.onLoad}
        onClick={this.onImageClick}
        lazyLoad={lazyLoad}
      />
    )
  }
}

export default connect<StateProps, OwnProps>(mapStateToProps)(EImage) as ComponentType<OwnProps>
