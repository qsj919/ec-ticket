import { AppState } from '@models/app'
import { LanguageState } from '@models/language'
import { ShopState } from '@models/shop'
import { StatementData } from '@@/subpackages/mine/pages/statement/model'
import { UserState } from '@models/user'
import { SearchShopState } from '@models/search_shop'
import { AddressState } from '@models/address'
import { ImageDownloadState } from '@models/image_download'
import { SystemInfoState } from '@models/system_info'
import { ReplenishmentState } from '@models/replenishment'
// import { GoodsModelState } from '@models/goods'
import { CloudBillState } from '@models/cloud_bill'
import { GoodsManageState } from '@models/goods_manage'
import { ImageState } from '@models/image'
import { ApplyMiniappState } from '@models/apply_miniapp'

interface LoadingState {
  effects: {
    [key: string]: {
      loading: boolean
    }
  }
  global: boolean
}

export interface GlobalState {
  app: AppState
  language: LanguageState
  shop: ShopState
  statement: StatementData
  user: UserState
  searchShop: SearchShopState
  address: AddressState
  imageDownload: ImageDownloadState
  systemInfo: SystemInfoState
  replenishment: ReplenishmentState
  // goodsDetail: GoodsModelState
  cloudBill: CloudBillState
  loading: LoadingState
  goodsManage: GoodsManageState
  image: ImageState
  applyMiniapp: ApplyMiniappState
}

// export default GlobalState

// 实际的dispath返回值，对于reducer来说，返回action对象，对于effects来说，返回promise
export const defaultMapDispatchToProps = (dispatch: any) => {
  return { dispatch }
}

export type DefaultDispatchProps = ReturnType<typeof defaultMapDispatchToProps>
