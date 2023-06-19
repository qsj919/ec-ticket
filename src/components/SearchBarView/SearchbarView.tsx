import Taro from '@tarojs/taro'
import React, { PureComponent } from 'react'
import { View, Image, Input } from '@tarojs/components'
import searchImg from '@/images/search_black_48.png'
import deleteImg from '@/images/delete_circle_32.png'

import './searchbar.scss'

type Props = {
  onSearchClick: Function
  onClearSearchClick?: (searchToken: string) => void
  searchToken: string
  style: string
  backgroundColor: string | null
  searchImg: string
  placeholder: string
  textColor: string
  deleteImg: string | null
  focus?: boolean
  onFocus?: Function
  onBlur?(key: string): void
  inputDisabled: boolean
  onSearchViewClick: Function
  isUseCoverViewPlaceholder: boolean
  searchImageStyle: string
  placeholderStyle: string
  containerStyle: string
  onInput?(value: string): void
  allgoodSearch?: boolean
}

type PageState = {
  searchToken: string
  inputFocus: boolean
}

export default class SearchbarView extends PureComponent<Props, PageState> {
  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    onSearchClick: null,
    searchToken: '',
    style: '',
    backgroundColor: null,
    searchImg,
    placeholder: '',
    textColor: '',
    deleteImg: null,
    onFocus: null,
    inputDisabled: false,
    onSearchViewClick: null,
    isUseCoverViewPlaceholder: false,
    searchImageStyle: '',
    placeholderStyle: '',
    containerStyle: ''
  }

  state = {
    searchToken: '',
    inputFocus: false
  }

  componentDidMount() {
    Taro.eventCenter.on('CLEAR_SEARCH_TOKEN', () => {
      this.setState({ searchToken: '' })
      this.props.onInput && this.props.onInput('')
    })
  }

  componentWillUnmount() {
    Taro.eventCenter.off('CLEAR_SEARCH_TOKEN')
  }

  onFocus = () => {
    if (this.props.onFocus) this.props.onFocus()
  }

  onBlur = () => {
    if (this.props.onBlur) this.props.onBlur(this.state.searchToken)
  }

  onSearchViewClick = () => {
    if (this.props.onSearchViewClick) this.props.onSearchViewClick()
  }

  onSearchClick = e => {
    if (!this.props.onSearchClick) return
    if (e && e.detail.value && e.detail.value !== this.state.searchToken) {
      this.setState({ searchToken: e.detail.value }, () => {
        this.props.onSearchClick(this.state.searchToken)
      })
    } else {
      this.props.onSearchClick(this.state.searchToken)
    }
  }

  inputSearch = event => {
    const { onInput } = this.props
    this.setState({
      searchToken: event.detail.value
    })
    onInput && onInput(event.detail.value)
  }

  onClearClick = () => {
    this.setState({
      searchToken: ''
    })
    this.props.onClearSearchClick && this.props.onClearSearchClick('')
  }

  onCoverViewClick = () => {
    this.setState({ inputFocus: true })
  }

  render() {
    const { inputFocus } = this.state
    const {
      inputDisabled,
      isUseCoverViewPlaceholder,
      placeholderStyle,
      searchImg,
      searchImageStyle,
      containerStyle,
      allgoodSearch
    } = this.props
    let searchbarStyle = this.props.backgroundColor
      ? `background-color: ${this.props.backgroundColor};`
      : ''
    searchbarStyle = containerStyle + searchbarStyle
    const searchIcon = searchImg
    const deleteIcon = deleteImg
    let placeholder = this.props.placeholder ? this.props.placeholder : '搜索本店商品'
    placeholder = this.state.searchToken ? '' : placeholder
    return (
      <View
        // className='shop_search_line'
        className={allgoodSearch ? 'shop_search_line shop_search_lineAllgoods' : 'shop_search_line'}
      >
        <View className='search_bar' style={searchbarStyle} onClick={this.onSearchViewClick}>
          <Image
            src={searchIcon}
            className='search_image'
            // onClick={this.onSearchClick}
            mode='aspectFit'
            style={searchImageStyle}
          />
          <Input
            auto-focus={this.props.focus}
            focus={this.props.focus || inputFocus}
            className='search_input'
            // style={inputStyle}
            placeholder={isUseCoverViewPlaceholder ? '' : placeholder}
            // placeholderStyle={inputStyle ? inputStyle : 'color:#9b9b9b'}
            // placeholderClass='search_input__placeholder'
            onInput={this.inputSearch}
            value={this.state.searchToken}
            onConfirm={this.onSearchClick}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            disabled={inputDisabled}
            confirmType='search'
            placeholderStyle={placeholderStyle}
          />
          {isUseCoverViewPlaceholder && (
            <View className='searchbar_input__placeholder' onClick={this.onCoverViewClick}>
              {placeholder}
            </View>
          )}
          {this.state.searchToken && (
            <Image src={deleteIcon} className='delete' onClick={this.onClearClick} />
          )}
        </View>
      </View>
    )
  }
}
