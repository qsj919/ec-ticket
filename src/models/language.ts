// import i18next from 'i18next'
import { isWeb } from '@constants/index'
import { Model } from '@@types/dva'
import zh from '../locales/zh-CN/index'
import en from '../locales/en-US/index'

// isWeb &&
//   i18next.init({
//     fallbackLng: 'zh-CN',
//     ns: ['common', 'statistics', 'ticketList', 'ticketDetail', 'statement'],
//     defaultNS: 'common',
//     initImmediate: false,
//     resources: {
//       // 'zh-CN': zh,
//       // 'en-US': en,
//       en,
//       zh
//     },
//     debug: process.env.NODE_ENV === 'development'
//   })

function replacer(match, p1) {
  return p1
}

// 国际化翻译
let transMap = {}
Object.keys(zh).forEach(k => {
  const temp = k === 'common' ? zh[k] : { [k]: zh[k] }
  transMap = { ...transMap, ...temp }
})

function parseAndTranslate(dict: object) {
  Object.keys(dict).forEach(k => {
    let value = dict[k]
    if (typeof value === 'object') {
      // 递归调用
      parseAndTranslate(value)
    } else {
      const matchArray = value.match(/\$t\(.*?\)/g)
      if (matchArray) {
        matchArray.forEach(v => {
          // 把$t(abc) 中的abc提取并翻译
          const key = v.replace(/\$t\((.*?)\)/, replacer)
          let result = ''
          // 考虑作用域
          if (key.includes(':')) {
            const [scope, _key] = key.split(':')
            result = zh[scope][_key]
          } else {
            result = transMap[key]
          }
          value = value.replace(v, result)
        })

        dict[k] = value
      }
    }
  })
}

// 翻译全局的词典
parseAndTranslate(transMap)

// // 进一步翻译 各作用域下的
// Object.keys(transMap).forEach(k => {
//   const parent = transMap[k]
//   if (typeof parent === 'object') {
//     parseAndTranslate(parent)
//   }
// })

export function t(key: string) {
  if (key.includes(':')) {
    const [scope, value] = key.split(':')
    return transMap[scope][value]
  } else {
    return transMap[key]
  }
}

export interface LanguageState {
  language: string
  // t: i18next.TFunction
}

const languageModel: Model<LanguageState> = {
  namespace: 'language',
  state: {
    language: 'zh'
    // todo 修改方案
    // state中不应该有函数吧
    // t(key: string) {
    //   return i18next.t(key)
    // }
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    }
  },
  effects: {
    *changeLanguage({ payload }, { call, put }) {
      const { language } = payload
      // i18next.changeLanguage(language)
      yield put({ type: 'save', payload: { language } })
    }
  }
}

// export default languageModel
