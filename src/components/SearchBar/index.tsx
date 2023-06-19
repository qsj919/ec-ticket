import Taro from '@tarojs/taro'
import React from 'react'
import { View, Input, Image, Text, Form } from '@tarojs/components'
import { InputProps } from '@tarojs/components/types/Input'

import searchIcon from '@/images/search.png'
import closeIcon from '@/images/close_white_circle.png'

import styles from './search_bar.module.scss'

// Taro无法在jsx中使用对象展开符 {...props}，所以用到什么取什么
// https://github.com/NervJS/taro/blob/master/packages/eslint-plugin-taro/docs/no-spread-in-props.md
interface Props
  extends Pick<
    InputProps,
    | 'placeholder'
    | 'onInput'
    | 'confirmType'
    | 'onConfirm'
    | 'focus'
    | 'onFocus'
    | 'onBlur'
    | 'maxLength'
  > {
  onSearch(value: string): void
  onClear(): void
  value: string
  preFixFilterText?: string
  onFilterClick: () => void
}

function noop() {}

export default function SearchBar(props: Props) {
  const {
    onSearch,
    onClear,
    preFixFilterText,
    onFilterClick,
    value,
    onInput,
    placeholder,
    confirmType,
    focus,
    onConfirm,
    onFocus,
    onBlur,
    maxLength
  } = props

  function search() {
    onSearch(value)
  }

  return (
    <View className={styles.container}>
      <View className={styles.input_wrapper}>
        {typeof preFixFilterText === 'string' ? (
          <View className={styles.filter_text} onClick={onFilterClick}>
            <Text>{preFixFilterText}</Text>
            <View className={styles.angle_down} />
          </View>
        ) : (
          <Image className={styles.search_icon} src={searchIcon} />
        )}
        <Input
          onConfirm={onConfirm}
          className={styles.input}
          value={value}
          onInput={onInput}
          placeholder={placeholder}
          confirmType={confirmType}
          focus={focus}
          onFocus={onFocus}
          onBlur={onBlur}
          maxlength={maxLength}
        />

        {typeof value === 'string' && value.length > 0 && (
          <Image onClick={onClear} className={styles.delete_icon} src={closeIcon} />
        )}
      </View>
      <View className={styles.search_text} onClick={search}>
        搜索
      </View>
    </View>
  )
}

SearchBar.defaultProps = {
  onSearch: noop,
  onClear: noop,
  onFilterClick: noop
}
