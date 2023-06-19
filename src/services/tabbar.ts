import Taro from '@tarojs/taro'
import { isWeb } from '@constants'

let CURRENT_TAB_INDEX = -1

export function setTabIndex(i: number) {
  CURRENT_TAB_INDEX = i
}

export function mapTabPathToIndex(path: string) {
  if (path.includes('eTicketList')) return 0
  if (path.includes('statement')) return 1
  if (path.includes('mine')) return 2
  return -1
}

export const tarBarSvc = {
  get currentTabIndex() {
    return CURRENT_TAB_INDEX
  },
  showTabbar() {
    Taro.showTabBar()
  },
  hideTabbar() {
    Taro.hideTabBar()
  },
  showTabBarAnyway() {
    if (!isWeb) return
    try {
      const tabbar = document.getElementsByClassName('taro-tabbar__tabbar')[0]
      tabbar.classList.add('taro-tabbar__no_hide')
    } catch (e) {
      console.warn(e, 'an error occurred in tabbar helper')
    }
  },
  hideTabBarAnyWay() {
    if (!isWeb) return
    try {
      const tabbar = document.getElementsByClassName('taro-tabbar__tabbar')[0]
      tabbar.classList.remove('taro-tabbar__no_hide')
    } catch (e) {
      console.warn(e, 'an error occurred in tabbar helper')
    }
  },
  initTabbarClickEvent(cb: (index: number) => void) {
    try {
      const tabbarItems = document.getElementsByClassName('weui-tabbar__item')
      Array.prototype.forEach.call(tabbarItems, (tabbar: Element, index) => {
        tabbar.addEventListener('click', e => {
          cb(index)
        })
      })
    } catch (e) {
      console.warn(e, 'an error occurred in initTabbarClickEvent')
    }
  }
}
