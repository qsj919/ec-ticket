export interface ICodeType {
  name: string
  id: number
  // 对应企业代码的长度
  numLength: number
}

export const CodeTypes: ICodeType[] = [
  {
    name: '统一社会信用代码',
    id: 1,
    numLength: 18
  },
  {
    name: '组织机构代码',
    id: 2,
    numLength: 9
  },
  {
    name: '营业执照注册号',
    id: 3,
    numLength: 15
  }
]
