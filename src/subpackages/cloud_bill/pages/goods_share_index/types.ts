import { ISpu } from '@@types/GoodsType'

export type ShareHistoryItem = {
  id: number //	合集id
  name: string //	合集名称
  spuIds: string //	合集中的spuIds
  type: number //	合集类型 0：默认自定义 1：爆款 2：新品
  coverId: string //	封面docId
  createdDate: string //	创建时间
  updatedDate: string //	更新时间
  spuList: Array<ISpu> //spu列表(只取20个)
}
