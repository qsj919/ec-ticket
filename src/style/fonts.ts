import { pxTransform } from '@tarojs/taro'

const fontsList = [23, 19, 17, 15, 13, 12, 11, 10].map(item => item * 2)

const fonts: { [key: string]: number | string } = {
  // font46: 46,
}

fontsList.forEach(fontSize => {
  fonts[`font${fontSize}`] = fontSize
  fonts[`font${fontSize}WithTransformed`] = pxTransform(fontSize)
})

export default fonts
