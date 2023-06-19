import Taro, { navigateTo, redirectTo, switchTab } from '@tarojs/taro'
import { isWeb } from '@constants/'
import trackSvc from './track'
import { mapTabPathToIndex, setTabIndex } from './tabbar'

const navigatorSvc = {
  navigateTo(p: navigateTo.Param) {
    Taro.navigateTo(p)
    trackSvc.uploadPage()
  },
  redirectTo(p: redirectTo.Param) {
    Taro.redirectTo(p)
    trackSvc.uploadPage()
  },
  switchTab(p: switchTab.Param) {
    Taro.switchTab(p)
    const tabIndex = mapTabPathToIndex(p.url)
    setTabIndex(tabIndex)
    trackSvc.uploadPage()
  }
}

export default navigatorSvc
