import zhcn from './zh_CN/translation'
import en from './en/translation'

export default function get(value: any = {}): any {
  return {
    zhcn: zhcn(value),
    en: en(value)
  }
}
