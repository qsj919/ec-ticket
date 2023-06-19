import cloneDeep from 'lodash/clonedeep'
import app from './app'
// import language from './language'
import shop from './shop'
import statement from '../subpackages/mine/pages/statement/model'
import user from './user'
import searchShop from './search_shop'
import address from './address'
import imageDownload from './image_download'
import systemInfo from './system_info'
import replenishment from './replenishment'
import cloudBill from './cloud_bill'
import goodsManage from './goods_manage'
import image from './image'
import applyMiniapp from './apply_miniapp'

const models = [
  app,
  // language,
  shop,
  statement,
  user,
  searchShop,
  address,
  imageDownload,
  systemInfo,
  replenishment,
  cloudBill,
  goodsManage,
  image,
  applyMiniapp
]

export default models

export const initState = {}
for (const model of models) {
  initState[model.namespace] = cloneDeep(model.state)
}
