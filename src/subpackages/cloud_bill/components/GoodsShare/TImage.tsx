import Taro from '@tarojs/taro'
import React from 'react'
import { Image } from '@tarojs/components'
import { ImageProps } from '@tarojs/components/types/Image'

type OwnProps = Omit<ImageProps, 'src'> & {
  src: string
}

export default function TImage({ src }: OwnProps) {
  return <Image style='width:100%;height:100%;' src={src} />
}
