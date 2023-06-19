import Taro from '@tarojs/taro'
import { isWeb } from '@constants/index'

function modalHelperCreator() {
  let scrollTop
  return {
    open() {
      if (!isWeb) return
      scrollTop = document.scrollingElement
        ? document.scrollingElement.scrollTop
        : document.body.scrollTop
      document.body.classList.add('fixed_item')
      document.body.style.top = `-${scrollTop}px`
    },
    close() {
      if (!isWeb) return
      document.body.style.top = ''
      document.body.classList.remove('fixed_item')
      document.body.scrollTop = scrollTop
    }
  }
}

const modalHelper = modalHelperCreator()

export { modalHelper }
